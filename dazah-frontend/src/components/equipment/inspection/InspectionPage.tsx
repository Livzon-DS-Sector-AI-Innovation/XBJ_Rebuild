'use client'

import { useEffect } from 'react'
import { Tabs } from 'antd'
import {
  CheckSquareOutlined, EnvironmentOutlined, HistoryOutlined,
} from '@ant-design/icons'
import { useInspectionStore } from '@/stores/inspection'
import { InspectionTasksTab } from './InspectionTasksTab'
import { InspectionRoutesTab } from './InspectionRoutesTab'
import { InspectionHistoryTab } from './InspectionHistoryTab'
import { InspectionExecuteView } from './InspectionExecuteView'
import { InspectionTaskDrawer } from './InspectionTaskDrawer'
import { InspectionRouteDrawer } from './InspectionRouteDrawer'
import { InspectionRouteEquipmentDrawer } from './InspectionRouteEquipmentDrawer'
import { InspectionDetailDrawer } from './InspectionDetailDrawer'
import type { InspectionTemplate } from '@/types/inspection'

interface Props {
  initialTemplates: InspectionTemplate[]
  initialEquipments: { id: string; name: string; equipment_no: string }[]
  initialCategories: { id: string; name: string }[]
  initialLocations: { id: string; name: string; code: string }[]
}

export function InspectionPage({ initialTemplates, initialEquipments, initialCategories, initialLocations }: Props) {
  const {
    activeTab, setActiveTab,
    executingTaskId, clearExecuting,
    templates, setTemplates,
  } = useInspectionStore()

  useEffect(() => {
    if (initialTemplates.length > 0 && templates.length === 0) {
      setTemplates(initialTemplates)
    }
  }, [initialTemplates, templates.length, setTemplates])

  if (executingTaskId) {
    return <InspectionExecuteView onClose={clearExecuting} />
  }

  const tabItems = [
    {
      key: 'tasks',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <CheckSquareOutlined style={{ fontSize: 15 }} />
          巡检任务
        </span>
      ),
      children: <InspectionTasksTab templates={templates} equipments={initialEquipments} />,
    },
    {
      key: 'routes',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <EnvironmentOutlined style={{ fontSize: 15 }} />
          巡检线路
        </span>
      ),
      children: <InspectionRoutesTab templates={templates} equipments={initialEquipments} />,
    },
    {
      key: 'history',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <HistoryOutlined style={{ fontSize: 15 }} />
          历史记录
        </span>
      ),
      children: <InspectionHistoryTab equipments={initialEquipments} />,
    },
  ]

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 600, color: '#1a1a1a',
          margin: 0, marginBottom: 4, lineHeight: 1.3,
        }}>
          设备巡检
        </h2>
        <p style={{ fontSize: 14, color: '#787671', margin: 0, lineHeight: 1.5 }}>
          巡检线路管理 · 任务执行 · 历史追溯
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e3df',
        padding: '4px 24px 24px',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as 'tasks' | 'routes' | 'history' | 'templates')}
          items={tabItems}
          tabBarStyle={{
            borderBottom: '1px solid #ede9e4',
            marginBottom: 20,
            paddingLeft: 0,
          }}
          tabBarGutter={32}
        />
      </div>

      <InspectionTaskDrawer templates={templates} equipments={initialEquipments} />
      <InspectionRouteDrawer />
      <InspectionRouteEquipmentDrawer equipments={initialEquipments} locations={initialLocations} templates={templates} />
      <InspectionDetailDrawer />
    </div>
  )
}
