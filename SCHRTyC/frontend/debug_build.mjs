import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../SCHRTyC/frontend')

try {
  await build({
    root,
    configFile: join(root, 'vite.config.js'),
  })
} catch (err) {
  console.error('BUILD FAILED WITH ERROR:')
  console.error(JSON.stringify(err, null, 2))
  if (err.errors) {
    console.error('DETAILED ERRORS:')
    console.error(JSON.stringify(err.errors, null, 2))
  }
  process.exit(1)
}
