import type { ICoordinate } from '../types/types'

export function interpolateCoordinates(
	from: ICoordinate,
	to: ICoordinate,
	progress: number
): ICoordinate {
	const r = Math.min(100, Math.max(0, progress)) / 100
	const lat = from.lat + (to.lat - from.lat) * r
	const lng = from.lng + (to.lng - from.lng) * r

	return { lat, lng }
}
