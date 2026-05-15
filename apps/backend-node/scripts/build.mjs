
import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const { dependencies, devDependencies } = JSON.parse(readFileSync('./package.json', 'utf-8'));

const external = [...Object.keys(dependencies || {}), ...Object.keys(devDependencies || {})];

await esbuild.build({
  entryPoints: ['api/graphql.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.js',
  external: external.filter(dep => !dep.startsWith('@repo/')),
});
