import { createJiti } from 'jiti';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(import.meta.url);

await jiti.import(path.join(__dirname, 'guardrails.test.ts'));
