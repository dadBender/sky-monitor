import { Calendar, Route } from 'lucide-react'
import { toast } from 'sonner'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'

import { formatICSDate } from '@/utils/format-ics-date.util'

import type { TFlight } from '@/lib/trpc'
import { cn } from '@/lib/utils'

import { MapPin } from '../animate-ui/icons/map-pin'
import { SquareArrowOutUpRight } from '../animate-ui/icons/square-arrow-out-up-right'
import { QUERY_PARAM_FLIGHT } from '../flight-list/flights.constants'

import {
	toggleFlightRoute,
	toggleFollowFlight
} from '@/store/flight-actions/flight-action.slice'

interface Props {
	flight: NonNullable<TFlight>
}

export function FlightActions({ flight }: Props) {
	const dispatch = useAppDispatch()

	const isShowRoute = useAppSelector(state => state.flightActions.isShowRoute)
	const isFollowingFlight = useAppSelector(
		state => state.flightActions.isFollowingFlight
	)

	const handleShare = async () => {
		try {
			const url = `${window.location.origin}${window.location.pathname}?${QUERY_PARAM_FLIGHT}=${flight.id}`
			await navigator.clipboard.writeText(url)

			toast.success('Flight link copied to clipboard', {
				description: 'Share it with your friends! ✈️',
				id: 'copy-flight-link-success'
			})
		} catch {
			toast.error('Failed to copy flight link.', {
				description: 'Please try again.',
				id: 'copy-flight-link-error'
			})
		}
	}

	const handleAddToCalendar = () => {
		if (!flight) {
			toast.error('Flight time is not available.')
			return
		}

		const schedule = flight.schedule

		const start = new Date(schedule.departure.scheduled.iso)
		const end = new Date(schedule.arrival.scheduled.iso)

		const dtStart = formatICSDate(start)
		const dtEnd = formatICSDate(end)

		const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Flight ${flight.from.code} → ${flight.to.code} (${flight.id})
DTSTART:${dtStart}
DTEND:${dtEnd}
DESCRIPTION:Airline: ${flight.airline.name}, Flight ID: ${flight.id}
LOCATION:${flight.from.city} - ${flight.to.city}
END:VEVENT
END:VCALENDAR
`.trim()

		const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = `flight-${flight.id}.ics`
		link.click()

		URL.revokeObjectURL(url)

		toast.success('File added to downloads', {
			description: 'Open it with your calendar app! 📅'
		})
	}

	return (
		<div className='xs:text-sm'>
			<div className='grid grid-cols-4 gap-1'>
				<button
					onClick={() => dispatch(toggleFlightRoute())}
					className={cn(
						'bg-card px-mini-element py-mini-element xs:rounded-tl-xl xs:rounded-bl-xl hover:bg-card/60 flex flex-col items-center gap-2 rounded-tl-2xl rounded-bl-2xl transition-colors',
						{
							'bg-[#ddd] hover:bg-[#ddd]/70 dark:bg-[#282828] dark:hover:bg-[#282828]/70':
								isShowRoute
						}
					)}
				>
					<Route size={22} className='xs:size-5' />
					<span>Route</span>
				</button>
				<button
					onClick={() => dispatch(toggleFollowFlight())}
					className={cn(
						'bg-card px-mini-element py-mini-element hover:bg-card/60 flex flex-col items-center gap-2 transition-colors',
						{
							'bg-[#ddd] hover:bg-[#ddd]/70 dark:bg-[#282828] dark:hover:bg-[#282828]/70':
								isFollowingFlight
						}
					)}
				>
					<MapPin animateOnHover animateOnTap size={22} className='xs:size-5' />
					<span>Follow</span>
				</button>
				<button
					onClick={handleShare}
					className='bg-card px-mini-element py-mini-element hover:bg-card/60 flex flex-col items-center gap-2 transition-colors'
				>
					<SquareArrowOutUpRight
						animateOnHover
						animateOnTap
						size={22}
						className='xs:size-5'
					/>
					<span>Share</span>
				</button>
				<button
					onClick={handleAddToCalendar}
					className='bg-card px-mini-element py-mini-element hover:bg-card/60 flex flex-col items-center gap-2 rounded-tr-2xl rounded-br-2xl transition-colors'
					data-testid='add-to-calendar-button'
				>
					<Calendar size={22} className='xs:size-5' />
					<span>Add</span>
				</button>
			</div>
		</div>
	)
}
