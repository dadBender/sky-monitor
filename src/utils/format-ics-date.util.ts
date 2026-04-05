export function formatICSDate(date: Date) {
	return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
