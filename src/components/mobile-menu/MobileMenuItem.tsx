import { Link } from 'react-router'

import { cn } from '@/lib/utils'

import type { IMobileMenuItem } from './mobile-menu.data'

interface Props {
	item: IMobileMenuItem
	isActive?: boolean
}

export function MobileMenuItem({ item, isActive }: Props) {
	return (
		<li>
			<Link
				to={item.href}
				className={cn(
					'transition-colors',
					isActive ? 'text-[#fca423]' : 'text-foreground'
				)}
			>
				<item.icon animateOnTap size={25} strokeWidth={1.5} />
			</Link>
		</li>
	)
}
