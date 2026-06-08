import {
  EmployeeListResponse,
  EmployeeResponse,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  DepartmentListResponse,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  TeamListResponse,
  TeamCreateInput,
  TeamUpdateInput,
  OffboardingRecordListResponse,
  OffboardingRecordCreateInput,
  OffboardingRecordUpdateInput,
  OnboardingRecordListResponse,
  OnboardingRecordResponse,
  DepartureRecordListResponse,
  DepartureRecordResponse,
  SyncStatusResponse,
  TurnoverAnalysisResponse,
} from '@/types/hr'

const API_BASE = 'http://127.0.0.1:8000'

export async function fetchEmployees(
  params?: {
    department?: string
    status?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<EmployeeListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/employees?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取员工列表失败')
  return res.json()
}

export async function fetchEmployeeById(id: string): Promise<EmployeeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取员工详情失败')
  return res.json()
}

export async function fetchDepartments(
  params?: {
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<DepartmentListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 100))

  const res = await fetch(`${API_BASE}/api/v1/hr/departments?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取部门列表失败')
  return res.json()
}

export async function fetchTeams(
  params?: {
    department_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TeamListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department_id) searchParams.set('department_id', params.department_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 100))

  const res = await fetch(`${API_BASE}/api/v1/hr/teams?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取班组列表失败')
  return res.json()
}

export async function fetchOffboardingRecords(
  params?: {
    employee_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<OffboardingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职记录失败')
  return res.json()
}

// ─── Feishu Sync APIs ───

export async function fetchSyncStatus(): Promise<SyncStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-status`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取同步状态失败')
  return res.json()
}

export async function syncFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步失败')
  return res.json()
}

export async function syncToFeishu(id: string): Promise<{ code: number; message: string; data: { feishu_record_id: string } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('同步到飞书失败')
  return res.json()
}

// ─── Onboarding APIs ───

export async function fetchOnboardingRecords(
  params?: {
    department?: string
    position?: string
    is_employed?: string
    keyword?: string
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: string
  }
): Promise<OnboardingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.position) searchParams.set('position', params.position)
  if (params?.is_employed) searchParams.set('is_employed', params.is_employed)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))
  searchParams.set('sort_by', params?.sort_by || 'hire_date')
  searchParams.set('sort_order', params?.sort_order || 'desc')

  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取入职台账列表失败')
  return res.json()
}

export async function fetchOnboardingRecordById(id: string): Promise<OnboardingRecordResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取入职记录详情失败')
  return res.json()
}

export async function syncOnboardingFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步入职台账失败')
  return res.json()
}

export async function fetchOnboardingSyncStatus(): Promise<SyncStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records/sync-status`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取入职台账同步状态失败')
  return res.json()
}

// ─── Departure APIs ───

export async function fetchDepartureRecords(
  params?: {
    department?: string
    offboarding_type?: string
    keyword?: string
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: string
  }
): Promise<DepartureRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.offboarding_type) searchParams.set('offboarding_type', params.offboarding_type)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))
  searchParams.set('sort_by', params?.sort_by || 'offboarding_date')
  searchParams.set('sort_order', params?.sort_order || 'desc')

  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职台账列表失败')
  return res.json()
}

export async function fetchDepartureRecordById(id: string): Promise<DepartureRecordResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职记录详情失败')
  return res.json()
}

export async function syncDepartureFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步离职台账失败')
  return res.json()
}

export async function fetchDepartureSyncStatus(): Promise<SyncStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records/sync-status`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职台账同步状态失败')
  return res.json()
}

export async function fetchTurnoverAnalysis(): Promise<TurnoverAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/turnover-analysis`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取人员流动分析失败')
  return res.json()
}
