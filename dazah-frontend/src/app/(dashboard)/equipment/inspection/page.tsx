import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoutesList } from './components/RoutesList'
import { TasksList } from './components/TasksList'
import { TemplatesList } from './components/TemplatesList'

export const metadata: Metadata = {
  title: '设备巡检 - 设备管理',
}

export default function InspectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">设备巡检</h1>
        <div className="flex gap-2">
          <Link href="/equipment">
            <Button variant="outline">返回设备</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">巡检任务</TabsTrigger>
          <TabsTrigger value="routes">巡检路线</TabsTrigger>
          <TabsTrigger value="templates">巡检模板</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>巡检任务列表</CardTitle>
              <Button>新建任务</Button>
            </CardHeader>
            <CardContent>
              <TasksList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>巡检路线列表</CardTitle>
              <Button>新建路线</Button>
            </CardHeader>
            <CardContent>
              <RoutesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>巡检模板列表</CardTitle>
              <Button>新建模板</Button>
            </CardHeader>
            <CardContent>
              <TemplatesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
