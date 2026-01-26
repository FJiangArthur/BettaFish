import { create } from 'zustand'
import { reportApi } from '@/lib/api'
import type { ReportTask, ReportTemplate } from '@/types'

interface SearchStore {
  query: string
  isSearching: boolean
  currentTaskId: string | null
  taskStatus: ReportTask | null
  templates: ReportTemplate[]
  selectedTemplate: string | null
  searchHistory: Array<{ query: string; timestamp: string; taskId?: string }>

  // Actions
  setQuery: (query: string) => void
  setSelectedTemplate: (templateId: string | null) => void
  startSearch: () => Promise<void>
  pollProgress: () => Promise<void>
  cancelSearch: () => Promise<void>
  fetchTemplates: () => Promise<void>
  addToHistory: (query: string, taskId?: string) => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  isSearching: false,
  currentTaskId: null,
  taskStatus: null,
  templates: [],
  selectedTemplate: null,
  searchHistory: [],

  setQuery: (query) => set({ query }),

  setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),

  startSearch: async () => {
    const { query, selectedTemplate } = get()
    if (!query.trim()) return

    set({ isSearching: true, taskStatus: null })

    try {
      // Start report generation
      const response = await reportApi.generate({
        query: query.trim(),
        template: selectedTemplate || undefined,
      })

      set({ currentTaskId: response.task_id })
      get().addToHistory(query, response.task_id)

      // Start polling for progress
      get().pollProgress()
    } catch (error) {
      console.error('Search failed:', error)
      set({ isSearching: false })
    }
  },

  pollProgress: async () => {
    const { currentTaskId } = get()
    if (!currentTaskId) return

    try {
      const status = await reportApi.getProgress(currentTaskId)
      set({ taskStatus: status })

      if (status.status === 'running' || status.status === 'pending') {
        // Continue polling
        setTimeout(() => get().pollProgress(), 2000)
      } else {
        // Task completed or failed
        set({ isSearching: false })
      }
    } catch (error) {
      console.error('Failed to poll progress:', error)
      set({ isSearching: false })
    }
  },

  cancelSearch: async () => {
    const { currentTaskId } = get()
    if (!currentTaskId) return

    try {
      await reportApi.cancel(currentTaskId)
      set({ isSearching: false, currentTaskId: null, taskStatus: null })
    } catch (error) {
      console.error('Failed to cancel search:', error)
    }
  },

  fetchTemplates: async () => {
    try {
      const response = await reportApi.getTemplates()
      set({ templates: response.templates })
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  },

  addToHistory: (query, taskId) => {
    set((state) => ({
      searchHistory: [
        { query, timestamp: new Date().toISOString(), taskId },
        ...state.searchHistory.slice(0, 19),
      ],
    }))
  },
}))
