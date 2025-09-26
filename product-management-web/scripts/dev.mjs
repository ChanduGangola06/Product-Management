import { context } from 'esbuild';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import serveStatic from 'serve-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outdir = path.resolve(projectRoot, 'dist/assets');

const port = Number(process.env.PORT || 5173);
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4000';

const ctx = await context({
  entryPoints: [path.resolve(projectRoot, 'src/main.tsx')],
  bundle: true,
  outdir,
  entryNames: 'index',
  sourcemap: true,
  minify: false,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  logLevel: 'info',
  loader: { '.css': 'css' },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
});

await ctx.watch();

console.log('esbuild watching...');

const app = express();

app.use('/api', createProxyMiddleware({ target: apiTarget, changeOrigin: true }));
app.use('/health', createProxyMiddleware({ target: apiTarget, changeOrigin: true }));

app.use(serveStatic(path.resolve(projectRoot, 'dist'), { fallthrough: true, index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(projectRoot, 'index.html'));
});

app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  try { await ctx.dispose?.(); } catch {}
  process.exit(0);
});

