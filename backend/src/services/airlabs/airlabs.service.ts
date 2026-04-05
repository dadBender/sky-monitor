import axios from 'axios'
import dotenv from 'dotenv'

import db from '../../db'
import { SimpleCache } from '../../utils/cache.util'

import type {
	IAirlabsFlightData,
	IAirlabsFlightsResponse,
	IAirlabsScheduleData,
	IAirlabsSchedulesResponse
} from './airlabs.types'

dotenv.config()

/** Free plan limit per month */
const MONTHLY_LIMIT = 1000
const KEY_ID = 'airlabs'

class AirlabsService {
	private readonly apiUrl = 'https://airlabs.co/api/v9'
	private readonly apiKey: string
	private readonly schedulesCache = new SimpleCache<IAirlabsScheduleData[]>(
		60 * 60 * 1000
	) // 1h

	constructor() {
		this.apiKey = process.env.AIRLABS_API_KEY ?? ''
	}

	private currentMonth(): string {
		const now = new Date()
		return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
	}

	private getOrInitBudget(): { requests_used: number; monthly_limit: number } {
		const month = this.currentMonth()

		const row = db
			.prepare(
				`SELECT requests_used, monthly_limit, month FROM api_key_budget WHERE key_id = ?`
			)
			.get(KEY_ID) as
			| { requests_used: number; monthly_limit: number; month: string }
			| undefined

		if (!row) {
			db.prepare(
				`INSERT INTO api_key_budget (key_id, month, requests_used, monthly_limit) VALUES (?, ?, 0, ?)`
			).run(KEY_ID, month, MONTHLY_LIMIT)
			return { requests_used: 0, monthly_limit: MONTHLY_LIMIT }
		}

		// New calendar month — reset counter
		if (row.month !== month) {
			db.prepare(
				`UPDATE api_key_budget SET month = ?, requests_used = 0 WHERE key_id = ?`
			).run(month, KEY_ID)
			console.log(`[AirLabs] New month ${month} — budget reset`)
			return { requests_used: 0, monthly_limit: row.monthly_limit }
		}

		return row
	}

	private incrementUsage(): void {
		db.prepare(
			`UPDATE api_key_budget SET requests_used = requests_used + 1 WHERE key_id = ?`
		).run(KEY_ID)
	}

	remainingBudget(): number {
		const { requests_used, monthly_limit } = this.getOrInitBudget()
		return Math.max(0, monthly_limit - requests_used)
	}

	async fetchFlightsByAirline(
		airlineIata: string
	): Promise<IAirlabsFlightData[]> {
		if (!this.apiKey) {
			console.warn('[AirLabs] AIRLABS_API_KEY not set, skipping')
			return []
		}

		const remaining = this.remainingBudget()
		if (remaining <= 0) {
			console.warn('[AirLabs] Monthly budget exhausted — skipping request')
			return []
		}

		try {
			console.log(
				`[AirLabs] Fetching ${airlineIata} (${remaining} req remaining this month)`
			)

			const url = new URL(`${this.apiUrl}/flights`)
			url.searchParams.set('airline_iata', airlineIata)
			url.searchParams.set('api_key', this.apiKey)

			const response = await axios.get<IAirlabsFlightsResponse>(url.toString())
			this.incrementUsage()

			return response.data.response ?? []
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const status = err.response?.status
				const message =
					(err.response?.data as any)?.error?.message ?? err.message
				throw new Error(`AirLabs API error [${status}]: ${message}`)
			}
			throw new Error(`Unexpected AirLabs error: ${String(err)}`)
		}
	}

	async fetchSchedules(airlineIata: string): Promise<IAirlabsScheduleData[]> {
		if (!this.apiKey) return []

		const cached = this.schedulesCache.get(airlineIata)
		if (cached) return cached

		const remaining = this.remainingBudget()
		if (remaining <= 0) {
			console.warn(
				'[AirLabs] Monthly budget exhausted — skipping schedules request'
			)
			return []
		}

		try {
			console.log(
				`[AirLabs] Fetching schedules for ${airlineIata} (${remaining} req remaining)`
			)

			const url = new URL(`${this.apiUrl}/schedules`)
			url.searchParams.set('airline_iata', airlineIata)
			url.searchParams.set('type', 'departure')
			url.searchParams.set('api_key', this.apiKey)

			const response = await axios.get<IAirlabsSchedulesResponse>(
				url.toString()
			)
			this.incrementUsage()

			const data = response.data.response ?? []
			this.schedulesCache.set(airlineIata, data)
			return data
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const status = err.response?.status
				const message =
					(err.response?.data as any)?.error?.message ?? err.message
				console.error(`[AirLabs] Schedules error [${status}]: ${message}`)
				return []
			}
			console.error('[AirLabs] Unexpected schedules error:', String(err))
			return []
		}
	}
}

export default new AirlabsService()
