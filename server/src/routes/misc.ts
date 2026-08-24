import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { NATIVE_LANGUAGES, PRACTICE_LANGUAGES } from '../languages.js';
import { presenceCounts, totalActiveCount } from '../ws/presence.js';

export const miscRouter = Router();

miscRouter.get('/presence-summary', (_req, res) => {
  res.json({ activeNow: totalActiveCount() });
});

miscRouter.get('/languages', (_req, res) => {
  const counts = presenceCounts();
  res.json({
    languages: PRACTICE_LANGUAGES.map((l) => ({ ...l, online: counts[l.name] ?? 0 })),
    nativeLanguages: NATIVE_LANGUAGES,
  });
});

miscRouter.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, name, native_language, city FROM users WHERE id = $1',
    [req.auth!.userId],
  );
  const row = result.rows[0];
  if (!row) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    id: row.id,
    email: row.email,
    name: row.name,
    nativeLanguage: row.native_language,
    city: row.city,
  });
});
