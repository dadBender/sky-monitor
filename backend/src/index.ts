import * as trpcExpress from '@trpc/server/adapters/express'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

import { appRouter } from './trpc'
import { startSeeder } from './services/seeder/flight.seeder'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5174

app.use(morgan('dev'))
app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:4173'],
		credentials: true
	})
)
app.use(express.json())

app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext: () => ({}),
		onError({ error, path }) {
			console.error(`❌ tRPC error on ${path}:`, error)
		}
	})
)

app.listen(PORT, () => {
	console.log(`🚀 tRPC server: http://localhost:${PORT}/trpc`)
	console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
	startSeeder()
})
