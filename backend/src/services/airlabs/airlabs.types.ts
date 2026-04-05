export interface IAirlabsFlightData {
	hex?: string
	reg_number?: string
	flag?: string
	lat?: number
	lng?: number
	alt?: number
	dir?: number
	speed?: number
	flight_number?: string
	flight_icao?: string
	flight_iata?: string
	dep_icao?: string
	dep_iata?: string
	dep_terminal?: string | null
	dep_gate?: string | null
	/** Local departure time "YYYY-MM-DD HH:MM" */
	dep_time?: string | null
	/** UTC departure time "YYYY-MM-DD HH:MM" */
	dep_time_utc?: string | null
	arr_icao?: string
	arr_iata?: string
	arr_terminal?: string | null
	arr_gate?: string | null
	arr_time?: string | null
	arr_time_utc?: string | null
	airline_icao?: string
	airline_iata?: string
	aircraft_icao?: string
	/** Unix timestamp of last position update */
	updated?: number
	status?: 'en-route' | 'landed' | 'scheduled' | string
	/** Seconds remaining to arrival */
	eta?: number
	/** Flight progress 0-100 */
	percent?: number
	/** Total flight duration in seconds */
	duration?: number
	/** Injected by our seeder — not from API */
	airline_name?: string
}

export interface IAirlabsFlightsResponse {
	response: IAirlabsFlightData[]
}

export interface IAirlabsScheduleData {
	airline_iata?: string
	airline_icao?: string
	flight_iata?: string
	flight_icao?: string
	flight_number?: string
	dep_iata?: string
	dep_icao?: string
	dep_terminal?: string | null
	dep_gate?: string | null
	/** Local departure time "YYYY-MM-DD HH:MM" */
	dep_time?: string | null
	/** UTC departure time "YYYY-MM-DD HH:MM" */
	dep_time_utc?: string | null
	/** Unix timestamp of departure */
	dep_time_ts?: number
	arr_iata?: string
	arr_icao?: string
	arr_terminal?: string | null
	arr_gate?: string | null
	arr_time?: string | null
	arr_time_utc?: string | null
	arr_time_ts?: number
	/** Flight duration in minutes */
	duration?: number
	delayed?: number | null
	dep_delayed?: number | null
	arr_delayed?: number | null
	aircraft_icao?: string
	status?: string
	/** Injected by our router before storing to DB */
	airline_name?: string
}

export interface IAirlabsSchedulesResponse {
	response: IAirlabsScheduleData[]
}
