import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'

import appIcon from '../../assets/app-icon.svg?no-inline'
import { ROUTES } from '../../config/routes.config'
import { NativeSelect } from '../form/native-select'
import { DesktopDownload } from './desktop-download'
import { RouteAddress } from './route-address'
import { ThemeToggle } from './theme-toggle'

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <Link to={ROUTES.campaigns} className="flex items-center gap-2 font-semibold text-content">
              <img src={appIcon} alt="" width={24} height={24} className="size-6 shrink-0" />
              {t('app.title')}
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NativeSelect
                aria-label={t('app.language')}
                value={language}
                onChange={(event) => void i18n.changeLanguage(event.currentTarget.value)}
              >
                <option value="ru">{t('app.languages.ru')}</option>
                <option value="en">{t('app.languages.en')}</option>
              </NativeSelect>
              <DesktopDownload />
            </div>
          </div>
          <div className="border-t border-line pt-3">
            <RouteAddress />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </>
  )
}
