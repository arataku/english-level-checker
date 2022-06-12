const { build } = require('esbuild');
const { resolve } = require('path');

const args = process.argv.slice(2);

build({
  define: { 'process.env.NODE_ENV': process.env.NODE_ENV },
  entryPoints: [resolve(__dirname, 'src/main.ts')],
  target: 'esnext',
  outfile: resolve(__dirname, 'build/main.js'),
  bundle: true,
  minify: true,
  sourcemap: true,
  watch: args.includes('--watch') && {
    onRebuild: (err, res) => {
      const now = `[${new Date().toLocaleTimeString()}]`;
      if (err) {
        console.error(`${now} ${err}`);
        return;
      }
      console.log(`Rebuild done!`);
      if (res.warnings.length) {
        console.log(`${now} ${res.warnings}`);
      }
    },
  },
}).catch(() => {});
