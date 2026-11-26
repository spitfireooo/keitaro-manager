import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

export interface SearchOption {
  value: string
  label: string
  detail?: string
}

const resultLimit = 10

export function useSelectSearch(
  id: string,
  options: readonly SearchOption[],
  value: string,
  onChange: (value: string) => void,
) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const selected = options.find((option) => option.value === value)
  const search = query.trim().toLocaleLowerCase()
  const searchedId = search.replace(/^#/, '')
  const matches = options
    .filter((option) =>
      option.label.toLocaleLowerCase().includes(search) || (searchedId !== '' && option.value.includes(searchedId)),
    )
    .slice(0, resultLimit)
  const activeIndex = Math.min(highlight, matches.length - 1)
  const listId = id + '-options'
  const activeId = open && activeIndex >= 0 ? listId + '-' + activeIndex : undefined

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])

  function registerInput(element: HTMLInputElement | null) {
    inputRef.current = element
  }

  function openSearch() {
    setQuery('')
    setHighlight(-1)
    setOpen(true)
  }

  function closeSearch() {
    setOpen(false)
    setHighlight(-1)
  }

  function changeQuery(text: string) {
    setQuery(text)
    setHighlight(-1)
    setOpen(true)
  }

  function choose(option: SearchOption) {
    onChange(option.value)
    closeSearch()
  }

  function toggle() {
    if (open) {
      closeSearch()
      return
    }

    inputRef.current?.focus()
    openSearch()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const down = event.key === 'ArrowDown'
      if (!open) {
        openSearch()
        setHighlight(down ? 0 : resultLimit - 1)
      } else if (matches.length > 0) {
        const next = down
          ? Math.min(activeIndex + 1, matches.length - 1)
          : activeIndex < 0 ? matches.length - 1 : Math.max(activeIndex - 1, 0)
        setHighlight(next)
      }
    } else if (open && event.key === 'Enter') {
      event.preventDefault()
      const option = matches[activeIndex] ?? (matches.length === 1 ? matches[0] : undefined)
      if (option) choose(option)
    } else if (open && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeSearch()
    }
  }

  return {
    open,
    registerInput,
    inputValue: open ? query : selected?.label ?? '',
    matches,
    activeIndex,
    activeId,
    listId,
    openSearch,
    closeSearch,
    changeQuery,
    choose,
    toggle,
    onKeyDown,
  }
}
