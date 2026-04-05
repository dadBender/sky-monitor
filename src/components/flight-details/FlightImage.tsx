import type { TFlight } from '@/lib/trpc'

interface Props {
	flight: TFlight
}

export function FlightImage({ flight }: Props) {
	if (!flight) {
		return null
	}

	return (
		<div
			className='xs:h-56 xs:pt-17 h-72 w-full pt-24'
			style={{
				background: `linear-gradient(to top, ${flight.assets.gradient[0]}, ${flight.assets.gradient[1]})`
			}}
		>
			<img
				src={flight.assets.aircraft}
				alt={flight?.airline.name}
				className='mx-auto h-auto max-w-[95%]'
			/>
		</div>
	)
}
