function toLocalTime(iso: string, timezone?: string | null): string {
	/* const base = new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: timezone,
		hour12: false
	}).format(new Date(iso)) */

	const base: Intl.DateTimeFormatOptions = {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}

	try {
		if (typeof timezone === 'string' && timezone.trim()) {
			return new Intl.DateTimeFormat('ru-RU', {
				...base,
				timeZone: timezone
			}).format(new Date(iso))
		}

		return new Intl.DateTimeFormat('ru-RU', base).format(new Date(iso))
	} catch {
		return new Intl.DateTimeFormat('ru-RU', {
			...base,
			timeZone: 'UTC'
		}).format(new Date(iso))
	}
}

function addMinutes(iso: string, mins: number): string {
	return new Date(new Date(iso).getTime() + mins * 60_000).toISOString()
}

function randomDelay(max = 16) {
	return Math.floor(Math.random() * max)
}

interface Props {
	departureScheduleISO: string
	arrivalScheduleISO: string
	departureTimezone: string
	arrivalTimezone: string
}

export function getFlightSchedule({
	arrivalScheduleISO,
	arrivalTimezone,
	departureScheduleISO,
	departureTimezone
}: Props) {
	const departureActualISO = addMinutes(departureScheduleISO, randomDelay())

	const arrivalActualISO = addMinutes(arrivalScheduleISO, randomDelay())

	return {
		departure: {
			scheduled: {
				iso: departureScheduleISO,
				localTime: toLocalTime(departureScheduleISO, departureTimezone)
			},
			actual: {
				iso: departureActualISO,
				localTime: toLocalTime(departureActualISO, departureTimezone)
			}
		},
		arrival: {
			scheduled: {
				iso: arrivalScheduleISO,
				localTime: toLocalTime(arrivalScheduleISO, arrivalTimezone)
			},
			actual: {
				iso: arrivalActualISO,
				localTime: toLocalTime(arrivalActualISO, arrivalTimezone)
			}
		}
	}
}

export type TGetFlightSchedule = ReturnType<typeof getFlightSchedule>
