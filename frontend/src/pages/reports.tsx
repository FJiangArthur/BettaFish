import { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  Search,
  Filter,
} from 'lucide-react'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { reportApi } from '@/lib/api'
import { formatDate, formatTimestamp, cn } from '@/lib/utils'

interface ReportItem {
  task_id: string
  title: string
  query: string
  status: 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

export function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  useEffect(() => {
    // Mock data for now - in production, fetch from API
    setReports([
      {
        task_id: 'demo-1',
        title: '人工智能行业舆情分析报告',
        query: '分析最近一周关于人工智能的社会舆论走向',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
      {
        task_id: 'demo-2',
        title: '新能源汽车市场分析',
        query: '分析新能源汽车市场的消费者反馈',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ])
    setIsLoading(false)
  }, [])

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchText.toLowerCase()) ||
      r.query.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleViewReport = (taskId: string) => {
    window.open(reportApi.downloadUrl(taskId), '_blank')
  }

  const handleDownloadPdf = (taskId: string) => {
    window.open(reportApi.exportPdfUrl(taskId), '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-100">报告中心</h2>
          <p className="text-sm text-dark-400 mt-1">
            查看和下载已生成的分析报告
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索报告..."
            icon={<Search className="w-4 h-4" />}
            className="w-64"
          />
          <Button variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card
            key={report.task_id}
            variant="glass"
            className={cn(
              'cursor-pointer transition-all',
              selectedReport === report.task_id && 'ring-2 ring-accent-500'
            )}
            onClick={() => setSelectedReport(report.task_id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-purple-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent-400" />
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    report.status === 'completed'
                      ? 'bg-success-500/20 text-success-400'
                      : 'bg-error-500/20 text-error-400'
                  )}
                >
                  {report.status === 'completed' ? '已完成' : '失败'}
                </span>
              </div>

              <h3 className="text-base font-medium text-dark-100 mb-2 line-clamp-1">
                {report.title}
              </h3>
              <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                {report.query}
              </p>

              <div className="flex items-center gap-4 text-xs text-dark-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(report.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimestamp(report.created_at)}
                </span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-dark-700">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewReport(report.task_id)
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  查看
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadPdf(report.task_id)
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">暂无报告</h3>
          <p className="text-sm text-dark-500">
            {searchText ? '没有找到匹配的报告' : '完成一次分析后将在此显示报告'}
          </p>
        </div>
      )}
    </div>
  )
}
