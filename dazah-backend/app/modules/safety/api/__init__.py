"""Safety API — aggregated router.

业务: 安全模块API路由聚合入口
依赖: 各子模块路由 (accidents, hazards, checks, trainings, etc.)
"""

from fastapi import APIRouter

# 基础枚举路由 - 始终可用
from app.modules.safety.api.enums import enums_router

router = APIRouter()

# 注册枚举路由
router.include_router(enums_router)

# TODO: 逐步添加其他路由
# from app.modules.safety.api.accidents import accidents_router
# from app.modules.safety.api.hazards import hazards_router
# from app.modules.safety.api.checks import checks_router
# router.include_router(accidents_router)
# router.include_router(hazards_router)
# router.include_router(checks_router)
