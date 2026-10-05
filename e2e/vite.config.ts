import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// Only this Playwright dev server replaces Firebase. Production builds use vite.config.ts.
export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^firebase\/app$/, replacement: path.join(root, 'e2e/mocks/firebase-app.ts') },
      { find: /^firebase\/auth$/, replacement: path.join(root, 'e2e/mocks/firebase-auth.ts') },
      { find: /^firebase\/firestore$/, replacement: path.join(root, 'e2e/mocks/firebase-firestore.ts') },
      { find: '@', replacement: root },
    ],
  },
});
