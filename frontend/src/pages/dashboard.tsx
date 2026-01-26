import { useState } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  StopCircle,
  Play,
  Pause,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, CardContent, StatusBadge } from '@/components/ui'
import { EngineTabs, ConsolePanel } from '@/components/console'
import { useEngineStore } from '@/stores/engine-store'
import { useSearchStore } from '@/stores/search-store'
import { useForumStore } from '@/stores/forum-store'
import { cn } from '@/lib/utils'

function SearchSection() {
  const { query, setQuery, isSearching, startSearch, cancelSearch, taskStatus } = useSearchStore()
  const { systemStatus } = useEngineStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isSearching) {
      startSearch()
    }
  }

  const isSystemReady = systemStatus === 'started'

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Search Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-100">智能分析</h2>
              <p className="text-sm text-dark-400">输入您的分析需求，开始全自动舆情研究</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：分析最近一周关于人工智能的社会舆论走向..."
                className="input-modern min-h-[100px] pr-14 resize-none"
                disabled={isSearching || !isSystemReady}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!query.trim() || isSearching || !isSystemReady}
                className="absolute right-3 bottom-3"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Progress */}
            <AnimatePresence>
              {isSearching && taskStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">{taskStatus.stage || '分析中...'}</span>
                    <span className="text-accent-400">{Math.round(taskStatus.progress)}%</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${taskStatus.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelSearch}
                    className="text-error-400 hover:text-error-300"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSystemReady && (
              <p className="text-xs text-warning-400">
                请先启动系统后再开始分析
              </p>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

function EngineStatusCards() {
  const { engines, startEngine, stopEngine } = useEngineStore()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.values(engines).map((engine) => (
        <Card key={engine.name} variant="glass" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-dark-200">{engine.displayName}</h3>
            <StatusBadge status={engine.status} showLabel={false} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-500">
              {engine.logs.length} 条日志
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                engine.status === 'running'
                  ? stopEngine(engine.name)
                  : startEngine(engine.name)
              }
              disabled={engine.status === 'starting'}
              className="text-xs"
            >
              {engine.status === 'running' ? (
                <Pause className="w-3 h-3 mr-1" />
              ) : (
                <Play className="w-3 h-3 mr-1" />
              )}
              {engine.status === 'running' ? '停止' : '启动'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ForumPanel() {
  const { messages, currentRound } = useForumStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const speakerColors: Record<string, string> = {
    主持人: 'text-accent-400',
    QueryAgent: 'text-blue-400',
    MediaAgent: 'text-purple-400',
    InsightAgent: 'text-green-400',
  }

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 border-b border-dark-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-dark-200">Agent 论坛</span>
          {currentRound > 0 && (
            <span className="text-xs px-2 py-0.5 bg-accent-500/20 text-accent-400 rounded-full">
              Round {currentRound}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-dark-400 transition-transform',
            !isExpanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-[300px] overflow-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-4">
                  等待 Agent 开始讨论...
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className={speakerColors[msg.speaker] || 'text-dark-300'}>
                      {msg.speaker}:
                    </span>
                    <span className="text-dark-300 ml-2">{msg.content}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export function DashboardPage() {
  const { activeEngine } = useEngineStore()

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <SearchSection />

      {/* Engine Status */}
      <EngineStatusCards />

      {/* Console and Forum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Console Panel - 2/3 width */}
        <Card variant="glass" className="lg:col-span-2 h-[500px] flex flex-col overflow-hidden">
          <EngineTabs />
          <ConsolePanel engine={activeEngine} className="flex-1" />
        </Card>

        {/* Forum Panel - 1/3 width */}
        <div className="lg:col-span-1">
          <ForumPanel />
        </div>
      </div>
    </div>
  )
}
