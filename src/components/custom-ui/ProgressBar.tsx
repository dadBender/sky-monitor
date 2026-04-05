import { Plane } from 'lucide-react'

interface Props {
	percentage: number
}

export function ProgressBar({ percentage }: Props) {
	return (
		<div className='h-1 w-full rounded-full bg-neutral-200/50 dark:bg-neutral-800'>
			<div
				className='relative h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 opacity-80 transition-all duration-500 ease-in-out'
				style={{ width: `${percentage}%` }}
			>
				<Plane
					strokeWidth={0}
					size={28}
					className='fill-foreground absolute top-1/2 -right-2 -translate-y-1/2 rotate-45'
				/>
			</div>
		</div>
	)
}
