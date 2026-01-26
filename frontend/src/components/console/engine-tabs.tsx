import { cn } from '@/lib/utils'
import { useEngineStore } from '@/stores/engine-store'
import { Bot, Search, Eye, MessageSquare } from 'lucide-react'

const engineIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  query: Search,
  media: Eye,
  insight: Bot,
  forum: MessageSquare,
}

interface EngineTabsProps {
  className?: string
}

export function EngineTabs({ className }: EngineTabsProps) {
  const { engines, activeEngine, setActiveEngine } = useEngineStore()

  return (
    <div className={cn('flex border-b border-dark-700', className)}>
      {Object.values(engines).map((engine) => {
        const Icon = engineIcons[engine.name] || Bot
        const isActive = activeEngine === engine.name

        return (
          <button
            key={engine.name}
            onClick={() => setActiveEngine(engine.name)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative',
              'hover:bg-dark-800/50',
              isActive
                ? 'text-accent-400 bg-dark-800/30'
                : 'text-dark-400'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{engine.displayName}</span>

            {/* Status indicator */}
            <span
              className={cn(
                'w-2 h-2 rounded-full ml-1',
                engine.status === 'running' && 'bg-success-500',
                engine.status === 'starting' && 'bg-warning-500 animate-pulse',
                engine.status === 'stopped' && 'bg-dark-600',
                engine.status === 'error' && 'bg-error-500'
              )}
            />

            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500 to-purple-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
