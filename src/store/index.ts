import { configureStore } from '@reduxjs/toolkit'

import { favoritesReducer } from './favorites/favorites.slice'
import { flightActionsReducer } from './flight-actions/flight-action.slice'

export const store = configureStore({
	reducer: {
		favorites: favoritesReducer,
		flightActions: flightActionsReducer
	}
})

export type TRootState = ReturnType<typeof store.getState>
export type TAppDispatch = typeof store.dispatch
