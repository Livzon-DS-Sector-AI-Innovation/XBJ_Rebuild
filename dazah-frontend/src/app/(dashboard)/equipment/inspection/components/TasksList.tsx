'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Spin, Empty } from 'antd'

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

  if (loading) return <Spin tip="加载中..." />
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {tasks.length === 0 ? (
        <Empty description="暂无巡检任务" />
      ) : (
        tasks.map((task) => (
          <Card key={task.id} size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{task.task_no}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {task.equipment_name || task.route_name || '未分配设备'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  计划时间: {new Date(task.planned_time).toLocaleString()}
                </div>
                {task.assignee_name && (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    负责人: {task.assignee_name}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge color={getStatusColor(task.status)} text={task.status} />
                <Button size="small">查看</Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case '待执行':
      return 'blue'
    case '执行中':
      return 'orange'
    case '已完成':
      return 'green'
    case '已关闭':
      return 'red'
    default:
      return 'default'
  }
}
