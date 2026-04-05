import type { ReactNode } from 'react'

interface Props {
	children: ReactNode
}

export function SubHeading({ children }: Props) {
	return <div className='text-foreground mb-6 opacity-70'>{children}</div>
}
