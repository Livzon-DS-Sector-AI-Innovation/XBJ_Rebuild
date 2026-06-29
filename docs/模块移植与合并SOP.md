# 模块移植与合并 SOP

> 适用项目：XBJ_Rebuild（原料药事业部数字化基座，前后端 monorepo）
> **适用范围**：本文覆盖模块移植、重构、合并、发布前清理的**通用流程**，不止"搬模块"。日常小改动见精简版（§2-③ 的分级）。
> **适用对象**：允许在 Claude 协助下执行；但**关键节点（历史改写、合并、清密钥）必须人工确认**，不能纯交给 AI。
> 本文档是**经过实战验证**的流程（首次实践记录见文末附录），不是纸上规范。

## 仓库结构与版本要求

```
XBJ_Rebuild/
├── dazah-backend/    后端  Python 3.12 + FastAPI + uv
└── dazah-frontend/   前端  Next.js 14 + pnpm
```

| 工具 | 版本 | 说明 |
|---|---|---|
| Python | 3.12 | 后端 |
| uv | 最新 | 后端包管理，dev 依赖需 `--extra dev` |
| Node | **22**（CI 锁定） | pnpm 11 要求 ≥22.13 |
| pnpm | 11 | 前端包管理 |

---

## 0. 核心哲学

> **人负责决策和理解，AI 负责执行和检查，机器（CI + 分支保护）负责兜底。**

- 规则写在纸上没用，必须有机器**强制执行**。本仓库的"执法系统"=
  `CLAUDE.md（约束 AI）` + `pre-commit（本地拦）` + `CI（PR 拦）` + `分支保护（合并拦）`。
- 零经验的人**无需精通 git 内部原理**，只需在 Claude 引导下、照速查表执行，并**确认每一步已完成**。
- 每一步都要**实际验证**，不靠"应该好了"。
- **回滚原则**：任何一步出错、状态不对，回到安全网 `git reset --hard baseline-runnable`（见 §2-②）。
- ⚠️ **连审核意见也要复核**：AI 给的建议可能基于错误假设（例：三份审核都误判本文"2026-06"是未来笔误，实则日期正确）。照单全收 = 把别人的想当然变成你的错误。

---

## 1. 七步主流程总览

```
① 只读勘察    → 禁止改动，先摸清现状，产出报告
② 收束工作区  → 按归属切分，建安全网（快照/备份分支）
③ 验证基线    → 实跑：import / 测试 / 页面 / 接口，不靠猜
④ 原子提交    → 一个提交一件事，信息规范，可回滚
⑤ CI 门禁     → 推分支 → 开 PR → CI 自动跑（阻断 vs 警告分级）
⑥ 人工审核    → 队友 Approve（1 人）+ CI 全绿 → 合并到 main
⑦ 公开前清密钥 → 转公开/外发前必扫 + filter-repo 清历史
```

每一步的详细做法见第 2 节。常见坑见第 3 节。命令速查见第 4 节。

---

## 2. 七步详解

### ① 只读勘察（禁止改动）

动手前先摸清现状，**这一步绝不改任何文件**。
- 对 Claude 的第一句永远是：「只读侦察，禁止修改任何文件」。AI 天性是"帮你解决"，不拦着它侦察着就开始动手术了。
- 要查清：要移植/改动的代码散在哪些文件、被谁依赖、有没有跨模块引用、有没有外键、路由怎么挂的。
- 产出一份现状报告（可写入 `docs/AUDIT.md`），你确认后再动手。

### ② 收束工作区（建安全网）

如果工作区已经一团乱（大量未提交改动混在一起），先切分、再建退路。
- **按归属切分**：自己负责的 vs 别人小组的。
  - **判定规则**：凡是**需要对方环境/密钥/业务确认才能在本地验证**的代码，默认**冻结**到独立分支（`freeze/xxx`），不混进自己的提交。共用类型、公共组件、迁移脚本、CI 配置这类边界模糊的，谁改谁负责验证，验证不了就冻结。
