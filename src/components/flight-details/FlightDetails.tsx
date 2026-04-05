import { AnimatePresence, m } from 'framer-motion'

import type { TFlight } from '@/lib/trpc'

import { FlightActions } from './FlightActions'
import { FlightHeader } from './FlightHeader'
import { FlightImage } from './FlightImage'
import { FlightInformation } from './FlightInformation'
import { FlightRoute } from './FlightRoute'
import { FlightSchedule } from './FlightSchedule'
import { FlightStatus } from './FlightStatus'

interface Props {
	flight: NonNullable<TFlight>
}

export function FlightDetails({ flight }: Props) {
	return (
		<AnimatePresence mode='wait'>
			<m.aside
				key={flight.id}
				initial={{ x: '100%', opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: '100%', opacity: 0 }}
				transition={{
					type: 'tween',
					duration: 0.4,
					ease: [0.3, 0.4, 0.45, 0.95]
				}}
				className='xs:rounded-lg xs:top-2 xs:inset-2.5 xs:w-[95%] bg-flight-card xs:overflow-y-auto absolute top-7 right-7 z-10 w-sm overflow-hidden rounded-xl shadow-xl sm:inset-3 sm:top-21 sm:w-[95.5%] xl:top-28'
				// style={{
				// 	height: 'calc(100% - 56px)'
				// }}
			>
				<FlightHeader flight={flight} />
				<FlightImage flight={flight} />

				<div className='p-3.5'>
					<FlightRoute flight={flight} />

					<FlightStatus flight={flight} />
					<FlightSchedule flight={flight} />

					<FlightInformation flight={flight} />

					<FlightActions flight={flight} />
				</div>
			</m.aside>
		</AnimatePresence>
	)
}
