# 智途 AstroPath — AGENTS.md

Vue 3 + Vite 单页应用，智能留学规划平台。集成 AI 对话（智谱 GLM）、ECharts 数据可视化、Markdown 渲染。

## Dev Environment Tips

```bash
npm install                  # 安装依赖（项目目录，不要在 nodejs 安装目录执行）
npm run dev                  # 启动开发服务器 → http://localhost:3000
npm run build                # 生产构建
npm run preview              # 预览构建产物
npm run lint                 # ESLint 检查并自动修复
npm run typecheck            # TypeScript 类型检查（git pre-commit hook 自动调用）
```

**Shell 环境**：Bash（非 Windows cmd），路径用正斜杠 `/`，命令用 Unix 风格（`ls`、`cp`、`rm`）。

## Build & Test

| 命令 | 用途 |
|------|------|
| `npm run build` | 生产构建 |
| `npm run typecheck` | 类型检查（阻断提交的 hook） |
| `npm run lint` | ESLint 自动修复 |
| `npm run preview` | 预览构建产物 |

## Project Structure

```
src/
  App.vue                    # 根组件（导航栏 + 路由 + 移动端抽屉）
  main.js                    # 入口（Vue app 初始化）
  router/index.ts            # 路由（Hash 模式）
  views/                     # 页面组件（12 个路由页面）
  components/                # 可复用组件
    common/                  # 通用组件（Logo、AnnouncementButton、AIStreamDisplay）
    ui/                      # 基础 UI（BaseCard、BaseBadge、EmptyState、LoadingState）
    materials/               # 材料中心子组件
    school-recommendation/   # 选校推荐子组件
    story/                   # 项目故事子组件
    result/                  # 比赛结果子组件
  composables/               # 状态管理（替代 Pinia）
    useAIStream.ts           # 单个 AI 流式调用
    useGlobalAIState.ts      # 全局 AI 状态（并发控制）
    useAIConfig.ts           # AI provider 配置
    useAssessmentState.ts    # 背景评估表单状态
    useDatabaseState.ts      # 院校数据库状态
    useMaterialsState.ts     # 材料中心状态
    useGlobalRecommendationState.ts  # 选校推荐状态
  styles/
    variables.css            # 设计系统变量（唯一颜色/字体/间距来源）
    index.css                # 全局样式 + Element Plus 主题覆盖
    atmosphere.css           # 氛围效果（纹理、滚动条等）
  data/                      # 静态数据（院校、专业等）
```

**路径别名**：`@` → `src/`（`@/views/Home.vue`）

## Code Style & Conventions

### 配色（硬约束）

**只使用 `src/styles/variables.css` 中已定义的变量，禁止硬编码色值。**

```css
/* Good */
color: var(--color-solid);
background: var(--color-accent);
border-color: var(--color-slate-200);

/* Bad */
color: #0F172A;
background: #D97706;
```

- 主色：`var(--color-solid)`（Slate-900）— 唯一交互色
- 强调色：`var(--color-accent)`（Amber-600）— 极度克制，仅下划线/活跃态
- 背景：白色为主
- 禁止：蓝白通用配色、渐变 hero banner、三栏 features section

### 字体

```css
/* 数据/数字/标签 */
font-family: var(--font-family-mono);  /* JetBrains Mono */

/* 标题 */
font-family: var(--font-family-display);  /* Playfair Display */

/* 正文 */
font-family: var(--font-family-base);  /* Inter + 中文回退 */
```

禁止使用 Inter / Roboto / Arial / Helvetica 作为显示字体（Inter 仅在 `--font-family-base` 中作为首选，不单独使用）。

### CSS 命名

BEM 格式，统一 `ud-` 前缀：

```css
/* Good */
.ud-card__accent--danger
.ud-header__nav-item

/* Bad */
.card-accent
.header-nav-item
```

### 动画

- 入场：`cubic-bezier(0.16, 1, 0.3, 1)`（Expo Out）— `var(--transition-expo)`
- 悬停微交互：`cubic-bezier(0.34, 1.56, 0.64, 1)`（Back Out）— `var(--transition-spring)`
- 所有含动画组件必须包含 `prefers-reduced-motion` 媒体查询

### 导入风格

```ts
// 路径别名优先
import Logo from '@/components/common/Logo.vue'
import { useAssessmentState } from '@/composables/useAssessmentState'

// Element Plus 按需引入（unplugin-vue-components 自动处理，无需手动 import）
```

## Boundaries

### ✅ 自主执行
- 在 `refactor/audit-fixes` 分支上修改代码
- 运行 `npm run typecheck` 和 `npm run lint`
- 提交代码并推送到 `refactor/audit-fixes`
- 修改 `src/views/`、`src/components/`、`src/composables/`、`src/styles/` 下的文件

### ⚠️ 先确认
- 修改 `src/data/` 中的静态数据
- 修改 `vite.config.js`、`package.json`、`tsconfig.json` 等配置文件
- 新增 npm 依赖
- 修改路由配置

### 🚫 禁止
- **永远不要 `git merge` 到 master**，除非用户明确要求并已确认
- 永远不要直接在 master 分支上修改
- 不要在 Node.js 安装目录下运行 `npm install`
- 不要硬编码 API Key 或敏感信息
- 不要提交 `.env` 文件
- 不要修改 `.claude/` 目录下的用户级配置

## Common Pitfalls

1. **Git 操作必须在正确分支**：当前开发分支是 `refactor/audit-fixes`，不是 master
2. **提交前 typecheck**：pre-commit hook 会自动运行 `vue-tsc --noEmit`，类型错误会阻断提交
3. **Element Plus 组件自动引入**：项目配置了 `unplugin-vue-components`，无需手动 `import { ElButton } from 'element-plus'`，但图标仍需手动导入
4. **ECharts 按需引入**：使用 `import * as echarts from 'echarts/core'` + 具体模块，不要 `import * as echarts from 'echarts'`
5. **CSS 变量作用域**：`variables.css` 的变量定义在 `:root` 上，全局可用；Assessment.vue 等页面组件的 `scoped` 样式中同样可以直接引用
6. **localStorage 前缀**：所有用户数据通过 `useStorage` composable 存取，自动加 `astropath_` 前缀

## Verification Loop

修改后自验证：
1. `npm run typecheck` — 确保无类型错误
2. `npm run lint` — 确保代码风格正确
3. `npm run build` — 确保构建通过
4. 浏览器验证（Playwright MCP）：`http://localhost:3000` 检查页面渲染
