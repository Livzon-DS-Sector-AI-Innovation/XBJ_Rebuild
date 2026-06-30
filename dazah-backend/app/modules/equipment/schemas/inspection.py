"""Inspection schemas (simplified).

业务: 设备巡检相关Pydantic模型（简化版）
依赖: 无
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class InspectionRouteCreate(BaseModel):
    """巡检路线创建"""
    name: str
    description: str | None = None
    period_type: str = "每日"
    period_value: int | None = None


class InspectionRouteUpdate(BaseModel):
    """巡检路线更新"""
    name: str | None = None
    description: str | None = None
    period_type: str | None = None
    is_active: bool | None = None


class InspectionRouteResponse(BaseModel):
    """巡检路线响应"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    period_type: str
    period_value: int | None = None
    is_active: bool
    created_at: datetime | None = None


class InspectionTaskCreate(BaseModel):
    """巡检任务创建"""
    task_no: str
    route_id: str | None = None
    equipment_id: str | None = None
    plan_type: str = "设备巡检"
    planned_time: datetime
    assigned_to: str | None = None


class InspectionTaskUpdate(BaseModel):
    """巡检任务更新"""
    status: str | None = None
    overall_result: str | None = None
    closure_remark: str | None = None


class InspectionTaskResponse(BaseModel):
    """巡检任务响应"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_no: str
    route_id: str | None = None
    route_name: str | None = None
    equipment_id: str | None = None
    equipment_name: str | None = None
    plan_type: str
    status: str
    overall_result: str | None = None
    planned_time: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    assignee_name: str | None = None
    created_at: datetime | None = None


class InspectionTemplateCreate(BaseModel):
    """巡检模板创建"""
    name: str
    description: str | None = None
    equipment_category_id: str | None = None


class InspectionTemplateResponse(BaseModel):
    """巡检模板响应"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    equipment_category_id: str | None = None
    is_active: bool
    created_at: datetime | None = None


class InspectionRecordCreate(BaseModel):
    """巡检记录创建"""
    task_id: str
    template_item_id: str
    result: str
    actual_value: str | None = None
    remark: str | None = None


class InspectionRecordResponse(BaseModel):
    """巡检记录响应"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    equipment_id: str | None = None
    template_item_id: str
    result: str
    actual_value: str | None = None
    remark: str | None = None
    created_at: datetime | None = None
