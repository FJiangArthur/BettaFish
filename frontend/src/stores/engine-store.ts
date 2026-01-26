import { create } from 'zustand'
import type { EngineStatus, LogEntry } from '@/types'
import { engineApi, systemApi } from '@/lib/api'
import { generateId, parseLogLevel } from '@/lib/utils'

interface Engine {
  name: string
  displayName: string
  status: EngineStatus
  logs: LogEntry[]
}

interface EngineStore {
  engines: Record<string, Engine>
  activeEngine: string
  systemStatus: 'not_started' | 'starting' | 'started'
  isLoading: boolean

  // Actions
  setActiveEngine: (name: string) => void
  addLog: (engine: string, message: string) => void
  clearLogs: (engine: string) => void
  fetchStatus: () => Promise<void>
  startSystem: () => Promise<void>
  shutdownSystem: () => Promise<void>
  startEngine: (name: string) => Promise<void>
  stopEngine: (name: string) => Promise<void>
}

const initialEngines: Record<string, Engine> = {
  query: {
    name: 'query',
    displayName: 'Query Agent',
    status: 'stopped',
    logs: [],
  },
  media: {
    name: 'media',
    displayName: 'Media Agent',
    status: 'stopped',
    logs: [],
  },
  insight: {
    name: 'insight',
    displayName: 'Insight Agent',
    status: 'stopped',
    logs: [],
  },
  forum: {
    name: 'forum',
    displayName: 'Forum Engine',
    status: 'stopped',
    logs: [],
  },
}

export const useEngineStore = create<EngineStore>((set, get) => ({
  engines: initialEngines,
  activeEngine: 'query',
  systemStatus: 'not_started',
  isLoading: false,

  setActiveEngine: (name) => set({ activeEngine: name }),

  addLog: (engine, message) => {
    const logEntry: LogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: parseLogLevel(message),
      message,
      engine,
    }

    set((state) => ({
      engines: {
        ...state.engines,
        [engine]: {
          ...state.engines[engine],
          logs: [...state.engines[engine].logs.slice(-500), logEntry],
        },
      },
    }))
  },

  clearLogs: (engine) => {
    set((state) => ({
      engines: {
        ...state.engines,
        [engine]: {
          ...state.engines[engine],
          logs: [],
        },
      },
    }))
  },

  fetchStatus: async () => {
    console.log('[EngineStore] fetchStatus called')
    try {
      const [engineStatus, sysStatus] = await Promise.all([
        engineApi.getStatus(),
        systemApi.getStatus(),
      ])
      console.log('[EngineStore] engineStatus:', engineStatus)
      console.log('[EngineStore] sysStatus:', sysStatus)

      const statusMap: Record<string, EngineStatus> = {}
      for (const [name, info] of Object.entries(engineStatus)) {
        if (info.status === 'running') {
          statusMap[name] = 'running'
        } else if (info.status === 'starting') {
          statusMap[name] = 'starting'
        } else {
          statusMap[name] = 'stopped'
        }
      }

      // Convert boolean flags to status string
      let systemStatusValue: 'not_started' | 'starting' | 'started' = 'not_started'
      if (sysStatus.starting) {
        systemStatusValue = 'starting'
      } else if (sysStatus.started) {
        systemStatusValue = 'started'
      }

      set((state) => ({
        systemStatus: systemStatusValue,
        engines: Object.fromEntries(
          Object.entries(state.engines).map(([name, engine]) => [
            name,
            { ...engine, status: statusMap[name] || 'stopped' },
          ])
        ),
      }))
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  },

  startSystem: async () => {
    console.log('[EngineStore] startSystem called, current status:', get().systemStatus)
    set({ isLoading: true, systemStatus: 'starting' })
    try {
      console.log('[EngineStore] Calling systemApi.start()...')
      const response = await systemApi.start()
      console.log('[EngineStore] API response:', response)
      if (response.success) {
        set({ systemStatus: 'started' })
        console.log('[EngineStore] System started successfully')
      } else {
        console.error('[EngineStore] System start failed:', response.message)
        set({ systemStatus: 'not_started' })
      }
      // Fetch updated status
      await get().fetchStatus()
    } catch (error) {
      console.error('[EngineStore] Failed to start system:', error)
      set({ systemStatus: 'not_started' })
    } finally {
      set({ isLoading: false })
      console.log('[EngineStore] startSystem completed, final status:', get().systemStatus)
    }
  },

  shutdownSystem: async () => {
    set({ isLoading: true })
    try {
      await systemApi.shutdown()
      set({
        systemStatus: 'not_started',
        engines: Object.fromEntries(
          Object.entries(get().engines).map(([name, engine]) => [
            name,
            { ...engine, status: 'stopped' },
          ])
        ),
      })
    } catch (error) {
      console.error('Failed to shutdown system:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  startEngine: async (name) => {
    set((state) => ({
      engines: {
        ...state.engines,
        [name]: { ...state.engines[name], status: 'starting' },
      },
    }))
    try {
      await engineApi.startEngine(name)
      set((state) => ({
        engines: {
          ...state.engines,
          [name]: { ...state.engines[name], status: 'running' },
        },
      }))
    } catch (error) {
      set((state) => ({
        engines: {
          ...state.engines,
          [name]: { ...state.engines[name], status: 'error' },
        },
      }))
    }
  },

  stopEngine: async (name) => {
    try {
      await engineApi.stopEngine(name)
      set((state) => ({
        engines: {
          ...state.engines,
          [name]: { ...state.engines[name], status: 'stopped' },
        },
      }))
    } catch (error) {
      console.error(`Failed to stop ${name}:`, error)
    }
  },
}))
