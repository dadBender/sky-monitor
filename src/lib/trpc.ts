import { createTRPCReact } from '@trpc/react-query';



import type { TAppRouter, TRouterOutput } from '../../backend/src/trpc/index';





export const trpc = createTRPCReact<TAppRouter>()

export type { TRouterOutput }
export type TFlight = NonNullable<
	TRouterOutput['flights']['getLive']['items']
>[number]
export type TScheduledFlight = NonNullable<
	TRouterOutput['flights']['getScheduled']['items']
>[number]
export type TAnyFlight = TFlight | TScheduledFlight