- **建安全网**：把当前"能跑的"状态打个快照分支 + tag（`baseline-runnable`），任何时候 `git reset --hard baseline-runnable` 回退。
- **历史改写前必建备份分支**（`pre-filter-backup`）。
- **freeze 分支的交接（闭环）**：冻结只是"暂存别人的半成品"，不是终点。必须约定**何时、由谁解冻**——通常由该模块的负责小组，在补齐配置/密钥后，按本 SOP 七步**重新移植**回主项目（不是直接 merge `freeze/xxx`）。在遗留债清单里登记，避免永久搁置。

### ③ 验证基线（实跑，不靠猜）

"编译通过 + 测试绿" ≠ "能正常使用"。按**变更影响范围分级**，不要一刀切：

**最低必做（任何改动）**：
- 后端：`import` 改动模块、相关 `pytest`。
- 前端：`tsc --noEmit` + `build`。

**按影响范围追加**：
- 改了后端接口/业务逻辑 → 起服务 `curl /health` + 真实数据调该接口看返回。
- 改了页面/路由 → 实际加载页面看 HTTP 200 + 无运行时报错。
- 只改前端文案/样式/静态配置 → 最低必做即可，不必全套接口测试。

⚠️ **改完后端，除非确认启用了热重载（`--reload`/容器热更新），否则必须重启服务**，不然你测的是旧代码。

### ④ 原子提交（一个提交一件事）

- 每个提交单一目的，信息用 `feat:/fix:/chore:/ci:` 前缀 + 中文说清做了什么。
- 互不相关的改动**分开提交**（如"功能"和"修 bug"不混在一个 commit）。
- 提交信息要让领导/队友看得懂——这是"领导看记录"的基础，也是 merge commit 方式能保留细节的前提。
- **定稿检查**：改动的文件头部是否有"标准档"注释（业务 + 依赖），且与本次改动后的实际一致？（规则见前后端 `CLAUDE.md` 的"文件头部注释"小节。端口/接口写指针不写值，防腐烂。）

### ⑤ CI 门禁（推分支 → PR → 自动检查）

- 改动推到自己的分支，**开 PR 到 main**（禁止直推 main）。
- CI 自动跑，分两级：
  - **阻断级**（不过不能合）：后端 `pytest`、前端 `tsc` + `build`。
  - **警告级**（暴露存量债但不阻断）：`ruff`、`mypy`、前端 `lint`。
- **警告级的处理责任**：不是"无视"，而是"记录 + 只降不升"。要有专项 issue 或周期清理清单跟进，否则警告级会沦为纸面门禁。（后续优化项：CI 加 `ruff check --statistics` 与基线对比，警告数增加则提示。）
- CI 用 `create_all` 建测试库（绕开对不齐的迁移链），测的是**代码逻辑**。
  - ⚠️ **重要边界**：`create_all` 按 ORM 建表，**不验证迁移链**（触发器、默认值、索引、约束、视图、迁移顺序都不在 CI 覆盖内）。**CI 全绿 ≠ 迁移没问题**。涉及迁移的改动，上线前需**单独验证** `alembic upgrade head`。

### ⑥ 人工审核 → 合并

- PR 需 **1 个队友 Approve**（GitHub 不允许自己批自己的）+ **CI 全绿** + **基于最新 main**。
- **审核要看什么**（不是走过场，至少两个检查点）：① 影响范围是否正确（有没有动到不该动的模块/公共文件）；② 有没有明显回归风险（删了别人在用的东西、改了公共接口）。CI 已验正确性，人主要扫方向和边界。
- **单人在线应急**：若某段时间只有你一人、PR 卡在"等 Approve"——这是**例外操作**，由管理员临时把 `Require approvals` 调 0 → 合 → **立即调回 1**。不可常态化，否则人工审核关形同虚设。
- **合并节奏**：开了 `Require up to date` 后，多人并行时别人先合你就要 rebase + 等 CI 重跑。对策是**小步快合**（PR 拆小、尽快合），避免高峰期反复 rebase 死循环。
- 合并方式**本仓库默认 "Create a merge commit"**（保留原子提交 + PR 归属节点），**默认禁止 Squash**（会压掉原子提交、丢历史）。特殊情况（如需线性历史）须在 PR 说明里写明并确认。

### ⑦ 公开前清密钥（转公开/外发必做）

