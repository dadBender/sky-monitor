import { AIRLINE_ASSETS } from '../../data/airline-assets.data'

export function pickAirlinesAssets(name: string) {
	const assets = AIRLINE_ASSETS.find(a => a.name === name)
	return (
		assets ?? {
			name,
			logo: '/logos/default-airline.svg',
			aircraft: '/planes/default-airline-plane.svg',
			gradient: ['#3b82f6', '#1e40af'],
			country: 'Worldwide',
			planeModel: 'Airbus A320',
			countryFlag: '🌐'
		}
	)
}
