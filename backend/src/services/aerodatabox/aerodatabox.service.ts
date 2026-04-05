import axios from 'axios'
import dotenv from 'dotenv'

import type { IAeroDataBoxFlight } from './aerodatabox.types'

dotenv.config()

const TTL_MS = 600_000 // 10 min

class AeroDataBoxService {
	private apiUrl = 'https://aerodatabox.p.rapidapi.com'
	// SimpleCache returns null on miss, so we use a plain Map to distinguish "miss" vs "cached null"
	private cache = new Map<string, { data: IAeroDataBoxFlight | null; expiresAt: number }>()

	private get apiKey(): string {
		return process.env.AERODATABOX_API_KEY ?? ''
	}

	private getCached(key: string): IAeroDataBoxFlight | null | undefined {
		const entry = this.cache.get(key)
		if (!entry) return undefined
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key)
			return undefined
		}
		return entry.data
	}

	private setCached(key: string, data: IAeroDataBoxFlight | null) {
		this.cache.set(key, { data, expiresAt: Date.now() + TTL_MS })
	}

	async getFlightByCallsign(callsign: string): Promise<IAeroDataBoxFlight | null> {
		const key = callsign.toUpperCase()
		const cached = this.getCached(key)
		if (cached !== undefined) return cached

		if (!this.apiKey) {
			console.warn('AERODATABOX_API_KEY is not set')
			this.setCached(key, null)
			return null
		}

		try {
			const response = await axios.get<IAeroDataBoxFlight[]>(
				`${this.apiUrl}/flights/callsign/${key}`,
				{
					headers: {
						'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
						'x-rapidapi-key': this.apiKey
					},
					timeout: 8_000
				}
			)

			// API returns array — take the most recent flight (last item)
			const flights = response.data
			const flight = Array.isArray(flights) && flights.length > 0
				? flights[flights.length - 1]
				: null

			this.setCached(key, flight)
			return flight
		} catch (err) {
			console.warn(`[AeroDataBox] ${key} error:`, (err as any)?.response?.status, (err as any)?.message)
			this.setCached(key, null)
			return null
		}
	}
}

export default new AeroDataBoxService()