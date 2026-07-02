# 设备模块剩余移植计划

> 生成: 2026-07-02
> 依据: [AUDIT-safety-equipment-porting.md](AUDIT-safety-equipment-porting.md)（现状勘察）、[模块移植与合并SOP.md](模块移植与合并SOP.md)（流程规范）
> 用途: 指导设备模块剩余子功能的详细移植，逐 PR 执行

---

## 一、目标与范围

设备模块的基础能力 + 巡检（inspection）已移植完成（详见 AUDIT §2.1）。本计划覆盖**剩余 6 个完整子功能**，按依赖顺序拆成 5 个 PR + 1 个可选项。

**范围内（移植）**：
- personnel 设备人员台账（+ 角色 roles）
- work_order 增强：maintainers 维修班组、claim 抢单、work_order_images 工单图片
- maintenance_plans 维保计划 + maintenance_config 维保配置
- stats 统计看板

**范围外（不移植）**：
- **spare_parts 备件管理** — 源参考里是未完成的半成品，功能（API/前端）不做。
- **feishu WS/回调** — 交互式基础设施，可选，暂缓。

**源路径**：`安全与设备模块-只读-仅参考/dazah-backend`、`/dazah-frontend`
**目标路径**：`XBJ/dazah-backend`、`XBJ/dazah-frontend`
**分支命名**：按 SOP，`feat/equipment-<子功能>-czl`（如 `feat/equipment-personnel-czl`）

---

## 二、前置条件与全局约束

### 2.1 数据库现状（重要）

- DB 已可用（`localhost:5432/dazah`），当前迁移 head = `f8a7b2c3d4e5`。
- equipment schema 实有 31 张表，其中 **11 张是 create_all 建的、迁移链缺失**（"孤儿表"，见 AUDIT §2.4）。
- **含本计划子功能的表（personnel 簇 / maintenance / work_order_images）已在 DB**，故本地联调不被阻断；但迁移链残缺必须由 PR-1 修复。

### 2.2 全局约束（每个 PR 都遵守）

1. **迁移幂等**：孤儿表已存在，任何新迁移建表须 `IF NOT EXISTS` 或 inspector 检测跳过，否则在本地库重复建表报错。
2. **去硬编码密钥**：源 AI/飞书文件若含 `sk-` 等硬编码，改从 `app/core/config.py` 读（参照巡检 `QwenClient` 的做法）。真值只进本地 `.env`，`.env.example` 放占位符。
3. **不污染共享层**：源可能把子功能的 types/store/actions 塞进 equipment 共享文件。personnel 有独立的 `*-personnel.ts` 文件（保持独立）；其余子功能按需增量补进 `equipment.ts`（本模块自己的文件，非跨模块污染）。避免把不兼容的东西硬塞（参照巡检砍掉 4 个模板组件的教训）。
4. **软删除约束防坑**：设计/复制表约束时注意"重复添加→删除→添加"的唯一约束冲突（见 backend CLAUDE.md 末尾）。
5. **SQLAlchemy async 铁律**：禁 `db.refresh()`、禁直接赋值未加载 relationship，写操作后用 `select+selectinload` eager re-fetch。

### 2.3 每个 PR 的验证基线

- 后端：`uv run python -c "from app.main import app; print(len(app.routes))"` import 通过
- 后端：`uv run ruff check app/modules/equipment/`（警告级，E501 可留）
- 后端迁移：`uv run alembic heads`（单 head）
- 后端：`uv run pytest`（不引入回归）
- **真机**：起服务 `uv run uvicorn app.main:app --port 8000`，`curl` 实测本 PR 端点
- 前端：`pnpm exec tsc --noEmit` + `pnpm build`

---

## 三、逐 PR 详细计划

### PR-1 → 补迁移链（幂等迁移）

**目标**：把 11 张孤儿表补进 alembic 迁移链，使干净环境 `alembic upgrade head` 能重建。**不是建表**（表已在），是修复可重现性。

**决策点 ①**：spare_parts 簇 4 张表（`spare_parts`/`spare_part_stocks`/`spare_part_transactions`/`equipment_spare_parts`）是否一并补进？
- 建议**补**：其 model 已在代码、表已在 DB，进链保证干净环境可重建；功能仍不做。

**做法**：
1. 手写一个迁移 `xxx_backfill_equipment_orphan_tables.py`，`down_revision = f8a7b2c3d4e5`。
2. `upgrade()` 里对 11 张孤儿表逐个建表，每个用 `IF NOT EXISTS` 语义（推荐 `op.execute` 原生 SQL，或先 `inspector.has_table` 判断）。
3. 表结构以 ORM model 为准（列结构已确认与 DB 一致，直接照 model 写 DDL；参照巡检迁移 `f8a7b2c3d4e5` 的手写风格）。
4. `downgrade()` 逆序 drop（谨慎，仅供测试库回滚验证）。

