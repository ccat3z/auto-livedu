import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import metablock from 'rollup-plugin-userscript-metablock'
import css from 'rollup-plugin-import-css'

const fs = require('fs')
const pkg = require('./package.json')

fs.mkdir('dist/', { recursive: true }, () => null)

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.user.js',
    format: 'iife',
    name: 'rollupUserScript',
    // banner: () => ('\n/*\n' + fs.readFileSync('./LICENSE', 'utf8') + '*/'),
    sourcemap: true,
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      ENVIRONMENT: JSON.stringify('production'),
      preventAssignment: true,
    }),
    nodeResolve({ extensions: ['.js', '.ts'] }),
    typescript(),
    css(),
    metablock({
      file: './meta.json',
      override: {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        homepage: pkg.homepage,
        author: pkg.author,
        license: pkg.license,
      },
    }),
  ],
}
