import aviationService from '../../services/aviationstack/aviation.service'
import { publicProcedure, router } from '../trpc'

export const airlinesRouter = router({
	getAll: publicProcedure.query(async () => {
		const airlines = await aviationService.fetchAirlines()
		return airlines
	})
})
