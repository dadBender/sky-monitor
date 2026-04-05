import type { ReactNode } from 'react'

export function CenterLayout({ children }: { children?: ReactNode }) {
	return <div className='xs:mt-5 mt-24'>{children}</div>
}
