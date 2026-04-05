import { ArrowDownFromLine, ArrowUpFromLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import type { TInfiniteQueryResponseFlight } from '@/types/flight.types'

import { RefreshCw } from '../animate-ui/icons/refresh-cw'
import { SkeletonLoader } from '../custom-ui/SkeletonLoader'
import { Filters } from '../filters/Filters'
import { Button } from '../ui/button'

import { FlightCard } from './FlightCard'
import { formatDate } from './format-date'

interface Props {
	flights: TInfiniteQueryResponseFlight[]
	refetch: () => void
	isRefetching: boolean
	isPending: boolean
	lastUpdate: Date | null

	currentAirline: string | undefined
	setCurrentAirline: (airline: string | undefined) => void

	fetchNextPage: () => void
	hasNextPage: boolean
	isFetchingNextPage: boolean
}

export function FlightList({
	flights,
	isRefetching,
	isPending,
	lastUpdate,
	refetch,
	currentAirline,
	setCurrentAirline,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage
}: Props) {
	const { ref: loadMoreRef, inView } = useInView({ rootMargin: '100px' })
	const lastFetchRef = useRef(0)

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			const now = Date.now()
			if (now - lastFetchRef.current < 4000) return
			lastFetchRef.current = now

			console.log('⬇️ Loading next page...')
			fetchNextPage()
		}
	}, [fetchNextPage, hasNextPage, inView, isFetchingNextPage])

	const selectAirlines = useMemo(
		() =>
			Array.from(
				new Set(
					flights.map(f => f?.airline.name).filter((f): f is string => !!f)
				)
			),
		[flights]
	)

	const [isShowList, setIsShowList] = useState(true)

	return (
		<div className='xs:w-full relative z-10 w-sm md:w-[26rem]'>
			<Filters
				currentAirline={currentAirline}
				setCurrentAirline={setCurrentAirline}
				isLoading={isPending}
				airlines={selectAirlines}
			/>

			<div className='xs:right-0 xs:space-y-2 absolute top-0 -right-12.5'>
				<Button
					onClick={() => refetch()}
					disabled={isRefetching}
					variant='secondary'
					className='xs:size-8 xs:mt-0.5'
				>
					<RefreshCw animateOnHover animateOnTap />
				</Button>

				<Button
					onClick={() => setIsShowList(!isShowList)}
					variant='secondary'
					className='xs:size-8 xs:flex hidden items-center justify-center'
				>
					{isShowList ? <ArrowUpFromLine /> : <ArrowDownFromLine />}
				</Button>
			</div>

			{lastUpdate && (
				<div className='text-muted-foreground mt-3 text-center text-xs italic opacity-50'>
					{isRefetching ? (
						<>Updating...</>
					) : (
						<>Last update: {formatDate(lastUpdate)}</>
					)}
				</div>
			)}

			{isShowList && (
				<div className='max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto space-y-4 pt-3 pb-8'>
					{isPending ? (
						<SkeletonLoader count={5} className='mb-4 h-40' />
					) : (
						!!flights?.length &&
						flights.map((flight, index) => (
							<FlightCard key={flight?.id} flight={flight} index={index} />
						))
					)}

					{isFetchingNextPage && (
						<SkeletonLoader count={5} className='mb-4 h-40' />
					)}

					<div ref={loadMoreRef} />
				</div>
			)}
		</div>
	)
}
