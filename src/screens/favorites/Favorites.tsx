import { CenterLayout } from '@/components/CenterLayout'
import { Heading } from '@/components/custom-ui/Heading'
import { SkeletonLoader } from '@/components/custom-ui/SkeletonLoader'
import { SubHeading } from '@/components/custom-ui/SubHeading'
import { FlightCard } from '@/components/flight-list/FlightCard'

import { useAppSelector } from '@/hooks/useAppSelector'

import { trpc } from '@/lib/trpc'

export function Favorites() {
	const favorites = useAppSelector(state => state.favorites)

	const { data, isLoading } = trpc.flights.getLive.useQuery(
		{
			limit: 30
		},
		{
			select: data => {
				return {
					items:
						data.items.filter(flight => favorites.includes(flight?.id ?? '')) ||
						[]
				}
			}
		}
	)

	return (
		<CenterLayout>
			<div className='xs:w-11/12 mx-auto w-4/12'>
				<Heading>Favorites</Heading>
				<SubHeading>
					You can add flights to your favorites by clicking the heart icon on
					the flight details page. Once added, you can view and manage your
					favorite flights here.
				</SubHeading>

				<div className='grid grid-cols-2 gap-3'>
					{isLoading ? (
						<SkeletonLoader className='mb-4 h-40' />
					) : (
						!!data?.items.length &&
						data?.items.map(flight => (
							<FlightCard key={flight?.id} flight={flight} />
						))
					)}
				</div>

				{!data?.items.length && (
					<p className='mt-4 text-center'>No favorite flights loaded yet.</p>
				)}
			</div>
		</CenterLayout>
	)
}
