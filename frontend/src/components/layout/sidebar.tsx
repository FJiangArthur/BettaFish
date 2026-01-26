import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Network,
  FileText,
  Settings,
  Activity,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEngineStore } from '@/stores/engine-store'

const navItems = [
  {
    name: '控制台',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: '知识图谱',
    path: '/graph',
    icon: Network,
  },
  {
    name: '报告中心',
    path: '/reports',
    icon: FileText,
  },
  {
    name: '设置',
    path: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const { engines, systemStatus } = useEngineStore()

  const runningCount = Object.values(engines).filter(e => e.status === 'running').length

  return (
    <aside className="w-64 h-screen bg-dark-900 border-r border-dark-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg gradient-text">微舆</h1>
          <p className="text-xs text-dark-500">BettaFish</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn('nav-item', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-dark-800">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">系统状态</span>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              systemStatus === 'started' && 'bg-success-500/20 text-success-400',
              systemStatus === 'starting' && 'bg-warning-500/20 text-warning-400',
              systemStatus === 'not_started' && 'bg-dark-700 text-dark-400'
            )}>
              {systemStatus === 'started' ? '运行中' : systemStatus === 'starting' ? '启动中' : '未启动'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-400" />
            <span className="text-sm">
              <span className="text-accent-400 font-semibold">{runningCount}</span>
              <span className="text-dark-400"> / 4 引擎运行中</span>
            </span>
          </div>

          {/* Engine Status Indicators */}
          <div className="grid grid-cols-2 gap-2">
            {Object.values(engines).map((engine) => (
              <div
                key={engine.name}
                className="flex items-center gap-2 text-xs text-dark-400"
              >
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  engine.status === 'running' && 'bg-success-500',
                  engine.status === 'starting' && 'bg-warning-500 animate-pulse',
                  engine.status === 'stopped' && 'bg-dark-600',
                  engine.status === 'error' && 'bg-error-500'
                )} />
                <span className="truncate">{engine.displayName.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
