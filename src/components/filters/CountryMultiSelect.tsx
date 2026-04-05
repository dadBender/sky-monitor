import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useState } from 'react'

import type { ICountryOption } from '@/constants/countries'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface Props {
	value: string[]
	onChange: (value: string[]) => void
	options: ICountryOption[]
	isLoading?: boolean
}

function buildLabel(value: string[], options: ICountryOption[]): string {
	if (value.length === 0) return 'All countries'

	const first = options.find(o => o.code === value[0])
	if (!first) return value[0]

	const label = `${first.flag} ${first.displayName}`
	return value.length > 1 ? `${label} +${value.length - 1}` : label
}

export function CountryMultiSelect({ value, onChange, options, isLoading }: Props) {
	const [isOpen, setIsOpen] = useState(false)

	const toggle = (code: string) => {
		if (value.includes(code)) {
			// Prevent deselecting the last item
			if (value.length === 1) return
			onChange(value.filter(c => c !== code))
		} else {
			onChange([...value, code])
		}
	}

	const selectAll = () => {
		onChange(options.map(o => o.code))
	}

	const clearToDefault = () => {
		onChange([options[0]?.code ?? 'RU'])
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild className='bg-card dark:bg-card'>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={isOpen}
					className='w-[180px] justify-between gap-0.5'
					data-testid='filter-by-country'
				>
					{isLoading ? 'Loading...' : buildLabel(value, options)}
					<ChevronsUpDownIcon className='h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>

			<PopoverContent className='w-[200px] p-0'>
				<Command>
					<CommandInput placeholder='Search country...' />

					{/* Quick actions */}
					<div className='border-b px-1 py-1 flex gap-1'>
						<button
							onClick={selectAll}
							className='text-muted-foreground hover:text-foreground flex-1 rounded px-2 py-0.5 text-xs transition-colors'
						>
							All
						</button>
						<button
							onClick={clearToDefault}
							className='text-muted-foreground hover:text-foreground flex-1 rounded px-2 py-0.5 text-xs transition-colors'
						>
							Reset
						</button>
					</div>

					<CommandList>
						<CommandEmpty>No country found.</CommandEmpty>
						<CommandGroup>
							{options.map(country => {
								const isSelected = value.includes(country.code)
								return (
									<CommandItem
										key={country.code}
										value={country.displayName}
										onSelect={() => toggle(country.code)}
									>
										<CheckIcon
											className={cn(
												'mr-2 h-4 w-4 shrink-0',
												isSelected ? 'opacity-100' : 'opacity-0'
											)}
										/>
										<span className='mr-1.5 text-base leading-none'>
											{country.flag}
										</span>
										{country.displayName}
									</CommandItem>
								)
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}