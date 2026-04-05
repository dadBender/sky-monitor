import { FilterSearchSelect } from './FilterSearchSelect'

interface Props {
	currentAirline: string | undefined
	setCurrentAirline: (airline: string | undefined) => void

	isLoading: boolean
	airlines: string[]
}

export function Filters({
	currentAirline,
	setCurrentAirline,
	isLoading,
	airlines
}: Props) {
	return (
		<div className='xs:gap-2 xs:ml-0 xs:flex xs:justify-center xs:flex-wrap xs:w-11/12 ml-1 grid grid-cols-2 gap-3'>
			{/* Country filter hidden for now — filtering happens server-side via fromCountry param
			<FilterSearchSelect
				data={countries}
				entityName='country'
				value={fromCountry}
				onChange={setFromCountry}
				isLoading={isLoading}
			/> */}
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
