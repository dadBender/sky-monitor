import { useTheme } from '@/providers/theme/useTheme'

import { ThemeToggleIcon } from './ThemeToggleIcon'
import { Button } from './ui/button'

export function ThemeToggle({ isMobile }: { isMobile?: boolean }) {
	const { theme, toggleTheme } = useTheme()

	return (
		<>
			{isMobile ? (
				<button
					onClick={() => {
						toggleTheme()
					}}
				>
					<ThemeToggleIcon theme={theme} isMobile={isMobile} />
				</button>
			) : (
				<Button
					onClick={() => {
						toggleTheme()
					}}
					variant={'secondary'}
					size='icon'
				>
					<ThemeToggleIcon theme={theme} isMobile={isMobile} />
				</Button>
			)}
		</>
	)
}
