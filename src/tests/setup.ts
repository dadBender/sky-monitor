import '@testing-library/jest-dom/vitest'
import '@testing-library/react'
import { cleanup } from '@testing-library/react'
import '@testing-library/user-event'
import { afterEach } from 'vitest'

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup()
})
