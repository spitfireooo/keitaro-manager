import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSelectSearch, type SearchOption } from './hooks/use-select-search'

interface SelectSearchProps {
  id: string
  options: readonly SearchOption[]
  value: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  menuPlacement?: 'above' | 'below'
  inputRef?: (element: HTMLInputElement | null) => void
  onBlur?: () => void
  onChange: (value: string) => void
}

export function SelectSearch({
  id,
  options,
  value,
  disabled,
  invalid,
  describedBy,
  menuPlacement = 'below',
  inputRef,
  onBlur,
  onChange,
}: SelectSearchProps) {
  const { t } = useTranslation()
  const search = useSelectSearch(id, options, value, onChange)
  const expanded = search.open && !disabled

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          ref={(element) => {
            search.registerInput(element)
            inputRef?.(element)
          }}
          className="field-control pr-10"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? search.listId : undefined}
          aria-activedescendant={expanded ? search.activeId : undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
          placeholder={t('offerSearch.placeholder')}
          value={search.inputValue}
          disabled={disabled}
          onFocus={search.openSearch}
          onBlur={() => {
            search.closeSearch()
            onBlur?.()
          }}
          onChange={(event) => search.changeQuery(event.currentTarget.value)}
          onKeyDown={search.onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={t(expanded ? 'offerSearch.hideOptions' : 'offerSearch.showOptions')}
          className="absolute inset-y-0 right-1 grid w-8 place-items-center rounded-lg text-muted hover:text-content"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={search.toggle}
        >
          <ChevronDown aria-hidden="true" className={expanded ? 'size-4 rotate-180' : 'size-4'} />
        </button>
      </div>
      {expanded && (
        <div className={`absolute inset-x-0 z-20 rounded-lg border border-control bg-surface p-1 shadow-lg ${
          menuPlacement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          <ul
            id={search.listId}
            role="listbox"
            aria-label={t('offerSearch.results')}
            className={menuPlacement === 'above' ? 'max-h-44 overflow-y-auto' : 'max-h-56 overflow-y-auto'}
          >
            {search.matches.map((option, index) => (
              <li
                id={search.listId + '-' + index}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={index === search.activeIndex
                  ? 'cursor-pointer rounded-md bg-hover px-3 py-2 text-sm text-content outline-1 -outline-offset-1 outline-focus'
                  : 'cursor-pointer rounded-md px-3 py-2 text-sm text-content hover:bg-hover'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => search.choose(option)}
              >
                <span>{option.label}</span>
                {option.detail && <span className="ml-2 text-xs text-muted">{option.detail}</span>}
              </li>
            ))}
          </ul>
          {search.matches.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted" role="status">{t('offerSearch.noResults')}</p>
          )}
        </div>
      )}
    </div>
  )
}
