import { Link } from 'react-router'

import { cn } from '@/lib/utils'

import type { IHeaderMenuItem } from './header-menu.data'

interface Props {
	item: IHeaderMenuItem
	isActive?: boolean
}

export function HeaderMenuItem({ item, isActive }: Props) {
	return (
		<li>
			<Link
				to={item.href}
				className={cn(
					'text-base transition-opacity hover:opacity-90 sm:text-base',
					isActive ? 'text-[#fca423] opacity-100' : 'opacity-70'
				)}
			>
				{item.label}
			</Link>
		</li>
	)
}
