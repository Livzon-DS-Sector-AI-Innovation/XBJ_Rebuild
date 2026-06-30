"""Inspection API routes (simplified).

业务: 设备巡检API路由（简化版）
依赖: app.modules.equipment.models.inspection
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import CurrentUser, get_current_user
from app.core.response import ApiResponse, paginated_response
from app.modules.equipment.models.inspection import (
    InspectionRoute,
    InspectionTask,
)
from app.modules.equipment.models.inspection_template import (
    InspectionRecord,
    InspectionTemplate,
)
from app.modules.equipment.schemas.inspection import (
    InspectionRecordCreate,
    InspectionRecordResponse,
    InspectionRouteCreate,
    InspectionRouteResponse,
    InspectionRouteUpdate,
    InspectionTaskCreate,
    InspectionTaskResponse,
    InspectionTaskUpdate,
    InspectionTemplateCreate,
    InspectionTemplateResponse,
)

router = APIRouter()


# ===== 巡检路线 =====

@router.get("/routes", summary="获取巡检路线列表")
async def list_inspection_routes(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> ApiResponse:
    """获取巡检路线列表"""
    result = await db.execute(
        select(InspectionRoute)
        .where(InspectionRoute.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )
    routes = result.scalars().all()
    return paginated_response(
        data=[InspectionRouteResponse.model_validate(r) for r in routes],
        page=skip // limit + 1 if limit else 1,
        page_size=limit,
        total=len(routes),
    )


@router.post("/routes", summary="创建巡检路线")
async def create_inspection_route(
    data: InspectionRouteCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """创建巡检路线"""
    route = InspectionRoute(**data.model_dump())
    db.add(route)
    await db.commit()
    await db.refresh(route)
    return ApiResponse(
        data=InspectionRouteResponse.model_validate(route),
        message="创建成功",
    )


@router.get("/routes/{route_id}", summary="获取巡检路线详情")
async def get_inspection_route(
    route_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """获取巡检路线详情"""
    result = await db.execute(
        select(InspectionRoute).where(
            InspectionRoute.id == route_id,
            InspectionRoute.is_deleted == False,
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        return ApiResponse(code=404, message="巡检路线不存在")
    return ApiResponse(data=InspectionRouteResponse.model_validate(route))


@router.put("/routes/{route_id}", summary="更新巡检路线")
async def update_inspection_route(
    route_id: uuid.UUID,
    data: InspectionRouteUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """更新巡检路线"""
    result = await db.execute(
        select(InspectionRoute).where(
            InspectionRoute.id == route_id,
            InspectionRoute.is_deleted == False,
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        return ApiResponse(code=404, message="巡检路线不存在")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(route, field, value)

    await db.commit()
    await db.refresh(route)
    return ApiResponse(
        data=InspectionRouteResponse.model_validate(route),
        message="更新成功",
    )


@router.delete("/routes/{route_id}", summary="删除巡检路线")
async def delete_inspection_route(
    route_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """删除巡检路线（软删除）"""
    result = await db.execute(
        select(InspectionRoute).where(
            InspectionRoute.id == route_id,
            InspectionRoute.is_deleted == False,
        )
    )
    route = result.scalar_one_or_none()
    if not route:
        return ApiResponse(code=404, message="巡检路线不存在")

    route.is_deleted = True
    await db.commit()
    return ApiResponse(message="删除成功")


# ===== 巡检任务 =====

@router.get("/tasks", summary="获取巡检任务列表")
async def list_inspection_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    status: str | None = Query(None, description="任务状态筛选"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> ApiResponse:
    """获取巡检任务列表"""
    query = select(InspectionTask).where(InspectionTask.is_deleted == False)
    if status:
        query = query.where(InspectionTask.status == status)

    result = await db.execute(query.offset(skip).limit(limit))
    tasks = result.scalars().all()
    return paginated_response(
        items=[InspectionTaskResponse.model_validate(t) for t in tasks],
        total=len(tasks),
        skip=skip,
        limit=limit,
    )


@router.post("/tasks", summary="创建巡检任务")
async def create_inspection_task(
    data: InspectionTaskCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """创建巡检任务，并发送飞书通知"""
    task = InspectionTask(**data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # 发送飞书通知（异步，不阻塞返回）
    if task.assigned_to:
        try:
            # 获取被分配人的飞书信息
            from app.modules.equipment.models.personnel import EquipmentPersonnel

            result = await db.execute(
                select(EquipmentPersonnel).where(
                    EquipmentPersonnel.user_id == task.assigned_to,
                    EquipmentPersonnel.is_active == True,
                    EquipmentPersonnel.is_deleted == False,
                )
            )
            personnel = result.scalar_one_or_none()

            if personnel and personnel.feishu_user_id:
                # 获取设备/路线名称
                equipment_name = "未知设备"
                route_name = None

                if task.equipment_id:
                    from app.modules.equipment.models.equipment import Equipment
                    eq_result = await db.execute(
                        select(Equipment).where(Equipment.id == task.equipment_id)
                    )
                    eq = eq_result.scalar_one_or_none()
                    if eq:
                        equipment_name = eq.name
                elif task.route_id:
                    route_result = await db.execute(
                        select(InspectionRoute).where(InspectionRoute.id == task.route_id)
                    )
                    route = route_result.scalar_one_or_none()
                    if route:
                        route_name = route.name
                        equipment_name = f"路线: {route.name}"

                # 发送飞书卡片通知
                from app.modules.equipment.feishu.notification import (
                    send_inspection_task_card,
                )

                import asyncio

                asyncio.create_task(
                    send_inspection_task_card(
                        feishu_user_id=personnel.feishu_user_id,
                        task_no=task.task_no,
                        task_type=task.plan_type,
                        equipment_name=equipment_name,
                        planned_time=task.planned_time,
                        route_name=route_name,
                    )
                )
        except Exception as e:
            # 通知失败不影响任务创建
            import logging

            logging.getLogger(__name__).exception("发送巡检任务飞书通知失败")

    return ApiResponse(
        data=InspectionTaskResponse.model_validate(task),
        message="创建成功",
    )


@router.get("/tasks/{task_id}", summary="获取巡检任务详情")
async def get_inspection_task(
    task_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """获取巡检任务详情"""
    result = await db.execute(
        select(InspectionTask).where(
            InspectionTask.id == task_id,
            InspectionTask.is_deleted == False,
        )
    )
    task = result.scalar_one_or_none()
    if not task:
        return ApiResponse(code=404, message="巡检任务不存在")
    return ApiResponse(data=InspectionTaskResponse.model_validate(task))


@router.put("/tasks/{task_id}", summary="更新巡检任务")
async def update_inspection_task(
    task_id: uuid.UUID,
    data: InspectionTaskUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """更新巡检任务"""
    result = await db.execute(
        select(InspectionTask).where(
            InspectionTask.id == task_id,
            InspectionTask.is_deleted == False,
        )
    )
    task = result.scalar_one_or_none()
    if not task:
        return ApiResponse(code=404, message="巡检任务不存在")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return ApiResponse(
        data=InspectionTaskResponse.model_validate(task),
        message="更新成功",
    )


# ===== 巡检模板 =====

@router.get("/templates", summary="获取巡检模板列表")
async def list_inspection_templates(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> ApiResponse:
    """获取巡检模板列表"""
    result = await db.execute(
        select(InspectionTemplate)
        .where(InspectionTemplate.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )
    templates = result.scalars().all()
    return paginated_response(
        items=[InspectionTemplateResponse.model_validate(t) for t in templates],
        total=len(templates),
        skip=skip,
        limit=limit,
    )


@router.post("/templates", summary="创建巡检模板")
async def create_inspection_template(
    data: InspectionTemplateCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """创建巡检模板"""
    template = InspectionTemplate(**data.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return ApiResponse(
        data=InspectionTemplateResponse.model_validate(template),
        message="创建成功",
    )


# ===== 巡检记录 =====

@router.get("/records", summary="获取巡检记录列表")
async def list_inspection_records(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
    task_id: uuid.UUID | None = Query(None, description="任务ID筛选"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> ApiResponse:
    """获取巡检记录列表"""
    query = select(InspectionRecord).where(InspectionRecord.is_deleted == False)
    if task_id:
        query = query.where(InspectionRecord.task_id == task_id)

    result = await db.execute(query.offset(skip).limit(limit))
    records = result.scalars().all()
    return paginated_response(
        items=[InspectionRecordResponse.model_validate(r) for r in records],
        total=len(records),
        skip=skip,
        limit=limit,
    )


@router.post("/records", summary="创建巡检记录")
async def create_inspection_record(
    data: InspectionRecordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: CurrentUser,
) -> ApiResponse:
    """创建巡检记录"""
    record = InspectionRecord(**data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return ApiResponse(
        data=InspectionRecordResponse.model_validate(record),
        message="创建成功",
    )
