const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[PWA Launcher] Memulai proses Vite Preview HTTPS di port 3000...');

const isWin = process.platform === 'win32';
const frontendDir = path.resolve(__dirname, '..');
const distDir = path.resolve(frontendDir, 'dist');
const logFile = path.resolve(frontendDir, '..', 'frontend.log');

// Pastikan dist sudah ada sebelum preview dijalankan
if (!fs.existsSync(distDir)) {
  console.error('[PWA Launcher] ❌ Direktori dist tidak ditemukan. Jalankan vite build terlebih dahulu.');
  process.exit(1);
}

try {
  // Matikan proses lama pada port 3000 jika ada (Linux)
  if (!isWin) {
    try {
      execSync('command -v fuser >/dev/null 2>&1 && fuser -k 3000/tcp >/dev/null 2>&1 || pkill -f "vite preview" || true', { shell: '/bin/bash' });
    } catch (e) {
      // ignore
    }
  }
} catch (e) {
  // ignore
}

// Buka file log untuk output preview server
let outFd = 'ignore';
let errFd = 'ignore';
try {
  outFd = fs.openSync(logFile, 'a');
  errFd = fs.openSync(logFile, 'a');
} catch (e) {
  // fallback
}

// Jalankan vite preview di port 3000 (HTTPS aktif di vite.config.js)
const subprocess = spawn(
  isWin ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--host', '0.0.0.0', '--port', '3000'],
  {
    cwd: frontendDir,
    detached: true,
    stdio: ['ignore', outFd, errFd],
    env: process.env
  }
);

subprocess.unref();

console.log(`[PWA Launcher] ✅ Vite HTTPS preview diluncurkan di background (PID: ${subprocess.pid}) pada port 3000.`);
