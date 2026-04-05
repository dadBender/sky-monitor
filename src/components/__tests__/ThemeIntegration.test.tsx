import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

import { ThemeProvider } from '@/providers/theme/ThemeProvider'

import { ThemeToggle } from '../ThemeToggle'

describe('Theme integration test (ThemeProvider + ThemeToggle)', () => {
	it('should switch theme from dark -> light -> dark correctly', async () => {
		render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>
		)

		//step 1
		expect(screen.getByTestId('lucide-moon')).toBeInTheDocument()
		expect(document.documentElement.classList.contains('dark')).toBe(true)

		//step 2
		const button = screen.getByRole('button')
		await userEvent.click(button)

		expect(screen.getByTestId('lucide-sun')).toBeInTheDocument()
		expect(document.documentElement.classList.contains('dark')).toBe(false)

		//step 3
		await userEvent.click(button)

		expect(screen.getByTestId('lucide-moon')).toBeInTheDocument()
		expect(document.documentElement.classList.contains('dark')).toBe(true)
	})
})
