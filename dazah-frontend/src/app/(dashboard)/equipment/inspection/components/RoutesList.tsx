'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  if (loading) return <div>加载中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      {routes.length === 0 ? (
        <div className="text-gray-500">暂无巡检路线</div>
      ) : (
        routes.map((route) => (
          <Card key={route.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{route.name}</div>
                  {route.description && (
                    <div className="text-sm text-gray-500">{route.description}</div>
                  )}
                  <div className="text-sm text-gray-400">
                    周期: {route.period_type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={route.is_active ? 'default' : 'secondary'}>
                    {route.is_active ? '启用' : '停用'}
                  </Badge>
                  <Button size="sm" variant="outline">查看</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
