/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), tsConfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/tests/setup.ts',
		css: true,
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			exclude: [
				'**/tests/**',
				'**/node_modules/**',
				'**/dist/**',
				'**/cypress/**'
			]
		},
		include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}']
	}
})
