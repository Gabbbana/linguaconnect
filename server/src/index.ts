import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth.js';
import { miscRouter } from './routes/misc.js';
import { attachWebSocketServer } from './ws/index.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api', miscRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
attachWebSocketServer(wss);

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`LinguaConnect server listening on http://localhost:${port}`);
});
