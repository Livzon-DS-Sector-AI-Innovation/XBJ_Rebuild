# 安全与设备模块移植 - 只读勘察报告

> 生成时间: 2026-06-30
> 勘察范围: 安全与设备模块-只读-仅参考 vs XBJ_Rebuild 当前项目

## 1. 现状总览

### 1.1 当前 XBJ 项目状态

**后端 (dazah-backend/app/modules/):**

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| safety | models.py | ⚠️ 占位符 | 仅1行注释 |
| safety | api/ | ⚠️ 空目录 | 存在但可能无内容 |
| safety | service/ | ⚠️ 空目录 | 存在但可能无内容 |
| safety | schemas/ | ⚠️ 空目录 | 存在但可能无内容 |
| safety | migrations/ | ⚠️ 空目录 | 存在但可能无内容 |
| equipment | models/ | ✅ 部分存在 | 4个模型文件 (equipment, calibration, failure_code, work_order) |
| equipment | api/ | ⚠️ 空目录 | 存在但可能无内容 |
| equipment | service/ | ⚠️ 空目录 | 存在但可能无内容 |
| equipment | schemas/ | ⚠️ 空目录 | 存在但可能无内容 |
| equipment | repository/ | ⚠️ 空目录 | 存在但可能无内容 |

**前端 (dazah-frontend/):**

| 模块 | 文件/目录 | 状态 | 说明 |
|------|----------|------|------|
| safety | actions/safety.ts | ⚠️ 占位符 | 仅9行，仅fetchModuleInfoAction |
| safety | app/(dashboard)/safety/ | ⚠️ 仅主页 | 仅page.tsx，无子页面 |
| equipment | actions/equipment.ts | ⚠️ 部分存在 | 236行，需要对比更新 |
| equipment | app/(dashboard)/equipment/ | ⚠️ 部分存在 | 仅assets, maintenance子页面 |

### 1.2 参考模块状态

**后端 safety 模块 (1927+ 行代码):**

| 文件/目录 | 行数 | 说明 |
|-----------|------|------|
| models.py | 1927 | 完整ORM模型，含多种检查类型、变更管理、风险评估等 |
| api/ | 18个文件 | accidents, ai_workflow, checks, contractors, daily_risk_reports, ehs_changes, enums, hazard_identifications, hazards, knowledge, oh_hazard_monitors, oh_health_exams, regulations, scheduled_tasks, special_operation_reports, special_ops_permits, special_ops_personnel, trainings |
| service/ | 目录存在 | 含业务逻辑 |
| schemas/ | 目录存在 | 含Pydantic模型 |
| repository.py | 94494行 | 数据访问层 |
| ai_hazard_identification/ | 目录 | AI风险识别功能 |
| feishu/ | 目录 | 飞书集成 |

**后端 equipment 模块:**

| 文件/目录 | 说明 |
|-----------|------|
| models/ | 12个模型文件 (equipment, calibration, failure_code, inspection, inspection_route_location, inspection_template, maintenance_config, maintenance_plan, personnel, spare_part, work_order, work_order_image) |
| api/ | 目录存在 |
| service/ | 目录存在 |
| schemas/ | 目录存在 |
| repository/ | 目录存在 |
| feishu/ | 目录存在 |
| mcp_tools.py | 20786行，MCP工具 |
| scheduler.py | 3099行，定时任务 |
| public_api.py | 4013行，公共API |

**前端 safety:**

| 目录/文件 | 说明 |
|-----------|------|
| actions/safety.ts | 1991行，完整API调用 |
| app/(dashboard)/safety/ | 16个子目录: accident, ai-workflow-config, check, contractor, ehs-change, hazard, hazard-identification, hazard-ledger, knowledge-base, occupational-health, regulation, risk-reporting, scheduled-tasks, special-ops, training |

**前端 equipment:**

| 目录/文件 | 说明 |
|-----------|------|
| actions/equipment.ts | 438行 |
| actions/equipment-personnel.ts | 人员相关操作 |
| app/(dashboard)/equipment/ | 6个子目录: assets, inspection, maintenance, personnel, spare-parts, stats |

## 2. 差异分析

### 2.1 Safety 模块缺失内容

**后端:**
- [ ] models.py - 需要完整替换 (1927行)
- [ ] api/ - 需要全部18个路由文件
- [ ] service/ - 需要全部服务层代码
- [ ] schemas/ - 需要全部Pydantic模型
- [ ] repository.py - 需要完整替换 (94494行)
- [ ] ai_hazard_identification/ - AI风险识别
- [ ] feishu/ - 飞书集成
- [ ] card_builder.py, document_parser.py, scheduler.py, template_export/

**前端:**
- [ ] actions/safety.ts - 需要从9行扩展到1991行
- [ ] 15个子页面需要创建 (除page.tsx外)

### 2.2 Equipment 模块缺失内容

**后端:**
- [ ] models/ - 需要对比，参考有12个模型 vs 当前4个
- [ ] api/ - 需要补充
- [ ] service/ - 需要补充
- [ ] schemas/ - 需要补充
- [ ] repository/ - 需要补充
- [ ] mcp_tools.py - 新增 (20786行)
- [ ] scheduler.py - 新增
- [ ] feishu/ - 飞书集成

**前端:**
- [ ] actions/equipment.ts - 需要从236行扩展到438行
- [ ] 4个子页面需要创建 (inspection, personnel, spare-parts, stats)

## 3. 依赖关系

### 3.1 后端依赖
- app/shared/base_model.py - 基础模型
- app/core/config.py - 配置
- app/platform/feishu/ - 飞书平台集成

### 3.2 前端依赖
- lib/api/ - API客户端
- components/ - 共享组件
- hooks/ - 共享hooks

## 4. 风险评估

| 风险点 | 等级 | 说明 |
|--------|------|------|
| 数据库迁移 | 高 | 新模型需要迁移脚本 |
| 依赖冲突 | 中 | 可能与现有代码存在命名冲突 |
| AI功能依赖 | 中 | ai_hazard_identification 依赖外部AI配置 |
| 飞书集成 | 中 | 需要飞书环境配置 |
| 文件体积 | 低 | repository.py 94KB，需要确认是否分批 |

## 5. 移植建议顺序

1. **后端 models** - 先建立数据模型
2. **后端 schemas** - 定义API契约
3. **后端 api** - 实现接口层
4. **后端 service** - 实现业务逻辑
5. **后端 repository** - 实现数据访问
6. **前端 actions** - 更新API调用
7. **前端 pages** - 创建页面
8. **验证测试** - 确保功能正常

## 6. 注意事项

1. 参考模块中的 `sk-` 硬编码密钥需要在移植时清理
2. 部分文件可能包含绝对路径，需要改为相对路径
3. 确保与现有 hr, energy 等模块的兼容性
4. 测试覆盖：后端 pytest + 前端 tsc --noEmit + build
