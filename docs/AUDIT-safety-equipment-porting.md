# 安全与设备模块移植 - 勘察报告

> 首次生成: 2026-06-30
> 最近更新: 2026-07-02（第二次修订：并入数据库实况核查）
> 勘察范围: `安全与设备模块-只读-仅参考` vs `XBJ`（前后端逐文件比对 + 本地 DB 核查）

---

## 0. 更新说明

**2026-07-02 第二次修订（数据库核查）**：
- **DB 已可用**：`localhost:5432/dazah` 可连（此前不可用），当前迁移版本 `f8a7b2c3d4e5`（巡检建表迁移，已是 head）。后续每个 PR 可**起服务真机 curl 验证**，不再只靠静态 import。
- **发现"孤儿表"**：equipment schema 实有 31 张表，但 **11 张表是早期 `create_all` 直接建的、迁移链里无 create_table**（见 §2.4）。抽查列结构与 ORM 一致，无列漂移。
- **影响**：这些"未移植子功能"的表其实已在 DB → 本地联调不被阻断；但迁移链残缺是 SOP §3 明令的债——干净环境 `alembic upgrade head` 建不出这些表。故 §3 计划第一步由"建表"改为**"补迁移链（幂等迁移）"**。
- **spare_parts 定性**：经确认，源参考里 **spare_parts（备件管理）是未完成的半成品**，其**功能（API/前端）不移植**；但其表已在 DB，是否补进迁移链见 §3 决策点。

**2026-07-02 第一次修订（移植进度复核）**：初版（2026-06-30）记录的是**开工前**状态，已过时。逐文件比对后修正：
- **安全模块（safety）**：已**全部移植完成**，前后端逐文件一致，无遗留。
- **设备模块（equipment）**：**基础能力 + 巡检（inspection）子模块已完成**；仍有 6 个完整子功能 + spare_parts（半成品）未移植。
- 初版"safety 仅占位符 / equipment 只有 4 个 model"等描述均已过时，以下第 1-4 节为最新状态。

---

## 1. 安全模块（safety）— ✅ 已完成

后端前端逐文件比对，全部一致，无实质遗漏。

| 层级 | 状态 | 备注 |
|------|------|------|
| 后端 models.py | ✅ 一致（1927 行） | |
| 后端 api/（18 文件） | ✅ 逐文件行数一致 | accidents/ai_workflow/checks/contractors/... 全部就位 |
| 后端 schemas/（18 文件） | ✅ 一致 | |
| 后端 service/（13 文件） | ✅ 就位 | `config.py`/`safety.py` 比源略大——是 XBJ 主动改进：去硬编码 AI key 改从 settings 读、删测试期通知代码，非缺失 |
| 后端 repository.py | ✅ 一致（2239 行） | |
| 后端 ai_hazard_identification/ | ✅ 一致 | AI 风险识别 |
| 后端 feishu/（7 文件） | ✅ 一致 | |
| 后端 card_builder / document_parser / scheduler / template_export / templates | ✅ 一致 | |
| 后端 api/__init__.py 路由注册 | ✅ 18 路由全注册 | |
| 前端 app/(dashboard)/safety/（15 子页） | ✅ 全部存在 | |
| 前端 actions/safety.ts | ✅ 一致（1991 行） | |
| 前端 components/safety/（34 文件） | ✅ 逐文件一致 | |
| 前端 stores/safety.ts、types/safety.ts | ✅ 一致 | |

**结论：safety 模块无需再做移植。**

---

## 2. 设备模块（equipment）— 🔶 部分完成

### 2.1 已完成

| 部分 | 状态 |
|------|------|
| 后端 models/（全部 9 个非巡检 model + 3 个巡检 model） | ✅ 就位（30 张表在 ORM metadata） |
| 后端 equipment 台账 api/service/repo/schema | ✅ |
| 后端 work_orders / calibration / failure_codes 基础 | ✅ |
| 后端 巡检 inspection（api 31 端点 / service 5 文件 / repo / schema / AI） | ✅ 本轮完成 |
| 后端 scheduler.py / mcp_tools.py / public_api.py | ✅ |
| 后端 feishu/client.py、notification.py | ✅（XBJ 版更新） |
| 前端 equipment 台账、maintenance、inspection 页面 | ✅ |
| 前端 巡检 9 组件 + types/store/actions/api | ✅ 本轮完成 |

### 2.2 未完成子功能

> ⚠️ **共同前提**：这些子功能的表**已在 DB（create_all 建的），但迁移链缺 create_table**（见 §2.4）。落地前需先补幂等迁移修复链（§3 PR-1），不再是"建表"而是"补链"。
>
> 源完成度核查结论（引用文件/行号见会话）：**除 spare_parts 外，其余 6 个子功能在源里实现完整**（路由已注册、service 无 TODO/mock、前端组件齐全）。**spare_parts 是半成品，功能不移植。**

