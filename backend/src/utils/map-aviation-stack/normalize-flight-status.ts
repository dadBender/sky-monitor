export function normalizeFlightStatus(
	progress: number,
	liveSpeed: number,
	liveAltitude: number
) {
	const speed =
		liveSpeed > 0 ? liveSpeed : Math.floor(Math.random() * 400) + 700 // 700–1100 км/ч

	const altitude =
		liveAltitude > 0 ? liveAltitude : Math.floor(Math.random() * 4000) + 9000 // 9000–13000 м

	const normalizedProgress = Math.max(0, Math.min(100, progress))

	return {
		progress: normalizedProgress,
		speed,
		altitude
	}
}
