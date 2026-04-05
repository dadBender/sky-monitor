import { z } from 'zod'

import db from '../../db'
import aviationService from '../../services/aviationstack/aviation.service'
import aerodataboxService from '../../services/aerodatabox/aerodatabox.service'
import openskyService from '../../services/opensky/opensky.service'
import type { IAviationStackData } from '../../services/aviationstack/aviation.types'
import type { IFlight } from '../../types/flight.types'
import { mapAviationToFlight } from '../../utils/map-aviation-stack'
import { mapOpenskyToFlight } from '../../utils/map-opensky'
import { publicProcedure, router } from '../trpc'

// ── OpenSky + AeroDataBox (live GPS) ────────────────────────────────────────

async function fetchFromOpenSky(
	limit: number,
	offset: number,
	airlineName?: string
): Promise<IFlight[]> {
	const states = await openskyService.fetchStates()
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

// ── SQLite DB (seeded Russian flights, re-mapped fresh on each request) ──────

interface SeededRow {
	id: string
	icao: string
	raw_data: string
}

function fetchFromDb(
	limit: number,
	airlineName?: string,
	fromCountry?: string
): IFlight[] {
	// Pull rows whose schedule window is currently active
	const rows = db.prepare(`
		SELECT id, icao, raw_data
		FROM seeded_flights
		WHERE datetime(dep_sched) <= datetime('now', '+1 hour')
		  AND datetime(arr_sched)  >= datetime('now')
		ORDER BY dep_sched ASC
		LIMIT 500
	`).all() as SeededRow[]

	const results: IFlight[] = []

	for (const row of rows) {
		if (results.length >= limit) break

		let raw: IAviationStackData
		try { raw = JSON.parse(row.raw_data) } catch { continue }

		// Re-run mapper → recalculates progress + interpolated position from current time
		const flight = mapAviationToFlight(raw)
		if (!flight) continue
		if (flight.progress <= 0 || flight.progress >= 100) continue
		if (airlineName && flight.airline.name !== airlineName) continue
		if (fromCountry && flight.from.country?.toLowerCase() !== fromCountry.toLowerCase()) continue

		results.push(flight)
	}

	return results
}

function dbFlightCount(): number {
	const row = db.prepare(`
		SELECT COUNT(*) as cnt FROM seeded_flights
		WHERE datetime(arr_sched) >= datetime('now')
	`).get() as { cnt: number }
	return row.cnt
}

// ── AviationStack live (fallback before first seed completes) ────────────────

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

// ── Router ───────────────────────────────────────────────────────────────────

export const flightsRouter = router({
	getLive: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.number().min(0).nullish(),
				airlineName: z.string().optional(),
				fromCountry: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 10
			const offset = input.cursor ?? 0
			const asOffset = Math.floor(offset / (limit * 6)) * limit
			const seeded = dbFlightCount()

			const [openskyResult, aviationResult] = await Promise.allSettled([
				fetchFromOpenSky(limit, offset, input.airlineName),
				seeded > 0
					? Promise.resolve(fetchFromDb(limit, input.airlineName, input.fromCountry))
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

			// Prefer OpenSky (real GPS); fill from DB (schedule-based) for Russian flights
			const seenIcao = new Set<string>()
			const merged: IFlight[] = []

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

			// Apply fromCountry to OpenSky results too (DB already filtered above)
			const fromCountry = input.fromCountry?.toLowerCase()
			const items = fromCountry
				? merged.filter(f => f.from.country?.toLowerCase() === fromCountry)
				: merged

			return { items, nextCursor: offset + limit * 6 }
		})
})