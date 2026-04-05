import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

import { getAirportAdditionalDataByIcao } from '../../data/airports/get-airport-coordinates-by-icao'
import type {
	IAirlabsFlightData,
	IAirlabsScheduleData
} from '../../services/airlabs/airlabs.types'
import type { IFlight } from '../../types/flight.types'
import { interpolateCoordinates } from '../geo.util'
import { computeRouteMetrics } from '../map-aviation-stack/compute-route-metrics'
import { correctCity } from '../map-aviation-stack/correct-city'
import { getFlightSchedule } from '../map-aviation-stack/get-flight-schedule'
import { normalizeFlightStatus } from '../map-aviation-stack/normalize-flight-status'
import { pickAirlinesAssets } from '../map-aviation-stack/pick-airlines-assets'
import { calculateProgress } from '../progress.util'

countries.registerLocale(enLocale)

/** "2024-01-15 07:00" → "2024-01-15T07:00:00.000Z" */
function utcStrToIso(utcStr?: string | null): string | null {
	if (!utcStr) return null
	return utcStr.replace(' ', 'T') + ':00.000Z'
}

export function mapAirlabsToFlight(flight: IAirlabsFlightData): IFlight | null {
	const depIcao = flight.dep_icao
	const arrIcao = flight.arr_icao

	if (!depIcao || !arrIcao) return null

	const flightId = flight.flight_iata ?? flight.flight_icao
	if (!flightId) return null

	const departure = getAirportAdditionalDataByIcao(depIcao)
	const arrival = getAirportAdditionalDataByIcao(arrIcao)
	if (!departure || !arrival) return null

	const depScheduled = utcStrToIso(flight.dep_time_utc)
	const arrScheduled = utcStrToIso(flight.arr_time_utc)
	if (!depScheduled || !arrScheduled) return null

	// Prefer AirLabs percent field, fall back to time-based calculation
	const progress =
		typeof flight.percent === 'number' && flight.percent >= 0
			? flight.percent
			: calculateProgress(depScheduled, arrScheduled)

	const current =
		departure.coords && arrival.coords
			? interpolateCoordinates(departure.coords, arrival.coords, progress)
			: null

	const airlineName = flight.airline_name ?? flight.airline_iata ?? 'Unknown'
	const assets = pickAirlinesAssets(airlineName)

	const normalized = normalizeFlightStatus(
		progress,
		flight.speed ?? 0,
		flight.alt ?? 0
	)

	const metrics = computeRouteMetrics({
		from: departure.coords,
		to: arrival.coords,
		progress: normalized.progress,
		arrivalScheduleISO: arrScheduled,
		departureScheduleISO: depScheduled
	})

	// AirLabs doesn't provide timezone strings — getFlightSchedule handles empty string gracefully
	const schedule = getFlightSchedule({
		departureScheduleISO: depScheduled,
		departureTimezone: '',
		arrivalScheduleISO: arrScheduled,
		arrivalTimezone: ''
	})

	return {
		id: flightId,
		number: flight.flight_number ?? '',
		icao: flight.flight_icao ?? '',
		airline: { name: airlineName },
		assets,
		from: {
			city: correctCity(departure.city),
			country: departure.country ?? null,
			countryCode: flight.dep_iata ?? depIcao,
			countryName: countries.getName(departure.country, 'en'),
			timezone: null as unknown as string,
			code: depIcao,
			coordinates: departure.coords ?? null
		},
		to: {
			city: correctCity(arrival.city),
			country: arrival.country ?? null,
			countryCode: flight.arr_iata ?? arrIcao,
			countryName: countries.getName(arrival.country, 'en'),
			timezone: null as unknown as string,
			code: arrIcao,
			coordinates: arrival.coords ?? null
		},
		currentLocation: { coordinates: current },
		route: {
			speed: normalized.speed,
			altitude: normalized.altitude,
			metrics
		},
		progress: normalized.progress,
		schedule
	}
}

export function mapAirlabsScheduleToFlight(
	schedule: IAirlabsScheduleData,
	airlineName?: string
): IFlight | null {
	const depIcao = schedule.dep_icao
	const arrIcao = schedule.arr_icao
	const flightId = schedule.flight_iata ?? schedule.flight_icao
	if (!depIcao || !arrIcao || !flightId) return null

	const departure = getAirportAdditionalDataByIcao(depIcao)
	const arrival = getAirportAdditionalDataByIcao(arrIcao)
	if (!departure || !arrival) return null

	const depScheduled = utcStrToIso(schedule.dep_time_utc)
	const arrScheduled = utcStrToIso(schedule.arr_time_utc)
	if (!depScheduled || !arrScheduled) return null

	const name =
		airlineName ?? schedule.airline_name ?? schedule.airline_iata ?? 'Unknown'
	const assets = pickAirlinesAssets(name)

	const metrics = computeRouteMetrics({
		from: departure.coords,
		to: arrival.coords,
		progress: 0,
		arrivalScheduleISO: arrScheduled,
		departureScheduleISO: depScheduled
	})

	const flightSchedule = getFlightSchedule({
		departureScheduleISO: depScheduled,
		departureTimezone: '',
		arrivalScheduleISO: arrScheduled,
		arrivalTimezone: ''
	})

	return {
		id: flightId,
		number: schedule.flight_number ?? '',
		icao: schedule.flight_icao ?? '',
		airline: { name },
		assets,
		from: {
			city: correctCity(departure.city),
			country: departure.country ?? null,
			countryCode: schedule.dep_iata ?? depIcao,
			countryName: countries.getName(departure.country, 'en'),
			timezone: null as unknown as string,
			code: depIcao,
			coordinates: departure.coords ?? null
		},
		to: {
			city: correctCity(arrival.city),
			country: arrival.country ?? null,
			countryCode: schedule.arr_iata ?? arrIcao,
			countryName: countries.getName(arrival.country, 'en'),
			timezone: null as unknown as string,
			code: arrIcao,
			coordinates: arrival.coords ?? null
		},
		currentLocation: { coordinates: departure.coords ?? null },
		route: {
			speed: 0,
			altitude: 0,
			metrics
		},
		progress: 0,
		schedule: flightSchedule,
		isScheduled: true
	}
}
