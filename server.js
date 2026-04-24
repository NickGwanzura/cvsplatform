import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'node:fs';
import path from 'node:path';
import { Agent } from 'undici';

const app = new Hono();

const UPSTREAM_API_URL = (process.env.UPSTREAM_API_URL || 'https://69.197.142.170/api/v1').replace(/\/+$/, '');

// Upstream has an invalid/self-signed TLS cert. Since this call is
// server-to-server (Railway container → upstream), the browser never sees
// the cert — it only ever talks to our origin over Railway's HTTPS. Skip
// validation here.
const UPSTREAM_INSECURE = process.env.UPSTREAM_INSECURE_TLS !== 'false';
const insecureDispatcher = UPSTREAM_INSECURE
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : undefined;

app.use('/*', cors({ origin: '*' }));

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// Proxy /api/v1/* → UPSTREAM_API_URL. Fixes mixed-content by keeping the
// browser on HTTPS (same origin) while we reach the HTTP backend server-side.
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

  console.log(`[proxy ${reqId}] → ${method} ${upstreamUrl}${bodySize ? ` (${bodySize}B)` : ''}`);

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: 'follow',
      dispatcher: insecureDispatcher,
    });
    const ms = Date.now() - startedAt;
    console.log(`[proxy ${reqId}] ← ${upstream.status} ${method} ${upstreamUrl} (${ms}ms)`);

    const resHeaders = new Headers();
    upstream.headers.forEach((v, k) => {
      const kl = k.toLowerCase();
      if (kl === 'content-encoding' || kl === 'transfer-encoding' || kl === 'connection') return;
      resHeaders.set(k, v);
    });
    return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
  } catch (err) {
    const ms = Date.now() - startedAt;
    console.error(`[proxy ${reqId}] ✗ ${method} ${upstreamUrl} (${ms}ms):`, err.code || '', err.message);
    if (err.cause) console.error(`[proxy ${reqId}]   cause:`, err.cause);
    return c.json(
      {
        error: 'Upstream API unreachable',
        detail: err.message,
        code: err.code,
        upstream: upstreamUrl,
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
  console.log(`CVS server on http://localhost:${info.port} (upstream: ${UPSTREAM_API_URL})`);
});
