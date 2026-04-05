import { MoonIcon } from './animate-ui/icons/moon'
import { SunIcon } from './animate-ui/icons/sun'

export function ThemeToggleIcon({
	theme,
	isMobile
}: {
	theme: 'light' | 'dark'
	isMobile?: boolean
}) {
	return theme === 'dark' ? (
		<MoonIcon
			animateOnHover
			animateOnTap
			size={isMobile ? 24 : 23}
			data-testid='lucide-moon'
		/>
	) : (
		<SunIcon
			animateOnHover
			animateOnTap
			size={isMobile ? 24 : 23}
			data-testid='lucide-sun'
		/>
	)
}
