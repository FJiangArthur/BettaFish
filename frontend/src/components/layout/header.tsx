import { Bell, Power, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useEngineStore } from '@/stores/engine-store'

interface HeaderProps {
  title?: string
}

export function Header({ title = '控制台' }: HeaderProps) {
  const { systemStatus, isLoading, startSystem, shutdownSystem, fetchStatus } = useEngineStore()

  const handleSystemToggle = () => {
    if (systemStatus === 'started') {
      shutdownSystem()
    } else {
      startSystem()
    }
  }

  return (
    <header className="h-16 bg-dark-900/50 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-dark-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Status */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchStatus()}
          className="text-dark-400 hover:text-dark-100"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-dark-400 hover:text-dark-100 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
        </Button>

        {/* System Toggle */}
        <Button
          variant={systemStatus === 'started' ? 'danger' : 'primary'}
          size="sm"
          onClick={handleSystemToggle}
          isLoading={isLoading || systemStatus === 'starting'}
          disabled={systemStatus === 'starting'}
        >
          <Power className="w-4 h-4" />
          {systemStatus === 'started' ? '关闭系统' : systemStatus === 'starting' ? '启动中...' : '启动系统'}
        </Button>
      </div>
    </header>
  )
}
