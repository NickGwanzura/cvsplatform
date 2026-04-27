import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import fs from 'node:fs';
import path from 'node:path';
import { Agent } from 'undici';

const app = new Hono();

const UPSTREAM_API_URL = (process.env.UPSTREAM_API_URL || 'https://api.example.com/api/v1').replace(/\/+$/, '');

// TLS validation for upstream calls. Defaults to *secure* (validate certs).
// Only set UPSTREAM_INSECURE_TLS=true if the upstream presents a self-signed
// or otherwise invalid cert AND you accept the MITM risk on that hop.
const UPSTREAM_INSECURE = process.env.UPSTREAM_INSECURE_TLS === 'true';
const insecureDispatcher = UPSTREAM_INSECURE
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : undefined;
if (UPSTREAM_INSECURE) {
  console.warn('[proxy] UPSTREAM_INSECURE_TLS=true — upstream TLS validation is DISABLED.');
}

// Allow-listed origins for CORS. Comma-separated env var; defaults to local dev.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.APP_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  '/*',
  cors({
    origin: (origin) => {
      if (!origin) return ALLOWED_ORIGINS[0] || '';
      return ALLOWED_ORIGINS.includes(origin) ? origin : '';
    },
    credentials: false,
  })
);

app.use(
  '/*',
  secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  })
);

// 10MB cap on request bodies. File uploads (supplier docs) are well under this.
app.use('/api/v1/*', bodyLimit({ maxSize: 10 * 1024 * 1024 }));

// Simple in-memory sliding-window rate limiter for auth endpoints.
// Keyed by client IP (X-Forwarded-For first hop, falling back to remote addr).
const RATE_BUCKETS = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 10;

function clientKey(c) {
  const xff = c.req.header('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = c.req.header('x-real-ip');
  if (real) return real;
  // node-server exposes the underlying socket on c.env.incoming
  return c.env?.incoming?.socket?.remoteAddress || 'unknown';
}

function rateLimit(c) {
  const key = clientKey(c);
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(key) || [];
  const fresh = bucket.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= RATE_MAX) {
    return false;
  }
  fresh.push(now);
  RATE_BUCKETS.set(key, fresh);
  return true;
}

// Periodic cleanup of stale buckets so the map can't grow unbounded.
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [key, hits] of RATE_BUCKETS) {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) RATE_BUCKETS.delete(key);
    else RATE_BUCKETS.set(key, fresh);
  }
}, RATE_WINDOW_MS).unref?.();

app.use('/api/v1/auth/*', async (c, next) => {
  if (!rateLimit(c)) {
    return c.json({ error: 'Too many requests', requestId: 'rl' }, 429);
  }
  return next();
});

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// Proxy /api/v1/* → UPSTREAM_API_URL. Fixes mixed-content by keeping the
// browser on HTTPS (same origin) while we reach the upstream server-side.
app.all('/api/v1/*', async (c) => {
  const startedAt = Date.now();
  const url = new URL(c.req.url);
  const suffix = url.pathname.slice('/api/v1'.length);
  const upstreamUrl = UPSTREAM_API_URL + suffix + url.search;
  const method = c.req.method;
  const reqId = Math.random().toString(36).slice(2, 8);

  const headers = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'host' || k === 'connection' || k === 'content-length') return;
    headers.set(key, value);
  });

  const body = method === 'GET' || method === 'HEAD' ? undefined : await c.req.arrayBuffer();
  const bodySize = body ? body.byteLength : 0;

  // Log path only — never the upstream host or full URL — to keep internal
  // infra out of any log shipper that gets exfiltrated.
  console.log(`[proxy ${reqId}] → ${method} ${suffix}${bodySize ? ` (${bodySize}B)` : ''}`);

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'follow',
      dispatcher: insecureDispatcher,
    });
    const ms = Date.now() - startedAt;
    console.log(`[proxy ${reqId}] ← ${upstream.status} ${method} ${suffix} (${ms}ms)`);

    const resHeaders = new Headers();
    upstream.headers.forEach((v, k) => {
      const kl = k.toLowerCase();
      if (kl === 'content-encoding' || kl === 'transfer-encoding' || kl === 'connection') return;
      resHeaders.set(k, v);
    });
    return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
  } catch (err) {
    const ms = Date.now() - startedAt;
    // Detailed error stays in server logs. Client only learns it failed.
    console.error(`[proxy ${reqId}] ✗ ${method} ${suffix} (${ms}ms):`, err.code || '', err.message);
    if (err.cause) console.error(`[proxy ${reqId}]   cause:`, err.cause);
    return c.json(
      {
        error: 'Service temporarily unavailable',
        requestId: reqId,
      },
      502
    );
  }
});

// Map unresolved tilde paths (webpack convention) that Vite leaves in the
// built CSS. Carbon's SCSS references ~@ibm/plex/... fonts; we serve them
// straight from node_modules at runtime.
app.use(
  '/assets/~@ibm/*',
  serveStatic({
    root: './node_modules/@ibm',
    rewriteRequestPath: (p) => p.replace(/^\/assets\/~@ibm/, ''),
  })
);

// Static SPA — serve built assets from dist/
const distDir = path.resolve('./dist');
const hasDist = fs.existsSync(distDir);

if (hasDist) {
  app.use('/*', serveStatic({ root: './dist' }));
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  app.notFound((c) => c.html(indexHtml));
} else {
  app.get('/', (c) => c.text('CVS API server — SPA not built. Run `npm run build`.'));
}

const PORT = Number(process.env.PORT) || Number(process.env.API_PORT) || 3001;
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`CVS server on http://localhost:${info.port} (allowed origins: ${ALLOWED_ORIGINS.join(', ')})`);
});
