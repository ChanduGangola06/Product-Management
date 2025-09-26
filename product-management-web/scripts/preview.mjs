import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import serveStatic from 'serve-static';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());
const port = Number(process.env.PORT || 5173);
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4000';

const app = express();

app.use('/api', createProxyMiddleware({ target: apiTarget, changeOrigin: true }));
app.use('/health', createProxyMiddleware({ target: apiTarget, changeOrigin: true }));

app.use(serveStatic(path.resolve(projectRoot, 'dist'), { fallthrough: true, index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(projectRoot, 'index.html'));
});

app.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});


