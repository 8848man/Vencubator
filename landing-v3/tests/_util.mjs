import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = resolve(DIR, '..');
export const read = p => readFileSync(resolve(DIR, p), 'utf8');
export const repoPath = p => resolve(REPO, p);
export const exists = p => existsSync(resolve(REPO, p));
