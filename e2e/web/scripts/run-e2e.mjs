import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EMAIL = 'qa-bot@example.test';
const PASSWORD = 'QaBot!2026Pass';
const DB_USER = 'user';
const DB_PASSWORD = 'pass';
const DB_NAME = 'db';
const DB_PORT = '54329';
const CONTAINER_NAME = 'npjc-e2e-postgres';
const BETTER_AUTH_SECRET = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const BASE_URL = 'http://localhost:3000';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const e2eDir = resolve(scriptDir, '..');
const repoRoot = resolve(e2eDir, '..', '..');
const webDir = resolve(repoRoot, 'apps/web');
const envFile = resolve(webDir, '.env');

const databaseUrl = `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}`,
    );
  }
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: process.env,
    ...options,
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(stderr || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForHttp(url, timeoutMs) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok || response.status === 302 || response.status === 307) {
        return;
      }
    } catch {}

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureDockerPostgres() {
  const running = capture('docker', [
    'ps',
    '--filter',
    `name=^${CONTAINER_NAME}$`,
    '--format',
    '{{.Names}}',
  ]);

  if (running === CONTAINER_NAME) {
    return;
  }

  const existing = capture('docker', [
    'ps',
    '-a',
    '--filter',
    `name=^${CONTAINER_NAME}$`,
    '--format',
    '{{.Names}}',
  ]);

  if (existing === CONTAINER_NAME) {
    run('docker', ['start', CONTAINER_NAME]);
  } else {
    run('docker', [
      'run',
      '-d',
      '--name',
      CONTAINER_NAME,
      '-e',
      `POSTGRES_USER=${DB_USER}`,
      '-e',
      `POSTGRES_PASSWORD=${DB_PASSWORD}`,
      '-e',
      `POSTGRES_DB=${DB_NAME}`,
      '-p',
      `${DB_PORT}:5432`,
      'postgres:17-alpine',
    ]);
  }

  const start = Date.now();
  while (Date.now() - start < 30000) {
    const result = spawnSync(
      'docker',
      ['exec', CONTAINER_NAME, 'pg_isready', '-U', DB_USER, '-d', DB_NAME],
      {
        stdio: 'ignore',
      },
    );

    if (result.status === 0) {
      return;
    }

    await sleep(1000);
  }

  throw new Error('Timed out waiting for Postgres container to become ready');
}

function writeWebEnv() {
  mkdirSync(webDir, { recursive: true });
  writeFileSync(
    envFile,
    [
      `DATABASE_URL="${databaseUrl}"`,
      `DATABASE_URL_DIRECT="${databaseUrl}"`,
      `BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}"`,
      `BETTER_AUTH_URL="${BASE_URL}"`,
      '',
    ].join('\n'),
    'utf8',
  );
}

function runMigrations() {
  run(
    'yarn',
    ['workspace', '@h82/no-picture-just-chat-web', 'exec', 'drizzle-kit', 'push', '--force'],
    {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DATABASE_URL_DIRECT: databaseUrl,
        BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: BASE_URL,
      },
    },
  );
}

function startWebServer() {
  const child = spawn(
    'sh',
    [
      '-c',
      'set -a && . ./.env && set +a && PATH="$PWD/../../node_modules/.bin:$PATH" vite dev --port 3000',
    ],
    {
      cwd: webDir,
      detached: true,
      stdio: 'inherit',
      env: process.env,
    },
  );

  return child;
}

async function stopWebServer(child) {
  if (child.killed || child.exitCode !== null) {
    return;
  }

  await new Promise((resolvePromise) => {
    const timeout = setTimeout(() => {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {}
    }, 5000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolvePromise();
    });

    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      clearTimeout(timeout);
      resolvePromise();
    }
  });
}

async function seedUser() {
  const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: BASE_URL,
    },
    body: JSON.stringify({
      name: 'QA Bot',
      email: EMAIL,
      password: PASSWORD,
      callbackURL: '/app',
    }),
  });

  if (response.ok || response.status === 422) {
    return;
  }

  const body = await response.text();
  throw new Error(`Failed to seed QA user: ${response.status} ${body}`);
}

async function main() {
  run('docker', ['--version']);
  await ensureDockerPostgres();
  writeWebEnv();
  runMigrations();

  const webServer = startWebServer();

  const stopServer = () => stopWebServer(webServer);

  process.on('exit', () => {
    if (!webServer.killed && webServer.exitCode === null) {
      webServer.kill('SIGTERM');
    }
  });
  process.on('SIGINT', () => {
    void stopServer().finally(() => process.exit(130));
  });
  process.on('SIGTERM', () => {
    void stopServer().finally(() => process.exit(143));
  });

  try {
    await waitForHttp(`${BASE_URL}/login`, 60000);
    await seedUser();
    run('yarn', ['exec', 'playwright', 'test'], { cwd: e2eDir });
  } finally {
    await stopServer();
  }
}

await main();
