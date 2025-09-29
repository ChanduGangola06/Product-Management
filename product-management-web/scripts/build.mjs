import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

await build({
  entryPoints: [path.resolve(__dirname, '../src/main.tsx')],
  bundle: true,
  outdir: path.resolve(__dirname, '../dist/assets'),
  entryNames: 'index',
  sourcemap: isProd ? false : true,
  minify: isProd,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  logLevel: 'info',
  loader: {
    '.css': 'css'
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
});

// Copy index.html to dist and rewrite asset paths to be relative
const projectRoot = path.resolve(__dirname, '..');
const indexHtmlPath = path.resolve(projectRoot, 'index.html');
const distDir = path.resolve(projectRoot, 'dist');
const distIndexPath = path.resolve(distDir, 'index.html');

await fs.mkdir(distDir, { recursive: true });
let indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
indexHtml = indexHtml
  .replaceAll('href="/assets/', 'href="./assets/')
  .replaceAll('src="/assets/', 'src="./assets/');

await fs.writeFile(distIndexPath, indexHtml, 'utf-8');


