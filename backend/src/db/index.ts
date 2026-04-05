import Database from 'better-sqlite3';
import path from 'path';





const db = new Database(path.join(process.cwd(), 'flights.db'))

// WAL mode: faster writes, readers don't block writers
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS seeded_flights (
    id           TEXT PRIMARY KEY,
    icao         TEXT NOT NULL,
    airline      TEXT,
    raw_data     TEXT NOT NULL,       -- serialized IAviationStackData, re-mapped on each request
    dep_sched    TEXT NOT NULL,       -- ISO departure time, used to judge staleness
    arr_sched    TEXT NOT NULL,       -- ISO arrival time
    seeded_at    INTEGER NOT NULL,    -- Unix ms
    country_code TEXT DEFAULT NULL    -- ISO2 country code (RU, TR, DE, …)
  )
`)

const columns = db.pragma('table_info(seeded_flights)') as Array<{
	name: string
}>

// Migrate: add country_code to tables created before this column existed
if (!columns.some(c => c.name === 'country_code')) {
	db.exec(
		`ALTER TABLE seeded_flights ADD COLUMN country_code TEXT DEFAULT NULL`
	)
	// All existing rows are Russian airlines — backfill them
	db.exec(
		`UPDATE seeded_flights SET country_code = 'RU' WHERE country_code IS NULL`
	)
}

// Migrate: add source column to track which API provided the data
if (!columns.some(c => c.name === 'source')) {
	db.exec(
		`ALTER TABLE seeded_flights ADD COLUMN source TEXT DEFAULT 'aviationstack'`
	)
}

// Budget tracking table — one row per API key, resets each calendar month
db.exec(`
  CREATE TABLE IF NOT EXISTS api_key_budget (
    key_id         TEXT PRIMARY KEY,
    month          TEXT NOT NULL,
    requests_used  INTEGER DEFAULT 0,
    monthly_limit  INTEGER DEFAULT 1000
  )
`)

// Indexes for common filter/sort patterns
db.exec(
	`CREATE INDEX IF NOT EXISTS idx_sf_country  ON seeded_flights(country_code)`
)
db.exec(
	`CREATE INDEX IF NOT EXISTS idx_sf_arr      ON seeded_flights(arr_sched)`
)
db.exec(
	`CREATE INDEX IF NOT EXISTS idx_sf_dep      ON seeded_flights(dep_sched)`
)

export default db