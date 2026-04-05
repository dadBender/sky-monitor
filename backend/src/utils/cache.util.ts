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

	set(key: string, value: T): void {
		this.cache.set(key, { data: value, timestamp: Date.now() })
	}

	delete(key: string): void {
		this.cache.delete(key)
	}

	/** Invalidate all entries whose key starts with the given prefix */
	invalidateByPrefix(prefix: string): number {
		let count = 0
		for (const key of this.cache.keys()) {
			if (key.startsWith(prefix)) {
				this.cache.delete(key)
				count++
			}
		}
		return count
	}

	clear(): void {
		this.cache.clear()
	}
}
