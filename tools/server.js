const loadConfigFile = require('rollup/dist/loadConfigFile')
const path = require('path')
const fs = require('fs')
const http = require('http')
const handler = require('serve-handler')
const rollup = require('rollup')
const metablock = require('rollup-plugin-userscript-metablock')
const { red, green, cyan, bold } = require('colorette')
const hyperlink = (url, title) => `\u001B]8;;${url}\u0007${title || url}\u001B]8;;\u0007`

// Const
const repoDir = path.resolve(__dirname, '..')
const destDir = path.resolve(repoDir, 'dist')
const devScriptTemplate = path.resolve(__dirname, 'dev.user.js')
const devScriptFileName = 'dev.user.js'

const pkg = require(path.resolve(repoDir, 'package.json'))
const meta = require(path.resolve(repoDir, 'meta.json'))
const port = pkg.config.port

// Start
console.log('👀 watch & serve 🤲\n###################\n')
fs.mkdir(destDir, { recursive: true }, () => null)

// Start web server
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: destDir,
  })
})
server.listen(port, () => {
  console.log(`Running webserver at ${hyperlink(`http://localhost:${port}`)}`)
})

// Create the userscript for development 'dist/dev.user.js'
console.log(cyan('Generating dev.user.js based on...'))

// Fix missing grants
const grants = 'grant' in meta ? meta.grant : []
if (grants.indexOf('GM.xmlHttpRequest') === -1) {
  grants.push('GM.xmlHttpRequest')
}
if (grants.indexOf('GM.setValue') === -1) {
  grants.push('GM.setValue')
}
if (grants.indexOf('GM.getValue') === -1) {
  grants.push('GM.getValue')
}

// Generate development script
const devMetablock = metablock({
  file: './meta.json',
  override: {
    name: pkg.name + ' [dev]',
    version: pkg.version,
    description: pkg.description,
    homepage: pkg.homepage,
    author: pkg.author,
    license: pkg.license,
    grant: grants,
  },
})
const devScriptContent = fs.readFileSync(devScriptTemplate, 'utf8').replace(/%PORT%/gm, port.toString())
const result = devMetablock.renderChunk(devScriptContent, null, { sourcemap: false })
const outContent = typeof result === 'string' ? result : result.code

// Save development script into dist
fs.writeFileSync(path.join(destDir, devScriptFileName), outContent)
console.log(green(`Created ${bold(devScriptFileName)}. Please install in Tampermonkey: `) + hyperlink(`http://localhost:${port}/${devScriptFileName}`))

// Watch and build userscript
loadConfigFile(path.resolve(repoDir, 'rollup.config.js')).then(
  async ({ options, warnings }) => {
    // Start rollup watch
    const watcher = rollup.watch(options)

    watcher.on('event', event => {
      if (event.code === 'BUNDLE_START') {
        console.log(cyan(`Bundling ${bold(event.input)} → ${bold(event.output.map(fullPath => path.relative(repoDir, fullPath)).join(', '))}...`))
      } else if (event.code === 'BUNDLE_END') {
        console.log(green(`Created ${bold(event.output.map(fullPath => path.relative(repoDir, fullPath)).join(', '))} in ${event.duration}ms`))
      } else if (event.code === 'ERROR') {
        console.log(bold(red('⚠ Error')))
        console.log(event.error)
      }
      if ('result' in event && event.result) {
        event.result.close()
      }
    })

    // stop watching
    watcher.close()
  },
)
