import { LazyMotion, domAnimation } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import RoutesProvider from './providers/RoutesProviders'
import { TrpcProvider } from './providers/TrpcProvider'
import { ThemeProvider } from './providers/theme/ThemeProvider'
import { store } from './store'

import './index.css'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<TrpcProvider>
			<ThemeProvider>
				<LazyMotion features={domAnimation}>
					<Provider store={store}>
						<RoutesProvider />
					</Provider>
				</LazyMotion>
			</ThemeProvider>
		</TrpcProvider>
	</StrictMode>
)
