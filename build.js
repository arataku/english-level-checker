const { build } = require('esbuild');
const { resolve } = require('path');

build({
  define: { 'process.env.NODE_ENV': process.env.NODE_ENV },
  entryPoints: [resolve(__dirname, 'src/main.ts')],
  target: 'esnext',
  outfile: resolve(__dirname, 'build/main.js'),
  bundle: true,
  minify: true,
  sourcemap: true,
}).catch(() => {});
