import { z } from 'zod';



import { AIRLINE_NAME_TO_IATA } from '../../data/airline-iata.data';
import { COUNTRIES_DICTIONARY, COUNTRY_DISPLAY_BY_CODE } from '../../data/countries.dictionary';
import db from '../../db';
import aerodataboxService from '../../services/aerodatabox/aerodatabox.service';
import airlabsService from '../../services/airlabs/airlabs.service';
import type { IAirlabsFlightData, IAirlabsScheduleData } from '../../services/airlabs/airlabs.types';
import aviationService from '../../services/aviationstack/aviation.service';
import type { IAviationStackData } from '../../services/aviationstack/aviation.types';
import openskyService from '../../services/opensky/opensky.service';
import type { IFlight } from '../../types/flight.types';
import { mapAirlabsScheduleToFlight, mapAirlabsToFlight } from '../../utils/map-airlabs';
import { mapAviationToFlight } from '../../utils/map-aviation-stack';
import { mapOpenskyToFlight } from '../../utils/map-opensky';
import { publicProcedure, router } from '../trpc';





// ---------------------------------------------------------------------------
// OpenSky path
// ---------------------------------------------------------------------------

async function fetchFromOpenSky(
	limit: number,
	offset: number,
	airlineName?: string,
	countryCodes?: string[]
): Promise<IFlight[]> {
	let states = await openskyService.fetchStates()

	// Pre-filter by originCountry to avoid unnecessary AeroDataBox calls
	if (countryCodes && countryCodes.length > 0) {
		const displayNames = countryCodes
			.map(code => COUNTRY_DISPLAY_BY_CODE.get(code))
			.filter((n): n is string => !!n)

		if (displayNames.length > 0) {
			states = states.filter(s => displayNames.includes(s.originCountry))
		}
	}

	const results: IFlight[] = []
	const seen = new Set<string>()
	const scanLimit = Math.min(offset + limit * 6, states.length)

	for (let i = offset; i < scanLimit && results.length < limit; i++) {
		const state = states[i]
		const callsign = state.callsign!
		if (seen.has(callsign)) continue
		seen.add(callsign)

		const details = await aerodataboxService.getFlightByCallsign(callsign)
		const flight = mapOpenskyToFlight(state, details)
		if (!flight) continue
		if (airlineName && flight.airline.name !== airlineName) continue

		results.push(flight)
		await new Promise(resolve => setTimeout(resolve, 350))
	}

	return results
}

// ---------------------------------------------------------------------------
// DB path
// ---------------------------------------------------------------------------

interface SeededRow {
	id: string
	icao: string
	raw_data: string
	source: string
}

function fetchFromDb(
	limit: number,
	airlineName?: string,
	countryCodes?: string[]
): IFlight[] {
	// Build country filter — ISO2 codes are safe to interpolate (validated below)
	let countryFilter = ''
	if (countryCodes && countryCodes.length > 0) {
		// Sanitize: keep only valid ISO2 codes
		const safe = countryCodes.filter(c => /^[A-Z]{2}$/.test(c))
		if (safe.length > 0) {
			const list = safe.map(c => `'${c}'`).join(',')
			countryFilter = `AND country_code IN (${list})`
		}
	}

	const rows = db
		.prepare(
			`
		SELECT id, icao, raw_data, source
		FROM seeded_flights
		WHERE datetime(dep_sched) <= datetime('now', '+1 hour')
		  AND datetime(arr_sched)  >= datetime('now')
		  ${countryFilter}
		ORDER BY dep_sched ASC
		LIMIT 500
	`
		)
		.all() as SeededRow[]

	const results: IFlight[] = []
	const seenIcao = new Set<string>()

	for (const row of rows) {
		if (results.length >= limit) break

		let flight: IFlight | null
		try {
			const parsed = JSON.parse(row.raw_data)
			flight =
				row.source === 'airlabs'
					? mapAirlabsToFlight(parsed as IAirlabsFlightData)
					: mapAviationToFlight(parsed as IAviationStackData)
		} catch {
			continue
		}
		if (!flight) continue
		if (flight.progress <= 0 || flight.progress >= 100) continue
		if (airlineName && flight.airline.name !== airlineName) continue
		// Deduplicate: AviationStack rows come first (ORDER BY dep_sched),
		// AirLabs adds only flights not already covered
		if (flight.icao && seenIcao.has(flight.icao)) continue
		if (flight.icao) seenIcao.add(flight.icao)

		results.push(flight)
	}

	return results
}

