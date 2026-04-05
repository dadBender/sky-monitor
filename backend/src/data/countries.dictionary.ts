export interface ICountryDictionaryItem {
	code: string        // ISO2: 'RU'
	iso3: string        // ISO3: 'RUS'
	displayName: string // 'Russia' — matches OpenSky originCountry field
	flag: string        // '🇷🇺'
	airlines: string[]  // airline names sent to AviationStack as airline_name param
	priority: number    // 1 = first seeded & first returned
	enabled: boolean    // participates in seeding & shown in UI
}

export const COUNTRIES_DICTIONARY: ICountryDictionaryItem[] = [
	{
		code: 'RU',
		iso3: 'RUS',
		displayName: 'Russia',
		flag: '🇷🇺',
		airlines: ['S7 Airlines', 'Aeroflot', 'Rossiya Airlines', 'Ural Airlines', 'Nordwind Airlines'],
		priority: 1,
		enabled: true
	},
	{
		code: 'TR',
		iso3: 'TUR',
		displayName: 'Turkey',
		flag: '🇹🇷',
		airlines: ['Turkish Airlines', 'Freebird Airlines'],
		priority: 2,
		enabled: true
	},
	{
		code: 'DE',
		iso3: 'DEU',
		displayName: 'Germany',
		flag: '🇩🇪',
		airlines: ['Lufthansa'],
		priority: 3,
		enabled: true
	},
	{
		code: 'SG',
		iso3: 'SGP',
		displayName: 'Singapore',
		flag: '🇸🇬',
		airlines: ['Singapore Airlines'],
		priority: 4,
		enabled: true
	},
	{
		code: 'QA',
		iso3: 'QAT',
		displayName: 'Qatar',
		flag: '🇶🇦',
		airlines: ['Qatar Airways'],
		priority: 5,
		enabled: true
	},
	{
		code: 'CN',
		iso3: 'CHN',
		displayName: 'China',
		flag: '🇨🇳',
		airlines: ['China Eastern Airlines', 'Air China', 'Hainan Airlines'],
		priority: 6,
		enabled: true
	},
	{
		code: 'IN',
		iso3: 'IND',
		displayName: 'India',
		flag: '🇮🇳',
		airlines: ['IndiGo'],
		priority: 7,
		enabled: true
	},
	{
		code: 'IE',
		iso3: 'IRL',
		displayName: 'Ireland',
		flag: '🇮🇪',
		airlines: ['Ryanair'],
		priority: 8,
		enabled: true
	},
	{
		code: 'CH',
		iso3: 'CHE',
		displayName: 'Switzerland',
		flag: '🇨🇭',
		airlines: ['SWISS International Air Lines'],
		priority: 9,
		enabled: true
	}
]

/** ISO2 → display name map (for OpenSky originCountry matching) */
export const COUNTRY_DISPLAY_BY_CODE = new Map<string, string>(
	COUNTRIES_DICTIONARY.map(c => [c.code, c.displayName])
)

/** display name → ISO2 map */
export const COUNTRY_CODE_BY_DISPLAY = new Map<string, string>(
	COUNTRIES_DICTIONARY.map(c => [c.displayName, c.code])
)
