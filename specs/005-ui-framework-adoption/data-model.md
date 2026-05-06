# Data Model: UI 框架采纳与前端重构

**Feature Branch**: `005-ui-framework-adoption`
**Date**: 2026-05-06

## Overview

本次迁移不涉及后端数据模型变更。数据模型主要描述前端侧的主题令牌系统、组件状态映射和交互模式。

## Theme Tokens (主题令牌)

### 全局设计令牌

| 令牌名 | 用途 | 暗色主题值 |
|--------|------|-----------|
| `--background` | 页面背景 | `#111b1f` |
| `--foreground` | 主文字 | `#eef7f4` |
| `--card` | 面板背景 | `rgba(255, 255, 255, 0.12)` |
| `--card-foreground` | 面板文字 | `#eef7f4` |
| `--popover` | 弹出层背景 | `rgba(255, 255, 255, 0.14)` |
| `--popover-foreground` | 弹出层文字 | `#eef7f4` |
| `--primary` | 主要操作 | `rgba(134, 239, 172, 0.82)` |
| `--primary-foreground` | 主要操作文字 | `#111b1f` |
| `--secondary` | 次要操作 | `rgba(255, 255, 255, 0.1)` |
| `--secondary-foreground` | 次要操作文字 | `#eef7f4` |
| `--muted` | 柔和背景 | `rgba(255, 255, 255, 0.06)` |
| `--muted-foreground` | 柔和文字 | `rgba(238, 247, 244, 0.72)` |
| `--accent` | 强调背景 | `rgba(255, 255, 255, 0.12)` |
| `--accent-foreground` | 强调文字 | `#eef7f4` |
| `--destructive` | 危险操作 | `rgba(248, 113, 113, 0.65)` |
| `--destructive-foreground` | 危险操作文字 | `#111b1f` |
| `--border` | 边框 | `rgba(255, 255, 255, 0.18)` |
| `--input` | 输入框边框 | `rgba(255, 255, 255, 0.18)` |
| `--ring` | 焦点环 | `rgba(134, 239, 172, 0.7)` |

### 玻璃态扩展令牌

| 令牌名 | 用途 | 值 |
|--------|------|-----|
| `--glass-bg` | 玻璃面板渐变 | `linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))` |
| `--glass-border` | 玻璃面板边框 | `rgba(255, 255, 255, 0.22)` |
| `--glass-shadow` | 玻璃面板阴影 | `0 24px 80px rgba(0,0,0,0.32), inset 0 1px rgba(255,255,255,0.28)` |
| `--glass-blur` | 背景模糊 | `22px` |
| `--glass-saturate` | 饱和度增强 | `1.5` |

### 语义状态令牌

| 令牌名 | 用途 | 值 |
|--------|------|-----|
| `--status-success` | 成功/已接受 | `rgba(134, 239, 172, 0.5)` |
| `--status-info` | 信息/重复 | `rgba(125, 211, 252, 0.55)` |
| `--status-warning` | 警告/不支持 | `rgba(253, 224, 71, 0.6)` |
| `--status-danger` | 危险/失败 | `rgba(248, 113, 113, 0.65)` |

## Component State Mapping (组件状态映射)

### 交互元素状态

| 组件类型 | default | hover | focus | active | disabled |
|---------|---------|-------|-------|--------|----------|
| Button | `--secondary` bg | 亮度 +10% | `--ring` outline | 亮度 -5% | opacity 0.45 |
| Input | `--input` border | `--input` border | `--ring` outline + ring | N/A | opacity 0.45 |
| Select | `--input` border | 亮度 +5% | `--ring` outline | N/A | opacity 0.45 |
| Checkbox | transparent | 亮度 +5% | `--ring` outline | `--primary` bg | opacity 0.45 |

### 导入状态映射

| 状态 | 图标 (Lucide) | 颜色令牌 | 标签 |
|------|-------------|---------|------|
| queued | `Clock` | `--muted-foreground` | 排队中 |
| uploading | `Loader2` (spin) | `--status-info` | 上传中 |
| accepted | `CheckCircle2` | `--status-success` | 已接受 |
| duplicate | `Copy` | `--status-info` | 重复 |
| unsupported | `AlertTriangle` | `--status-warning` | 不支持 |
| failed | `XCircle` | `--status-danger` | 失败 |

## Interaction Patterns (交互模式)

### Dialog 模式

| 场景 | 组件 | 行为 |
|------|------|------|
| 删除确认 | AlertDialog | 模态遮罩 + 玻璃面板，显示影响数量，确认/取消按钮 |
| 标签编辑 | Popover + Command | 点击标签区域弹出搜索面板，支持多选 |

### Sheet/Drawer 模式

| 场景 | 方向 | 触发条件 |
|------|------|----------|
| 资产详情 | 从右侧滑入 | 点击资产卡片 |
| 侧边栏筛选 | 从左侧滑入 | 窄屏下点击筛选图标 |

### Toast 模式

| 场景 | 类型 | 持续时间 |
|------|------|----------|
| 操作成功 | success | 3 秒 |
| 操作部分失败 | warning | 5 秒 |
| 操作失败 | error | 手动关闭 |
| 信息提示 | info | 3 秒 |

### Dropdown 模式

| 场景 | 组件 | 内容 |
|------|------|------|
| 媒体类型筛选 | Select | 可滚动选项列表 |
| 分组模式 | Select | 4 个固定选项 |
| 收藏/缩略图/元数据筛选 | Select | 3 个布尔选项 |
| 标签选择 | Popover + Command | 可搜索的标签列表 |
