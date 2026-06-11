const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const UPDATES_DIR = path.join(__dirname, 'updates');
const CHANNEL = process.env.UPDATE_CHANNEL || 'production';

// Ensure updates directory exists
if (!fs.existsSync(UPDATES_DIR)) {
  fs.mkdirSync(UPDATES_DIR, { recursive: true });
}

// ─── Expo Updates Protocol Implementation ───

// GET /manifest — Returns the update manifest for the requesting platform/runtimeVersion
app.get('/manifest', (req, res) => {
  const platform = req.headers['expo-platform'] || req.query.platform;
  const runtimeVersion = req.headers['expo-runtime-version'] || req.query.runtimeVersion;
  const currentManifestId = req.headers['expo-current-manifest-id'];

  if (!platform) {
    return res.status(400).json({ error: 'Missing expo-platform header' });
  }

  // Find latest update for this platform and runtime version
  const manifest = findLatestUpdate(platform, runtimeVersion);

  if (!manifest) {
    // No update available — return 204 (no update)
    return res.status(204).send();
  }

  // Check if client already has this update
  if (currentManifestId === manifest.id) {
    return res.status(204).send();
  }

  // Set Expo protocol headers
  res.setHeader('expo-protocol-version', '1');
  res.setHeader('expo-sfx-version', '1');
  res.setHeader('cache-control', 'no-cache');
  res.setHeader('content-type', 'application/json');

  res.json(manifest);
});

// GET /assets/:path — Serves update bundles and assets
app.get('/assets/:platform/:hash', (req, res) => {
  const { platform, hash } = req.params;
  const filePath = path.join(UPDATES_DIR, platform, 'assets', hash);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Determine content type
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  res.setHeader('content-type', contentTypes[ext] || 'application/octet-stream');
  res.setHeader('cache-control', 'public, max-age=31536000, immutable');

  fs.createReadStream(filePath).pipe(res);
});

// GET /bundles/:platform/:filename — Serves JS bundles
app.get('/bundles/:platform/:filename', (req, res) => {
  const { platform, filename } = req.params;
  const filePath = path.join(UPDATES_DIR, platform, 'bundles', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Bundle not found' });
  }

  res.setHeader('content-type', 'application/javascript');
  res.setHeader('cache-control', 'public, max-age=31536000, immutable');

  fs.createReadStream(filePath).pipe(res);
});

// GET /status — Health check
app.get('/status', (req, res) => {
  const updates = listUpdates();
  res.json({
    status: 'ok',
    channel: CHANNEL,
    totalUpdates: updates.length,
    latestUpdate: updates.length > 0 ? updates[updates.length - 1] : null,
  });
});

// GET /updates — List all updates (dashboard)
app.get('/updates', (req, res) => {
  const updates = listUpdates();
  res.json(updates);
});

// ─── Helper Functions ───

function findLatestUpdate(platform, runtimeVersion) {
  const platformDir = path.join(UPDATES_DIR, platform);
  if (!fs.existsSync(platformDir)) return null;

  // Read all update directories sorted by creation time
  const dirs = fs.readdirSync(platformDir)
    .filter(d => fs.statSync(path.join(platformDir, d)).isDirectory())
    .sort()
    .reverse();

  for (const dir of dirs) {
    const manifestPath = path.join(platformDir, dir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Check runtime version match
    if (runtimeVersion && manifest.runtimeVersion !== runtimeVersion) continue;

    return manifest;
  }

  return null;
}

function listUpdates() {
  const updates = [];
  const platforms = ['ios', 'android'];

  for (const platform of platforms) {
    const platformDir = path.join(UPDATES_DIR, platform);
    if (!fs.existsSync(platformDir)) continue;

    const dirs = fs.readdirSync(platformDir)
      .filter(d => fs.statSync(path.join(platformDir, d)).isDirectory())
      .sort();

    for (const dir of dirs) {
      const manifestPath = path.join(platformDir, dir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      updates.push({
        platform,
        dir,
        id: manifest.id,
        runtimeVersion: manifest.runtimeVersion,
        createdAt: manifest.createdAt,
      });
    }
  }

  return updates;
}

// ─── Start Server ───

app.listen(PORT, () => {
  console.log(`🚀 FitForge OTA Server running on port ${PORT}`);
  console.log(`📡 Channel: ${CHANNEL}`);
  console.log(`📂 Updates dir: ${UPDATES_DIR}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET /manifest    — Update manifest (Expo protocol)`);
  console.log(`  GET /assets/*    — Update assets`);
  console.log(`  GET /bundles/*   — JS bundles`);
  console.log(`  GET /status      — Health check`);
  console.log(`  GET /updates     — List all updates`);
});
