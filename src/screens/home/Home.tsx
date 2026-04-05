import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';



import { FlightDetails } from '@/components/flight-details/FlightDetails';
import { FlightList } from '@/components/flight-list/FlightList';
import { SkyTrackMap } from '@/components/map/SkyTrackMap';



import { trpc } from '@/lib/trpc';
import type { TAnyFlight } from '@/lib/trpc';



import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODES } from '@/constants/countries';





export type TFlightMode = 'live' | 'scheduled'

export function Home() {
	const lastUpdateRef = useRef<Date | null>(new Date())

	const [currentAirline, setCurrentAirline] = useState<string | undefined>(
		undefined
	)
	const [selectedCountries, setSelectedCountries] = useState<string[]>(
		DEFAULT_COUNTRY_CODES
	)
	const [flightMode, setFlightMode] = useState<TFlightMode>('live')

	// ── Live flights (infinite scroll) ──────────────────────────────────────
	const {
		data: liveData,
		isLoading: liveLoading,
		error,
		refetch,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage
	} = trpc.flights.getLive.useInfiniteQuery(
		{
			limit: 10,
			airlineName: currentAirline,
			countryCodes: selectedCountries
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
			select: data => data.pages.flatMap(page => page.items) ?? [],
			enabled: flightMode === 'live'
		}
	)

	// ── Scheduled flights ────────────────────────────────────────────────────
	const {
		data: scheduledData,
		isLoading: scheduledLoading,
		refetch: refetchScheduled,
		isRefetching: isRefetchingScheduled
	} = trpc.flights.getScheduled.useQuery(
		{ countryCodes: selectedCountries, airlineName: currentAirline },
		{ enabled: flightMode === 'scheduled' }
	)

	const liveFlights = useMemo(
		() => liveData?.filter(f => !!f) ?? [],
		[liveData]
	)
	const scheduledFlights = useMemo(
		() => scheduledData?.items ?? [],
		[scheduledData]
	)

	const flights: TAnyFlight[] =
		flightMode === 'scheduled' ? scheduledFlights : liveFlights

	useEffect(() => {
		if (flights.length > 0) lastUpdateRef.current = new Date()
	}, [flights])

	const [searchParams] = useSearchParams()
	const selectedFlight = searchParams.get('flight')

	const activeFlight = useMemo(
		() => flights.find(f => f?.id === selectedFlight),
		[flights, selectedFlight]
	)

	const isPending = flightMode === 'scheduled' ? scheduledLoading : liveLoading
	const isRefetchingAny =
		flightMode === 'scheduled' ? isRefetchingScheduled : isRefetching
	const handleRefetch = flightMode === 'scheduled' ? refetchScheduled : refetch

	const airlines = useMemo(
		() =>
			Array.from(
				new Set(
					flights.map(f => f?.airline.name).filter((n): n is string => !!n)
				)
			),
		[flights]
	)

	return error ? (
		<div className='relative z-10 w-sm text-red-500 sm:w-full md:w-xs'>
			Error fetching live flights: {error.message}
		</div>
	) : (
		<div>
			<FlightList
				flights={flights}
				airlines={airlines}
				lastUpdate={lastUpdateRef.current}
				isRefetching={isRefetchingAny}
				isPending={isPending}
				refetch={handleRefetch}
				currentAirline={currentAirline}
				setCurrentAirline={setCurrentAirline}
				selectedCountries={selectedCountries}
				setSelectedCountries={setSelectedCountries}
				countryOptions={COUNTRY_OPTIONS}
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage ?? false}
				isFetchingNextPage={isFetchingNextPage}
				flightMode={flightMode}
				setFlightMode={setFlightMode}
			/>
			{activeFlight && <FlightDetails flight={activeFlight as any} />}
			<div className='absolute inset-0 z-0'>
				<SkyTrackMap
					flights={flights as any}
					activeFlight={activeFlight as any}
				/>
			</div>
		</div>
	)
}
