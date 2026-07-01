import { Page, expect } from '@playwright/test'

/**
 * Safety模块测试辅助函数和数据构造器
 * 用于L1/L2层测试的数据准备
 *
 * 重要：后端所有枚举字段一律只接受英文 value（snake_case），不接受中文 label。
 * 字段名、必填项均已对齐后端 Pydantic schema（见 dazah-backend/app/modules/safety/schemas/）。
 */

const API_BASE = 'http://localhost:8000/api/v1/safety'

// 枚举 value 映射（英文 value，与后端 enums.py 一致）
export const SAFETY_ENUMS = {
  // 检查类型（label→value）
  checkType: {
    日常检查: 'daily',
    专项检查: 'special',
    综合检查: 'comprehensive',
    季节性安全检查: 'seasonal',
  },
  // 隐患等级
  hazardLevel: { 一般隐患: 'general', 较大隐患: 'serious', 重大隐患: 'major' },
  // 隐患类别
  hazardCategory: { 设备设施: 'equipment', 工艺管理: 'process_mgmt', 特殊作业: 'special_operation' },
  // 隐患类型（人/物/环/管）
  hazardType: {
    人的不安全行为: 'unsafe_action',
    物的不安全状态: 'unsafe_condition',
    环境的不安全因素: 'environmental',
    管理的缺陷: 'management_defect',
  },
  // 事故类型
  accidentType: { 工伤事故: 'injury', 火灾: 'fire', 爆炸: 'explosion', 设备事故: 'equipment', 其他: 'other' },
  // 事故等级
  accidentLevel: { 一般事故: 'general', 较大事故: 'serious', 重大事故: 'major', 特别重大事故: 'catastrophic' },
  // 特殊作业类型
  operationType: {
    动火作业: 'hot_work',
    受限空间作业: 'confined_space',
    盲板抽堵作业: 'blind_plate',
    高处作业: 'height_work',
    吊装作业: 'lifting',
    临时用电作业: 'temporary_electricity',
    动土作业: 'excavation',
    断路作业: 'road_breaking',
  },
  // 特殊作业级别
  operationLevel: { 特级: 'special', 一级: 'grade1', 二级: 'grade2', 不涉及: 'not_applicable' },
  // 人员资质状态
  personnelStatus: { 有效: 'active', 已过期: 'expired', 已撤销: 'revoked' },
  // 卡片颜色
  headerColor: { 蓝色: 'blue', 橙色: 'orange', 绿色: 'green', 红色: 'red', 紫色: 'purple' },
}

// 生成随机字符串
export function randomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

// 生成今日日期字符串 (YYYY-MM-DD)
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

// 生成完整 ISO datetime 串（后端 datetime 字段需要）
export function nowISO(): string {
  return new Date().toISOString()
}

// API: 创建隐患记录
// 后端 HazardReportCreate 全部字段 Optional；枚举用英文 value
export async function createHazard(data: Partial<HazardData> = {}): Promise<string> {
  const payload = {
    hazard_no: data.hazard_no, // 留空自动生成
    inspection_category: data.inspection_category || '日常检查', // 检查类别是自由文本，非枚举
    hazard_type: data.hazard_type || 'unsafe_condition',
    hazard_level: data.hazard_level || 'general',
    hazard_category: data.hazard_category || 'equipment',
    description: data.description || `测试隐患描述-${randomString()}`,
    discovered_by_name: data.discovered_by_name || '测试人员',
    discovered_at: data.discovered_at || nowISO(),
    department: data.department || '测试部门',
    corrective_preventive_measures: data.corrective_preventive_measures || '立即整改',
    deadline: data.deadline || nowISO(),
  }

  try {
    const response = await fetch(`${API_BASE}/hazards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`创建隐患失败: ${response.status} ${await response.text()}`)
      return ''
    }

    const result = await response.json()
    return result.data?.id || result.id || ''
  } catch (e) {
    console.warn('创建隐患请求失败:', e)
    return ''
  }
}

// API: 删除隐患（软删）
export async function deleteHazard(id: string): Promise<void> {
  if (!id) return
  try {
    await fetch(`${API_BASE}/hazards/${id}`, { method: 'DELETE' })
  } catch (e) {
    console.warn('删除隐患失败:', e)
  }
}

// API: 创建安全检查
// 必填：check_no, check_date(datetime)；check_type 默认 daily
export async function createSafetyCheck(data: Partial<CheckData> = {}): Promise<string> {
  const payload = {
    check_no: data.check_no || `CHK-${randomString(6).toUpperCase()}`,
    check_type: data.check_type || 'daily',
    check_date: data.check_date || nowISO(),
    department: data.department || '测试部门',
    inspector_name: data.inspector_name || '测试检查人',
    location: data.location || '测试地点',
    findings: data.findings || '未发现异常',
  }

  try {
    const response = await fetch(`${API_BASE}/checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`创建检查失败: ${response.status} ${await response.text()}`)
      return ''
    }

    const result = await response.json()
    return result.data?.id || result.id || ''
  } catch (e) {
    console.warn('创建检查请求失败:', e)
    return ''
  }
}

