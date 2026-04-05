/** Maps airline display name → IATA code. Used by seeder and scheduled-flights router. */
export const AIRLINE_NAME_TO_IATA: Record<string, string> = {
	'S7 Airlines': 'S7',
	Aeroflot: 'SU',
	'Rossiya Airlines': 'FV',
	'Ural Airlines': 'U6',
	'Nordwind Airlines': 'N4',
	'Turkish Airlines': 'TK',
	'Freebird Airlines': 'FH',
	Lufthansa: 'LH',
	'Singapore Airlines': 'SQ',
	'Qatar Airways': 'QR',
	'China Eastern Airlines': 'MU',
	'Air China': 'CA',
	'Hainan Airlines': 'HU',
	IndiGo: '6E',
	Ryanair: 'FR',
	'SWISS International Air Lines': 'LX'
}
