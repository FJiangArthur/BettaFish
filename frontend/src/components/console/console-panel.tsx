import { useRef, useEffect } from 'react'
import { Terminal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn, formatTimestamp } from '@/lib/utils'
import { useEngineStore } from '@/stores/engine-store'
import type { LogEntry } from '@/types'

interface ConsolePanelProps {
  engine: string
  className?: string
}

const levelStyles: Record<string, string> = {
  info: 'text-blue-400',
  success: 'text-success-400',
  warning: 'text-warning-400',
  error: 'text-error-400',
  debug: 'text-dark-500',
}

function LogLine({ log }: { log: LogEntry }) {
  return (
    <div className="console-text py-0.5 hover:bg-dark-800/30 px-2 -mx-2 rounded">
      <span className="timestamp mr-3">
        [{formatTimestamp(log.timestamp)}]
      </span>
      <span className={levelStyles[log.level] || 'text-dark-300'}>
        {log.message}
      </span>
    </div>
  )
}

export function ConsolePanel({ engine, className }: ConsolePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { engines, clearLogs } = useEngineStore()
  const logs = engines[engine]?.logs || []

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs.length])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-dark-200">
            {engines[engine]?.displayName || engine} Console
          </span>
          <span className="text-xs text-dark-500">
            ({logs.length} lines)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearLogs(engine)}
          className="text-dark-500 hover:text-dark-300"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Console Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-dark-950 p-4 font-mono text-sm"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-600">
            <div className="text-center">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>等待日志输出...</p>
            </div>
          </div>
        ) : (
          logs.map((log) => <LogLine key={log.id} log={log} />)
        )}
      </div>
    </div>
  )
}
