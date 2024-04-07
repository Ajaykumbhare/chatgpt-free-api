import dts from 'bun-plugin-dts';

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'node',
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
  plugins: [dts()],
});
