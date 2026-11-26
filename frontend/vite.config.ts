import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import desktopDownload from './desktop-download.config.json' with { type: 'json' }

const downloadFile = 'downloads/' + desktopDownload.fileName
const installerPath = fileURLToPath(new URL('./public/' + downloadFile, import.meta.url))

export default defineConfig(({ mode }) => {
  const desktop = mode === 'desktop'

  return {
    plugins: [react(), tailwindcss()],
    publicDir: desktop ? false : 'public',
    build: { outDir: desktop ? 'dist-desktop' : 'dist' },
    define: {
      __LOCAL_DESKTOP_DOWNLOAD_FILE__: JSON.stringify(!desktop && existsSync(installerPath) ? downloadFile : null),
    },
    server: {
      host: '127.0.0.1',
      port: 1422,
      strictPort: true,
      proxy: {
        '/api': 'http://127.0.0.1:8080',
      },
    },
  }
})
