import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';
import { NATIVE_LANGUAGES } from '../languages.js';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1, 'Name is required').max(80),
  nativeLanguage: z.enum(NATIVE_LANGUAGES as [string, ...string[]]),
  city: z.string().trim().max(80).optional().or(z.literal('')),
});

function toPublicUser(row: {
  id: number;
  email: string;
  name: string;
  native_language: string;
  city: string | null;
}) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    nativeLanguage: row.native_language,
    city: row.city,
  };
}

authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }
  const { email, password, name, nativeLanguage, city } = parsed.data;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    res.status(409).json({ error: 'An account with that email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, native_language, city)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, native_language, city`,
    [email, passwordHash, name, nativeLanguage, city || null],
  );

  const user = toPublicUser(result.rows[0]);
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  const { email, password } = parsed.data;

  const result = await pool.query(
    'SELECT id, email, name, native_language, city, password_hash FROM users WHERE email = $1',
    [email],
  );
  const row = result.rows[0];
  if (!row) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const user = toPublicUser(row);
  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user });
});