function dbFlightCount(countryCodes?: string[]): number {
	let countryFilter = ''
	if (countryCodes && countryCodes.length > 0) {
		const safe = countryCodes.filter(c => /^[A-Z]{2}$/.test(c))
		if (safe.length > 0) {
			const list = safe.map(c => `'${c}'`).join(',')
			countryFilter = `AND country_code IN (${list})`
		}
	}

	const row = db
		.prepare(
			`
		SELECT COUNT(*) as cnt FROM seeded_flights
		WHERE datetime(arr_sched) >= datetime('now')
		  ${countryFilter}
	`
		)
		.get() as { cnt: number }
	return row.cnt
}

// ---------------------------------------------------------------------------
// AviationStack live fallback
// ---------------------------------------------------------------------------

async function fetchFromAviationStackLive(
	limit: number,
	offset: number,
	airlineName?: string
): Promise<IFlight[]> {
	const data = await aviationService.fetchLiveFlights(
		Math.min(100, limit * 10),
		offset,
		airlineName
	)
	const results: IFlight[] = []

	for (const item of data.data) {
		if (results.length >= limit) break
		const flight = mapAviationToFlight(item)
		if (!flight) continue
		if (flight.progress <= 0 || flight.progress >= 100) continue
		results.push(flight)
	}

	return results
}

// ---------------------------------------------------------------------------
// Scheduled flights — DB-first, AirLabs only when DB is empty
// ---------------------------------------------------------------------------

const insertScheduledFlight = db.prepare(`
  INSERT OR REPLACE INTO seeded_flights
    (id, icao, airline, raw_data, dep_sched, arr_sched, seeded_at, country_code, source)
  VALUES
    (@id, @icao, @airline, @raw_data, @dep_sched, @arr_sched, @seeded_at, @country_code, @source)
`)

function countScheduledInDb(safeCountryCodes: string[]): number {
	const countryFilter =
		safeCountryCodes.length > 0
			? `AND country_code IN (${safeCountryCodes.map(c => `'${c}'`).join(',')})`
			: ''

	const row = db
		.prepare(
			`
      SELECT COUNT(*) as cnt FROM seeded_flights
      WHERE source = 'airlabs_scheduled'
        AND datetime(dep_sched) > datetime('now')
        AND datetime(dep_sched) <= datetime('now', '+24 hours')
        ${countryFilter}
    `
		)
		.get() as { cnt: number }
	return row.cnt
}

function fetchScheduledFromDb(
	safeCountryCodes: string[],
	airlineName?: string
): IFlight[] {
	const countryFilter =
		safeCountryCodes.length > 0
			? `AND country_code IN (${safeCountryCodes.map(c => `'${c}'`).join(',')})`
			: ''

	const rows = db
		.prepare(
			`
      SELECT id, icao, raw_data, source
      FROM seeded_flights
      WHERE source = 'airlabs_scheduled'
        AND datetime(dep_sched) > datetime('now')
        AND datetime(dep_sched) <= datetime('now', '+24 hours')
        ${countryFilter}
      ORDER BY dep_sched ASC
      LIMIT 300
    `
		)
		.all() as SeededRow[]

	const results: IFlight[] = []
	const seenId = new Set<string>()

	for (const row of rows) {
		let flight: IFlight | null
		try {
			flight = mapAirlabsScheduleToFlight(
				JSON.parse(row.raw_data) as IAirlabsScheduleData
			)
		} catch {
			continue
		}
		if (!flight) continue
		if (airlineName && flight.airline.name !== airlineName) continue
		if (seenId.has(flight.id)) continue
		seenId.add(flight.id)
		results.push(flight)
	}

	return results
}

