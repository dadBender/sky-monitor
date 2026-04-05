/* eslint-disable no-useless-catch */
import axios from 'axios'

import { ACCESS_TOKEN } from './opensky.token'
import { type IOpenSkyResponse } from './opensky.types'

class OpenSkyService {
	private apiUrl: string

	constructor() {
		this.apiUrl = 'https://opensky-network.org/api'
	}

	async fetchLiveFlights() {
		try {
			const response = await axios.get<IOpenSkyResponse>(
				`${this.apiUrl}/states/all`,
				{
					headers: {
						Authorization: `Bearer ${ACCESS_TOKEN}`
					}
				}
			)

			if (response.status !== 200 || !response.data.states) {
				throw new Error('OpenSky API returned invalid response')
			}

			return response.data
		} catch (err) {
			throw err
		}
	}
}

export default new OpenSkyService()
