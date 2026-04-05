import type { IAviationStackData } from '../../services/aviationstack/aviation.types'

export function generateFakeProgress(
	flight: IAviationStackData,
	progress: number
): number {
	// если прогресс корректный — сразу возвращаем
	if (progress > 0 && !isNaN(progress)) return progress

	let seed = 0
	const id = flight.flight?.iata || flight.flight?.icao || 'UNK'
	for (let i = 0; i < id.length; i++) {
		seed += id.charCodeAt(i)
	}
	const fakeProgress = 10 + (seed % 70) // диапазон 10–80%
	return Math.min(fakeProgress, 99)
}
