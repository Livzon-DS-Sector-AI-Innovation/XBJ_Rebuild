"""设备模块飞书客户端.

业务: 设备模块飞书机器人客户端初始化
依赖: app.core.config (FEISHU_APP_ID/SECRET)
"""

import json
import logging

import lark_oapi as lark

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def get_equipment_feishu_client() -> lark.Client:
    """获取设备模块飞书客户端（使用主机器人凭证）."""
    return (
        lark.Client.builder()
        .app_id(settings.FEISHU_APP_ID)
        .app_secret(settings.FEISHU_APP_SECRET)
        .domain(lark.FEISHU_DOMAIN)
        .app_type(lark.AppType.SELF)
        .build()
    )


async def get_feishu_tenant_token(client: lark.Client) -> str:
    """获取飞书 tenant_access_token."""
    from lark_oapi.api.auth.v3 import (
        InternalTenantAccessTokenRequest,
        InternalTenantAccessTokenRequestBody,
    )

    req = (
        InternalTenantAccessTokenRequest.builder()
        .request_body(
            InternalTenantAccessTokenRequestBody.builder()
            .app_id(settings.FEISHU_APP_ID)
            .app_secret(settings.FEISHU_APP_SECRET)
            .build()
        )
        .build()
    )
    resp = await client.auth.v3.tenant_access_token.ainternal(req)
    if not resp.success():
        raise RuntimeError(
            f"获取 tenant_token 失败: code={resp.code}, msg={resp.msg}"
        )
    if resp.raw and resp.raw.content:
        data = json.loads(resp.raw.content.decode("utf-8"))
        token = data.get("tenant_access_token", "")
        if token:
            return token
    raise RuntimeError("tenant_token 响应为空")
