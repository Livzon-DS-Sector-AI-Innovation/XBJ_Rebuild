"""Safety API — enums endpoints.

业务: 提供安全模块所有枚举值选项
依赖: app.modules.safety.schemas (枚举定义)
"""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_current_user
from app.core.response import ApiResponse

enums_router = APIRouter()


# 枚举选项定义 (内联定义，避免依赖未移植的schemas)
CHECK_TYPE_OPTIONS = [
    {"value": "daily", "label": "日常检查"},
    {"value": "special", "label": "专项检查"},
    {"value": "comprehensive", "label": "综合检查"},
    {"value": "holiday", "label": "节假日检查"},
    {"value": "monthly", "label": "月度安全检查"},
    {"value": "seasonal", "label": "季节性安全检查"},
    {"value": "pre_holiday", "label": "节前安全检查"},
    {"value": "leadership_duty", "label": "领导干部值班检查"},
    {"value": "dept_cross", "label": "部门互查"},
    {"value": "weekly", "label": "周检"},
    {"value": "resumption", "label": "复工复产安全检查"},
    {"value": "change_acceptance", "label": "变更验收"},
    {"value": "lightning", "label": "防雷检查"},
    {"value": "safety_valve", "label": "安全阀专项检查"},
    {"value": "post_holiday", "label": "节后复工检查"},
    {"value": "heatstroke_prevention", "label": "防暑降温专项"},
]

HAZARD_TYPE_OPTIONS = [
    {"value": "unsafe_condition", "label": "物的不安全状态"},
    {"value": "unsafe_action", "label": "人的不安全行为"},
    {"value": "management_defect", "label": "管理缺陷"},
    {"value": "environmental", "label": "环境因素"},
]

HAZARD_LEVEL_OPTIONS = [
    {"value": "general", "label": "一般隐患"},
    {"value": "serious", "label": "较大隐患"},
    {"value": "major", "label": "重大隐患"},
]

HAZARD_CATEGORY_OPTIONS = [
    {"value": "equipment", "label": "设备设施"},
    {"value": "hazardous_storage", "label": "危化储存"},
    {"value": "emergency_mgmt", "label": "应急管理"},
    {"value": "instrument_electrical", "label": "仪表+电气"},
    {"value": "lightning_antistatic", "label": "防雷防静电"},
    {"value": "occupational_health", "label": "职业健康+劳保防护"},
    {"value": "violation_operation", "label": "三违作业"},
    {"value": "six_s", "label": "6S"},
    {"value": "label_signage", "label": "标签标识"},
    {"value": "process_mgmt", "label": "工艺管理"},
    {"value": "contractor_defect", "label": "承包商缺陷"},
    {"value": "documentation", "label": "内页资料"},
    {"value": "special_operation", "label": "特殊作业"},
]

ACCIDENT_TYPE_OPTIONS = [
    {"value": "injury", "label": "工伤事故"},
    {"value": "fire", "label": "火灾"},
    {"value": "explosion", "label": "爆炸"},
    {"value": "leakage", "label": "泄漏"},
    {"value": "equipment", "label": "设备事故"},
    {"value": "near_miss", "label": "未遂事件"},
    {"value": "environmental", "label": "环境事件"},
    {"value": "occupational_disease", "label": "职业病"},
    {"value": "traffic", "label": "交通事故"},
    {"value": "other", "label": "其他"},
]

ACCIDENT_LEVEL_OPTIONS = [
    {"value": "general", "label": "一般事故"},
    {"value": "serious", "label": "较大事故"},
    {"value": "major", "label": "重大事故"},
    {"value": "catastrophic", "label": "特别重大事故"},
]

ACCIDENT_STATUS_OPTIONS = [
    {"value": "reported", "label": "已报告"},
    {"value": "investigating", "label": "调查中"},
    {"value": "investigated", "label": "调查完成"},
    {"value": "capa_in_progress", "label": "CAPA进行中"},
    {"value": "closed", "label": "已关闭"},
]

INJURY_SEVERITY_OPTIONS = [
    {"value": "death", "label": "死亡"},
    {"value": "serious_injury", "label": "重伤"},
    {"value": "minor_injury", "label": "轻伤"},
    {"value": "no_injury", "label": "无伤害"},
]

TRAINING_TYPE_OPTIONS = [
    {"value": "induction", "label": "入职培训"},
    {"value": "annual", "label": "年度培训"},
    {"value": "special", "label": "专项培训"},
    {"value": "emergency", "label": "应急培训"},
    {"value": "contractor", "label": "承包商培训"},
    {"value": "refresher", "label": "复训"},
]

TRAINING_MODE_OPTIONS = [
    {"value": "online", "label": "线上"},
    {"value": "offline", "label": "线下"},
    {"value": "blended", "label": "混合"},
]

OPERATION_TYPE_OPTIONS = [
    {"value": "hot_work", "label": "动火作业"},
    {"value": "confined_space", "label": "受限空间作业"},
    {"value": "blind_plate", "label": "盲板抽堵作业"},
    {"value": "height_work", "label": "高处作业"},
    {"value": "lifting", "label": "吊装作业"},
    {"value": "temporary_electricity", "label": "临时用电作业"},
    {"value": "excavation", "label": "动土作业"},
    {"value": "road_breaking", "label": "断路作业"},
]

