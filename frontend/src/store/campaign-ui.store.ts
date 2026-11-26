import { create } from 'zustand'

interface CampaignUiState {
  createDialogOpen: boolean
  openCreateDialog: () => void
  closeCreateDialog: () => void
}

export const useCampaignUiStore = create<CampaignUiState>()((set) => ({
  createDialogOpen: false,
  openCreateDialog: () => set({ createDialogOpen: true }),
  closeCreateDialog: () => set({ createDialogOpen: false }),
}))
