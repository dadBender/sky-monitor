import { useCallback } from 'react'

import { Heart } from '@/components/animate-ui/icons/heart'
import { Button } from '@/components/ui/button'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'

import { addFavorite, removeFavorite } from '@/store/favorites/favorites.slice'

interface Props {
	flightId: string
}

export function FlightCardActions({ flightId }: Props) {
	const dispatch = useAppDispatch()
	const favorites = useAppSelector(state => state.favorites)
	const isFavorite = favorites.includes(flightId)

	const handleToggleFavorite = useCallback(() => {
		if (isFavorite) {
			dispatch(removeFavorite(flightId))
		} else {
			dispatch(addFavorite(flightId))
		}
	}, [dispatch, flightId, isFavorite])

	return (
		<div
			className={
				'xs:h-auto xs:w-full xs:origin-bottom-right xs:right-0 xs:top-1 xs:justify-end xs:flex-row xs:group-hover:right-auto xs:group-hover:-top-10 xs:px-1 absolute top-0.5 right-1 z-50 flex h-full w-10 origin-top-right scale-0 flex-col gap-2 px-3 opacity-0 transition-all duration-500 group-hover:-right-10 group-hover:scale-100 group-hover:opacity-100'
			}
		>
			<Button onClick={handleToggleFavorite} variant='ghost' size='icon'>
				<Heart
					fill={isFavorite ? 'var(--foreground)' : 'none'}
					className='xs:shadow size-5.5'
					animateOnHover
					animateOnTap
				/>
			</Button>
		</div>
	)
}
