import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

import { getAirportAdditionalDataByIcao } from '../../data/airports/get-airport-coordinates-by-icao'
import type { IAviationStackData } from '../../services/aviationstack/aviation.types'
import type { IFlight } from '../../types/flight.types'
import { interpolateCoordinates } from '../geo.util'
import { calculateProgress } from '../progress.util'

import { computeRouteMetrics } from './compute-route-metrics'
import { correctCity } from './correct-city'
import { generateFakeProgress } from './generate-fake-progress'
import { getFlightSchedule } from './get-flight-schedule'
import { normalizeFlightStatus } from './normalize-flight-status'
import { pickAirlinesAssets } from './pick-airlines-assets'

countries.registerLocale(enLocale)

export function mapAviationToFlight(
	flight: IAviationStackData
): IFlight | null {
	const departure = getAirportAdditionalDataByIcao(flight.departure.icao)
	const arrival = getAirportAdditionalDataByIcao(flight.arrival.icao)

	if (!departure || !arrival) {
		return null
	}

	let progress =
		flight.departure.scheduled && flight.arrival.scheduled
			? calculateProgress(flight.departure.scheduled, flight.arrival.scheduled)
			: 0

	progress = generateFakeProgress(flight, progress)

	const current =
		departure?.coords && arrival?.coords
			? interpolateCoordinates(departure.coords, arrival.coords, progress)
			: null

	const assets = pickAirlinesAssets(flight.airline?.name)

	const normalized = normalizeFlightStatus(
		progress,
		flight.live?.speed_horizontal ?? 0,
		flight.live?.altitude ?? 0
	)

	const metrics = computeRouteMetrics({
		from: departure.coords,
		to: arrival.coords,
		progress: normalized.progress,
		arrivalScheduleISO: flight.arrival.scheduled,
		departureScheduleISO: flight.departure.scheduled
	})

	const schedule = getFlightSchedule({
		departureScheduleISO: flight.departure.scheduled,
		departureTimezone: flight.departure.timezone,
		arrivalScheduleISO: flight.arrival.scheduled,
		arrivalTimezone: flight.arrival.timezone
	})

	return {
		id: flight.flight.iata,
		number: flight.flight.number,
		icao: flight.flight.icao,
		airline: {
			name: flight.airline.name
		},
		assets,
		from: {
			city: correctCity(departure?.city),
			country: departure?.country ?? null,
			countryCode: flight.departure?.iata ?? null,
			countryName: countries.getName(departure.country, 'en'),
			timezone: flight.departure?.timezone ?? null,
			code: flight.departure?.icao ?? null,
			coordinates: departure?.coords ?? null
		},
		to: {
			city: correctCity(arrival?.city),
			country: arrival?.country ?? null,
			countryCode: flight.arrival?.iata ?? null,
			countryName: countries.getName(arrival.country, 'en'),
			timezone: flight.arrival?.timezone ?? null,
			code: flight.arrival?.icao ?? null,
			coordinates: arrival?.coords ?? null
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