**涉及表**（按建表依赖排序，被引用的先建）：
```
equipment_role
equipment_personnel
equipment_personnel_role      (依赖 equipment_personnel, equipment_role)
equipment_personnel_category  (依赖 equipment_personnel)
maintenance_config
maintenance_plans
work_order_images             (依赖 work_orders)
spare_parts                   (决策点①决定是否含)
spare_part_stocks             (依赖 spare_parts)
spare_part_transactions       (依赖 spare_parts)
equipment_spare_parts         (依赖 spare_parts, equipments)
```

**验证**：
- `alembic heads` 单 head；`alembic upgrade head` 在本地库跑通（幂等，不报"已存在"）。
- 在**空测试库**上 `alembic upgrade head` 能从零建出全部表（验证补链有效）。

---

### PR-2 → personnel 设备人员台账

**目标**：移植设备人员台账 + 角色管理。最大、最基础（maintainers/claim 依赖它）。

**后端**（源 → 目标，路径均在 `app/modules/equipment/`）：
| 文件 | 行数 | 操作 |
|------|------|------|
| `api/personnel.py` | 201 | 复制（14 端点：角色 CRUD、人员 CRUD、角色分配、分类约束、飞书刷新） |
| `service/personnel.py` | 465 | 复制 |
| `repository/personnel.py` | 392 | 复制 |
| `schemas/personnel.py` | 164 | 复制 |
| `api/__init__.py` | — | 注册 `router.include_router(personnel_router, prefix="/personnel")` |
| `service/__init__.py`、`repository/__init__.py`、`schemas/__init__.py` | — | 补 re-export |

**前端**（源 → 目标，`dazah-frontend/src/`）：
| 文件 | 行数 | 操作 |
|------|------|------|
| `app/(dashboard)/equipment/personnel/page.tsx` | 9 | 复制（壳页面） |
| `components/equipment/PersonnelPage.tsx` | 202 | 复制 |
| `components/equipment/PersonnelTable.tsx` | 204 | 复制 |
| `components/equipment/PersonnelDrawer.tsx` | 229 | 复制 |
| `components/equipment/PersonnelCategoryDrawer.tsx` | 421 | 复制 |
| `components/equipment/PersonnelInfo.tsx` | 180 | 复制 |
| `components/equipment/PersonnelQueryProvider.tsx` | 24 | 复制 |
| `components/equipment/RoleManagePanel.tsx` | 337 | 复制 |
| `actions/equipment-personnel.ts` | 114 | 复制（独立文件，不并入 equipment.ts） |
| `lib/api/equipment-personnel.ts` | 97 | 复制，适配 API base URL |
| `types/equipment-personnel.ts` | 93 | 复制 |
| `components/equipment/index.ts` | — | 导出 Personnel* 组件 |
| `lib/menu-config.ts` | — | 确认 `/equipment/personnel` 入口（源第 45 行已有，XBJ 需补） |

**适配要点**：
- 飞书刷新端点若含硬编码凭证 → 用 `EQUIPMENT_FEISHU_*` 配置。
- 组件若 import `@/components/equipment/shared-styles` → 已在（巡检时已复制）。

**决策点 ②**：巡检/工单选人现接 HR `fetchEmployees`，personnel 落地后是否切换？建议**并存、先不切**（personnel 是设备专属台账，HR 是全员；两者定位不同）。

**验证**：`curl /api/v1/equipment/personnel`、`/personnel/roles` 等；前端 personnel 页面加载、增删改。

---

### PR-3 → 工单增强（maintainers + claim + work_order_images）

**目标**：给已移植的 work_order 补上抢单、维修班组选择、工单图片。依赖 personnel（PR-2）。

**后端**：
| 文件 | 行数 | 操作 |
|------|------|------|
| `api/maintainers.py` | 67 | 复制（2 个 GET：在岗维修人员、全体用户） |
| `api/claim.py` | 56 | 复制（PUT 抢单，含飞书部门校验+通知） |
| `api/images.py` | 86 | 复制（上传/列表/查看/删除，MinIO+本地双路） |
| `service/work_order_image.py` | 102 | 复制 |
| `service/work_order_feishu.py` | 174 | 复制，去硬编码密钥 |
| `repository/work_order_image.py` | 46 | 复制 |
| `schemas/work_order_image.py` | 18 | 复制 |
| `service/work_order.py` | — | 确认 `claim_work_order` 已导出（源在此） |
| `api/__init__.py` | — | 注册 3 个 prefix：`images_router`/`claim_router` → `/maintenance/work-orders`；`maintainers_router` → `/maintenance/staff` |