// API: 删除安全检查
export async function deleteSafetyCheck(id: string): Promise<void> {
  if (!id) return
  try {
    await fetch(`${API_BASE}/checks/${id}`, { method: 'DELETE' })
  } catch (e) {
    console.warn('删除检查失败:', e)
  }
}

// API: 创建事故记录
// 必填：accident_no, accident_type, happened_at, description, reported_at
export async function createAccident(data: Partial<AccidentData> = {}): Promise<string> {
  const payload = {
    accident_no: data.accident_no || `ACC-${randomString(6).toUpperCase()}`,
    accident_type: data.accident_type || 'injury',
    accident_level: data.accident_level || 'general',
    happened_at: data.happened_at || nowISO(),
    reported_at: data.reported_at || nowISO(),
    location: data.location || '测试地点',
    department: data.department || '测试部门',
    description: data.description || `测试事故描述-${randomString()}`,
    casualties: data.casualties || '无',
    property_damage: data.property_damage ?? 0,
    reported_by_name: data.reported_by_name || '测试报告人',
  }

  try {
    const response = await fetch(`${API_BASE}/accidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`创建事故失败: ${response.status} ${await response.text()}`)
      return ''
    }

    const result = await response.json()
    return result.data?.id || result.id || ''
  } catch (e) {
    console.warn('创建事故请求失败:', e)
    return ''
  }
}

// API: 删除事故记录
export async function deleteAccident(id: string): Promise<void> {
  if (!id) return
  try {
    await fetch(`${API_BASE}/accidents/${id}`, { method: 'DELETE' })
  } catch (e) {
    console.warn('删除事故失败:', e)
  }
}

// API: 创建特殊作业报备
// 必填：report_no, operation_type；字段名对齐 SpecialOperationReportBase
export async function createSpecialOps(data: Partial<SpecialOpsData> = {}): Promise<string> {
  const payload = {
    report_no: data.report_no || `OPS-${randomString(6).toUpperCase()}`,
    operation_type: data.operation_type || 'hot_work',
    operation_level: data.operation_level || 'grade2',
    department: data.department || '测试部门',
    location: data.location || '测试作业地点',
    work_description: data.work_description || `测试作业-${randomString()}`,
    work_leader_name: data.work_leader_name || '测试负责人',
    applicant_name: data.applicant_name || '测试申请人',
    risk_level: data.risk_level || '一般',
    is_critical: data.is_critical ?? false,
  }

  try {
    const response = await fetch(`${API_BASE}/special-operation-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`创建特殊作业失败: ${response.status} ${await response.text()}`)
      return ''
    }

    const result = await response.json()
    return result.data?.id || result.id || ''
  } catch (e) {
    console.warn('创建特殊作业请求失败:', e)
    return ''
  }
}

// API: 删除特殊作业报备
export async function deleteSpecialOps(id: string): Promise<void> {
  if (!id) return
  try {
    await fetch(`${API_BASE}/special-operation-reports/${id}`, { method: 'DELETE' })
  } catch (e) {
    console.warn('删除特殊作业失败:', e)
  }
}

