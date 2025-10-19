import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'giveaway.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON entries(email);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_name_dob ON entries(name, dob);
`);

export default db;