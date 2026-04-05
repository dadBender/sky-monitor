import type { inferRouterOutputs } from '@trpc/server'

import { airlinesRouter } from './routers/airlines.router'
import { countriesRouter } from './routers/countries.router'
import { flightsRouter } from './routers/flights.router'
import { router } from './trpc'

export const appRouter = router({
	flights: flightsRouter,
	countries: countriesRouter,
	airlines: airlinesRouter
})

export type TAppRouter = typeof appRouter
export type TRouterOutput = inferRouterOutputs<TAppRouter>
