'use server'

import { revalidatePath } from 'next/cache'
import {
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeListResponse,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  DepartmentListResponse,
  TeamCreateInput,
  TeamUpdateInput,
  TeamListResponse,
  OffboardingRecordCreateInput,
  OffboardingRecordUpdateInput,
  OffboardingRecordListResponse,
  TrainingPlanCreateInput,
  TrainingPlanUpdateInput,
  TrainingPlanListResponse,
  TrainingPlanSopCreateInput,
  TrainingPlanSopUpdateInput,
  TrainingPlanSopListResponse,
  TrainingRecordCreateInput,
  TrainingRecordUpdateInput,
  TrainingRecordListResponse,
  TrainingAssessmentCreateInput,
  TrainingAssessmentUpdateInput,
  TrainingAssessmentListResponse,
  TrainingApprovalCreateInput,
  TrainingApprovalUpdateInput,
  TrainingApprovalListResponse,
} from '@/types/hr'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'

export async function fetchEmployeesAction(
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

export async function createEmployee(data: EmployeeCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function updateEmployee(id: string, data: EmployeeUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function deleteEmployee(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

// ─── Feishu Sync Actions ───

export async function syncFromFeishuAction() {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '从飞书同步失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function syncToFeishuAction(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '同步到飞书失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

// ─── Department Actions ───

export async function fetchDepartmentsAction(
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

export async function createDepartment(data: DepartmentCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function updateDepartment(id: string, data: DepartmentUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function deleteDepartment(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

// ─── Team Actions ───

export async function fetchTeamsAction(
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

export async function createTeam(data: TeamCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function updateTeam(id: string, data: TeamUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

// ─── OffboardingRecord Actions ───

export async function fetchOffboardingRecordsAction(
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

export async function createOffboardingRecord(data: OffboardingRecordCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  revalidatePath('/hr/profile')
  return res.json()
}

export async function updateOffboardingRecord(id: string, data: OffboardingRecordUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  return res.json()
}

export async function deleteOffboardingRecord(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  return res.json()
}

// ─── TrainingPlan Actions ───

export async function fetchTrainingPlansAction(
  params?: {
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingPlanListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划列表失败')
  return res.json()
}

export async function createTrainingPlan(data: TrainingPlanCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训计划失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function updateTrainingPlan(id: string, data: TrainingPlanUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训计划失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function deleteTrainingPlan(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训计划失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

// ─── TrainingPlanSop Actions ───

export async function fetchTrainingPlanSopsAction(
  params?: {
    plan_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingPlanSopListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.plan_id) searchParams.set('plan_id', params.plan_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划SOP列表失败')
  return res.json()
}

export async function createTrainingPlanSop(data: TrainingPlanSopCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训计划SOP失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function updateTrainingPlanSop(id: string, data: TrainingPlanSopUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训计划SOP失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function deleteTrainingPlanSop(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训计划SOP失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

// ─── TrainingRecord Actions ───

export async function fetchTrainingRecordsAction(
  params?: {
    plan_id?: string
    employee_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.plan_id) searchParams.set('plan_id', params.plan_id)
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录列表失败')
  return res.json()
}

export async function createTrainingRecord(data: TrainingRecordCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训记录失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function updateTrainingRecord(id: string, data: TrainingRecordUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训记录失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function deleteTrainingRecord(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-records/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训记录失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

// ─── TrainingAssessment Actions ───

export async function fetchTrainingAssessmentsAction(
  params?: {
    record_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingAssessmentListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.record_id) searchParams.set('record_id', params.record_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训考核列表失败')
  return res.json()
}

export async function createTrainingAssessment(data: TrainingAssessmentCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训考核失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function updateTrainingAssessment(id: string, data: TrainingAssessmentUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训考核失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function deleteTrainingAssessment(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训考核失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

// ─── TrainingApproval Actions ───

export async function fetchTrainingApprovalsAction(
  params?: {
    record_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingApprovalListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.record_id) searchParams.set('record_id', params.record_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训审批列表失败')
  return res.json()
}

export async function createTrainingApproval(data: TrainingApprovalCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训审批失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function updateTrainingApproval(id: string, data: TrainingApprovalUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训审批失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}

export async function deleteTrainingApproval(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训审批失败')
  }
  revalidatePath('/hr/training')
  return res.json()
}
