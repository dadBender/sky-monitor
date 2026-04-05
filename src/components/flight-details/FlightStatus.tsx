import { formatNumber } from '@/utils/format-number.util'

import type { TFlight } from '@/lib/trpc'

import { ProgressBar } from '../custom-ui/ProgressBar'

interface Props {
	flight: TFlight
}

export function FlightStatus({ flight }: Props) {
	return (
		<div className='bg-card p-mini-element mb-1'>
			<div className='mt-3 mb-3.5'>
				<ProgressBar percentage={flight?.progress ?? 0} />
			</div>
			<div className='flex justify-between text-sm opacity-50'>
				<div>
					<span>{formatNumber(flight?.route.metrics.distanceDoneKm)} km</span>
					<span className='mx-2'>•</span>
					<span>{flight?.route.metrics.durationDoneHm}</span>
				</div>
				<div>
					<span>{formatNumber(flight?.route.metrics.distanceLeftKm)} km</span>
					<span className='mx-2'>•</span>
					<span>{flight?.route.metrics.durationLeftHm}</span>
				</div>
			</div>
		</div>
	)
}
