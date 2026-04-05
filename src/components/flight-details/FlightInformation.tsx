import { formatNumber } from '@/utils/format-number.util'

import type { TFlight } from '@/lib/trpc'

interface Props {
	flight: NonNullable<TFlight>
}

export function FlightInformation({ flight }: Props) {
	return (
		<div className='xs:text-sm my-3.5'>
			<div className='px-mini-element py-mini-element mb-1 rounded-tl-xl rounded-tr-xl bg-[#ddd] font-medium dark:bg-[#282828]'>
				Flight information
			</div>
			<div className='mb-1 grid grid-cols-2 gap-1'>
				<div className='bg-card px-mini-element py-mini-element flex items-center justify-between'>
					<p>{flight.assets.planeModel}</p>
				</div>
				<div className='bg-card px-mini-element py-mini-element flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<span>{flight.assets.countryFlag}</span>
						<span>{flight.assets.country}</span>
					</div>
				</div>
			</div>
			<div className='mb-1 grid grid-cols-2 gap-1'>
				<div className='bg-card px-mini-element py-mini-element flex flex-wrap items-center justify-between rounded-bl-xl'>
					<p className='text-muted-foreground'>Speed</p>
					<p className='text-[0.9rem]'>{Math.round(flight.route.speed)} km/h</p>
				</div>
				<div className='bg-card px-mini-element py-mini-element flex flex-wrap items-center justify-between rounded-br-xl'>
					<p className='text-muted-foreground'>Altitude</p>
					<p className='text-[0.9rem]'>
						{formatNumber(Math.round(flight.route.altitude))} m
					</p>
				</div>
			</div>
		</div>
	)
}
