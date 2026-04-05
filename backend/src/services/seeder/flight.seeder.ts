import { AIRLINE_NAME_TO_IATA } from '../../data/airline-iata.data';
import { COUNTRIES_DICTIONARY } from '../../data/countries.dictionary';
import db from '../../db';
import airlabsService from '../airlabs/airlabs.service';
import type { IAirlabsFlightData } from '../airlabs/airlabs.types';
import aviationService from '../aviationstack/aviation.service';
import type { IAviationStackData } from '../aviationstack/aviation.types';





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
    (id, icao, airline, raw_data, dep_sched, arr_sched, seeded_at, country_code, source)
  VALUES
    (@id, @icao, @airline, @raw_data, @dep_sched, @arr_sched, @seeded_at, @country_code, @source)
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
			if (
				!id ||
				!icao ||
				!item.departure?.scheduled ||
				!item.arrival?.scheduled
			)
				continue

			insertFlight.run({
				id,
				icao,
				airline: item.airline?.name ?? null,
				raw_data: JSON.stringify(item),
				dep_sched: item.departure.scheduled,
				arr_sched: item.arrival.scheduled,
				seeded_at: Date.now(),
				country_code: countryCode,
				source: 'aviationstack'
			})
			count++
		}
		return count
	})
	return upsert(items)
}

/** "2024-01-15 07:00" → ISO string for SQLite storage */
function airlabsUtcToIso(utcStr?: string | null): string | null {
	if (!utcStr) return null
	return utcStr.replace(' ', 'T') + ':00.000Z'
}

function upsertAirlabsBatch(
	items: IAirlabsFlightData[],
	countryCode: string,
	airlineName: string
): number {
	const upsert = db.transaction((rows: IAirlabsFlightData[]) => {
		let count = 0
		const now = Date.now()

		for (const item of rows) {
			const rawId = item.flight_iata ?? item.flight_icao
			const icao = item.flight_icao
			if (!rawId || !icao) continue
			if (item.status === 'landed' || item.status === 'scheduled') continue

			// AirLabs uses a namespaced key so it never overwrites AviationStack rows
			const id = rawId + ':al'

			let depSched = airlabsUtcToIso(item.dep_time_utc)
			let arrSched = airlabsUtcToIso(item.arr_time_utc)

			// Fallback for en-route flights that lack scheduled times:
			// assume departed ~1h ago, arriving ~2h from now
			if (!depSched || !arrSched) {
				if (item.status !== 'en-route') continue
				depSched = new Date(now - 60 * 60 * 1000).toISOString()
				arrSched = new Date(now + 2 * 60 * 60 * 1000).toISOString()
			}

			// Inject airline name so the mapper can use it without extra lookups
			const enriched: IAirlabsFlightData = {
				...item,
				airline_name: airlineName
			}

			insertFlight.run({
				id,
				icao,
				airline: airlineName,
				raw_data: JSON.stringify(enriched),
				dep_sched: depSched,
				arr_sched: arrSched,
				seeded_at: now,
				country_code: countryCode,
				source: 'airlabs'
			})
			count++
		}
		return count
	})
	return upsert(items)
}

async function seedAirline(
	airlineName: string,
	countryCode: string
): Promise<number> {
	console.log(
		`[Seeder] ✈  ${countryCode} — fetching ${airlineName} (AviationStack)...`
	)
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

async function seedAirlineAirlabs(
	airlineName: string,
	countryCode: string
): Promise<number> {
	const iata = AIRLINE_NAME_TO_IATA[airlineName]
	if (!iata) {
		console.warn(`[Seeder] No IATA code for "${airlineName}", skipping AirLabs`)
		return 0
	}

	console.log(
		`[Seeder] ✈  ${countryCode} — fetching ${airlineName} (AirLabs IATA: ${iata})...`
	)
	try {
		const flights = await airlabsService.fetchFlightsByAirline(iata)
		const count = upsertAirlabsBatch(flights, countryCode, airlineName)
		console.log(`[Seeder]    ${airlineName} (AirLabs): ${count} flights stored`)
		return count
	} catch (err) {
		console.error(
			`[Seeder]    ${airlineName} AirLabs error:`,
			(err as Error).message
		)
		return 0
	}
}

async function seedCountry(code: string): Promise<number> {
	const entry = COUNTRIES_DICTIONARY.find(c => c.code === code && c.enabled)
	if (!entry) {
		console.warn(`[Seeder] Unknown or disabled country code: ${code}`)
		return 0
	}

	console.log(
		`[Seeder] 🌍 Seeding ${entry.displayName} (${code}) — ${entry.airlines.length} airlines`
	)
	let total = 0

	for (const airline of entry.airlines) {
		// AviationStack first, then AirLabs (both write to the same table via INSERT OR REPLACE)
		total += await seedAirline(airline, code)
		await new Promise(resolve => setTimeout(resolve, AIRLINE_DELAY_MS))

		total += await seedAirlineAirlabs(airline, code)
		await new Promise(resolve => setTimeout(resolve, AIRLINE_DELAY_MS))
	}

	return total
}

export async function runSeed(): Promise<void> {
	console.log('[Seeder] ── Starting seed run ──────────────────────')
	console.log(
		`[Seeder] AirLabs budget remaining: ${airlabsService.remainingBudget()} req`
	)

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

	console.log(
		`[Seeder] Will reseed every ${intervalHours}h | Countries: ${getSeedCountryCodes().join(', ')}`
	)
	setInterval(() => {
		runSeed().catch(err => console.error('[Seeder] Periodic seed failed:', err))
	}, intervalMs)
}