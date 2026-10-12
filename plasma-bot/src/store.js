import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.env.DATA_DIR || 'data');
fs.mkdirSync(dir, { recursive: true });

// Tiny JSON-file store: load(name, default) / save(name, value)
export function load(name, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, name + '.json'), 'utf8')); }
  catch { return fallback; }
}
export function save(name, value) {
  fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(value, null, 2));
}

// review pictures: stored on the persistent volume (Discord attachment links expire after about a day)
const proofDir = path.join(dir, 'proofs');
fs.mkdirSync(proofDir, { recursive: true });
export function saveProof(file, buf) { fs.writeFileSync(path.join(proofDir, file), buf); }
export function proofPath(file) { return path.join(proofDir, file); }
