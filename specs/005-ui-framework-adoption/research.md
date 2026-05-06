# Research: UI 框架采纳与前端重构

**Feature Branch**: `005-ui-framework-adoption`
**Date**: 2026-05-06

## Decision 1: UI 组件框架选择

**Decision**: 采用 shadcn/ui（基于 Radix UI 无头原语 + Tailwind CSS）

**Rationale**:
1. **玻璃态风格天然适配**: CSS 变量主题系统 + Tailwind 的 `backdrop-blur`/`bg-white/10` 让液体玻璃效果几乎开箱即用；`shadcn-glass-ui` 扩展库已提供 59 个玻璃态组件
2. **组件覆盖完整**: Dialog, AlertDialog, Select, DropdownMenu, Tabs, Accordion, Toast, Progress, Card, Badge, Skeleton, Sheet (侧面板) — 全部覆盖需求
3. **极小包体积**: ~18KB gzip（按需引入，代码复制到项目中，无运行时库开销）
4. **无 CSS-in-JS**: 纯 CSS 变量 + Tailwind 工具类，无需引入 Emotion/styled-components
5. **代码所有权**: 组件源码直接复制到项目中，可自由修改液体玻璃样式而不"对抗"库的默认行为
6. **可访问性**: 底层 Radix UI 提供完整 WAI-ARIA 支持

**Alternatives considered**:
- **Ant Design / MUI**: 强设计观点与玻璃态根本冲突，包体积过大（100-180KB gzip），大量样式覆盖工作
- **Chakra UI**: 中等适配度，但 CSS-in-JS (Emotion) 增加构建复杂度和运行时开销
- **NextUI/HeroUI**: 暗色主题支持好，但 v3 较新生态不成熟，依赖 framer-motion 增加包体积
- **Headless UI**: 组件覆盖严重不足（仅 10 个组件），需大量自建
- **Radix UI 纯无头**: 最大控制权但工作量显著增加，需自行实现 Card/Skeleton/Toast 等组件
- **Park UI**: 社区太小，遇到问题难以找到解决方案

## Decision 2: Tailwind CSS 版本与配置策略

**Decision**: 采用 Tailwind CSS v4，使用 `@tailwindcss/vite` 插件

**Rationale**:
- Tailwind v4 是当前最新稳定版，与 Vite 7 和 shadcn/ui 最新版完全兼容
- v4 使用 CSS-first 配置（`@theme` 指令），不再需要 `tailwind.config.js`
- `@tailwindcss/vite` 提供零配置的 Vite 集成，比 PostCSS 方案更快
- shadcn/ui 最新版已支持 Tailwind v4

**Alternatives considered**:
- **Tailwind v3**: 仍需 `tailwind.config.js`，配置更繁琐；v4 是明确的方向
- **PostCSS 方案**: v4 推荐使用 Vite 插件而非 PostCSS，构建速度更快

## Decision 3: 路径别名配置

**Decision**: 配置 `@/` 路径别名指向 `src/ui/react/` 目录

**Rationale**:
- shadcn/ui 组件使用 `@/components/ui/button` 风格的导入路径
- 当前 Vite root 是 `src/ui/`，但 React 组件在 `src/ui/react/` 下
- 别名需要在 Vite (`resolve.alias`) 和 TypeScript (`compilerOptions.paths`) 中同步配置
- 注意 tsconfig.json 的 `rootDir` 是 `./src`，但 `include` 已经包含 `src/**/*`

**Implementation details**:
- `vite.config.ts`: `resolve.alias: { '@': path.resolve(__dirname, 'src/ui/react') }`
- `tsconfig.json`: `paths: { "@/*": ["./src/ui/react/*"] }`
- shadcn/ui 的 `components.json` 中配置 `aliases` 指向 `@/components`

## Decision 4: 液体玻璃主题实现方式

**Decision**: 通过 CSS 变量 + Tailwind `@theme` 扩展 + shadcn/ui 主题层实现液体玻璃风格

**Rationale**:
- shadcn/ui 的主题系统基于 CSS 变量（`--background`, `--foreground`, `--card` 等）
- 只需将这些变量设为半透明值，加上 `backdrop-blur` 工具类，即可实现玻璃态
- 核心映射关系：
  - `--background`: 半透明渐变背景
  - `--card`: 玻璃面板背景
  - `--border`: 高光边框色
  - `--ring`: 焦点环色
  - 新增 `--glass-blur`、`--glass-saturate` 变量控制模糊强度
- 保持 `.glass-panel` 作为语义化类名，但内部实现迁移到 Tailwind 工具类

