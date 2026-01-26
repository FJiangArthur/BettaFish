// Engine status types
export type EngineStatus = 'stopped' | 'starting' | 'running' | 'error'

export interface EngineState {
  name: string
  displayName: string
  status: EngineStatus
  logs: LogEntry[]
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug' | 'success'
  message: string
  engine?: string
}

// API response types
export interface EngineStatusInfo {
  status: string
  port: number | null
  output_lines: number
}

export interface StatusResponse {
  insight: EngineStatusInfo
  media: EngineStatusInfo
  query: EngineStatusInfo
  forum: EngineStatusInfo
  [key: string]: EngineStatusInfo
}

export interface SystemStatusResponse {
  success: boolean
  started: boolean
  starting: boolean
}

export interface SearchRequest {
  query: string
  engines?: string[]
  options?: {
    depth?: 'quick' | 'standard' | 'deep'
    language?: string
    timeRange?: string
  }
}

export interface ConfigResponse {
  [key: string]: string | number | boolean | null
}

// Forum types
export interface ForumMessage {
  timestamp: string
  speaker: string
  content: string
  round?: number
}

// Knowledge Graph types
export interface GraphNode {
  id: string
  label: string
  type: 'topic' | 'engine' | 'section' | 'search_query' | 'source'
  properties?: Record<string, unknown>
}

export interface GraphEdge {
  from: string
  to: string
  label?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  meta?: {
    report_id: string
    created_at: string
    query: string
  }
}

// Report types
export interface ReportTask {
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  stage?: string
  created_at: string
  completed_at?: string
  error?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon?: string
}
