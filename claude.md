# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

智途 AstroPath — 一站式智能留学规划平台。Vue 3 + Vite 单页应用，集成 AI 对话（智谱 GLM）、ECharts 数据可视化、Markdown 渲染。人工智能学院网页设计大赛参赛项目。

## 开发命令

```bash
npm run dev                  # 启动开发服务器 (http://localhost:3000)
npm run build                # 生产构建
npm run preview              # 预览构建产物
npm run lint                 # ESLint 检查并自动修复
npm run typecheck            # TypeScript 类型检查 (vue-tsc --noEmit)
npm run precommit            # 提交前类型检查（git hook 调用）
```

pre-commit hook（`simple-git-hooks`）会自动运行 `npm run typecheck`，类型错误会阻断提交。

## 架构要点

### AI 调用链路

```
页面组件 → useAIStream (composable)
         → useGlobalAIState (全局 AI 状态，管理并发流)
         → ai-api.js (API 调用，多 provider 适配)
         → Vite proxy /ai-proxy/ → 智谱 open.bigmodel.cn
```

- `useAIStream`：单个任务级流式调用，处理 SSE、重试、状态机
- `useGlobalAIState`：全局状态中心，管理活跃流、队列、并发控制
- `ai-api.js`：provider 适配层，统一 OpenAI 兼容接口

### 数据持久化

所有用户数据存 `localStorage`，由 `useStorage` composable 封装（自动加 `astropath_` 前缀）。无后端服务器，清除浏览器数据会丢失。

### 状态管理

用 composables 模式替代 Pinia，每个业务域一个 composable：
- `useAssessmentState` — 背景评估表单
- `useAIConfig` — AI provider 配置
- `useMaterialsState` — 材料中心状态
- `useDatabaseState` — 院校数据库状态
- `useGlobalRecommendationState` — 选校推荐状态

### 路由

Hash 模式（`createWebHashHistory`），URL 带 `#`（如 `http://localhost:3000/#/assessment`）。沉浸式页面（`/ai-chat`、`/story`、`/result`）隐藏顶栏。

### 静态数据

`src/data/` 含多版本数据（v1/v2/v3），为数据结构迭代产物。院校、专业等数据为 JS/TS 静态导出。

### 路径别名

`@` → `src/`（配置在 `vite.config.js`），import 用 `@/views/Home.vue` 而非相对路径。

## 核心约束（违反即扣分）

### 配色系统

只使用 `src/styles/variables.css` 中已定义的变量，禁止硬编码色值或新增颜色变量。

- 主色 `#0F172A`（Slate-900）— 唯一交互色（按钮、文字、边框）
- 强调色 `#D97706`（Amber-600）— 唯一彩色点缀（下划线、活跃态、footer 光线），极度克制
- 背景 `#FFFFFF` 白色为主
- 禁止：蓝白通用配色、渐变 hero banner、三栏 features section 布局

### 字体

- 数据/数字/标签 → `var(--font-family-mono)`（JetBrains Mono）
- 禁止使用 Inter / Roboto / Arial / Helvetica 作为显示字体

### CSS 命名

BEM 格式，统一 `ud-` 前缀：
```css
.ud-card__accent--danger   /* Good */
.card-accent               /* Bad */
```

### 动画

- 入场：`cubic-bezier(0.16, 1, 0.3, 1)`（Expo Out）
- 悬停微交互：`cubic-bezier(0.34, 1.56, 0.64, 1)`（Back Out）
- 筛选芯片激活态 → 边框强调 + `rgba(15,23,42,0.06)` 底色，不用实色填充
- 卡片悬停 → CSS 3D perspective 倾斜（`--mx/--my` 变量驱动）
- 纹理：全页 SVG fractalNoise 叠加层，`opacity: 0.03`

### 无障碍

所有包含动画的组件必须添加：
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition-duration: 0.01ms !important; }
}
```

### 安全红线

`AIConfig.vue` 内含硬编码 API Key，严禁 git 提交、严禁公开暴露。

### 分支策略

- **`master`** — 稳定版本，**禁止直接 merge 任何 refactor/ 分支**
- **`refactor/audit-fixes`** — 当前开发分支，所有改动在此进行
- **永远不要执行 `git merge` 到 master**，除非用户明确要求并已确认
- 需要同步 master 更新时，用 `git rebase master` 而非 merge
