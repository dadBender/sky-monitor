import type { TAirlineAssets } from '../data/airline-assets.data'
import type { TComputeRouteMetrics } from '../utils/map-aviation-stack/compute-route-metrics'
import type { TGetFlightSchedule } from '../utils/map-aviation-stack/get-flight-schedule'

import type { ICoordinate } from './types'

export interface IFlightRoute {
	speed: number
	altitude: number
	metrics: TComputeRouteMetrics
}

export interface IFlightLocation {
	city: string | null
	country: string | null
	countryCode: string
	countryName?: string
	timezone: string
	code: string
	coordinates: ICoordinate | null
}

export interface IFlightAirline {
	name: string
}

export interface IFlight {
	id: string
	number: string
	icao: string
	assets: TAirlineAssets
	route: IFlightRoute
	airline: IFlightAirline
	from: IFlightLocation
	to: IFlightLocation
	progress: number
	currentLocation: Pick<IFlightLocation, 'coordinates'>
	schedule: TGetFlightSchedule
}
