import { useSearchParams } from 'react-router'

import type { TFlight } from '@/lib/trpc'
import { cn } from '@/lib/utils'

import { ProgressBar } from '../custom-ui/ProgressBar'

import { FlightCardActions } from './actions/FlightCardActions'
import { QUERY_PARAM_FLIGHT } from './flights.constants'

interface Props {
	flight: TFlight
	index?: number
}

export function FlightCard({ flight, index }: Props) {
	const [searchParams, setSearchParams] = useSearchParams()
	const selectedFlight = searchParams.get(QUERY_PARAM_FLIGHT)

	const isActive = selectedFlight === flight?.id

	if (!flight) {
		return null
	}

	return (
		<div
			className={cn(
				'group animate-fadeIn relative w-full rounded-lg p-0.5 shadow-xl transition-colors ease-in',
				isActive
					? 'bg-gradient-to-r from-rose-500 to-orange-400'
					: 'bg-flight-card'
			)}
			data-testid={`flight-card-${index}`}
		>
			<FlightCardActions flightId={flight.id} />
			<button
				onClick={() => {
					setSearchParams({
						[QUERY_PARAM_FLIGHT]: flight.id
					})
				}}
				className={cn('bg-flight-card block h-full w-full rounded-lg p-4')}
			>
				<div className='mb-7 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white'>
							<img
								src={flight.assets.logo}
								alt={flight.airline.name}
								width={40}
								height={40}
								className='bg-white'
							/>
						</div>
						<span data-testid='flight-id'>{flight.id}</span>
					</div>
					<div>
						<span className='bg-card rounded-xl px-2 py-1'>{flight.icao}</span>
					</div>
				</div>

				<div className='grid grid-cols-[1fr_4fr_1fr] items-end gap-4'>
					<div className='space-y-0.5 text-left'>
						<div>{flight.from.city}</div>
						<div className='text-3xl font-semibold'>{flight.from.code}</div>
					</div>

					<div className='mb-4'>
						<ProgressBar percentage={flight.progress} />
					</div>

					<div className='space-y-0.5 text-right'>
						<div>{flight.to.city}</div>
						<div className='text-3xl font-semibold'>{flight.to.code}</div>
					</div>
				</div>
			</button>
		</div>
	)
}
