import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../config/routes.config'
import type { Campaign } from '../../services/campaigns.service'

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-subtle text-muted">
          <tr>
            <th scope="col" className="w-20 px-4 py-3 font-medium">{t('common.id')}</th>
            <th scope="col" className="px-4 py-3 font-medium">{t('campaigns.name')}</th>
            <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">{t('campaigns.alias')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-subtle">
              <td className="px-4 py-4 tabular-nums text-muted">{campaign.id}</td>
              <td className="px-4 py-4">
                <Link
                  to={ROUTES.campaign(campaign.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
                >
                  {campaign.name}
                  <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                </Link>
              </td>
              <td className="hidden px-4 py-4 font-mono text-xs text-muted sm:table-cell">{campaign.alias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
