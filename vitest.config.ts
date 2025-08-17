import react from '@vitejs/plugin-react-swc';
import * as fs from 'fs';
import * as path from 'path';
import { defineConfig } from 'vitest/config';
const tsconfigPath = path.resolve(__dirname, './tsconfig.test.json');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    typecheck: fs.existsSync(tsconfigPath)
      ? { tsconfig: './tsconfig.test.json' }


import { defineConfig } from 'vitest/config';


export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    typecheck: { tsconfig: './tsconfig.test.json' },
  }
})
