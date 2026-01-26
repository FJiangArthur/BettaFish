import { useEffect, useRef, useState, useCallback } from 'react'
import { Network } from 'vis-network/standalone'
import {
  Search,
  RefreshCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Filter,
} from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { graphApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { GraphData, GraphNode } from '@/types'

const nodeColors: Record<string, { background: string; border: string }> = {
  topic: { background: '#ef4444', border: '#dc2626' },
  engine: { background: '#f59e0b', border: '#d97706' },
  section: { background: '#22c55e', border: '#16a34a' },
  search_query: { background: '#3b82f6', border: '#2563eb' },
  source: { background: '#a855f7', border: '#9333ea' },
}

export function GraphPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  const nodeTypes = ['topic', 'engine', 'section', 'search_query', 'source']

  const fetchGraph = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await graphApi.getLatest()
      if (data.available) {
        setGraphData(data)
      }
    } catch (error) {
      console.error('Failed to fetch graph:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  useEffect(() => {
    if (!containerRef.current || !graphData) return

    const filteredNodes = graphData.nodes.filter(
      (node) =>
        (activeFilters.size === 0 || activeFilters.has(node.type)) &&
        (searchText === '' ||
          node.label.toLowerCase().includes(searchText.toLowerCase()))
    )

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
    const filteredEdges = graphData.edges.filter(
      (edge) => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)
    )

    const nodes = filteredNodes.map((node) => ({
      id: node.id,
      label: node.label,
      color: nodeColors[node.type] || { background: '#64748b', border: '#475569' },
      font: { color: '#f8fafc', size: 12 },
      shape: node.type === 'topic' ? 'diamond' : 'dot',
      size: node.type === 'topic' ? 30 : 20,
    }))

    const edges = filteredEdges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.label || '',
      color: { color: '#475569', highlight: '#6366f1' },
      font: { color: '#94a3b8', size: 10 },
      arrows: 'to',
    }))

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 1,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5,
        },
      },
      physics: {
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -8000,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
    }

    if (networkRef.current) {
      networkRef.current.destroy()
    }

    networkRef.current = new Network(
      containerRef.current,
      { nodes, edges },
      options
    )

    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0]
        const node = graphData.nodes.find((n) => n.id === nodeId)
        setSelectedNode(node || null)
      } else {
        setSelectedNode(null)
      }
    })

    return () => {
      networkRef.current?.destroy()
    }
  }, [graphData, searchText, activeFilters])

  const handleZoom = (direction: 'in' | 'out') => {
    if (!networkRef.current) return
    const scale = networkRef.current.getScale()
    networkRef.current.moveTo({
      scale: direction === 'in' ? scale * 1.3 : scale / 1.3,
    })
  }

  const handleFit = () => {
    networkRef.current?.fit({ animation: true })
  }

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar */}
      <Card variant="glass" className="w-80 flex flex-col">
        <CardContent className="p-4 space-y-6 flex-1">
          {/* Search */}
          <div>
            <h3 className="text-sm font-medium text-dark-300 mb-3">搜索节点</h3>
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="输入关键词..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-sm font-medium text-dark-300 mb-3">节点类型</h3>
            <div className="flex flex-wrap gap-2">
              {nodeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    activeFilters.has(type) || activeFilters.size === 0
                      ? 'bg-dark-700 text-dark-100'
                      : 'bg-dark-800/50 text-dark-500'
                  )}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: nodeColors[type]?.background }}
                  />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="p-4 bg-dark-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-dark-200 mb-2">
                {selectedNode.label}
              </h4>
              <p className="text-xs text-dark-400 mb-2">类型: {selectedNode.type}</p>
              {selectedNode.properties && (
                <pre className="text-xs text-dark-500 overflow-auto max-h-40">
                  {JSON.stringify(selectedNode.properties, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Stats */}
          {graphData && (
            <div className="mt-auto pt-4 border-t border-dark-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent-400">
                    {graphData.nodes.length}
                  </p>
                  <p className="text-xs text-dark-500">节点</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {graphData.edges.length}
                  </p>
                  <p className="text-xs text-dark-500">关系</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graph Canvas */}
      <Card variant="glass" className="flex-1 relative overflow-hidden">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleZoom('in')}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleZoom('out')}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFit}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchGraph}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Graph Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-accent-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-dark-400">加载图谱数据...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !graphData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Filter className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">暂无图谱数据</h3>
              <p className="text-sm text-dark-500">完成一次分析后将自动生成知识图谱</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
