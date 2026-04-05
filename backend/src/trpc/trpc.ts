import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

export const t = initTRPC.create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			status: 'error',
			message: error.message,
			code: error.code,
			path: error.cause ?? null,
			stack:
				process.env.NODE_ENV === 'development' ? shape.data.stack : undefined
		}
	}
})
export const router = t.router
export const publicProcedure = t.procedure
