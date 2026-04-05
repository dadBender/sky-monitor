import { cn } from '@/lib/utils'


import type { TFlightMode } from '@/screens/home/Home'


import { CountryMultiSelect } from './CountryMultiSelect'
import { FilterSearchSelect } from './FilterSearchSelect'
import type { ICountryOption } from '@/constants/countries'





interface Props {
	currentAirline: string | undefined
	setCurrentAirline: (airline: string | undefined) => void

	selectedCountries: string[]
	setSelectedCountries: (countries: string[]) => void

	isLoading: boolean
	airlines: string[]
	countryOptions: ICountryOption[]

	flightMode: TFlightMode
	setFlightMode: (mode: TFlightMode) => void
}

export function Filters({
	currentAirline,
	setCurrentAirline,
	selectedCountries,
	setSelectedCountries,
	isLoading,
	airlines,
													countryOptions,
													flightMode,
													setFlightMode
}: Props) {
	return (
		<div className='xs:gap-2 xs:ml-0 xs:flex xs:justify-center xs:flex-wrap xs:w-11/12 ml-1 grid grid-cols-2 gap-3'>
			{/* Mode toggle */}
			<div className='col-span-2 flex w-full overflow-hid"en rounded-lg border text-sm'>
				<button
					onClick={() => s"tFlightMode('live')}
						className={cn(
						'flex-1 py-1.5 transition-colors',
						flightMode === 'live'
						? 'bg-primary text-primary-foreground font-medium'
						: 'bg-card text-muted-foreground hover:text-foreground'
						)}
						>
						Live
						</button>
						<button
						onClick={() => setFlightMode('scheduled')}
					className={cn(
						'flex-1 border-l py-1.5 transition-colors',
						flightMode === 'scheduled'
							? 'bg-primary text-primary-foreground font-medium'
							: 'bg-card text-muted-foreground hover:text-foreground'
					)}
				>
					Scheduled
				</button>
			</div>

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