| 子功能 | 结论 | 后端缺失 | 前端缺失 | 涉及表 | 估算 |
|--------|------|---------|---------|--------|------|
| **设备人员台账 personnel** | ✅ 移植 | api(201)+service(465)+repo(392)+schema(164)=1222 行 | 7 组件 1597 行 + page(9) + actions/lib-api/types-personnel（各独立文件） | equipment_personnel, equipment_personnel_category, equipment_personnel_role, equipment_role | ~3000 行（最大） |
| **维保计划 maintenance_plans** | ✅ 移植 | api(89)+service(279)+repo(131)+schema(83)=582 行 | 3 组件 447 行 | maintenance_plans | ~1000 行 |
| **统计看板 stats** | ✅ 移植 | 无专属后端（聚合已有接口） | StatsDashboard(1386)+page(112) | — | ~1500 行（纯前端；库存预警面板依赖 spare_parts，需降级） |
| **工单图片 work_order_images** | ✅ 移植 | api(86)+service(102)+repo(46)+schema(18)=252 行 | 融入 WorkOrderDrawer | work_order_images | ~250 行 |
| **工单认领 claim / 维保配置 config / 维修班组 maintainers** | ✅ 移植 | claim(56)+config(137)+maintainers(67)=260 行 | 融入现有工单/维护页 | maintenance_config | ~260 行 |
| **飞书 WS/回调 feishu** | 🔶 可选 | handler.py(183)+ws_client.py(512)=695 行 | 无 | — | ~700 行（交互式用，暂缓） |
| **备件管理 spare_parts** | ❌ 跳过 | —（源半成品，不移植功能） | — | spare_parts, spare_part_stocks, spare_part_transactions, equipment_spare_parts（表已在 DB） | 不做 |

### 2.3 已有文件需补全（支撑上述子功能）

| 文件 | 源 | XBJ | 缺口 |
|------|-----|-----|------|
| lib/api/equipment-client.ts | 347 | 169 | 缺 178 行（备件/人员/维保 API） |
| actions/equipment.ts | 438 | 236 | 缺 202 行 |
| types/equipment.ts | 683 | 353 | 缺 330 行（备件/人员/维保类型） |
| stores/equipment.ts | 570 | 321 | 缺 249 行 |
| actions/equipment-personnel.ts、lib/api/equipment-personnel.ts、types/equipment-personnel.ts | 有 | 无 | 全缺（人员专用） |

---

## 2.4 数据库现状（2026-07-02 核查）

- **连接**：`localhost:5432/dazah` ✅ 可连；当前迁移版本 `f8a7b2c3d4e5`（head）。
- **equipment schema 实有 31 张表**，与 ORM metadata 基本对齐（抽查 4 张孤儿表列结构完全一致）。
- **11 张孤儿表**（在 DB + ORM，但迁移链无 create_table）：

| 簇 | 孤儿表 |
|----|--------|
| personnel | equipment_personnel, equipment_personnel_category, equipment_personnel_role, equipment_role |
| spare_parts（功能跳过，表已在） | spare_parts, spare_part_stocks, spare_part_transactions, equipment_spare_parts |
| maintenance | maintenance_config, maintenance_plans |
| work_order | work_order_images |

- **成因**：早期用 `Base.metadata.create_all()` 直接建表，绕过 alembic。
- **后果**：本地可用，但干净环境 `alembic upgrade head` 建不出这 11 张表 → 必须 PR-1 补链。

---

## 3. 依赖关系与建议移植顺序

子功能间的依赖：

- **personnel + maintainers + roles**：人员/角色/维修班组是一簇；巡检选人、工单派工都会用 → 最基础，先做。
- **work_order 增强（images/claim/maintainers）**：挂在已移植的 work_order 上；claim/maintainers 读 EquipmentPersonnel → 依赖 personnel。
- **maintenance_plans + config**：预防性维护，会生成工单。
- **stats**：聚合以上所有接口，**应最后做**；库存预警面板依赖 spare_parts（跳过）→ 需优雅降级。
- **feishu WS**：交互式基础设施，独立可选（参照巡检 inspection_feishu 的降级处理）。

**按依赖顺序拆多 PR**（SOP 小步快合）：

```
PR-1  补迁移链（幂等迁移，修复 11 张孤儿表；非建表）
PR-2  personnel 设备人员台账（最大、最基础）
PR-3  工单增强（maintainers + claim + work_order_images）
PR-4  maintenance_plans + maintenance_config
PR-5  stats 统计看板（聚合，最后；库存预警面板降级）
(可选) feishu WS
```

**待拍板决策点**：
1. **PR-1 是否把 spare_parts 簇 4 张表也补进迁移链？** 建议**补**（表已在 DB、model 在代码，进链保证干净环境可重建；功能仍不做）。
2. **PR-2 后选人接口是否从 HR `fetchEmployees` 切到 personnel？** 建议**并存、先不切**。

---

## 4. 风险与注意

| 风险点 | 等级 | 说明 |
|--------|------|------|
| **迁移链孤儿表** | 高 | 11 张表 create_all 建的、迁移链缺（§2.4）；干净环境重建不出。PR-1 需写**幂等迁移**（表存在则跳过），避免在本地已有表的库上重复建表报错 |
| 硬编码密钥 | 中 | 源 AI/飞书文件可能含 `sk-` 硬编码，移植时改从 config 读（同巡检 QwenClient 做法） |
| 跨模块共享层污染 | 中 | 源把部分类型/store/actions 塞进 equipment 共享层；XBJ 是隔离风格，移植时避免污染，必要时拆到子模块专属文件（同巡检把模板组件砍掉的教训） |
| stats 依赖 spare_parts | 中 | stats 库存预警面板拉 spare_parts 数据；功能跳过 → 该面板需优雅降级（空/隐藏），不报错 |
| 选人依赖 | 中 | personnel 未移植前，巡检/工单选人已临时接 HR `fetchEmployees`；personnel 落地后需决定是否切换 |
| 飞书交互 WS | 低 | 可不挂 lifespan，优雅降级 |

---

## 5. 验证基线（每个 PR 必做）

- 后端：`uv run python -c "from app.main import app"` import 通过 + 相关 `pytest`
- 后端迁移：`uv run alembic heads`（单 head）；DB 已可用 → `alembic upgrade head` 实跑；幂等性在测试库上 `downgrade -1` + `upgrade head` 验证
- 前端：`pnpm exec tsc --noEmit` + `pnpm build`
- 涉及接口：**起服务真机 `curl` 实测**（DB 已可用，不再只靠静态检查）
