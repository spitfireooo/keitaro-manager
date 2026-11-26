import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontend = fileURLToPath(new URL('../', import.meta.url))
const { fileName, target } = JSON.parse(readFileSync(resolve(frontend, 'desktop-download.config.json'), 'utf8'))
const { productName, version } = JSON.parse(readFileSync(resolve(frontend, 'src-tauri/tauri.conf.json'), 'utf8'))

if (process.platform !== 'win32' || !process.env.npm_execpath) {
  throw new Error('Run pnpm desktop:download on Windows with the Tauri build prerequisites installed.')
}

const targetDirectory = resolve(frontend, process.env.CARGO_TARGET_DIR ?? 'src-tauri/target')
const build = spawnSync(process.execPath, [
  process.env.npm_execpath, 'exec', 'tauri', 'build', '--target', target, '--bundles', 'nsis',
], { cwd: frontend, stdio: 'inherit', env: { ...process.env, CARGO_TARGET_DIR: targetDirectory } })

if (build.error) throw build.error
if (build.status !== 0) process.exit(build.status ?? 1)

const installer = resolve(targetDirectory, target, 'release/bundle/nsis', productName + '_' + version + '_x64-setup.exe')
const downloads = resolve(frontend, 'public/downloads')
mkdirSync(downloads, { recursive: true })
copyFileSync(installer, resolve(downloads, fileName))
console.log('Desktop installer: ' + resolve(downloads, fileName))
