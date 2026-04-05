export interface IOpenSkyTokenResponse {
	access_token: string
	expires_in: number
}

export interface IOpenskyState {
	icao24: string // "39de4f"
	callsign: string | null // "TVF3037",
	originCountry: string // "France"
	timePosition: number | null // 1753821226
	lastContact: number // 1753821226
	longitude: number | null // 2.0565
	latitude: number | null // 48.5571
	baroAltitude: number | null // 3352.8
	onGround: boolean // false
	velocity: number | null // 156.08 (м/с)
	heading: number | null // 84.51 (градусы)
	verticalRate: number | null // 0
	// sensors: null | number[] // null
	geoAltitude: number | null // 3520.44
	squawk: string | null // "1000"
	spi: boolean // false
	positionSource: number // 0
}

export interface IOpenSkyResponse {
	time: number
	states: [
		string, // 0. icao24
		string | null, // 1. callsign
		string, // 2. origin_country
		number | null, // 3. time_position
		number | null, // 4. last_contact
		number | null, // 5. longitude
		number | null, // 6. latitude
		number | null, // 7. baro_altitude
		boolean, // 8. on_ground
		number | null, // 9. velocity
		number | null, // 10. heading
		number | null, // 11. vertical_rate
		null, // 12. sensors (null)
		number | null, // 13. geo_altitude
		string | null, // 14. squawk
		boolean, // 15. spi
		number // 16. position_source
	][]
}
