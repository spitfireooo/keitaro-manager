import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { CreateCampaignForm } from './create-campaign-form'

interface CreateCampaignDialogProps {
  onClose: () => void
  onCreated: (campaignId: number) => void
}

export function CreateCampaignDialog({ onClose, onCreated }: CreateCampaignDialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="create-campaign-heading"
      className="m-auto max-h-[calc(100%_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl border border-line bg-surface p-6 text-content shadow-xl backdrop:bg-overlay"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="create-campaign-heading" className="text-lg font-semibold">{t('createCampaign.heading')}</h2>
        <button type="button" aria-label={t('common.close')} className="rounded-md p-1.5 hover:bg-hover" onClick={onClose}>
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <CreateCampaignForm onCancel={onClose} onCreated={onCreated} />
    </dialog>
  )
}
