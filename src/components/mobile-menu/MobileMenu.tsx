import { match } from 'path-to-regexp'
import { useLocation } from 'react-router'

import { ThemeToggle } from '../ThemeToggle'

import { MobileMenuItem } from './MobileMenuItem'
import { mobileMenuData } from './mobile-menu.data'

export function MobileMenu() {
	const location = useLocation()

	return (
		<div className='bg-card sm:px-mini-element xs:block fixed right-0 bottom-3 left-0 z-10 mx-auto hidden w-max rounded-3xl p-2 px-5 shadow-xl dark:bg-[#2e2e2e]'>
			<nav>
				<ul className='flex items-center justify-center gap-7'>
					{mobileMenuData.map(item =>
						item.label === 'Toggle Theme' ? (
							<li
								key={item.href}
								className='inline-flex items-center justify-center'
							>
								<ThemeToggle isMobile />
							</li>
						) : (
							<MobileMenuItem
								key={item.href}
								item={item}
								isActive={!!match(item.href)(location.pathname)}
							/>
						)
					)}
				</ul>
			</nav>
		</div>
	)
}
