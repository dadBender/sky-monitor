import db from '../../db'
import { COUNTRIES_DICTIONARY } from '../../data/countries.dictionary'
import type { IAviationStackData } from '../aviationstack/aviation.types'
import aviationService from '../aviationstack/aviation.service'

// Delay between individual airline requests (respects AviationStack rate limit)
const AIRLINE_DELAY_MS = 3_000
// Extra delay between country batches
const COUNTRY_DELAY_MS = 5_000

// Controls which country codes to seed. Defaults to RU only.
// Set SEED_COUNTRIES=RU,TR,DE in .env to add more countries.
// Budget note — AviationStack free plan: 100 req/month
//   RU alone  (5 airlines)  at weekly cadence = ~22 req/month ✓
//   All 9 countries (16 airlines) at weekly cadence = ~70 req/month ✓
function getSeedCountryCodes(): string[] {
	const env = process.env.SEED_COUNTRIES
	if (env) {
		return env
			.split(',')
			.map(s => s.trim().toUpperCase())
			.filter(Boolean)
	}
	return ['RU']
}

const insertFlight = db.prepare(`
  INSERT OR REPLACE INTO seeded_flights
    (id, icao, airline, raw_data, dep_sched, arr_sched, seeded_at, country_code)
  VALUES
    (@id, @icao, @airline, @raw_data, @dep_sched, @arr_sched, @seeded_at, @country_code)
`)

const deleteExpired = db.prepare(`
  DELETE FROM seeded_flights
  WHERE datetime(arr_sched) < datetime('now', '-3 hours')
`)

function upsertBatch(items: IAviationStackData[], countryCode: string): number {
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
				seeded_at: Date.now(),
				country_code: countryCode
			})
			count++
		}
		return count
	})
	return upsert(items)
}

async function seedAirline(airlineName: string, countryCode: string): Promise<number> {
	console.log(`[Seeder] ✈  ${countryCode} — fetching ${airlineName}...`)
	try {
		const data = await aviationService.fetchLiveFlights(100, 0, airlineName)
		const count = upsertBatch(data.data, countryCode)
		console.log(`[Seeder]    ${airlineName}: ${count} flights stored`)
		return count
	} catch (err) {
		console.error(`[Seeder]    ${airlineName} error:`, (err as Error).message)
		return 0
	}
}

async function seedCountry(code: string): Promise<number> {
	const entry = COUNTRIES_DICTIONARY.find(c => c.code === code && c.enabled)
	if (!entry) {
		console.warn(`[Seeder] Unknown or disabled country code: ${code}`)
		return 0
	}

	console.log(`[Seeder] 🌍 Seeding ${entry.displayName} (${code}) — ${entry.airlines.length} airlines`)
	let total = 0

	for (const airline of entry.airlines) {
		total += await seedAirline(airline, code)
		await new Promise(resolve => setTimeout(resolve, AIRLINE_DELAY_MS))
	}

	return total
}

export async function runSeed(): Promise<void> {
	console.log('[Seeder] ── Starting seed run ──────────────────────')

	const cleaned = deleteExpired.run()
	if (cleaned.changes > 0) {
		console.log(`[Seeder]    Cleaned up ${cleaned.changes} expired flights`)
	}

	const seedCodes = getSeedCountryCodes()
	// Sort by priority: RU always first regardless of env order
	const ordered = [...seedCodes].sort((a, b) => {
		const pa = COUNTRIES_DICTIONARY.find(c => c.code === a)?.priority ?? 99
		const pb = COUNTRIES_DICTIONARY.find(c => c.code === b)?.priority ?? 99
		return pa - pb
	})

	console.log(`[Seeder] Countries to seed: ${ordered.join(', ')}`)

	let grandTotal = 0
	for (let i = 0; i < ordered.length; i++) {
		grandTotal += await seedCountry(ordered[i])
		if (i < ordered.length - 1) {
			await new Promise(resolve => setTimeout(resolve, COUNTRY_DELAY_MS))
		}
	}

	console.log(`[Seeder] ── Done. Total upserted: ${grandTotal} ──`)
}

/** Seed a single country immediately (for manual revalidation) */
export async function revalidateCountry(code: string): Promise<void> {
	console.log(`[Seeder] 🔄 Revalidating country: ${code}`)
	await seedCountry(code)
}

export function startSeeder(): void {
	runSeed().catch(err => console.error('[Seeder] Startup seed failed:', err))

	// Reseed periodically — default 168h (weekly) for free AviationStack plan
	// Set SEED_INTERVAL_HOURS=24 if on a paid plan (basic = 1000 req/month)
	const intervalHours = Number(process.env.SEED_INTERVAL_HOURS ?? 168)
	const intervalMs = intervalHours * 60 * 60 * 1000

	console.log(`[Seeder] Will reseed every ${intervalHours}h | Countries: ${getSeedCountryCodes().join(', ')}`)
	setInterval(() => {
		runSeed().catch(err => console.error('[Seeder] Periodic seed failed:', err))
	}, intervalMs)
}