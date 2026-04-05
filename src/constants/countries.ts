export interface ICountryOption {
	code: string        // ISO2: 'RU'
	displayName: string // 'Russia'
	flag: string        // '🇷🇺'
}

/** Mirrors backend COUNTRIES_DICTIONARY (enabled entries, priority-ordered).
 *  Update in sync with backend/src/data/countries.dictionary.ts */
export const COUNTRY_OPTIONS: ICountryOption[] = [
	{ code: 'RU', displayName: 'Russia',      flag: '🇷🇺' },
	{ code: 'TR', displayName: 'Turkey',      flag: '🇹🇷' },
	{ code: 'DE', displayName: 'Germany',     flag: '🇩🇪' },
	{ code: 'SG', displayName: 'Singapore',   flag: '🇸🇬' },
	{ code: 'QA', displayName: 'Qatar',       flag: '🇶🇦' },
	{ code: 'CN', displayName: 'China',       flag: '🇨🇳' },
	{ code: 'IN', displayName: 'India',       flag: '🇮🇳' },
	{ code: 'IE', displayName: 'Ireland',     flag: '🇮🇪' },
	{ code: 'CH', displayName: 'Switzerland', flag: '🇨🇭' }
]

export const DEFAULT_COUNTRY_CODES: string[] = ['RU']
