import { createSlice } from '@reduxjs/toolkit'

const LS_KEY = 'favorites'

const getFavoritesFromLocalStorage = () => {
	const favorites = localStorage.getItem(LS_KEY)
	if (!favorites) return []
	try {
		return JSON.parse(favorites)
	} catch (error) {
		console.error('Error parsing favorites from localStorage:', error)
		return []
	}
}

const saveFavoritesToLocalStorage = (favorites: string[]) => {
	localStorage.setItem(LS_KEY, JSON.stringify(favorites))
}

const initialState: string[] = getFavoritesFromLocalStorage()

const favoritesSlice = createSlice({
	name: LS_KEY,
	initialState,
	reducers: {
		addFavorite: (state, action) => {
			if (!state.includes(action.payload)) {
				state.push(action.payload)
				saveFavoritesToLocalStorage(state)
			}
		},
		removeFavorite: (state, action) => {
			const index = state.indexOf(action.payload)
			if (index !== -1) {
				state.splice(index, 1)
				saveFavoritesToLocalStorage(state)
			}
		}
	}
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions
export const favoritesReducer = favoritesSlice.reducer
