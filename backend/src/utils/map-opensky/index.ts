import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

import { getAirportAdditionalDataByIcao } from '../../data/airports/get-airport-coordinates-by-icao'
import type { IAeroDataBoxFlight } from '../../services/aerodatabox/aerodatabox.types'
import type { IOpenskyState } from '../../services/opensky/opensky.types'
import type { IFlight } from '../../types/flight.types'
import { interpolateCoordinates } from '../geo.util'
import { computeRouteMetrics } from '../map-aviation-stack/compute-route-metrics'
import { correctCity } from '../map-aviation-stack/correct-city'
import { getFlightSchedule } from '../map-aviation-stack/get-flight-schedule'
import { normalizeFlightStatus } from '../map-aviation-stack/normalize-flight-status'
import { pickAirlinesAssets } from '../map-aviation-stack/pick-airlines-assets'
import { calculateProgress } from '../progress.util'

countries.registerLocale(enLocale)

// AeroDataBox returns "2024-01-01 08:00Z" — convert to ISO 8601
function toISO(dt: string): string {
	return dt.replace(' ', 'T').replace(/Z$/, ':00Z')
}

export function mapOpenskyToFlight(
	state: IOpenskyState,
	details: IAeroDataBoxFlight | null
): IFlight | null {
	if (!details) return null

	const depIcao = details.departure?.airport?.icao
	const arrIcao = details.arrival?.airport?.icao
	if (!depIcao || !arrIcao) return null

	const departure = getAirportAdditionalDataByIcao(depIcao)
	const arrival = getAirportAdditionalDataByIcao(arrIcao)
	if (!departure || !arrival) return null

	const depUtc = details.departure?.scheduledTime?.utc
	const arrUtc = details.arrival?.scheduledTime?.utc
	if (!depUtc || !arrUtc) return null

	const depISO = toISO(depUtc)
	const arrISO = toISO(arrUtc)

	const progress = calculateProgress(depISO, arrISO)
	if (progress <= 0 || progress >= 100) return null

	// OpenSky velocity is m/s → convert to km/h
	const speedKmh = state.velocity != null ? Math.round(state.velocity * 3.6) : 0
	const altitudeM = state.baroAltitude ?? state.geoAltitude ?? 0

	const normalized = normalizeFlightStatus(progress, speedKmh, altitudeM)

	const metrics = computeRouteMetrics({
		from: departure.coords,
		to: arrival.coords,
		progress: normalized.progress,
		departureScheduleISO: depISO,
		arrivalScheduleISO: arrISO
	})

	const depTimezone = details.departure.airport.timeZone ?? 'UTC'
	const arrTimezone = details.arrival.airport.timeZone ?? 'UTC'

	const schedule = getFlightSchedule({
		departureScheduleISO: depISO,
		departureTimezone: depTimezone,
		arrivalScheduleISO: arrISO,
		arrivalTimezone: arrTimezone
	})

	const airlineName = details.airline?.name ?? state.callsign!.slice(0, 3)
	const assets = pickAirlinesAssets(airlineName)

	// Use real OpenSky position; fallback to interpolation
	const currentLocation =
		state.latitude != null && state.longitude != null
			? { coordinates: { lat: state.latitude, lng: state.longitude } }
			: { coordinates: interpolateCoordinates(departure.coords, arrival.coords, normalized.progress) }

	const flightId = state.callsign!.trim()

	return {
		id: flightId,
		number: details.number ?? flightId.replace(/^[A-Z]+/, ''),
		icao: flightId,
		airline: { name: airlineName },
		assets,
		from: {
			city: correctCity(departure.city),
			country: departure.country ?? null,
			countryCode: details.departure.airport.iata ?? '',
			countryName: countries.getName(departure.country, 'en'),
			timezone: depTimezone,
			code: depIcao,
			coordinates: departure.coords ?? null
		},
		to: {
			city: correctCity(arrival.city),
			country: arrival.country ?? null,
			countryCode: details.arrival.airport.iata ?? '',
			countryName: countries.getName(arrival.country, 'en'),
			timezone: arrTimezone,
			code: arrIcao,
			coordinates: arrival.coords ?? null
		},
		currentLocation,
		route: {
			speed: normalized.speed,
			altitude: normalized.altitude,
			metrics
		},
		progress: normalized.progress,
		schedule
	}
}