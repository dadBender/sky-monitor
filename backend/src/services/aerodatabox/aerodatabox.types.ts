export interface IAeroDataBoxAirport {
	icao: string
	iata: string
	name: string
	shortName?: string
	municipalityName?: string
	location?: { lat: number; lon: number }
	timeZone?: string
}

export interface IAeroDataBoxTime {
	utc: string   // "2024-01-01 08:00Z"
	local: string // "2024-01-01 11:00+03:00"
}

export interface IAeroDataBoxDeparture {
	airport: IAeroDataBoxAirport
	scheduledTime: IAeroDataBoxTime
	actualTime?: IAeroDataBoxTime
	terminal?: string
	gate?: string
}

export interface IAeroDataBoxArrival {
	airport: IAeroDataBoxAirport
	scheduledTime: IAeroDataBoxTime
	estimatedTime?: IAeroDataBoxTime
	actualTime?: IAeroDataBoxTime
	terminal?: string
	gate?: string
}

export interface IAeroDataBoxFlight {
	departure: IAeroDataBoxDeparture
	arrival: IAeroDataBoxArrival
	airline?: { name: string; iata?: string; icao?: string }
	number?: string
	callSign?: string
	status?: string
	aircraft?: { reg?: string; modeS?: string; model?: string }
}