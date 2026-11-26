import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'

type NativeSelectProps = ComponentProps<'select'>

export function NativeSelect({ className, children, ...props }: NativeSelectProps) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <select className="field-control h-9 appearance-none py-0 pr-9" {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  )
}
