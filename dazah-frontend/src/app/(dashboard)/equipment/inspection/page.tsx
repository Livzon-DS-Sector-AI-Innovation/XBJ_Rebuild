import { Metadata } from 'next'
import Link from 'next/link'
import { Button, Tabs, Card } from 'antd'
import { TasksList } from './components/TasksList'
import { RoutesList } from './components/RoutesList'
import { TemplatesList } from './components/TemplatesList'

export const metadata: Metadata = {
  title: '设备巡检 - 设备管理',
}

export default function InspectionPage() {
  const items = [
    {
      key: 'tasks',
      label: '巡检任务',
      children: (
        <Card
          title="巡检任务列表"
          extra={<Button type="primary">新建任务</Button>}
        >
          <TasksList />
        </Card>
      ),
    },
    {
      key: 'routes',
      label: '巡检路线',
      children: (
        <Card
          title="巡检路线列表"
          extra={<Button type="primary">新建路线</Button>}
        >
          <RoutesList />
        </Card>
      ),
    },
    {
      key: 'templates',
      label: '巡检模板',
      children: (
        <Card
          title="巡检模板列表"
          extra={<Button type="primary">新建模板</Button>}
        >
          <TemplatesList />
        </Card>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>设备巡检</h1>
        <Link href="/equipment">
          <Button>返回设备</Button>
        </Link>
      </div>

      <Tabs defaultActiveKey="tasks" items={items} />
    </div>
  )
}
