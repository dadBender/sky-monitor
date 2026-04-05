import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { type ReactNode, useState } from 'react'
import superjson from 'superjson'

import { trpc } from '@/lib/trpc'

import { BACK_END_URL } from '@/constants'

export function TrpcProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						retry: false,
						staleTime: 1000 * 60 * 2 // 2 minutes
					}
				}
			})
	)

	const [client] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${BACK_END_URL}/trpc`,
					transformer: superjson
				})
			]
		})
	)

	return (
		<trpc.Provider client={client} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	)
}
