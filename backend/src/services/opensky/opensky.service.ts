import axios from 'axios'
import dotenv from 'dotenv'

import { SimpleCache } from '../../utils/cache.util'

import type { IOpenskyState, IOpenSkyResponse } from './opensky.types'

dotenv.config()

class OpenSkyService {
	private apiUrl = 'https://opensky-network.org/api'
	private cache = new SimpleCache<IOpenskyState[]>(30_000) // 30s TTL

	private mapState(raw: IOpenSkyResponse['states'][number]): IOpenskyState | null {
		if (!Array.isArray(raw) || raw.length < 14) return null

		const callsign = typeof raw[1] === 'string' ? raw[1].trim() || null : null
		const latitude = raw[6] != null ? Number(raw[6]) : null
		const longitude = raw[5] != null ? Number(raw[5]) : null
		const onGround = Boolean(raw[8])

		if (!callsign || latitude == null || longitude == null || onGround) return null

		return {
			icao24: String(raw[0]),
			callsign,
			originCountry: String(raw[2]),
			timePosition: raw[3] != null ? Number(raw[3]) : null,
			lastContact: Number(raw[4]),
			longitude,
			latitude,
			baroAltitude: raw[7] != null ? Number(raw[7]) : null,
			onGround,
			velocity: raw[9] != null ? Number(raw[9]) : null,
			heading: raw[10] != null ? Number(raw[10]) : null,
			verticalRate: raw[11] != null ? Number(raw[11]) : null,
			geoAltitude: raw[13] != null ? Number(raw[13]) : null,
			squawk: raw[14] != null ? String(raw[14]) : null,
			spi: Boolean(raw[15]),
			positionSource: Number(raw[16])
		}
	}

	async fetchStates(): Promise<IOpenskyState[]> {
		const cached = this.cache.get('states')
		if (cached) return cached

		const username = process.env.OPENSKY_USERNAME
		const password = process.env.OPENSKY_PASSWORD

		const config = username && password
			? { auth: { username, password } }
			: {}

		const response = await axios.get<IOpenSkyResponse>(
			`${this.apiUrl}/states/all`,
			{ ...config, timeout: 15_000 }
		)

		if (!response.data?.states) {
			throw new Error('OpenSky API returned empty states')
		}

		const states = response.data.states
			.map(s => this.mapState(s))
			.filter((s): s is IOpenskyState => s !== null)

		this.cache.set('states', states)
		return states
	}
}

export default new OpenSkyService()
