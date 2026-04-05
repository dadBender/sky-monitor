import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

interface ISkeletonLoader {
	count?: number
	style?: CSSProperties
	className?: string
}

export function SkeletonLoader({
	count = 1,
	style,
	className
}: ISkeletonLoader) {
	return (
		<>
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					className={cn(
						'bg-flight-card mb-[0.65rem] h-10 animate-pulse rounded-lg last:mb-0',
						className
					)}
					style={style}
				/>
			))}
		</>
	)
}
