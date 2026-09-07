import { cpSync, rmSync } from 'node:fs';
rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true });
cpSync(new URL('../client/dist', import.meta.url), new URL('../dist', import.meta.url), { recursive: true });
