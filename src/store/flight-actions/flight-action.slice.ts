import { createSlice } from '@reduxjs/toolkit'

interface IFlightActionState {
	isShowRoute: boolean
	isFollowingFlight: boolean
}

const initialState: IFlightActionState = {
	isShowRoute: true,
	isFollowingFlight: true
}

const flightActionsSlice = createSlice({
	name: 'flight-actions',
	initialState,
	reducers: {
		toggleFlightRoute: state => {
			state.isShowRoute = !state.isShowRoute
		},
		toggleFollowFlight: state => {
			state.isFollowingFlight = !state.isFollowingFlight
		}
	}
})

export const { toggleFlightRoute, toggleFollowFlight } =
	flightActionsSlice.actions
export const flightActionsReducer = flightActionsSlice.reducer
