export interface IFetchFlightsParams {
	limit?: number
	offset?: number
	airline?: string | null
	fromCountry?: string | null
	flightIcao?: string | null
}

export interface IFetchAllByMultipleIcaoParams
	extends Omit<IFetchFlightsParams, 'flightIcao'> {
	flightIcaos: string[]
}

export interface IPagination {
	limit: number
	offset: number
	count: number
	total: number
}

export interface IAirportInfo {
	airport: string
	timezone: string
	iata: string
	icao: string
	terminal: string | null
	gate: string | null
	delay: number | null
	scheduled: string
	estimated: string
	actual: string | null
	estimated_runway: string | null
	actual_runway: string | null
	baggage?: string | null
}

export interface IAirline {
	name: string
	iata: string
	icao: string
}

export interface IFlight {
	number: string
	iata: string
	icao: string
	codeshared: null
}

export interface IAircraft {
	registration: string
	iata: string
	icao: string
	icao24: string
}

export interface ILive {
	updated: string
	latitude: number
	longitude: number
	altitude: number
	direction: number
	speed_horizontal: number
	speed_vertical: number
	is_ground: boolean
}

export interface IFlightData {
	flight_date: string
	flight_status: string
	departure: IAirportInfo
	arrival: IAirportInfo
	airline: IAirline
	flight: IFlight
	aircraft: IAircraft | null
	live: ILive | null
}

export interface IFetchFlightsResponse {
	pagination: IPagination
	data: IFlightData[]
}
