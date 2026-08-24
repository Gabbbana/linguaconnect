import 'dotenv/config';
import { pool } from './pool.js';

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  native_language TEXT NOT NULL,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function main() {
  await pool.query(SQL);
  console.log('Migration complete: users table ready.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