仓库转公开、或代码外发前，**必扫历史里的真密钥**：
- **扫描重点**：已知密钥模式（`*_SECRET=` / `*_API_KEY=` / `sk-xxxx` 等明文赋值），含**全部 git 历史**（不只当前文件）。base64/长串**不等于密钥**（签名、图片编码、哈希都像），**只作可疑项人工确认**，不自动删，避免误伤历史。
- 发现真密钥：① 去对应平台**重置**（若还活着）→ ② `git filter-repo` 从全历史清除 → ③ force-push 覆盖。
- ⚠️ **与分支保护的冲突处理（管理员专项，破坏性操作）**：§5 规定 main 禁 force push 且不允许绕过，与这里的 force-push 直接冲突。正确顺序：
  1. 清理历史是破坏性操作，**只能由仓库管理员执行**。
  2. 管理员先在 Settings 临时**关闭 main 的"禁止 force push"**（并通知全员暂停推送）。
  3. `git filter-repo` 清除 → ⚠️ **filter-repo 会自动移除 remote，需 `git remote add <名> <url>` 重新关联**后才能推。
  4. force-push 覆盖远程 → **立即在 Settings 恢复保护**。
  5. 通知所有协作者执行 `git fetch --all && git reset --hard origin/main`（或重新 clone），否则他们本地的旧历史会把密钥再推回来。
  > 注：若是**全新仓库、保护尚未开启**时清理（如本仓库首次），可直接 force-push，无需开关保护——本 SOP 附录的首次实践就属此情形。
- `.env` 永不提交；`.env.example` 只放占位符（`YOUR_XXX`），绝不填真值。

---

## 3. 踩坑清单（本轮实际踩过的，新人必读）

> 这些都是真实踩过的坑。别人花时间踩的，你读一遍就避开。

| 坑 | 现象 | 正确做法 |
|---|---|---|
| **硬编码绝对路径** | `open('d:/LivzonAI/api_success.log')` 在别的机器 FileNotFoundError | 路径/配置走环境变量，不写死盘符 |
| **改完没重启服务** | 改了代码、测试还报旧错 | 后端没开 `--reload` 时，改完必须重启进程 |
| **.env.example 填真值** | 真密钥进了示例文件、混进历史 | 示例文件只放 `YOUR_XXX` 占位符 |
| **密钥藏在历史里** | 当前文件干净，但旧 commit 的 diff 里有 | 转公开前扫**全历史**，filter-repo 清 |
| **PowerShell ≠ Linux** | `tail`/`grep`/`head` 在 PowerShell 报 not found | PS 用 `Select-Object -Last N` / `Select-String` |
| **uv dev 依赖装不上** | `uv run mypy` → program not found | dev 依赖在 optional 组，要 `uv sync --extra dev` |
| **pnpm 绑 Node 版本** | pnpm 11 在 Node 20 报 "requires Node ≥22.13" | CI 锁兼容的 Node 版本（如 22） |
| **代理抖动** | `git push` / `ls-remote` 突然 Could not connect | 探活 `curl -x http://127.0.0.1:7890`，恢复后重试 |
| **异常捕获顺序错** | `except Exception` 写在 `except FileNotFoundError` 前 → 后者分支不可达（Python 会捕获但永远走不到子类分支；ruff/IDE 报 unreachable） | 子类异常写在父类前面 |
| **迁移链对不齐** | `alembic upgrade` 建出的表缺列 | 测试用 `create_all`；迁移单独专项修 |
| **CI paths 过滤死锁** | 纯前端 PR 等不到 backend 必过检查 | 必过检查的 job 不要加 paths 过滤 |
| **Squash 丢历史** | 合并选了 squash，7 个原子提交压成 1 个 | 统一用 merge commit |

---

## 4. 命令速查（PowerShell 环境）

