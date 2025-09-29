import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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


