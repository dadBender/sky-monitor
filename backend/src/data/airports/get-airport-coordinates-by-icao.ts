import airports from './airports.json'

interface IAirportRaw {
	id: string
	ident: string
	type: string
	name: string
	latitude_deg: string
	longitude_deg: string
	elevation_ft: string
	continent: string
	iso_country: string
	iso_region: string
	municipality: string
	scheduled_service: string
	icao_code: string
	iata_code: string
	gps_code: string
	local_code: string
	home_link: string
	wikipedia_link: string
	keywords: string
}

export function getAirportAdditionalDataByIcao(icao?: string) {
	if (!icao) {
		return null
	}

	const airport = (airports as IAirportRaw[]).find(
		a => a.icao_code?.toLowerCase() === icao?.toLowerCase()
	)

	if (!airport) {
		return null
	}

	return {
		name: airport.name,
		country: airport.iso_country,
		city: airport.municipality,
		elevation: airport.elevation_ft ? parseInt(airport.elevation_ft, 10) : null,
		iata: airport.iata_code || null,
		type: airport.type,
		coords: {
			lat: parseFloat(airport.latitude_deg),
			lng: parseFloat(airport.longitude_deg)
		}
	}
}
