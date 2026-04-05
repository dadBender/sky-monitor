import { match } from 'path-to-regexp'
import { Link, useLocation } from 'react-router'

import { ThemeToggle } from '../ThemeToggle'
import { Heart } from '../animate-ui/icons/heart'
import { Button } from '../ui/button'

import { HeaderMenuItem } from './HeaderMenuItem'
import { headerMenuData } from './header-menu.data'
import { PAGES } from '@/config/pages.config'

export function Header() {
	const location = useLocation()

	return (
		<div className='xs:hidden bg-card sm:px-mini-element xs:flex-col xs:pb-4 absolute top-7 left-1/2 z-10 flex w-4/12 -translate-x-1/2 items-center justify-between rounded-xl p-2 px-5 sm:rounded-lg xl:relative xl:top-0 xl:mb-5 xl:w-full'>
			<div className='xs:flex-wrap xs:justify-center xs:mb-3 flex items-center gap-4 sm:gap-2 2xl:gap-3'>
				<img
					src='/logo.svg'
					alt='Sky Track Logo'
					className='mt-1 h-12 w-12 sm:h-10 sm:w-10'
				/>
				<nav>
					<ul className='flex items-center gap-5 sm:gap-3'>
						{headerMenuData.map(item => (
							<HeaderMenuItem
								key={item.href}
								item={item}
								isActive={!!match(item.href)(location.pathname)}
							/>
						))}
					</ul>
				</nav>
			</div>
			<div className='flex items-center gap-3 sm:gap-2'>
				<Button asChild variant='secondary' size='icon'>
					<Link to={PAGES.FAVORITES}>
						<Heart animateOnHover size={23} />
					</Link>
				</Button>
				<ThemeToggle />
			</div>
		</div>
	)
}
