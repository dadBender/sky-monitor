type CacheEntry<T> = {
	data: T
	timestamp: number
}

export class SimpleCache<T> {
	private cache: Map<string, CacheEntry<T>> = new Map()

	constructor(private ttlMs: number) {}

	get(key: string): T | null {
		const entry = this.cache.get(key)
		if (!entry) return null

		const isExpired = Date.now() - entry.timestamp > this.ttlMs
		if (isExpired) {
			this.cache.delete(key)
			return null
		}

		return entry.data
	}

	set(key: string, value: T) {
		this.cache.set(key, { data: value, timestamp: Date.now() })
	}
}
