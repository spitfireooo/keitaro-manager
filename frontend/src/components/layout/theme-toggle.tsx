import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '../../store/theme.store'

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const label = t(theme === 'dark' ? 'app.switchToLight' : 'app.switchToDark')
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      className="button-secondary size-9 shrink-0 p-0"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  )
}
