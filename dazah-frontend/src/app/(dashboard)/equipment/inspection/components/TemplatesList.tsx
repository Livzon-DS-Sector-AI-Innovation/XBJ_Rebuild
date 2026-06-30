'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Spin, Empty } from 'antd'

interface InspectionTemplate {
  id: string
  name: string
  description?: string
  is_active: boolean
}

export function TemplatesList() {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/v1/equipment/inspection/templates')
      const result = await response.json()
      if (result.code === 200) {
        setTemplates(result.data || [])
      } else {
        setError(result.message || '获取模板列表失败')
      }
    } catch (err) {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spin tip="加载中..." />
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {templates.length === 0 ? (
        <Empty description="暂无巡检模板" />
      ) : (
        templates.map((template) => (
          <Card key={template.id} size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{template.name}</div>
                {template.description && (
                  <div style={{ fontSize: '14px', color: '#666' }}>{template.description}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge status={template.is_active ? 'success' : 'default'} text={template.is_active ? '启用' : '停用'} />
                <Button size="small">查看</Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
