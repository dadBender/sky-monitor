import type { ICoordinate } from '../../types/types'

const EARTH_RADIUS_KM = 6371

const toRad = (deg: number) => (deg * Math.PI) / 180

function haversineDistanceKm(a: ICoordinate, b: ICoordinate): number {
	const dLat = toRad(b.lat - a.lat)
	const dLng = toRad(b.lng - a.lng)
	const lat1 = toRad(a.lat)
	const lat2 = toRad(b.lat)
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
	return Math.round(
		EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
	)
}

function diffMinutesISO(startISO: string, endISO: string): number {
	return Math.max(
		0,
		Math.round(
			(new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000
		)
	)
}

function formatHm(mins: number): string {
	const h = Math.floor(mins / 60)
	const m = Math.floor(mins % 60)
	return `${h}h ${m.toString().padStart(2, '0')}m`
}

interface Props {
	from: ICoordinate
	to: ICoordinate
	progress: number
	departureScheduleISO: string
	arrivalScheduleISO: string
}

export function computeRouteMetrics({
	from,
	to,
	progress,
	departureScheduleISO,
	arrivalScheduleISO
}: Props) {
	const totalDistanceKm = haversineDistanceKm(from, to)
	const totalDurationMin = diffMinutesISO(
		departureScheduleISO,
		arrivalScheduleISO
	)

	const ratioDone = Math.min(Math.max(progress / 100, 0), 1)

	const distanceDoneKm = Math.round(totalDistanceKm * ratioDone)
	const distanceLeftKm = Math.max(0, totalDistanceKm - distanceDoneKm)

	const durationDoneMin = Math.round(totalDurationMin * ratioDone)
	const durationLeftMin = Math.max(0, totalDurationMin - durationDoneMin)

	return {
		distanceLeftKm,
		durationLeftHm: formatHm(durationLeftMin),
		distanceDoneKm,
		durationDoneHm: formatHm(durationDoneMin)
	}
}

export type TComputeRouteMetrics = ReturnType<typeof computeRouteMetrics>
