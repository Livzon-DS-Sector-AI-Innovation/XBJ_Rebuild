import { Metadata } from 'next'
import { InspectionPage } from '@/components/equipment/inspection/InspectionPage'

export const metadata: Metadata = {
  title: '设备巡检 - 设备管理',
}

async function fetchData() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const [templatesRes, equipmentsRes, categoriesRes, locationsRes] = await Promise.all([
    fetch(`${API_BASE}/api/v1/equipment/inspection/templates?page=1&page_size=200`, { cache: 'no-store' }),
    fetch(`${API_BASE}/api/v1/equipment/equipments?page=1&page_size=2000`, { cache: 'no-store' }),
    fetch(`${API_BASE}/api/v1/equipment/categories?page=1&page_size=200`, { cache: 'no-store' }),
    fetch(`${API_BASE}/api/v1/equipment/locations?page=1&page_size=200`, { cache: 'no-store' }),
  ])

  const templates = templatesRes.ok ? (await templatesRes.json()).data || [] : []
  const equipments = equipmentsRes.ok ? ((await equipmentsRes.json()).data?.items || []) : []
  const categories = categoriesRes.ok ? ((await categoriesRes.json()).data?.items || []) : []
  const locations = locationsRes.ok ? ((await locationsRes.json()).data?.items || []) : []

  return {
    initialTemplates: templates,
    initialEquipments: equipments.map((e: { id: string; name: string; equipment_no: string }) => ({
      id: e.id, name: e.name, equipment_no: e.equipment_no,
    })),
    initialCategories: categories,
    initialLocations: locations.map((l: { id: string; name: string; code: string }) => ({
      id: l.id, name: l.name, code: l.code,
    })),
  }
}

export default async function Page() {
  const data = await fetchData()
  return <InspectionPage {...data} />
}
