export interface Employee {
  id: string
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  age?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date: string
  graduation_date?: string
  work_years?: number
  factory_tenure?: string
  company_tenure?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status: string
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface EmployeeCreateInput {
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date: string
  graduation_date?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status?: string
}

export interface EmployeeUpdateInput {
  employee_number?: string
  name?: string
  domain_account?: string
  department?: string
  team?: string
  position?: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date?: string
  graduation_date?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status?: string
}

export interface EmployeeListResponse {
  code: number
  message: string
  data: Employee[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface EmployeeResponse {
  code: number
  message: string
  data: Employee
}

export interface SyncStatusResponse {
  code: number
  message: string
  data: {
    local_total: number
    feishu_total: number
    synced_count: number
    unsynced_count: number
    conflict_count: number
    last_sync_at: string | null
  }
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface DepartmentCreateInput {
  name: string
  code: string
  description?: string
}

export interface DepartmentUpdateInput {
  name?: string
  code?: string
  description?: string
}

export interface DepartmentListResponse {
  code: number
  message: string
  data: Department[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface Team {
  id: string
  name: string
  code?: string
  description?: string
  department_id: string
  department?: Department
  created_at?: string
  updated_at?: string
}

export interface TeamCreateInput {
  name: string
  code?: string
  description?: string
  department_id: string
}

export interface TeamUpdateInput {
  name?: string
  code?: string
  description?: string
  department_id?: string
}

export interface TeamListResponse {
  code: number
  message: string
  data: Team[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OffboardingRecord {
  id: string
  employee_id: string
  employee?: Employee
  offboarding_date: string
  offboarding_type: string
  reason?: string
  handover_status: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface OffboardingRecordCreateInput {
  employee_id: string
  offboarding_date: string
  offboarding_type?: string
  reason?: string
  handover_status?: string
  notes?: string
}

export interface OffboardingRecordUpdateInput {
  employee_id?: string
  offboarding_date?: string
  offboarding_type?: string
  reason?: string
  handover_status?: string
  notes?: string
}

export interface OffboardingRecordListResponse {
  code: number
  message: string
  data: OffboardingRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OnboardingRecord {
  id: string
  seq_number?: number
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  status_category?: string
  is_employed?: string
  hire_date: string
  factory_entry_date?: string
  livo_entry_date?: string
  work_start_date?: string
  graduation_date?: string
  birth_month?: number
  birth_day?: number
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  age?: number
  work_years?: number
  factory_tenure?: string
  company_tenure?: string
  hire_month?: string
  school?: string
  education?: string
  major?: string
  classification?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  marital_status?: string
  household_type?: string
  political_status?: string
  phone?: string
  email?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  bank_account_location?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface OnboardingRecordListResponse {
  code: number
  message: string
  data: OnboardingRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OnboardingRecordResponse {
  code: number
  message: string
  data: OnboardingRecord
}

export interface DepartureRecord {
  id: string
  name: string
  department: string
  team?: string
  position: string
  job_category?: string
  gender?: string
  status_category?: string
  livo_entry_date?: string
  factory_entry_date?: string
  work_start_date?: string
  offboarding_date: string
  company_tenure_at_leave?: string
  education?: string
  school?: string
  major?: string
  classification?: string
  id_card?: string
  native_place?: string
  household_type?: string
  marital_status?: string
  political_status?: string
  phone?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  contract_type?: string
  transfer_history?: string
  offboarding_type: string
  offboarding_reason?: string[]
  offboarding_reason_2?: string[]
  offboarding_remarks?: string[]
  remarks?: string[]
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface DepartureRecordListResponse {
  code: number
  message: string
  data: DepartureRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface DepartureRecordResponse {
  code: number
  message: string
  data: DepartureRecord
}

export interface AiSuggestion {
  suggestion: string
  evidence: string
}

export interface TurnoverRawData {
  period_start: string
  period_end: string
  onboarding_count: number
  onboarding_by_department: Record<string, number>
  onboarding_by_job_category: Record<string, number>
  onboarding_by_education: Record<string, number>
  departure_count: number
  departure_by_reason: Record<string, number>
  departure_by_department: Record<string, number>
  departure_by_job_category: Record<string, number>
  current_headcount: number
}

export interface TurnoverMetrics {
  net_change: number
  initial_headcount: number
  turnover_rate: number
}

export interface TurnoverAnalysisResponse {
  code: number
  message: string
  data: {
    raw_data: TurnoverRawData
    metrics: TurnoverMetrics
    ai_summary: string
    ai_suggestions: AiSuggestion[]
  }
}

export interface TrainingPlan {
  id: string
  title: string
  description?: string
  department?: string
  target_audience?: string
  start_date?: string
  end_date?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingPlanCreateInput {
  title: string
  description?: string
  department?: string
  target_audience?: string
  start_date?: string
  end_date?: string
  status?: string
  created_by?: string
}

export interface TrainingPlanUpdateInput {
  title?: string
  description?: string
  department?: string
  target_audience?: string
  start_date?: string
  end_date?: string
  status?: string
  created_by?: string
}

export interface TrainingPlanListResponse {
  code: number
  message: string
  data: TrainingPlan[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingPlanResponse {
  code: number
  message: string
  data: TrainingPlan
}

export interface TrainingPlanSop {
  id: string
  plan_id: string
  sop_id: string
  sop_name?: string
  order?: number
  created_at?: string
  updated_at?: string
}

export interface TrainingPlanSopCreateInput {
  plan_id: string
  sop_id: string
  sop_name?: string
  order?: number
}

export interface TrainingPlanSopUpdateInput {
  plan_id?: string
  sop_id?: string
  sop_name?: string
  order?: number
}

export interface TrainingPlanSopListResponse {
  code: number
  message: string
  data: TrainingPlanSop[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingPlanSopResponse {
  code: number
  message: string
  data: TrainingPlanSop
}

export interface TrainingRecord {
  id: string
  plan_id: string
  employee_id: string
  employee?: Employee
  status?: string
  started_at?: string
  completed_at?: string
  score?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingRecordCreateInput {
  plan_id: string
  employee_id: string
  status?: string
  started_at?: string
  completed_at?: string
  score?: number
  notes?: string
}

export interface TrainingRecordUpdateInput {
  plan_id?: string
  employee_id?: string
  status?: string
  started_at?: string
  completed_at?: string
  score?: number
  notes?: string
}

export interface TrainingRecordListResponse {
  code: number
  message: string
  data: TrainingRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingRecordResponse {
  code: number
  message: string
  data: TrainingRecord
}

export interface TrainingAssessment {
  id: string
  record_id: string
  assessor_id?: string
  assessment_type?: string
  score?: number
  result?: string
  comments?: string
  assessed_at?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingAssessmentCreateInput {
  record_id: string
  assessor_id?: string
  assessment_type?: string
  score?: number
  result?: string
  comments?: string
  assessed_at?: string
}

export interface TrainingAssessmentUpdateInput {
  record_id?: string
  assessor_id?: string
  assessment_type?: string
  score?: number
  result?: string
  comments?: string
  assessed_at?: string
}

export interface TrainingAssessmentListResponse {
  code: number
  message: string
  data: TrainingAssessment[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingAssessmentResponse {
  code: number
  message: string
  data: TrainingAssessment
}

export interface TrainingApproval {
  id: string
  record_id: string
  approver_id?: string
  approval_type?: string
  status?: string
  comments?: string
  approved_at?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingApprovalCreateInput {
  record_id: string
  approver_id?: string
  approval_type?: string
  status?: string
  comments?: string
  approved_at?: string
}

export interface TrainingApprovalUpdateInput {
  record_id?: string
  approver_id?: string
  approval_type?: string
  status?: string
  comments?: string
  approved_at?: string
}

export interface TrainingApprovalListResponse {
  code: number
  message: string
  data: TrainingApproval[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingApprovalResponse {
  code: number
  message: string
  data: TrainingApproval
}
