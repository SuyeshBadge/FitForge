#!/usr/bin/env node

/**
 * FitForge OTA Publish Script
 * 
 * Takes the output from `npx expo export` and publishes it to the OTA server.
 * 
 * Usage:
 *   node publish.js <platform> [dist-dir]
 * 
 * Example:
 *   node publish.js ios ./dist
 *   node publish.js android ./dist
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPDATES_DIR = path.join(__dirname, 'updates');

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function publish(platform, distDir) {
  if (!platform || !['ios', 'android'].includes(platform)) {
    console.error('Usage: node publish.js <ios|android> [dist-dir]');
    process.exit(1);
  }

  distDir = distDir || path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(distDir)) {
    console.error(`❌ dist directory not found: ${distDir}`);
    console.error('Run `npx expo export` first to generate the dist directory.');
    process.exit(1);
  }

  console.log(`📦 Publishing ${platform} update from ${distDir}...`);

  // Generate update ID from timestamp
  const updateId = `update-${Date.now()}`;
  const updateDir = path.join(UPDATES_DIR, platform, updateId);

  // Create update directories
  fs.mkdirSync(path.join(updateDir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(updateDir, 'bundles'), { recursive: true });

  // Read existing manifest to get runtime version
  const existingManifest = findLatestManifest(platform);
  const runtimeVersion = existingManifest?.runtimeVersion || '1.0.0';

  // Process dist directory
  const assets = [];
  const distFiles = getAllFiles(distDir);

  for (const file of distFiles) {
    const relativePath = path.relative(distDir, file);
    const hash = hashFile(file);
    const ext = path.extname(file).toLowerCase();

    // Determine asset type
    let type, contentType;
    if (ext === '.js') {
      type = 'js';
      contentType = 'application/javascript';
    } else if (ext === '.json') {
      type = 'json';
      contentType = 'application/json';
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      type = 'asset';
      contentType = `image/${ext.slice(1)}`;
    } else if (['.woff', '.woff2'].includes(ext)) {
      type = 'font';
      contentType = `font/${ext.slice(1)}`;
    } else {
      type = 'asset';
      contentType = 'application/octet-stream';
    }

    // Copy file to appropriate location
    if (type === 'js') {
      const destPath = path.join(updateDir, 'bundles', hash);
      fs.copyFileSync(file, destPath);
    } else {
      const destPath = path.join(updateDir, 'assets', hash);
      fs.copyFileSync(file, destPath);
    }

    assets.push({
      hash,
      type,
      contentType,
      path: relativePath,
    });

    console.log(`  ✓ ${relativePath} → ${hash.slice(0, 12)}...`);
  }

  // Find the main JS bundle (usually index.js or similar)
  const mainBundle = assets.find(a => a.type === 'js');

  // Create manifest
  const manifest = {
    id: updateId,
    createdAt: new Date().toISOString(),
    runtimeVersion,
    channel: process.env.UPDATE_CHANNEL || 'production',
    assets,
    launchAsset: mainBundle ? {
      hash: mainBundle.hash,
      type: mainBundle.type,
      contentType: mainBundle.contentType,
      path: mainBundle.path,
    } : null,
  };

  // Write manifest
  fs.writeFileSync(
    path.join(updateDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n✅ Update published!`);
  console.log(`   Platform: ${platform}`);
  console.log(`   Update ID: ${updateId}`);
  console.log(`   Runtime Version: ${runtimeVersion}`);
  console.log(`   Assets: ${assets.length}`);
  console.log(`   Manifest: ${path.join(updateDir, 'manifest.json')}`);

  return manifest;
}

function findLatestManifest(platform) {
  const platformDir = path.join(UPDATES_DIR, platform);
  if (!fs.existsSync(platformDir)) return null;

  const dirs = fs.readdirSync(platformDir)
    .filter(d => fs.statSync(path.join(platformDir, d)).isDirectory())
    .sort()
    .reverse();

  for (const dir of dirs) {
    const manifestPath = path.join(platformDir, dir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }
  }

  return null;
}

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// Run
const platform = process.argv[2];
const distDir = process.argv[3];
publish(platform, distDir);