```powershell
# —— 后端（dazah-backend）——
uv sync --extra dev                         # 装含 dev 工具的依赖
uv run pytest -q                            # 跑测试
uv run ruff check app                        # lint（警告级）
uv run mypy app                              # 类型检查（警告级）
uv run uvicorn app.main:app --reload --port 8000   # 起服务（开发开 reload）

# —— 前端（dazah-frontend）——
pnpm install
pnpm tsc --noEmit                            # 类型检查（阻断级）
pnpm build                                   # 构建（阻断级）
pnpm lint                                    # lint（警告级）

# —— Git 日常（三句话；下面 "; " 是简写示意，逐条执行更稳）——
git checkout main; git pull                  # 干活前拉最新
git checkout -b 名字/做的事                   # 开自己的分支
git add .; git commit -m "feat: 说清做了啥"   # 存档
git push origin 名字/做的事                   # 推送，然后去 GitHub 开 PR

# —— 清密钥（公开前；PowerShell 语法）——
# 1. 扫全历史(PS 用 Select-String,不是 grep)
git log --all -p | Select-String "可疑密钥串" | Measure-Object -Line
# 2. 写替换规则文件 replacements.txt,格式 “原文==>替换”,每行一对:
#      dW90FQW5h1SKDL6cOLdRUhcEcPkoCG0z==>***REMOVED-SECRET***
#      sk-a2ef55e9d2904572bb039f51e236a250==>***REMOVED***
# 3. 清除(会从全历史所有分支替换)
uv tool run git-filter-repo --force --replace-text replacements.txt
# 4. ⚠️ filter-repo 会移除 remote,必须重新关联(<名><url> 按实际填)
git remote add rebuild https://github.com/<org>/<repo>.git
# 5. force-push 覆盖(分支名按实际;main 受保护时需先临时关保护,见 ⑦)
git push --force rebuild main
git push --force rebuild <你的分支>

# —— Linux→PowerShell 对照 ——
# tail -5      → Select-Object -Last 5
# grep xxx     → Select-String xxx
# rm -rf dir   → Remove-Item -Recurse -Force dir
# export X=1   → $env:X=1
```

---

## 5. 分支保护与 PR 规则（本仓库现行配置）

main 分支已开启保护，进 main 必须同时满足：

| 规则 | 设置 | 含义 |
|---|---|---|
| Require a pull request | 开 | 禁止直推 main，必须走 PR |
| Require approvals | **1** | 必须 1 个队友审核（不能自己批自己） |
| Require status checks | `backend` + `frontend` | CI 两个 job 不绿，合并按钮灰着 |
| Require up to date | 开 | 合前必须同步最新 main、CI 重跑 |
| Do not allow bypassing | 开 | 管理员也守，无后门 |
| Force push / 删除 | 禁 | main 历史不能被强推或删除 |

> 合并方式：**本仓库默认 Create a merge commit**（保留原子提交 + PR 归属节点）。**默认禁用 Squash**。特殊情况（需线性历史等）须在 PR 说明里写明并确认。
>
> ⚠️ 上表的 "Force push / 删除 禁" 与 §2-⑦ 清密钥的 force-push 冲突——清密钥是管理员专项的破坏性例外，必须按 ⑦ 的"临时关保护→清→恢复"流程，不可平时绕过。

---

## 附录：首次实践记录（2026-06）

> **这是一次具体实践的案例记录，不是约束。** 其中的数据规模、分支命名、技术债数字都是当时的特定情况，照搬时按你自己的项目调整。（注：`2026-06` 是真实日期，非笔误。）

本 SOP 的七步由一次真实重构走通并验证：
- ① 勘察发现 `PlanStep` 缺失（AI 查询功能 + 测试全挂）、equipment 半成品、工作区 200+ 混合改动。
- ② 切分"HR（自己的）vs safety/equipment（别人的，冻结）"，建 `baseline-runnable` 快照。
- ③ 实跑验证：后端 102 passed、前端 12 页 200、HR 导出接口产出真 xlsx。
- ④ 7 个原子提交（fix(ai) / chore / feat(hr)×3 / fix(hr) / ci）。
- ⑤ CI 首次失败（缺 sys.path、Node 版本），第二次全绿。
- ⑥ PR #1 经 merge commit 合入 main，保留全部 7 个提交。
- ⑦ 公开前扫出 `FEISHU_APP_SECRET` 死值藏在历史，filter-repo 清除后才转公开。

> 遗留技术债（按需专项处理）：ruff 1530 / mypy 1593（警告级盯着只降不升）、
> 前端 lint（Node 兼容，升级 Next 时解决）、迁移链对不齐（重新生成干净迁移）、
> freeze 分支里 safety/equipment 的 `sk-` 硬编码 key（重新移植时清，可能需对应小组重置）。


