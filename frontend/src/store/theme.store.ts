import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemTheme(),
      toggleTheme: () => {
        const theme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme })
        applyTheme(theme)
      },
    }),
    {
      name: 'keitaro-manager.theme',
      partialize: ({ theme }) => ({ theme }),
    },
  ),
)

export function initializeTheme() {
  applyTheme(useThemeStore.getState().theme)
}
