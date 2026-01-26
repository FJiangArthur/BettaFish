import { create } from 'zustand'
import type { ForumMessage } from '@/types'
import { forumApi } from '@/lib/api'

interface ForumStore {
  messages: ForumMessage[]
  isMonitoring: boolean
  currentRound: number

  // Actions
  addMessage: (message: ForumMessage) => void
  clearMessages: () => void
  startMonitoring: () => Promise<void>
  stopMonitoring: () => Promise<void>
  fetchLog: () => Promise<void>
}

export const useForumStore = create<ForumStore>((set) => ({
  messages: [],
  isMonitoring: false,
  currentRound: 0,

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages.slice(-100), message],
      currentRound: message.round ?? state.currentRound,
    }))
  },

  clearMessages: () => set({ messages: [], currentRound: 0 }),

  startMonitoring: async () => {
    try {
      await forumApi.start()
      set({ isMonitoring: true })
    } catch (error) {
      console.error('Failed to start forum monitoring:', error)
    }
  },

  stopMonitoring: async () => {
    try {
      await forumApi.stop()
      set({ isMonitoring: false })
    } catch (error) {
      console.error('Failed to stop forum monitoring:', error)
    }
  },

  fetchLog: async () => {
    try {
      const response = await forumApi.getLog()
      if (response.messages) {
        set({
          messages: response.messages.map((m, i) => ({
            timestamp: new Date().toISOString(),
            speaker: m.speaker,
            content: m.content,
            round: Math.floor(i / 4) + 1,
          })),
        })
      }
    } catch (error) {
      console.error('Failed to fetch forum log:', error)
    }
  },
}))
