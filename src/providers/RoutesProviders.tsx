import { BrowserRouter, Route, Routes } from 'react-router'

import { Layout } from '@/components/Layout'

import { ROUTES } from '@/screens/routes'

export default function RoutesProvider() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					{ROUTES.map(({ path, component: Component }) => (
						<Route key={path} path={path} element={<Component />} />
					))}
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
