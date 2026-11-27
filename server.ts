import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { buildDefaultState, migrateState, WorkbenchState } from './src/utils/workbenchLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const BASE_DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILENAME = 'workbench_state.json';
const AUTH_FILENAME = 'workbench_auth.json';

// Active session tokens stored in server memory
const activeSessionTokens = new Set<string>();

interface StoredAuthHash {
  salt: string;
  hash: string;
  claimedAt: string;
}

function ensureBaseDataDir(): void {
  if (!fs.existsSync(BASE_DATA_DIR)) {
    fs.mkdirSync(BASE_DATA_DIR, { recursive: true });
  }
}

function getConfinedFilePath(filename: string): string {
  ensureBaseDataDir();
  const resolved = path.resolve(BASE_DATA_DIR, filename);
  if (!resolved.startsWith(BASE_DATA_DIR + path.sep)) {
    throw new Error('Invalid file path boundary');
  }
  return resolved;
}

function getEnvPasscode(): string {
  return (process.env.WORKBENCH_PASSCODE || '').trim();
}

function readStoredAuthHash(): StoredAuthHash | null {
  const authPath = getConfinedFilePath(AUTH_FILENAME);
  if (!fs.existsSync(authPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    if (typeof parsed?.salt === 'string' && typeof parsed?.hash === 'string') {
      return parsed as StoredAuthHash;
    }
  } catch {
    // ignore invalid file
  }
  return null;
}

function writeStoredAuthHash(passcode: string): StoredAuthHash {
  const authPath = getConfinedFilePath(AUTH_FILENAME);
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(passcode, salt, 64).toString('hex');
  const record: StoredAuthHash = { salt, hash, claimedAt: new Date().toISOString() };
  fs.writeFileSync(authPath, JSON.stringify(record, null, 2), 'utf-8');
  return record;
}

function verifyPasscode(candidate: string): boolean {
  if (!candidate) return false;
  const envPass = getEnvPasscode();
  if (envPass) {
    const a = Buffer.from(candidate, 'utf-8');
    const b = Buffer.from(envPass, 'utf-8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const stored = readStoredAuthHash();
  if (!stored) return false;
  const derived = crypto.scryptSync(candidate, stored.salt, 64);
  const expected = Buffer.from(stored.hash, 'hex');
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

function isPasscodeConfigured(): boolean {
  return getEnvPasscode().length > 0 || readStoredAuthHash() !== null;
}

function issueSessionToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessionTokens.add(token);
  return token;
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token && activeSessionTokens.has(token)) {
      next();
      return;
    }
  }
  res.status(401).json({ error: 'Unauthorized: valid Booth 04 session required' });
}

function readPersistedState(): { state: WorkbenchState; updatedAt: string } {
  const filePath = getConfinedFilePath(STATE_FILENAME);
  if (!fs.existsSync(filePath)) {
    const initial = buildDefaultState();
    const updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify({ state: initial, updatedAt }, null, 2), 'utf-8');
    return { state: initial, updatedAt };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const migrated = migrateState(raw.state || raw);
    const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString();
    return { state: migrated, updatedAt };
  } catch (err) {
    console.warn('Corrupted workbench_state.json, falling back to canonical defaults:', err);
    return { state: buildDefaultState(), updatedAt: new Date().toISOString() };
  }
}

function writePersistedState(incomingState: unknown): { state: WorkbenchState; updatedAt: string } {
  if (!incomingState || typeof incomingState !== 'object' || Array.isArray(incomingState)) {
    throw new Error('Invalid state payload: must be a JSON object');
  }
  const filePath = getConfinedFilePath(STATE_FILENAME);
  const tempPath = getConfinedFilePath(`${STATE_FILENAME}.tmp`);

  const sanitizedState = migrateState(incomingState);
  const updatedAt = new Date().toISOString();
  const payload = JSON.stringify({ state: sanitizedState, updatedAt }, null, 2);

  fs.writeFileSync(tempPath, payload, 'utf-8');
  fs.renameSync(tempPath, filePath);

  return { state: sanitizedState, updatedAt };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // API: Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'subspace-protocols-writing-workbench' });
  });

  // API: Auth Status
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const authenticated = Boolean(token && activeSessionTokens.has(token));
    res.json({
      configured: isPasscodeConfigured(),
      usingEnvPasscode: getEnvPasscode().length > 0,
      authenticated
    });
  });

  // API: One-time first-run passcode setup (when WORKBENCH_PASSCODE is unset and no hash exists yet)
  app.post('/api/auth/setup', (req: Request, res: Response) => {
    if (isPasscodeConfigured()) {
      res.status(403).json({ error: 'Passcode is already configured. Please sign in.' });
      return;
    }
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 4) {
      res.status(400).json({ error: 'Choose a passcode of at least 4 characters.' });
      return;
    }
    writeStoredAuthHash(passcode);
    const token = issueSessionToken();
    res.json({ ok: true, token });
  });

  // API: Passcode Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    if (!isPasscodeConfigured()) {
      res.status(400).json({ error: 'No passcode configured yet. Set one first.' });
      return;
    }
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!verifyPasscode(passcode)) {
      res.status(401).json({ error: 'Invalid Booth 04 passcode.' });
      return;
    }
    const token = issueSessionToken();
    res.json({ ok: true, token });
  });

  // API: Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      activeSessionTokens.delete(authHeader.slice(7).trim());
    }
    res.json({ ok: true });
  });

  // Protected API: Read current server-persisted workbench state
  app.get('/api/state', requireAuth, (_req: Request, res: Response) => {
    try {
      const data = readPersistedState();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to read server state' });
    }
  });

  // Protected API: Save updated workbench state to server disk
  app.put('/api/state', requireAuth, (req: Request, res: Response) => {
    try {
      const bodyState = req.body?.state ?? req.body;
      const saved = writePersistedState(bodyState);
      res.json({ ok: true, updatedAt: saved.updatedAt });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Failed to persist server state' });
    }
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Subspace Protocols Writing Workbench running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
