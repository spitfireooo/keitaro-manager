import { createHashRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../components/layout/app-layout'
import { RouteError } from '../components/layout/route-error'
import { ROUTES } from '../config/routes.config'
import { CampaignPage } from '../pages/campaign'
import { CampaignsPage } from '../pages/campaigns'

export const router = createHashRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: ROUTES.campaigns, element: <CampaignsPage /> },
      { path: ROUTES.campaignPattern, element: <CampaignPage /> },
      { path: '*', element: <Navigate to={ROUTES.campaigns} replace /> },
    ],
  },
])
