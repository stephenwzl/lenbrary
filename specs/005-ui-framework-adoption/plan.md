# Implementation Plan: UI 框架采纳与前端重构

**Branch**: `005-ui-framework-adoption` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-ui-framework-adoption/spec.md`

## Summary

将 Lenbrary 前端从手写 CSS + 原生 HTML 元素迁移到 shadcn/ui（基于 Radix UI 无头原语 + Tailwind CSS v4），保留液体玻璃视觉风格，同时提升交互一致性、可访问性和组件可维护性。迁移仅涉及前端渲染层，后端 API 保持不变。

## Technical Context

**Language/Version**: TypeScript 5 + React 19 + Vite 7
**Primary Dependencies**: shadcn/ui, Radix UI, Tailwind CSS v4, Lucide React, Sonner, class-variance-authority, clsx, tailwind-merge
**Storage**: SQLite (后端不变)
**Testing**: Vitest + Playwright（现有测试框架不变）
**Target Platform**: 浏览器 (Chrome/Firefox/Safari 现代版)
**Project Type**: Web application (Express + React SPA)
**Performance Goals**: 前端包体积增长 ≤50%，首屏加载 ≤2s
**Constraints**: 保持液体玻璃视觉风格、暗色主题、WCAG 2.1 AA、prefers-reduced-motion 支持
**Scale/Scope**: 单用户个人媒体库，约 20 个前端组件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 尚未定制（使用模板占位符），跳过门禁检查。采用通用最佳实践原则：

- **KISS**: 使用 shadcn/ui 复制模式而非自建组件库
- **YAGNI**: 不引入状态管理库、路由库或 CSS-in-JS
- **DRY**: 通过自定义 Hooks 提取重复的状态逻辑
- **SRP**: 将 App.tsx 单文件拆分为职责单一的组件和 Hooks

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-framework-adoption/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contract.md   # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app.ts                          # Express 服务 (不变)
├── config/                         # 服务端配置 (不变)
├── middleware/                      # 服务端中间件 (不变)
├── routes/                         # API 路由 (不变)
├── services/                       # 业务逻辑 (不变)
├── types/                          # 共享类型 (不变)
│   └── library.types.ts
└── ui/
    ├── index.html                  # Vite 入口 HTML (更新: 移除 legacy template)
    ├── react/
    │   ├── main.tsx                # React 入口 (更新: 导入 globals.css)
    │   ├── App.tsx                 # 主应用组件 (重构: 使用 Hooks + shadcn/ui)
    │   ├── api.ts                  # API 客户端 (不变)
    │   ├── types.ts                # 前端类型 (不变)
    │   ├── globals.css             # 新增: CSS 变量 + Tailwind 指令 + 玻璃态样式
    │   ├── lib/
    │   │   └── utils.ts            # 新增: cn() 工具函数
    │   ├── hooks/
    │   │   ├── use-library.ts      # 新增: 资产列表 Hook
    │   │   ├── use-import.ts       # 新增: 导入队列 Hook
    │   │   ├── use-selection.ts    # 新增: 选择与批量操作 Hook
    │   │   ├── use-filters.ts      # 新增: 筛选状态 Hook
    │   │   └── use-health.ts       # 新增: 健康状态 Hook
    │   ├── components/
    │   │   ├── ui/                 # shadcn/ui 基础组件
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── checkbox.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── alert-dialog.tsx
    │   │   │   ├── badge.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── skeleton.tsx
    │   │   │   ├── sheet.tsx
    │   │   │   ├── popover.tsx
    │   │   │   ├── command.tsx
    │   │   │   ├── calendar.tsx
    │   │   │   ├── separator.tsx
    │   │   │   ├── tooltip.tsx
    │   │   │   ├── progress.tsx
    │   │   │   ├── accordion.tsx
    │   │   │   └── sonner.tsx
    │   │   ├── layout/
    │   │   │   ├── app-shell.tsx    # 新增: 应用外壳 + 三栏布局
    │   │   │   ├── sidebar.tsx      # 新增: 侧边栏
    │   │   │   ├── content-area.tsx # 新增: 内容区域
    │   │   │   └── detail-panel.tsx # 新增: 详情面板
    │   │   └── features/
    │   │       ├── import-queue.tsx  # 新增: 导入队列
    │   │       ├── asset-grid.tsx    # 新增: 资产网格
    │   │       ├── filter-bar.tsx    # 新增: 筛选栏
    │   │       ├── batch-toolbar.tsx # 新增: 批量操作栏
    │   │       ├── health-panel.tsx  # 新增: 健康面板
    │   │       └── asset-detail.tsx  # 新增: 资产详情
    │   └── styles.css               # 删除: 迁移到 globals.css + Tailwind

tests/
├── contract/
│   ├── react-ui-static.test.ts     # 更新: 新的 CSS 契约断言
│   ├── ui-static.test.ts           # 删除: 旧版 UI 契约
│   └── ... (其他契约测试不变)
├── unit/
│   ├── react-import-state.test.ts  # 更新: 适配新组件结构
│   ├── react-selection-state.test.ts
│   ├── react-grouping-state.test.ts
│   └── react-health-export-state.test.ts
├── integration/                     # (不变)
└── acceptance/                      # (不变)
```

**Structure Decision**: 保持现有的 Web application 结构（Express 单体 + React SPA），不拆分为独立前后端项目。前端组件按 `ui/`（框架组件）、`layout/`（布局组件）、`features/`（业务组件）三层组织。

## Complexity Tracking

无宪章违规需要记录。