**Implementation approach**:
1. 在 `src/ui/react/globals.css` 中定义 CSS 变量主题
2. 使用 Tailwind `@theme` 指令注册自定义令牌
3. shadcn/ui 组件通过 `className` 附加 `backdrop-blur-xl` 等工具类
4. 状态颜色（success/warning/danger/info）通过 CSS 变量注入 shadcn/ui 的 `--destructive` 等

## Decision 5: 组件文件组织

**Decision**: 在 `src/ui/react/` 下创建 `components/ui/` 目录存放 shadcn/ui 组件

**Rationale**:
- 遵循 shadcn/ui 的标准目录结构
- 组件源码直接复制到项目中（shadcn/ui 的模式）
- 目录结构：
  ```
  src/ui/react/
  ├── components/
  │   ├── ui/          # shadcn/ui 基础组件（Button, Dialog, Select 等）
  │   ├── layout/      # 布局组件（AppShell, Sidebar, ContentArea, DetailPanel）
  │   └── features/    # 业务组件（ImportQueue, AssetGrid, FilterBar, BatchToolbar 等）
  ├── hooks/           # 自定义 Hooks
  ├── lib/             # 工具函数（cn, formatDate 等）
  ├── globals.css      # 全局样式 + CSS 变量 + Tailwind 指令
  ├── main.tsx         # 入口
  ├── App.tsx          # 主应用组件
  ├── api.ts           # API 客户端
  └── types.ts         # 类型定义
  ```

**Alternatives considered**:
- **扁平结构**: 所有组件放在同一目录，难以区分框架组件和业务组件
- **按功能域分目录**: 过度设计，当前应用只有一个域

## Decision 6: 状态管理策略

**Decision**: 继续使用 React useState + 自定义 Hooks，不引入外部状态管理库

**Rationale**:
- 当前 10 个 useState 集中在 App 组件中，通过提取自定义 Hooks（`useLibrary`, `useImport`, `useSelection`, `useFilters`）即可解决
- 应用是单页面、单用户、本地部署，无需复杂状态管理
- 引入 zustand/jotai 等会增加依赖复杂度，YAGNI

**Hook 提取方案**:
- `useLibrary(filters)`: 资产列表、加载状态、刷新逻辑
- `useImport()`: 导入队列、摘要、上传逻辑
- `useSelection()`: 选中资产、选中 ID、批量操作
- `useFilters()`: 筛选状态、活跃筛选计数、更新和清除
- `useHealth()`: 健康状态、刷新逻辑

## Decision 7: 图标库选择

**Decision**: 使用 Lucide React

**Rationale**:
- shadcn/ui 默认图标库，组件示例全部使用 Lucide
- 提供 1500+ SVG 图标，按需引入
- 包体积小（每个图标约 200-500 bytes gzip）
- 包含媒体库所需的所有图标：Upload, Image, Video, Star, Tag, Trash, Filter, Search, Heart, X, Check, AlertTriangle, Info, ChevronDown, Calendar, Camera, Layers, Grid, List, RefreshCw, Download, File, Folder

## Decision 8: Toast/通知实现

**Decision**: 使用 shadcn/ui 的 Sonner 组件（基于 Sonner 库）

**Rationale**:
- shadcn/ui 官方推荐 Sonner 作为 Toast 解决方案
- 支持成功/错误/警告/信息四种类型
- 支持自定义样式，可以应用液体玻璃风格
- 支持堆叠、自动消失、可操作按钮
- 替代当前的行内反馈区域

**Alternatives considered**:
- **shadcn/ui Toast**: Radix 原语实现，API 较低层，需要更多自建
- **react-hot-toast**: 功能较弱，定制性不足

## Decision 9: 日期选择方案

**Decision**: 使用 shadcn/ui 的 Calendar + Popover 组合实现日期范围选择

**Rationale**:
- shadcn/ui 提供 `Calendar` 组件（基于 Radix/react-day-picker）
- 日期范围通过两个 Calendar 实例或 `mode="range"` 实现
- Popover 提供下拉弹出交互
- 无需引入重量级的日期库（如 react-datepicker）

## Decision 10: 旧版前端代码处理

**Decision**: 迁移完成后删除旧版前端文件

**Rationale**:
- `src/ui/app.js` (489 行) 和 `src/ui/styles.css` (527 行) 已被 React 版本完全取代
- `src/ui/app.ts` 是旧版的类型定义参考文件，已无作用
- 保留这些文件会混淆新贡献者，且 `tests/contract/ui-static.test.ts` 仍在验证旧版契约
- 迁移完成后，同时删除旧版契约测试和 legacy HTML template 中的 DOM ID 契约

**Removal list**:
- `src/ui/app.js`
- `src/ui/app.ts`
- `src/ui/styles.css`
- `tests/contract/ui-static.test.ts`
- `src/ui/index.html` 中的 `<template id="legacy-static-contract">` 块
