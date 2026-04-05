import aviationService from '../../services/aviationstack/aviation.service'
import { COUNTRIES_DICTIONARY } from '../../data/countries.dictionary'
import { publicProcedure, router } from '../trpc'

export const countriesRouter = router({
	getAll: publicProcedure.query(async () => {
		const countries = await aviationService.fetchCountries()
		return countries
	}),

	/** Normalized country dictionary used for UI selectors & seeding */
	getDictionary: publicProcedure.query(() => {
		return COUNTRIES_DICTIONARY
			.filter(c => c.enabled)
			.sort((a, b) => a.priority - b.priority)
			.map(({ code, iso3, displayName, flag, priority }) => ({
				code,
				iso3,
				displayName,
				flag,
				priority
			}))
	})
})
