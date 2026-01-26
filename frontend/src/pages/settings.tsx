import { useState, useEffect } from 'react'
import {
  Save,
  Eye,
  EyeOff,
  Database,
  Brain,
  Search,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui'
import { configApi } from '@/lib/api'

interface ConfigSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'number'
    placeholder?: string
  }>
}

const configSections: ConfigSection[] = [
  {
    title: '数据库配置',
    icon: Database,
    fields: [
      { key: 'DB_HOST', label: '主机', type: 'text', placeholder: 'localhost' },
      { key: 'DB_PORT', label: '端口', type: 'number', placeholder: '5432' },
      { key: 'DB_USER', label: '用户名', type: 'text' },
      { key: 'DB_PASSWORD', label: '密码', type: 'password' },
      { key: 'DB_NAME', label: '数据库名', type: 'text' },
    ],
  },
  {
    title: 'Query Engine LLM',
    icon: Brain,
    fields: [
      { key: 'QUERY_ENGINE_API_KEY', label: 'API Key', type: 'password' },
      { key: 'QUERY_ENGINE_BASE_URL', label: 'Base URL', type: 'text' },
      { key: 'QUERY_ENGINE_MODEL_NAME', label: '模型名称', type: 'text' },
    ],
  },
  {
    title: 'Media Engine LLM',
    icon: Brain,
    fields: [
      { key: 'MEDIA_ENGINE_API_KEY', label: 'API Key', type: 'password' },
      { key: 'MEDIA_ENGINE_BASE_URL', label: 'Base URL', type: 'text' },
      { key: 'MEDIA_ENGINE_MODEL_NAME', label: '模型名称', type: 'text' },
    ],
  },
  {
    title: 'Insight Engine LLM',
    icon: Brain,
    fields: [
      { key: 'INSIGHT_ENGINE_API_KEY', label: 'API Key', type: 'password' },
      { key: 'INSIGHT_ENGINE_BASE_URL', label: 'Base URL', type: 'text' },
      { key: 'INSIGHT_ENGINE_MODEL_NAME', label: '模型名称', type: 'text' },
    ],
  },
  {
    title: '搜索配置',
    icon: Search,
    fields: [
      { key: 'TAVILY_API_KEY', label: 'Tavily API Key', type: 'password' },
      { key: 'SEARCH_TOOL_TYPE', label: '搜索工具类型', type: 'text' },
    ],
  },
]

export function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const data = await configApi.get()
      setConfig(
        Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
        )
      )
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await configApi.update(config)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const togglePassword = (key: string) => {
    setShowPasswords((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const updateField = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-accent-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-100">系统设置</h2>
          <p className="text-sm text-dark-400 mt-1">配置数据库连接和 LLM API</p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          className="relative"
        >
          {savedMessage ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              已保存
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </>
          )}
        </Button>
      </div>

      {/* Config Sections */}
      <div className="space-y-6">
        {configSections.map((section) => (
          <Card key={section.title} variant="glass">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <section.icon className="w-4 h-4 text-accent-400" />
              </div>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">
                    {field.label}
                  </label>
                  <div className="relative">
                    <Input
                      type={
                        field.type === 'password' && !showPasswords.has(field.key)
                          ? 'password'
                          : 'text'
                      }
                      value={config[field.key] || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={field.type === 'password' ? 'pr-10' : ''}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePassword(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                      >
                        {showPasswords.has(field.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
