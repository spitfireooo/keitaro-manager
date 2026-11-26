import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '../../../config/routes.config'

function getRoute(input: string) {
  let path = input.trim()
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) {
    try {
      const current = window.location
      const url = new URL(path)
      if (url.protocol !== current.protocol || url.host !== current.host) return null
      if (url.username || url.password) return null
      path = url.hash || url.pathname + url.search
    } catch {
      return null
    }
  }

  const route = path.startsWith('#') ? path.slice(1) : path
  const pathname = route.split(/[?#]/, 1)[0]

  if (pathname === '/') return ROUTES.campaigns + route.slice(1)
  if (matchPath(ROUTES.campaigns, pathname)) return route

  const campaign = matchPath(ROUTES.campaignPattern, pathname)
  const id = campaign?.params.campaignId ?? ''
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0 ? route : null
}

export function useRouteAddress() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = location.pathname + location.search + location.hash
  const [draft, setDraft] = useState<{ key: string; value: string; invalid: boolean }>()
  const edited = draft?.key === location.key ? draft : undefined

  function change(value: string) {
    setDraft({ key: location.key, value, invalid: false })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = edited?.value ?? '#' + current
    const route = getRoute(value)

    if (!route) {
      setDraft({ key: location.key, value, invalid: true })
      return
    }

    setDraft(undefined)
    if (route !== current) void navigate(route)
  }

  function resetOnEscape(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setDraft(undefined)
  }

  return { value: edited?.value ?? '#' + current, invalid: edited?.invalid ?? false, change, submit, resetOnEscape }
}
