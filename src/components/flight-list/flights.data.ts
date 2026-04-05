import type { IFlight } from '../../types/flight.types'

const getCurrentCoordinates = (
	from: [number, number],
	to: [number, number],
	progressPercent: number
): [number, number] => {
	const ratio = progressPercent / 100
	const lat = from[0] + (to[0] - from[0]) * ratio
	const lng = from[1] + (to[1] - from[1]) * ratio
	return [lat, lng]
}

export const FLIGHTS: IFlight[] = [
	{
		logo: '/logos/turkish.svg',
		id: 'TK143',
		airline: {
			name: 'Turkish Airlines',
			country: 'Turkey'
		},
		aircraftReg: 'TC-JFP',
		from: {
			city: 'Sofia',
			country: 'Bulgaria',
			countryCode: 'BG',
			timezone: 'UTC +3',
			code: 'SOF',
			coordinates: [42.6977, 23.3219]
		},
		to: {
			city: 'Beijing',
			country: 'China',
			countryCode: 'CN',
			timezone: 'UTC +8',
			code: 'PEK',
			coordinates: [39.9042, 116.4074]
		},
		airplane: {
			image: '/planes/turkish.png',
			name: 'Airbus A330'
		},
		colorGradient: ['#f9b9b9', '#d34f4f'],
		route: {
			speed: 870,
			altitude: 10600
		},
		progress: 73,
		currentLocation: {
			coordinates: getCurrentCoordinates(
				[42.6977, 23.3219],
				[39.9042, 116.4074],
				73
			)
		}
	},
	{
		logo: '/logos/ryanair.svg',
		id: 'RN1782',
		airline: {
			name: 'Ryanair',
			country: 'Ireland'
		},
		aircraftReg: 'D-AISP',
		from: {
			city: 'Dublin',
			country: 'Ireland',
			countryCode: 'IE',
			timezone: 'UTC +1',
			code: 'DUB',
			coordinates: [53.349805, -6.26031]
		},
		to: {
			city: 'Larnaca',
			country: 'Cyprus',
			countryCode: 'CY',
			timezone: 'UTC +3',
			code: 'LCA',
			coordinates: [34.7758, 33.6295]
		},
		airplane: {
			image: '/planes/ryanair.png',
			name: 'Boeing 737-800'
		},
		colorGradient: ['#accffb', '#5281b1'],
		route: {
			speed: 840,
			altitude: 11200
		},
		progress: 50,
		currentLocation: {
			coordinates: getCurrentCoordinates(
				[53.349805, -6.26031],
				[34.7758, 33.6295],
				50
			)
		}
	},
	{
		logo: '/logos/s7.svg',
		id: 'S7124',
		airline: { name: 'S7 Airlines', country: 'Russia' },
		aircraftReg: 'RA-73415',
		from: {
			city: 'Nice',
			country: 'France',
			countryCode: 'FR',
			timezone: 'UTC +2',
			code: 'NCE',
			coordinates: [43.7102, 7.262]
		},
		to: {
			city: 'Tbilisi',
			country: 'Georgia',
			countryCode: 'GE',
			timezone: 'UTC +4',
			code: 'TBS',
			coordinates: [41.7151, 44.8271]
		},
		airplane: {
			image: '/planes/s7.png',
			name: 'Airbus A320neo'
		},
		colorGradient: ['#f0ffdd', '#d2f3ab'],
		route: {
			speed: 860,
			altitude: 10900
		},
		progress: 68,
		currentLocation: {
			coordinates: getCurrentCoordinates(
				[43.7102, 7.262],
				[41.7151, 44.8271],
				68
			)
		}
	},
	{
		logo: '/logos/swiss.svg',
		id: 'LX318',
		airline: {
			name: 'SWISS International Air Lines',
			country: 'Switzerland'
		},
		aircraftReg: 'HB-JHK',
		from: {
			city: 'Porto',
			country: 'Portugal',
			countryCode: 'PT',
			timezone: 'UTC +1',
			code: 'OPO',
			coordinates: [41.14961, -8.61099]
		},
		to: {
			city: 'Baku',
			country: 'Azerbaijan',
			countryCode: 'AZ',
			timezone: 'UTC +4',
			code: 'GYD',
			coordinates: [40.4093, 49.8671]
		},
		airplane: {
			image: '/planes/swiss.png',
			name: 'Airbus A220-300'
		},
		colorGradient: ['#ffc7c7', '#cc6565'],
		route: {
			speed: 830,
			altitude: 10700
		},
		progress: 85,
		currentLocation: {
			coordinates: getCurrentCoordinates(
				[41.14961, -8.61099],
				[40.4093, 49.8671],
				85
			)
		}
	},
	{
		logo: '/logos/lufthansa.svg',
		id: 'LH401',
		airline: { name: 'Lufthansa', country: 'Germany' },
		aircraftReg: 'D-AIXD',
		from: {
			city: 'Burgas',
			country: 'Bulgaria',
			countryCode: 'BG',
			timezone: 'UTC +3',
			code: 'BOJ',
			coordinates: [42.5663, 27.466]
		},
		to: {
			city: 'Muscat',
			country: 'Oman',
			countryCode: 'OM',
			timezone: 'UTC +4',
			code: 'MCT',
			coordinates: [23.588, 58.4059]
		},
		airplane: {
			image: '/planes/lufthansa.png',
			name: 'Airbus A350-900'
		},
		colorGradient: ['#b7cff7', '#5879ac'],
		route: {
			speed: 890,
			altitude: 11300
		},
		progress: 48,
		currentLocation: {
			coordinates: getCurrentCoordinates(
				[42.5663, 27.466],
				[23.588, 58.4059],
				48
			)
		}
	}
]
