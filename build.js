const { build } = require('esbuild')
const glob = require('glob')

const options = {
    entryPoints: glob.sync('./src/index.ts'),
    bundle: true,
    minify: true,
    sourcemap: true,
    outbase: './src',
    outdir: './dist',
    platform: 'node',
    external: [],
    watch: false
}

build(options).catch(err => {
    process.stderr.write(err.stderr)
    process.exit(1)
})
