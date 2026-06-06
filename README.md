# LivzonAI — 原料药事业部工厂数字化基座

本项目是丽珠集团原料药事业部的工厂数字化管理系统，包含后端 API 服务（FastAPI）和前端管理界面（Next.js）。

---

## 项目结构

```
LivzonAI/
├── dazah-backend/          # 后端服务（Python + FastAPI + SQLite）
│   ├── app/                # 业务代码
│   │   ├── core/           # 数据库、配置等基础设施
│   │   ├── modules/        # 业务模块（HR、设备、生产、质量等）
│   │   └── platform/       # 平台能力（审计、身份、外部集成）
│   ├── alembic/            # 数据库迁移
│   ├── scripts/            # 工具脚本
│   ├── dazah.db            # SQLite 数据库文件（已包含初始数据）
│   └── .env.example        # 环境变量模板
│
└── dazah-frontend/         # 前端应用（Next.js + Ant Design）
    ├── src/
    │   ├── app/            # 页面路由
    │   ├── components/     # 业务组件
    │   ├── actions/        # Server Actions
    │   └── stores/         # 状态管理
    └── package.json
```

---

## 前置条件

| 工具 | 版本 | 说明 |
|------|------|------|
| Python | 3.12+ | 后端运行环境 |
| uv | 最新版 | Python 包管理器（https://docs.astral.sh/uv/） |
| Node.js | 18+ | 前端运行环境 |
| pnpm | 8+ | 前端包管理器 |

---

## 后端启动

```bash
cd dazah-backend

# 1. 安装依赖
uv sync

# 2. 直接启动（数据库文件 dazah.db 已包含在项目内）
uv run uvicorn app.main:app --reload
```

启动成功后访问：http://localhost:8000/docs

> 无需安装 PostgreSQL、无需 Docker、无需手动创建数据库。

---

## 前端启动

```bash
cd dazah-frontend

# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev
```

启动成功后访问：http://localhost:3000

> 首次运行 `pnpm install` 后会重新生成 `pnpm-lock.yaml`。

---

## 数据库说明

项目使用 **SQLite** 作为数据库，数据库文件 `dazah.db` 直接放在 `dazah-backend/` 目录下，已随代码一起提交到 GitHub。

### 已预置的基础数据

| 数据 | 数量 |
|------|------|
| 部门 | 15 个（AI创新部、安全环保部、财务部、采购部、发酵工程部等） |
| 班组 | 26 个 |

### 如需重置或补充数据

```bash
cd dazah-backend

# 重新运行迁移（会清空现有数据，谨慎使用）
uv run alembic upgrade head

# 导入种子数据（部门、班组）
uv run python scripts/seed.py
```

### 如需修改数据库结构

修改 ORM 模型后，生成新的迁移：

```bash
uv run alembic revision --autogenerate -m "描述"
uv run alembic upgrade head
```

---

## 飞书数据同步（可选）

员工数据（`employees` 表）目前通过**飞书多维表格同步**拉取。如需启用，请配置以下环境变量：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env，填写飞书参数
FEISHU_APP_ID=你的飞书应用ID
FEISHU_APP_SECRET=你的飞书应用密钥
FEISHU_BITABLE_APP_TOKEN=多维表格应用Token
FEISHU_BITABLE_EMPLOYEE_TABLE_ID=员工表ID
FEISHU_BITABLE_DEPARTMENT_TABLE_ID=部门表ID
```

配置完成后，调用同步接口即可导入员工数据。

> 没有飞书权限时，员工表保持为空，但部门和班组数据已预置。

---

## 技术栈

### 后端
- **框架**：FastAPI
- **ORM**：SQLAlchemy 2.0（异步）
- **数据库**：SQLite（`aiosqlite` 驱动）
- **迁移**：Alembic
- **配置**：Pydantic Settings

### 前端
- **框架**：Next.js 14 + React 18
- **UI 库**：Ant Design V6
- **状态管理**：Zustand
- **样式**：Tailwind CSS
- **类型校验**：Zod

---

## 常见问题

### Q1: 后端启动报错 `ModuleNotFoundError`

**原因**：依赖未安装或虚拟环境未激活。  
**解决**：确保在项目根目录执行 `uv sync`。

### Q2: 前端启动报错 `pnpm-lock.yaml` 不存在

**原因**：首次克隆后缺少 lock 文件。  
**解决**：执行 `pnpm install` 会自动生成。

### Q3: 数据库文件损坏或想从零开始

**解决**：
```bash
cd dazah-backend
rm dazah.db
uv run alembic upgrade head
uv run python scripts/seed.py
```

### Q4: 修改了数据库模型后如何更新数据库

**解决**：
```bash
uv run alembic revision --autogenerate -m "描述"
uv run alembic upgrade head
```

### Q5: 飞书同步失败

**原因**：`.env` 中飞书参数未配置或配置错误。  
**解决**：检查 `FEISHU_APP_ID`、`FEISHU_APP_SECRET` 等参数是否正确。

---

## 开发规范

- 后端代码修改后，建议运行 `uv run ruff check .` 检查格式
- 涉及数据库变更时，同步更新 ORM、migration 和 seed 脚本
- 提交前确保 `.env` 文件不会被提交（已配置在 `.gitignore` 中）
