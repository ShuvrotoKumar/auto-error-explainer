import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      browser: 'src/browser.ts'
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    platform: 'browser'
  },
  {
    entry: {
      node: 'src/node.ts',
      cli: 'src/cli.ts'
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    platform: 'node',
    esbuildOptions(options: any) {
      options.banner = {
        js: '#!/usr/bin/env node\n'
      };
    }
  }
]);
