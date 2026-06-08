# 项目说明

原料药厂管理系统，Next.js 16 App Router，TypeScript。
后端为独立的 Python FastAPI 服务，地址见 .env.local 的 API_BASE_URL。
UI或组件样式务必遵守：@DESIGN.md
你使用的技术和函数调用的方式可能有些过时，请使用context7获取最新技术文档。
使用antd组件和配置时，使用context7查询最新参数文档。

## 技术栈

- Next.js 16 + React 19 + TypeScript + Tailwind CSS
- 组件库：Ant Design V6（antd）
- 状态管理：Zustand（stores/ 目录）
- 服务端数据请求：直接 fetch（Server Component 内）
- 客户端数据请求：React Query（@tanstack/react-query）
- 表单：React Hook Form + Zod 校验

## 目录职责

- app/(dashboard)/<模块>/     路由页面，只做数据获取和布局组装
- components/<模块>/          该模块所有 UI 组件
- components/shared/          公共组件，不要擅自修改，如需新增找架构负责人
- actions/<模块>.ts           该模块所有写操作（Server Actions）
- stores/<模块>.ts            该模块客户端状态
- types/<模块>.ts             该模块 TypeScript 类型
- lib/                        基础设施，只允许修改自己负责模块的部分

## actions、stores、types 目录说明

内容多时按职责拆子目录，通过 index.ts 统一导出。
引用时始终从 index.ts 层导入，不进入子文件内部。

例：
✓ import { createBatch } from '@/actions/production'
✗ import { createBatch } from '@/actions/production/batch'

## Server vs Client 组件规则

page.tsx 默认是 Server Component，不加 'use client'。
只有以下情况才加 'use client'：
- 用了 useState / useEffect / 事件处理器
- 用了浏览器 API
- 用了 Zustand store

Client 组件放在 components/<模块>/ 里，page.tsx 只负责拿数据然后传给 Client 组件。

详见 [examples/server-component-pattern.md](examples/server-component-pattern.md)。

## 模块边界规则（重要）

不允许跨模块直接 import 组件内部文件。
如果需要用其他模块的东西，只能从该模块的 index.ts 导入。

禁止：
```ts
import { BatchForm } from '@/components/production/BatchForm'  // 进入了模块内部
```

允许：
```ts
import { BatchTable } from '@/components/production'  // 通过 index.ts
```

## 写操作必须用 Server Actions

所有 POST/PUT/DELETE 操作写在 actions/ 目录，不要在 Client 组件里直接 fetch 写接口。

详见 [examples/server-actions.md](examples/server-actions.md)。

## 飞书集成

暂时为空

## 不允许修改的文件

以下文件只有架构负责人可以修改，如有需求提 PR 说明原因：
- src/middleware.ts
- src/app/layout.tsx
- src/components/shared/ 下所有文件
- src/hooks/usePermission.ts

## 命名规范

- 组件文件：PascalCase（BatchTable.tsx）
- 非组件文件：camelCase（useBatch.ts、batchApi.ts）
- 类型名：PascalCase（BatchStatus、CreateBatchInput）
- Server Action 函数：动词开头（createBatch、updateBatch、submitApproval）
- API 请求函数放在 lib/api/<模块>.ts，函数名以 fetch 开头（fetchBatches、fetchBatchById）

## 新增页面的步骤

1. 在 app/(dashboard)/<模块>/ 下新建目录和 page.tsx
2. page.tsx 里 fetch 数据，传给 components/<模块>/ 里的组件
3. 组件写在 components/<模块>/ 里，需要交互的加 'use client'
4. 如果有写操作，写在 actions/<模块>.ts 里
5. 类型定义更新到 types/<模块>.ts
6. 新增的对外组件记得在 components/<模块>/index.ts 里导出

---

# Karpathy-Inspired Coding Guidelines


## 1. Think Before Coding

**不要假设。不要隐藏困惑。呈现权衡。**

实现前：
- 明确陈述你的假设。如果不确定，就问。
- 如果存在多种解释，请呈现出来——不要默默选择。
- 如果存在更简单的方法，说出来。该反对时就反对。
- 如果某事不清楚，停下来。指明困惑之处。提问。

## 2. Simplicity First

**最少代码解决问题。不做推测性编码。**

- 不要添加超出需求的功能。
- 不要为一次性代码做抽象。
- 不要添加未被要求的"灵活性"或"可配置性"。
- 不要为不可能发生的场景写错误处理。
- 如果你写了 200 行但 50 行就能搞定，重写它。

问自己："资深工程师会说这过度复杂了吗？" 如果是，简化。

## 3. Surgical Changes

**只碰必须碰的。只清理自己制造的混乱。**

编辑现有代码时：
- 不要"改进"相邻代码、注释或格式。
- 不要重构没坏的东西。
- 匹配现有风格，即使你会用不同方式写。
- 如果注意到无关的死代码，提一下——不要删。

当你的改动产生孤儿代码时：
- 删除你的改动导致不再使用的 import/变量/函数。
- 不要删除预先存在的死代码，除非被要求。

检验标准：每一行改动都应能直接追溯到用户的请求。

## 4. Goal-Driven Execution

**定义成功标准。循环直到验证通过。**

将任务转化为可验证的目标：
- "添加验证" → "为无效输入写测试，然后让它们通过"
- "修复 bug" → "写个能复现它的测试，然后让它通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务时，陈述简要计划：
```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

明确的成功标准让你能独立循环。弱标准（"让它工作"）需要不断澄清。

