#!/usr/bin/env node
/**
 * Cache-busting build script.
 * Reads styles.css and invitation.js, computes an 8-char MD5 hash of
 * each file's content, then updates the ?v= query strings in index.html.
 *
 * Run after any change:  node build.js
 */

const fs     = require('fs');
const crypto = require('crypto');
const path   = require('path');

const root = __dirname;

function contentHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

const cssHash = contentHash(path.join(root, 'styles.css'));
const jsHash  = contentHash(path.join(root, 'invitation.js'));

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Replace existing ?v=... query strings (or bare filenames) with hashed versions
html = html.replace(/(styles\.css)(\?v=[^"']*)?/g,      `$1?v=${cssHash}`);
html = html.replace(/(invitation\.js)(\?v=[^"']*)?/g,   `$1?v=${jsHash}`);

fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');

console.log('✔  Cache hashes updated:');
console.log(`   styles.css     → ?v=${cssHash}`);
console.log(`   invitation.js  → ?v=${jsHash}`);
