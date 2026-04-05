import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import { useTheme } from '@/providers/theme/useTheme'

import { Header } from './header/Header'
import { MobileMenu } from './mobile-menu/MobileMenu'

export function Layout() {
	const { theme } = useTheme()

	return (
		<>
			<div className='xs:p-2.5 relative p-7 sm:p-3'>
				<Header />
				<Outlet />
				<MobileMenu />
			</div>
			<Toaster position='top-right' theme={theme} />
		</>
	)
}
