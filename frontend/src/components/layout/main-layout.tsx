import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useEngineStore } from '@/stores/engine-store'
import { socketClient } from '@/lib/socket'

const pageTitles: Record<string, string> = {
  '/': '控制台',
  '/graph': '知识图谱',
  '/reports': '报告中心',
  '/settings': '设置',
}

export function MainLayout() {
  const location = useLocation()
  const { fetchStatus, addLog } = useEngineStore()

  const title = pageTitles[location.pathname] || '控制台'

  useEffect(() => {
    // Initial status fetch
    fetchStatus()

    // Poll status every 10 seconds
    const interval = setInterval(fetchStatus, 10000)

    // Connect to WebSocket
    socketClient.connect()

    // Listen for console messages
    const unsubscribe = socketClient.onMessage(({ engine, message }) => {
      addLog(engine, message)
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
      socketClient.disconnect()
    }
  }, [fetchStatus, addLog])

  return (
    <div className="flex h-screen bg-dark-950 bg-mesh">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
