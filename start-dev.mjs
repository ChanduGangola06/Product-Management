import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Product Management Development Environment...\n');

// Start the server
console.log('🚀 Starting server on port 4000...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'product-management-server'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for server to start, then start the frontend
setTimeout(() => {
  console.log('🌐 Starting frontend on port 5173...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'product-management-web'),
    stdio: 'inherit',
    shell: true
  });

  // Handle cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down development servers...');
    server.kill();
    frontend.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 2000);

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
