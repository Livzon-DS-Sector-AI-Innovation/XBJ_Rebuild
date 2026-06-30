'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InspectionTask {
  id: string
  task_no: string
  plan_type: string
  status: string
  equipment_name?: string
  route_name?: string
  planned_time: string
  assignee_name?: string
}

export function TasksList() {
  const [tasks, setTasks] = useState<InspectionTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/v1/equipment/inspection/tasks')
      const result = await response.json()
      if (result.code === 200) {
        setTasks(result.data || [])
      } else {
        setError(result.message || '获取任务列表失败')
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
      {tasks.length === 0 ? (
        <div className="text-gray-500">暂无巡检任务</div>
      ) : (
        tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{task.task_no}</div>
                  <div className="text-sm text-gray-500">
                    {task.equipment_name || task.route_name || '未分配设备'}
                  </div>
                  <div className="text-sm text-gray-400">
                    计划时间: {new Date(task.planned_time).toLocaleString()}
                  </div>
                  {task.assignee_name && (
                    <div className="text-sm text-gray-400">
                      负责人: {task.assignee_name}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
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

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case '待执行':
      return 'secondary'
    case '执行中':
      return 'default'
    case '已完成':
      return 'outline'
    case '已关闭':
      return 'destructive'
    default:
      return 'default'
  }
}
