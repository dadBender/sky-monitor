import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type Mock, expect, vi } from 'vitest'

import { useTheme } from '@/providers/theme/useTheme'

import { ThemeToggle } from './ThemeToggle'

vi.mock('@/providers/theme/useTheme', () => ({
	useTheme: vi.fn()
}))

describe('ThemeToggle', () => {
	it('renders Moon icon when theme is dark', () => {
		;(useTheme as Mock).mockReturnValue({
			theme: 'dark',
			toggleTheme: vi.fn()
		})

		render(<ThemeToggle />)

		expect(screen.getByTestId('lucide-moon')).toBeInTheDocument()
		expect(screen.queryByTestId('lucide-sun')).not.toBeInTheDocument()
	})

	it('renders Sun icon when theme is light', () => {
		;(useTheme as Mock).mockReturnValue({
			theme: 'light',
			toggleTheme: vi.fn()
		})

		render(<ThemeToggle />)

		expect(screen.getByTestId('lucide-sun')).toBeInTheDocument()
		expect(screen.queryByTestId('lucide-moon')).not.toBeInTheDocument()
	})

	it('calls toggleTheme when button is clicked', async () => {
		const toggleTheme = vi.fn()

		;(useTheme as Mock).mockReturnValue({
			theme: 'light',
			toggleTheme
		})

		render(<ThemeToggle />)

		await userEvent.click(screen.getByRole('button'))

		expect(toggleTheme).toHaveBeenCalledTimes(1)
	})
})