**前端**：
| 文件 | 行数 | 操作 |
|------|------|------|
| `components/equipment/WorkOrderDetailDrawer.tsx` | — | 增强：图片上传/预览、抢单按钮 |
| `components/equipment/WorkOrderDrawer.tsx` | — | 增强：维修人员下拉（调 maintainers） |
| `components/equipment/RepairDrawer.tsx` | 168 | 复制（维修填报表单） |
| `lib/api/equipment-client.ts`、`actions/equipment.ts`、`types/equipment.ts`、`stores/equipment.ts` | — | 增量补 maintainers/claim/images 相关切片 |

**适配要点**：storage.py（MinIO 本地回退）已在（巡检时建）；图片上传复用。

**验证**：`curl` 上传工单图片、抢单；前端工单详情抽屉走通。

---

### PR-4 → maintenance_plans 维保计划 + maintenance_config 维保配置

**目标**：预防性维护计划（自动生成工单）+ 抢单超时配置。

**后端**：
| 文件 | 行数 | 操作 |
|------|------|------|
| `api/maintenance_plans.py` | 89 | 复制（CRUD + 逾期查询） |
| `api/config.py` | 29 | 复制（GET/PUT claim-timeout） |
| `service/maintenance_plan.py` | 279 | 复制（含次维护日期计算、`generate_due_work_orders`） |
| `service/maintenance_config.py` | 48 | 复制 |
| `repository/maintenance_plan.py` | 131 | 复制 |
| `repository/maintenance_config.py` | 39 | 复制 |
| `schemas/maintenance_plan.py` | 83 | 复制 |
| `schemas/maintenance_config.py` | 21 | 复制 |
| `scheduler.py` | — | 确认维保计划定时任务接入（源已有） |
| `api/__init__.py` | — | 注册 `maintenance_plans_router` → `/maintenance/plans`；`config_router` → `/maintenance/config` |

**前端**：
| 文件 | 行数 | 操作 |
|------|------|------|
| `components/equipment/MaintenancePlanTable.tsx` | 97 | 复制 |
| `components/equipment/MaintenancePlanDrawer.tsx` | 182 | 复制 |
| `components/equipment/MaintenancePage.tsx` | — | 接入维保计划 Tab + 配置面板（源版本已含，对比补齐） |
| `lib/api/equipment-client.ts` 等 | — | 增量补维保计划/配置 API 切片 |

**验证**：`curl` 维保计划 CRUD；触发 `generate_due_work_orders` 看是否生成工单；前端维护页 Tab。

---

### PR-5 → stats 统计看板（聚合，最后）

**目标**：设备仪表盘。无专属后端（聚合已有 statistics 接口）。

**后端**：无需新增（`GET /equipments/statistics`、`/work-orders/statistics` 已在）。

**前端**：
| 文件 | 行数 | 操作 |
|------|------|------|
| `app/(dashboard)/equipment/stats/page.tsx` | 112 | 复制（Server Component，`Promise.allSettled` 拉 6 数据源） |
| `components/equipment/StatsDashboard.tsx` | 1386 | 复制（图表/卡片，数字动画 Hook） |
| `lib/menu-config.ts` | — | 确认 `/equipment/stats` 入口（源第 37 行，设备模块首项） |

**降级要点（重要）**：源 stats 拉 6 数据源，其中**"库存预警"来自 spare_parts（本计划跳过）**。移植时该面板需优雅降级——数据源用 `Promise.allSettled` 已能容错，但前端要判断空数据时**隐藏或置空**该面板，不报错、不显示崩溃占位。

**验证**：加载 stats 页面，5 个正常面板有数据，库存预警面板优雅空态。

---

### （可选，暂缓）feishu WS/回调

- `feishu/handler.py`(183) + `feishu/ws_client.py`(512)：飞书 webhook 回调 + WebSocket 长连接。
- 参照巡检 `inspection_feishu` 的降级：文件可复制但**不挂 lifespan**，用环境开关（`EQUIPMENT_FEISHU_WS_ENABLED=false`）控制，不影响正常 API。
- 需要交互式巡检/工单时再启用。

---

## 四、依赖链与执行顺序

```
PR-1 补迁移链
   └─> PR-2 personnel（最基础）
          └─> PR-3 工单增强（claim/maintainers 依赖 personnel）
          └─> PR-4 维保计划+配置（独立于 PR-3，可并行）
                 └─> PR-5 stats（聚合全部，最后）
(可选) feishu WS —— 任意时点，独立
```

PR-3 与 PR-4 无相互依赖，可并行或任意先后；但都需 PR-2 先落地（选人/派工）。PR-5 聚合，最后做。

---

## 五、待拍板决策点汇总

| # | 决策 | 建议 | 影响 |
|---|------|------|------|
| ① | PR-1 是否把 spare_parts 簇 4 表补进迁移链 | **补**（表已在，进链保证可重建；功能仍不做） | 迁移链完整性 |
| ② | PR-2 后选人接口是否 HR→personnel 切换 | **并存、先不切** | 巡检/工单选人来源 |

决策定了即可从 PR-1 开工。每个 PR 独立分支、独立验证、独立 PR 合并（SOP 小步快合）。
