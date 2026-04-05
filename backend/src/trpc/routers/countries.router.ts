import aviationService from '../../services/aviationstack/aviation.service'
import { publicProcedure, router } from '../trpc'

export const countriesRouter = router({
	getAll: publicProcedure.query(async () => {
		const countries = await aviationService.fetchCountries()
		return countries
	})
})