async function seedScheduledFromAirlabs(
	airlines: Array<{ name: string; iata: string; countryCode: string }>
): Promise<number> {
	const now = Date.now()
	const in24h = now + 24 * 60 * 60 * 1000
	let total = 0

	for (const airline of airlines) {
		const schedules = await airlabsService.fetchSchedules(airline.iata)

		const upsert = db.transaction((rows: IAirlabsScheduleData[]) => {
			let count = 0
			for (const s of rows) {
				// Filter: only future flights within 24h
				const depMs = s.dep_time_ts ? s.dep_time_ts * 1000 : null
				if (depMs !== null && (depMs < now || depMs > in24h)) continue

				const id = s.flight_iata ?? s.flight_icao
				const icao = s.flight_icao
				const depSched = s.dep_time_utc
					? s.dep_time_utc.replace(' ', 'T') + ':00.000Z'
					: null
				const arrSched = s.arr_time_utc
					? s.arr_time_utc.replace(' ', 'T') + ':00.000Z'
					: null
				if (!id || !icao || !depSched || !arrSched) continue

				// Embed airline name so mapper works without extra lookups
				const enriched: IAirlabsScheduleData = {
					...s,
					airline_name: airline.name
				}

				insertScheduledFlight.run({
					id: id + ':sched',
					icao,
					airline: airline.name,
					raw_data: JSON.stringify(enriched),
					dep_sched: depSched,
					arr_sched: arrSched,
					seeded_at: now,
					country_code: airline.countryCode,
					source: 'airlabs_scheduled'
				})
				count++
			}
			return count
		})

		total += upsert(schedules)
		console.log(`[Scheduled] ${airline.name}: ${total} flights stored`)
	}

	return total
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const flightsRouter = router({
	getLive: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.number().min(0).nullish(),
				airlineName: z.string().optional(),
				/** ISO2 country codes to filter by, e.g. ['RU', 'TR']. Empty = all. */
				countryCodes: z.array(z.string()).optional()
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 10
			const offset = input.cursor ?? 0
			const asOffset = Math.floor(offset / (limit * 6)) * limit
			const countryCodes = input.countryCodes?.length
				? input.countryCodes
				: undefined
			const seeded = dbFlightCount(countryCodes)

			const [openskyResult, aviationResult] = await Promise.allSettled([
				fetchFromOpenSky(limit, offset, input.airlineName, countryCodes),
				seeded > 0
					? Promise.resolve(fetchFromDb(limit, input.airlineName, countryCodes))
					: fetchFromAviationStackLive(limit, asOffset, input.airlineName)
			])

			if (openskyResult.status === 'rejected') {
				console.error('[OpenSky error]', openskyResult.reason)
			}
			if (aviationResult.status === 'rejected') {
				console.error('[Aviation error]', aviationResult.reason)
			}

			const openskyFlights =
				openskyResult.status === 'fulfilled' ? openskyResult.value : []
			const aviationFlights =
				aviationResult.status === 'fulfilled' ? aviationResult.value : []

			const seenIcao = new Set<string>()
			const merged: IFlight[] = []

			// RU / priority-1 flights from OpenSky come first
			for (const f of openskyFlights) {
				seenIcao.add(f.icao)
				merged.push(f)
			}
			for (const f of aviationFlights) {
				if (!seenIcao.has(f.icao)) {
					seenIcao.add(f.icao)
					merged.push(f)
				}
			}

			return { items: merged, nextCursor: offset + limit * 6 }
		}),

	/** Upcoming scheduled departures — served from DB, fetched from AirLabs only once per 24h window */
	getScheduled: publicProcedure
		.input(
			z.object({
				countryCodes: z.array(z.string()).optional(),
				airlineName: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const countryCodes = input.countryCodes?.length
				? input.countryCodes
				: undefined
			const safeCountryCodes = (countryCodes ?? []).filter(c =>
				/^[A-Z]{2}$/.test(c)
			)

			// Only hit AirLabs if DB has no scheduled flights for this filter
			if (countScheduledInDb(safeCountryCodes) === 0) {
				const airlines = COUNTRIES_DICTIONARY.filter(
					c => c.enabled && (!countryCodes || countryCodes.includes(c.code))
				)
					.flatMap(c =>
						c.airlines.map(name => ({
							name,
							iata: AIRLINE_NAME_TO_IATA[name],
							countryCode: c.code
						}))
					)
					.filter(
						(a): a is { name: string; iata: string; countryCode: string } =>
							!!a.iata
					)

				const stored = await seedScheduledFromAirlabs(airlines)
				console.log(`[Scheduled] Seeded ${stored} flights from AirLabs into DB`)
			}

			const items = fetchScheduledFromDb(safeCountryCodes, input.airlineName)
			return { items }
		}),

	/** Available country options (dictionary subset: enabled only) */
	getCountries: publicProcedure.query(() => {
		return COUNTRIES_DICTIONARY.filter(c => c.enabled)
			.sort((a, b) => a.priority - b.priority)
			.map(({ code, iso3, displayName, flag, priority }) => ({
				code,
				iso3,
				displayName,
				flag,
				priority
			}))
	})
})
