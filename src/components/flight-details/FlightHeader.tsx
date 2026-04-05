import { useSearchParams } from 'react-router'

import type { TFlight } from '@/lib/trpc'

import { X } from '../animate-ui/icons/x'
import { QUERY_PARAM_FLIGHT } from '../flight-list/flights.constants'

export function FlightHeader({ flight }: { flight: TFlight }) {
	const [searchParams, setSearchParams] = useSearchParams()

	return (
		<div className='xs:rounded-lg bg-card absolute top-3.5 left-1/2 flex h-max w-11/12 -translate-x-1/2 items-center justify-between rounded-xl px-4 py-3'>
			<div>
				<h2 className='text-xl font-medium text-amber-400'>{flight?.id}</h2>
				<p className='text-foreground/60 text-sm'>{flight?.airline.name}</p>
			</div>
			<button
				onClick={() => {
					searchParams.delete(QUERY_PARAM_FLIGHT)
					setSearchParams(searchParams)
				}}
				className='bg-popover text-foreground/60 hover:text-foreground rounded-full p-1 transition-colors'
			>
				<X animateOnHover animateOnTap size={20} />
			</button>
		</div>
	)
}
