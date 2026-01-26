import { cn } from '@/lib/utils'
import type { EngineStatus } from '@/types'

interface StatusBadgeProps {
  status: EngineStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<EngineStatus, { label: string; color: string; dotClass: string }> = {
  running: {
    label: '运行中',
    color: 'text-success-400 bg-success-500/10 border-success-500/30',
    dotClass: 'status-dot running',
  },
  starting: {
    label: '启动中',
    color: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
    dotClass: 'status-dot starting',
  },
  stopped: {
    label: '已停止',
    color: 'text-dark-400 bg-dark-700/50 border-dark-600',
    dotClass: 'status-dot stopped',
  },
  error: {
    label: '错误',
    color: 'text-error-400 bg-error-500/10 border-error-500/30',
    dotClass: 'status-dot error',
  },
}

export function StatusBadge({ status, showLabel = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.color,
        sizes[size]
      )}
    >
      <span className={config.dotClass} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