OPERATION_LEVEL_OPTIONS = [
    {"value": "special", "label": "特级"},
    {"value": "grade1", "label": "一级"},
    {"value": "grade2", "label": "二级"},
    {"value": "not_applicable", "label": "不涉及"},
]

PERMIT_STATUS_OPTIONS = [
    {"value": "draft", "label": "草稿"},
    {"value": "submitted", "label": "已提交"},
    {"value": "approved", "label": "已审批"},
    {"value": "rejected", "label": "已驳回"},
    {"value": "in_progress", "label": "作业中"},
    {"value": "completed", "label": "已完工"},
    {"value": "archived", "label": "已归档"},
]

KNOWLEDGE_CATEGORY_OPTIONS = [
    {"value": "laws_regulations", "label": "法律法规"},
    {"value": "standards", "label": "标准规范"},
    {"value": "management_systems", "label": "管理制度"},
    {"value": "accident_cases", "label": "事故案例"},
    {"value": "emergency_plans", "label": "应急预案"},
    {"value": "sds", "label": "化学品安全技术说明书"},
    {"value": "training_materials", "label": "培训教材"},
    {"value": "other", "label": "其他"},
]

RISK_LEVEL_OPTIONS = [
    {"value": "level_1", "label": "一级/重大风险"},
    {"value": "level_2", "label": "二级/较大风险"},
    {"value": "level_3", "label": "三级/一般风险"},
    {"value": "level_4", "label": "四级/低风险"},
]

CHANGE_TYPE_OPTIONS = [
    {"value": "process_tech", "label": "工艺技术变更"},
    {"value": "equipment_facility", "label": "设备设施变更"},
    {"value": "management", "label": "管理变更"},
]

CHANGE_GRADE_OPTIONS = [
    {"value": "major", "label": "重大变更"},
    {"value": "general", "label": "一般变更"},
]

EHS_CHANGE_STATUS_OPTIONS = [
    {"value": "draft", "label": "草稿"},
    {"value": "under_review", "label": "审核中"},
    {"value": "approved", "label": "已批准"},
    {"value": "rejected", "label": "已驳回"},
    {"value": "in_progress", "label": "实施中"},
    {"value": "commissioned", "label": "已投用"},
    {"value": "closed", "label": "已关闭"},
]

DETECTION_TYPE_OPTIONS = [
    {"value": "regular", "label": "定期检测"},
    {"value": "commissioned", "label": "委托检测"},
    {"value": "evaluation", "label": "评价检测"},
    {"value": "accident", "label": "事故调查检测"},
]

EXAM_TYPE_OPTIONS = [
    {"value": "pre_employment", "label": "上岗前"},
    {"value": "periodic", "label": "在岗期间"},
    {"value": "post_employment", "label": "离岗时"},
    {"value": "emergency", "label": "应急/事故后"},
]

EXAM_STATUS_OPTIONS = [
    {"value": "scheduled", "label": "已安排"},
    {"value": "in_progress", "label": "体检中"},
    {"value": "completed", "label": "已完成"},
    {"value": "archived", "label": "已归档"},
]

CONTRACTOR_STATUS_OPTIONS = [
    {"value": "active", "label": "活跃"},
    {"value": "inactive", "label": "停用"},
    {"value": "blacklisted", "label": "黑名单"},
]


@enums_router.get("/enums", response_model=ApiResponse, summary="获取枚举值列表")
async def get_enums(
    current_user: CurrentUser | None = Depends(get_current_user),
):
    """获取安全模块的所有枚举值选项"""

    return ApiResponse(
        data={
            "check_types": CHECK_TYPE_OPTIONS,
            "hazard_types": HAZARD_TYPE_OPTIONS,
            "hazard_levels": HAZARD_LEVEL_OPTIONS,
            "hazard_categories": HAZARD_CATEGORY_OPTIONS,
            "accident_types": ACCIDENT_TYPE_OPTIONS,
            "accident_levels": ACCIDENT_LEVEL_OPTIONS,
            "accident_statuses": ACCIDENT_STATUS_OPTIONS,
            "injury_severities": INJURY_SEVERITY_OPTIONS,
            "training_types": TRAINING_TYPE_OPTIONS,
            "training_modes": TRAINING_MODE_OPTIONS,
            "operation_types": OPERATION_TYPE_OPTIONS,
            "operation_levels": OPERATION_LEVEL_OPTIONS,
            "permit_statuses": PERMIT_STATUS_OPTIONS,
            "knowledge_categories": KNOWLEDGE_CATEGORY_OPTIONS,
            "risk_levels": RISK_LEVEL_OPTIONS,
            "ehs_change_types": CHANGE_TYPE_OPTIONS,
            "ehs_change_grades": CHANGE_GRADE_OPTIONS,
            "ehs_change_statuses": EHS_CHANGE_STATUS_OPTIONS,
            "detection_types": DETECTION_TYPE_OPTIONS,
            "exam_types": EXAM_TYPE_OPTIONS,
            "exam_statuses": EXAM_STATUS_OPTIONS,
            "contractor_statuses": CONTRACTOR_STATUS_OPTIONS,
        }
    )
