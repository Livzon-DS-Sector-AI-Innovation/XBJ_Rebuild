'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Spin, Empty } from 'antd'

interface InspectionRoute {
  id: string
  name: string
  description?: string
  period_type: string
  is_active: boolean
}

export function RoutesList() {
  const [routes, setRoutes] = useState<InspectionRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/v1/equipment/inspection/routes')
      const result = await response.json()
      if (result.code === 200) {
        setRoutes(result.data || [])
      } else {
        setError(result.message || '获取路线列表失败')
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
      {routes.length === 0 ? (
        <Empty description="暂无巡检路线" />
      ) : (
        routes.map((route) => (
          <Card key={route.id} size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{route.name}</div>
                {route.description && (
                  <div style={{ fontSize: '14px', color: '#666' }}>{route.description}</div>
                )}
                <div style={{ fontSize: '12px', color: '#999' }}>
                  周期: {route.period_type}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge status={route.is_active ? 'success' : 'default'} text={route.is_active ? '启用' : '停用'} />
                <Button size="small">查看</Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
