import { isTauri } from '@tauri-apps/api/core'

const desktop = isTauri()
const packagedDesktop = import.meta.env.PROD && desktop

function getDesktopDownloadUrl() {
  const external = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim()
  if (external) {
    try {
      const url = new URL(external)
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href
    } catch {
      // Use the local installer when the configured URL is invalid.
    }
  }

  return __LOCAL_DESKTOP_DOWNLOAD_FILE__ && import.meta.env.BASE_URL + __LOCAL_DESKTOP_DOWNLOAD_FILE__
}

export const ENV = {
  API_URL: packagedDesktop ? 'http://127.0.0.1:8080/api' : '/api',
  NATIVE_HTTP: packagedDesktop,
  IS_DESKTOP: desktop,
  DESKTOP_DOWNLOAD_URL: getDesktopDownloadUrl(),
} as const
