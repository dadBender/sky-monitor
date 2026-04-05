import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { FlightDetails } from '@/components/flight-details/FlightDetails'
import { FlightList } from '@/components/flight-list/FlightList'
import { SkyTrackMap } from '@/components/map/SkyTrackMap'

import { trpc } from '@/lib/trpc'

export function Home() {
	const lastUpdateRef = useRef<Date | null>(new Date())

	const [currentAirline, setCurrentAirline] = useState<string | undefined>(undefined)

	const {
		data,
		isLoading,
		error,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage
	} = trpc.flights.getLive.useInfiniteQuery(
		{
			limit: 10,
			airlineName: currentAirline
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
			select: data => data.pages.flatMap(page => page.items) ?? []
		}
	)

	useEffect(() => {
		if (data && data.length > 0) {
			lastUpdateRef.current = new Date()
		}
	}, [data])

	const flights = useMemo(() => data?.filter(f => !!f) ?? [], [data])

	const [searchParams] = useSearchParams()
	const selectedFlight = searchParams.get('flight')

	const activeFlight = useMemo(
		() => flights.find(flight => flight?.id === selectedFlight),
		[flights, selectedFlight]
	)

	return error ? (
		<div className='relative z-10 w-sm text-red-500 sm:w-full md:w-xs'>
			Error fetching live flights: {error.message}
		</div>
	) : (
		<div>
			<FlightList
				flights={flights}
				lastUpdate={lastUpdateRef.current}
				isRefetching={isRefetching}
				isPending={isLoading}
				refetch={refetch}
				currentAirline={currentAirline}
				setCurrentAirline={setCurrentAirline}
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
			/>
			{activeFlight && <FlightDetails flight={activeFlight} />}
			<div className='absolute inset-0 z-0'>
				<SkyTrackMap flights={flights} activeFlight={activeFlight} />
			</div>
		</div>
	)
}