// API: 创建定时任务
// 必填：name, cron_expression, feishu_chat_id
export async function createScheduledTask(data: Partial<TaskData> = {}): Promise<string> {
  const payload = {
    name: data.name || `测试任务-${randomString()}`,
    description: data.description || '自动化测试任务',
    cron_expression: data.cron_expression || '0 9 * * *',
    cron_desc: data.cron_desc || '每天上午9点',
    feishu_chat_id: data.feishu_chat_id || `test_chat_${randomString(6)}`,
    feishu_chat_name: data.feishu_chat_name || '测试通知群',
    header_color: data.header_color || 'blue',
    is_enabled: data.is_enabled ?? true,
  }

  try {
    const response = await fetch(`${API_BASE}/scheduled-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`创建定时任务失败: ${response.status} ${await response.text()}`)
      return ''
    }

    const result = await response.json()
    return result.data?.id || result.id || ''
  } catch (e) {
    console.warn('创建定时任务请求失败:', e)
    return ''
  }
}

// API: 删除定时任务
export async function deleteScheduledTask(id: string): Promise<void> {
  if (!id) return
  try {
    await fetch(`${API_BASE}/scheduled-tasks/${id}`, { method: 'DELETE' })
  } catch (e) {
    console.warn('删除定时任务失败:', e)
  }
}

// 类型定义（字段名对齐后端 schema）
interface HazardData {
  hazard_no: string
  inspection_category: string
  hazard_type: string
  hazard_level: string
  hazard_category: string
  description: string
  discovered_by_name: string
  discovered_at: string
  department: string
  corrective_preventive_measures: string
  deadline: string
}

interface CheckData {
  check_no: string
  check_type: string
  check_date: string
  department: string
  inspector_name: string
  location: string
  findings: string
}

interface AccidentData {
  accident_no: string
  accident_type: string
  accident_level: string
  happened_at: string
  reported_at: string
  location: string
  department: string
  description: string
  casualties: string
  property_damage: number
  reported_by_name: string
}

interface SpecialOpsData {
  report_no: string
  operation_type: string
  operation_level: string
  department: string
  location: string
  work_description: string
  work_leader_name: string
  applicant_name: string
  risk_level: string
  is_critical: boolean
}

interface TaskData {
  name: string
  description: string
  cron_expression: string
  cron_desc: string
  feishu_chat_id: string
  feishu_chat_name: string
  header_color: string
  is_enabled: boolean
}

// 通用页面加载等待函数
export async function waitForPageLoad(page: Page, timeout = 3000): Promise<void> {
  await page.waitForTimeout(timeout)
}

// 通用错误检查
export async function expectNoApplicationError(page: Page): Promise<void> {
  await expect(page.getByText('Application error').first()).not.toBeVisible().catch(() => {
    // 忽略错误，仅做保护性断言
  })
}

// 表格数据行数检查
export async function expectTableRows(page: Page, minRows = 1): Promise<number> {
  const rows = page.locator('table tbody tr')
  const count = await rows.count()
  expect(count).toBeGreaterThanOrEqual(minRows)
  return count
}

/**
 * 选择 AntD 下拉选项（标准动作）
 * AntD Select 选项懒渲染：必须先 click 打开下拉，选项才出现在 .ant-select-dropdown 中。
 * @param selectLocator 已定位到的 .ant-select 元素
 * @param optionText 下拉选项显示文本
 * @returns 是否成功选中
 */
export async function openSelectAndPick(page: Page, selectLocator: any, optionText: string): Promise<boolean> {
  try {
    await selectLocator.click()
    await page.waitForTimeout(400)
    const option = page
      .locator('.ant-select-dropdown')
      .locator('.ant-select-item-option')
      .filter({ hasText: optionText })
      .first()
    if (await option.isVisible().catch(() => false)) {
      await option.click()
      await page.waitForTimeout(300)
      return true
    }
    // 关掉下拉避免遮挡后续操作
    await page.keyboard.press('Escape').catch(() => {})
    return false
  } catch {
    return false
  }
}

// 兼容旧签名：按 placeholder 定位 select 再选项
export async function selectAntdOption(page: Page, placeholder: string, optionText: string): Promise<void> {
  const select = page
    .locator('.ant-select')
    .filter({ has: page.locator(`[placeholder="${placeholder}"]`) })
    .first()
  await openSelectAndPick(page, select, optionText)
}
