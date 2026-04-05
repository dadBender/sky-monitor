import db from '../../db'
import type { IAviationStackData } from '../aviationstack/aviation.types'
import aviationService from '../aviationstack/aviation.service'

// Russian airlines to seed — one AviationStack request per entry
const SEED_AIRLINES = [
	'S7 Airlines',
	'Aeroflot',
	'Rossiya Airlines',
	'Ural Airlines',
	'Nordwind Airlines'
]

// Delay between airline requests to stay well within rate limits
const REQUEST_DELAY_MS = 3_000

const insertFlight = db.prepare(`
  INSERT OR REPLACE INTO seeded_flights (id, icao, airline, raw_data, dep_sched, arr_sched, seeded_at)
  VALUES (@id, @icao, @airline, @raw_data, @dep_sched, @arr_sched, @seeded_at)
`)

const deleteExpired = db.prepare(`
  DELETE FROM seeded_flights
  WHERE datetime(arr_sched) < datetime('now', '-3 hours')
`)

function upsertBatch(items: IAviationStackData[]) {
	const upsert = db.transaction((rows: IAviationStackData[]) => {
		let count = 0
		for (const item of rows) {
			const id = item.flight?.iata || item.flight?.icao
			const icao = item.flight?.icao
			if (!id || !icao || !item.departure?.scheduled || !item.arrival?.scheduled) continue

			insertFlight.run({
				id,
				icao,
				airline: item.airline?.name ?? null,
				raw_data: JSON.stringify(item),
				dep_sched: item.departure.scheduled,
				arr_sched: item.arrival.scheduled,
				seeded_at: Date.now()
			})
			count++
		}
		return count
	})
	return upsert(items)
}

async function seedAirline(airlineName: string): Promise<number> {
	console.log(`[Seeder] ✈  Fetching ${airlineName}...`)
	try {
		const data = await aviationService.fetchLiveFlights(100, 0, airlineName)
		const count = upsertBatch(data.data)
		console.log(`[Seeder]    ${airlineName}: ${count} flights stored`)
		return count
	} catch (err) {
		console.error(`[Seeder]    ${airlineName} error:`, (err as Error).message)
		return 0
	}
}

export async function runSeed(): Promise<void> {
	console.log('[Seeder] ── Starting seed run ──────────────────────')

	// Remove flights that landed more than 3h ago
	const cleaned = deleteExpired.run()
	if (cleaned.changes > 0) {
		console.log(`[Seeder]    Cleaned up ${cleaned.changes} expired flights`)
	}

	let total = 0
	for (const airline of SEED_AIRLINES) {
		total += await seedAirline(airline)
		await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
	}

	console.log(`[Seeder] ── Done. Total in DB: ${total} upserted ──`)
}

export function startSeeder(): void {
	// Seed immediately on startup
	runSeed().catch(err => console.error('[Seeder] Startup seed failed:', err))

	// Reseed periodically — default 24h to respect AviationStack free tier (100 req/month)
	// 5 airlines × 1 req = 5 req per run → at 24h interval = ~150 req/month (basic plan)
	// For free plan set SEED_INTERVAL_HOURS=168 (weekly, 20 req/month)
	const intervalHours = Number(process.env.SEED_INTERVAL_HOURS ?? 24)
	const intervalMs = intervalHours * 60 * 60 * 1000

	console.log(`[Seeder] Will reseed every ${intervalHours}h`)
	setInterval(() => {
		runSeed().catch(err => console.error('[Seeder] Periodic seed failed:', err))
	}, intervalMs)
}