export function correctCity(city: string | undefined): string | null {
	if (!city) return null

	const parts = city.split(/,|\(/)
	const name = parts[0].trim()

	if (name.includes('Qian Gorlos Mongol Autonomous County')) {
		return 'Qian Gorlos'
	}

	if (name.includes('Nossa Senhora do Carmo')) {
		return 'Nossa Senhora'
	}

	return name || null
}
