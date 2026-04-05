import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'flights.db'))

// WAL mode: faster writes, readers don't block writers
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS seeded_flights (
    id          TEXT PRIMARY KEY,
    icao        TEXT NOT NULL,
    airline     TEXT,
    raw_data    TEXT NOT NULL,       -- serialized IAviationStackData, re-mapped on each request
    dep_sched   TEXT NOT NULL,       -- ISO departure time, used to judge staleness
    arr_sched   TEXT NOT NULL,       -- ISO arrival time
    seeded_at   INTEGER NOT NULL     -- Unix ms
  )
`)

export default db