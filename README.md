# LivzonAI - 原料药事业部工厂管理平台

原料药制药厂综合业务管理平台，涵盖生产、设备、安全、环保、能源、仓储、采购、行政、人事、研发、注册、质量等业务模块。

## 项目结构

```
LivzonAI/
├── dazah-frontend/      # 前端：Next.js 14 + React + TypeScript
└── dazah-backend/       # 后端：Python 3.12 + FastAPI + PostgreSQL
```

## 技术栈

- **前端**：Next.js 14, React 18, TypeScript, Tailwind CSS, Ant Design V6
- **后端**：Python 3.12, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Redis, Alembic
- **包管理器**：前端 pnpm，后端 uv

## 快速启动

> ⚠️ **关于地址**：下面的 `localhost:8000` / `localhost:3000` 只是**本地开发的默认地址**。
> 演示机 / 局域网 / 部署环境的 host 和端口会不同（如局域网 IP `192.168.x.x`、其他端口），
> 通过环境变量配置（后端 `.env`，前端 `.env.local` 的 `API_BASE_URL`）。
> **代码里不要写死这些地址**——跳转/回调链接从运行时取，详见 [`CLAUDE.md`](CLAUDE.md)「路径与跳转链接」。

### 前置要求

- Node.js 22+（pnpm 11 要求）
- Python 3.12+
- Docker（数据库 PostgreSQL + Redis 跑在容器里）

### 1. 启动数据库

PostgreSQL 和 Redis 跑在 Docker 容器里：

```bash
cd dazah-backend
docker compose up -d        # 启动 postgres + redis
docker ps                   # 确认两个容器在跑
```
> 每次重启电脑后，需先 `docker compose up -d` 再启动项目。

### 2. 后端启动

```bash
cd dazah-backend

# 安装依赖（含 ruff/mypy/pytest 等开发工具）
uv sync --extra dev

# 配置环境变量
cp .env.example .env

# 数据库迁移
uv run alembic upgrade head
# 若报错(迁移链已知不齐), 用 ORM 直接建表兜底:
#   uv run python scripts/ci_create_tables.py

# 导入种子数据（部门、班组等初始数据）
uv run python scripts/seed.py

# 启动服务
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端服务地址：http://localhost:8000  
API 文档：http://localhost:8000/docs

### 3. 前端启动

```bash
cd dazah-frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端默认地址（本地开发）：http://localhost:3000（端口被占用时自动顺延，如 3001）。
> 演示/局域网环境请用对应的 host:端口访问，后端地址由前端 `.env.local` 的 `API_BASE_URL` 配置，勿写死。

## 种子数据

项目包含以下种子数据文件：

| 文件 | 内容 | 导入脚本 |
|------|------|----------|
| `dazah-backend/departments.json` | 15 个部门 | `scripts/seed.py` |
| `dazah-backend/teams.json` | 26 个班组 | `scripts/seed.py` |

运行 `uv run python scripts/seed.py` 即可将数据导入数据库。该脚本支持重复执行（已存在的数据会自动跳过）。

## 文档导航（先看这里）

| 我想…… | 看这份 |
|--------|--------|
| **第一天上手**（装环境、跑起来、提首个 PR） | [`docs/新人上手指南.md`](docs/新人上手指南.md) |
| **日常开发**（建分支、commit、提 PR、冲突处理） | [`docs/日常协作SOP.md`](docs/日常协作SOP.md) ← 最常用 |
| **搬模块 / 大重构 / 清密钥** | [`docs/模块移植与合并SOP.md`](docs/模块移植与合并SOP.md) |
| **强制规则**（协作分支 / 路径跳转 / 密钥） | [`CLAUDE.md`](CLAUDE.md) |
| **查数据源 / 飞书配置 / 环境变量** | [`docs/数据源与飞书参考.md`](docs/数据源与飞书参考.md) |
| **后端 / 前端编程规范** | `dazah-backend/CLAUDE.md` / `dazah-frontend/CLAUDE.md` |

> 协作底线：不在 `main` 直接改，走分支 → PR（CI 绿 + 1 人审核）→ merge commit 合并。分支命名 `<类型>/<描述>-<代号>`，如 `feat/employee-export-czl`。

## 常见问题

### Q: 前端报错 `fetch failed`？

检查 `.env.local` 中的 `API_BASE_URL` 是否指向正确的后端地址（默认 `http://localhost:8000`）。

### Q: 数据库连接失败？

检查 `dazah-backend/.env` 中的 `DATABASE_URL` 是否正确，并确认 PostgreSQL 已启动。

### Q: 种子数据导入后没有显示？

刷新前端页面（F5），或检查后端服务是否正常运行。
