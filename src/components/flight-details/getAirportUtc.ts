export function getUtcOffsetFromTimezone(timezone?: string): string {
	if (!timezone || !timezone.includes('/')) {
		return 'UTC+0'
	}

	try {
		const now = new Date()
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'short'
		})
		const parts = formatter.formatToParts(now)
		const tzPart = parts.find(p => p.type === 'timeZoneName')?.value

		return tzPart?.replace('GMT', 'UTC') ?? 'UTC+0'
	} catch {
		return 'UTC+0'
	}
}
