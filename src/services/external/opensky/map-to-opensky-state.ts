import type { IOpenSkyResponse, IOpenskyState } from './opensky.types'

export const mapToOpenskyState = (
	state: IOpenSkyResponse['states'][number]
): IOpenskyState => {
	if (!Array.isArray(state) || state.length < 14) {
		console.warn('Невалидный state:', state)
		throw new Error('Invalid OpenSky state array')
	}

	return {
		icao24: state[0]?.toString(),
		callsign: state[1]?.toString().trim() || null,
		originCountry: state[2]?.toString(),
		timePosition: +state[3],
		lastContact: +state[4],
		longitude: +state[5],
		latitude: +state[6],
		baroAltitude: +state[7],
		onGround: !!state[8],
		velocity: +state[9],
		heading: +state[10],
		verticalRate: +state[11],
		geoAltitude: state[13] ? +state[13] : null,
		squawk: state[14]?.toString() ?? null,
		spi: !!state[15],
		positionSource: +state[16]
	}
}
