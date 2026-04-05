export function calculateProgress(
	departureTime: string,
	arrivalTime: string
): number {
	const now = Date.now()
	const departure = new Date(departureTime).getTime()
	const arrival = new Date(arrivalTime).getTime()

	if (!departure || !arrival || departure >= arrival) {
		return 0
	}

	if (now <= departure) {
		return 0
	}

	if (now >= arrival) {
		return 100
	}

	return Math.round(((now - departure) / (arrival - departure)) * 100)
}
