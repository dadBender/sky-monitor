import { z } from 'zod'

import db from '../../db'
import { COUNTRIES_DICTIONARY, COUNTRY_DISPLAY_BY_CODE } from '../../data/countries.dictionary'
import aviationService from '../../services/aviationstack/aviation.service'
import aerodataboxService from '../../services/aerodatabox/aerodatabox.service'
import openskyService from '../../services/opensky/opensky.service'
import type { IAviationStackData } from '../../services/aviationstack/aviation.types'
import type { IFlight } from '../../types/flight.types'
import { mapAviationToFlight } from '../../utils/map-aviation-stack'
import { mapOpenskyToFlight } from '../../utils/map-opensky'
import { publicProcedure, router } from '../trpc'

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

	const rows = db.prepare(`
		SELECT id, icao, raw_data
		FROM seeded_flights
		WHERE datetime(dep_sched) <= datetime('now', '+1 hour')
		  AND datetime(arr_sched)  >= datetime('now')
		  ${countryFilter}
		ORDER BY dep_sched ASC
		LIMIT 500
	`).all() as SeededRow[]

	const results: IFlight[] = []

	for (const row of rows) {
		if (results.length >= limit) break

		let raw: IAviationStackData
		try { raw = JSON.parse(row.raw_data) } catch { continue }

		const flight = mapAviationToFlight(raw)
		if (!flight) continue
		if (flight.progress <= 0 || flight.progress >= 100) continue
		if (airlineName && flight.airline.name !== airlineName) continue

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

	const row = db.prepare(`
		SELECT COUNT(*) as cnt FROM seeded_flights
		WHERE datetime(arr_sched) >= datetime('now')
		  ${countryFilter}
	`).get() as { cnt: number }
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
	const data = await aviationService.fetchLiveFlights(Math.min(100, limit * 10), offset, airlineName)
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
			const countryCodes = input.countryCodes?.length ? input.countryCodes : undefined
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

			const openskyFlights = openskyResult.status === 'fulfilled' ? openskyResult.value : []
			const aviationFlights = aviationResult.status === 'fulfilled' ? aviationResult.value : []

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

	/** Available country options (dictionary subset: enabled only) */
	getCountries: publicProcedure.query(() => {
		return COUNTRIES_DICTIONARY
			.filter(c => c.enabled)
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
