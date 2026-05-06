# Implementation Plan: 筛选器维度优化

**Branch**: `006-filter-dimensions` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-filter-dimensions/spec.md`

## Summary

扩展 Lenbrary 媒体库的筛选维度，从当前 9 个基础筛选条件扩展为覆盖摄影爱好者核心需求的完整维度体系。关键技术变更包括：(1) 修复日期筛选语义偏差——当前 `dateFrom`/`dateTo` 仅过滤导入时间，需新增拍摄日期维度；(2) 在后端 SQL 查询中新增 `lens_model`、`f_number`、`focal_length`、`exposure_time`、`iso`、GPS 坐标、视频属性等过滤条件；(3) 前端 FilterState 和 FilterBar 组件同步扩展新维度 UI 控件；(4) 新增 API 端点提供可选值列表（镜头、相机、编码格式等）供自动补全使用。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js
**Primary Dependencies**: Express.js (后端), React 19 + shadcn/ui + Tailwind CSS v4 (前端), better-sqlite3 (数据库)
**Storage**: SQLite (better-sqlite3)，已有 `asset_exif`、`asset_video_metadata`、`asset_tags`、`asset_favorites` 表
**Testing**: Vitest (单元/集成/契约测试)
**Target Platform**: 桌面浏览器 (macOS 优先)
**Project Type**: Web application (Express + React SPA)
**Performance Goals**: 5 维度组合筛选 <2s 响应，单维度筛选 <500ms
**Constraints**: SQLite 单文件数据库，离线优先，无外部 API 依赖
**Scale/Scope**: 个人媒体库（数千至数万资产）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 文件为模板状态（未自定义原则），无自定义 Gate 约束。检查通过。

**Post-Phase 1 Re-check**: 设计后重新验证——无违规。

## Project Structure

### Documentation (this feature)

```text
specs/006-filter-dimensions/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── filter-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── migrations/
│   └── V00000010__add_filter_dimension_indexes.sql    # 新增索引
├── types/
│   ├── library.types.ts       # LibraryFilters 扩展
│   └── assets.types.ts        # ExifData, VideoMetadata (已有)
├── services/
│   ├── database.service.ts    # SQL WHERE 扩展 + 可选值查询
│   └── library.service.ts     # parseFilters 扩展 + 可选值 API
├── routes/
│   └── library.routes.ts      # 新增 /api/library/facets 端点
└── ui/react/
    ├── types.ts               # FilterState 扩展
    ├── api.ts                 # createLibraryQuery 扩展 + fetchFacets
    ├── hooks/
    │   └── use-filters.ts     # 扩展 emptyFilters + 交互优化
    └── components/features/
        └── filter-bar.tsx     # 新增筛选维度 UI 控件

tests/
├── contract/
│   └── filter-api.test.ts     # API 契约测试
├── integration/
│   └── filter-dimensions.test.ts  # 端到端筛选测试
└── unit/
    ├── filter-parsing.test.ts     # 参数解析单元测试
    └── filter-state.test.ts       # FilterState 构建测试
```

**Structure Decision**: 沿用现有 monorepo 结构（Express + React SPA），后端和前端代码在同一仓库。新增迁移文件、扩展现有服务和路由、扩展前端组件。

## Complexity Tracking

无 Constitution 违规需要跟踪。
