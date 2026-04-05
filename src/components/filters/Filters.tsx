import type { ICountryOption } from '@/constants/countries'

import { CountryMultiSelect } from './CountryMultiSelect'
import { FilterSearchSelect } from './FilterSearchSelect'

interface Props {
	currentAirline: string | undefined
	setCurrentAirline: (airline: string | undefined) => void

	selectedCountries: string[]
	setSelectedCountries: (countries: string[]) => void

	isLoading: boolean
	airlines: string[]
	countryOptions: ICountryOption[]
}

export function Filters({
	currentAirline,
	setCurrentAirline,
	selectedCountries,
	setSelectedCountries,
	isLoading,
	airlines,
	countryOptions
}: Props) {
	return (
		<div className='xs:gap-2 xs:ml-0 xs:flex xs:justify-center xs:flex-wrap xs:w-11/12 ml-1 grid grid-cols-2 gap-3'>
			<CountryMultiSelect
				value={selectedCountries}
				onChange={setSelectedCountries}
				options={countryOptions}
				isLoading={isLoading}
			/>
			<FilterSearchSelect
				data={airlines}
				entityName='airline'
				value={currentAirline}
				onChange={setCurrentAirline}
				isLoading={isLoading}
			/>
		</div>
	)
}