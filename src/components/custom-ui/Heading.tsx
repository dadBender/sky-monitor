import type { ReactNode } from 'react'

interface Props {
	children: ReactNode
}

export function Heading({ children }: Props) {
	return <h1 className='text-foreground mb-4 text-3xl font-bold'>{children}</h1>
}
