# UI Contract: 液体玻璃视觉与交互契约

**Feature Branch**: `005-ui-framework-adoption`
**Date**: 2026-05-06

## Purpose

定义迁移到 shadcn/ui 后必须保持的视觉和交互契约，确保液体玻璃设计语言不被框架引入而破坏。

## Visual Primitives (视觉原语)

### VP-001: Glass Panel

所有主区域面板必须呈现液体玻璃效果：

- 背景使用半透明渐变（至少两层 rgba 白色，从 0.16 到 0.07）
- `backdrop-filter: blur()` 不低于 20px
- 1px 高光边框（rgba 白色不低于 0.18）
- 深度阴影（外阴影 + 内阴影高光）

**适用区域**: toolbar, sidebar, content sections, detail panel, import queue, batch toolbar

**验证方式**: CSS 文件中必须包含 `backdrop-filter` 和 `.glass-panel` 或等效实现

### VP-002: Dark Theme

应用默认为暗色主题：

- 页面背景深色（明度低于 15%）
- 文字颜色高对比度（与背景对比度不低于 12:1）
- 所有面板和控件使用半透明而非不透明背景

**验证方式**: 构建产物中 `:root` 或 `@layer base` 中声明 `color-scheme: dark`

### VP-003: Status Colors

四种语义状态色必须保持一致：

| 状态 | 颜色族 | 应用场景 |
|------|--------|----------|
| Success | 绿色系 | 已接受、操作成功 |
| Info | 蓝色系 | 重复、信息提示 |
| Warning | 黄色系 | 不支持、警告 |
| Danger | 红色系 | 失败、危险操作 |

**验证方式**: CSS 变量中存在 `--status-success`, `--status-info`, `--status-warning`, `--status-danger`

### VP-004: Focus Ring

所有交互元素在 `focus-visible` 时显示焦点环：

- 颜色与 success 色族一致
- outline 宽度 2-3px
- outline-offset 2px
- 不使用 box-shadow 模拟焦点环

**验证方式**: CSS 中存在 `focus-visible` 选择器和焦点环定义

## Interaction Contracts (交互契约)

### IC-001: Keyboard Navigation

所有交互元素可通过 Tab 键到达：

- 使用原生或 Radix 提供的焦点管理
- 焦点顺序与视觉布局一致
- Dialog/Sheet 打开时焦点陷阱，关闭时焦点返回触发元素

### IC-002: Reduced Motion

`prefers-reduced-motion: reduce` 时：

- 所有 CSS `transition` 设为 `none`
- 所有 CSS `animation` 设为 `none`
- `scroll-behavior` 设为 `auto`
- 组件级动画（如 Dialog 弹出）直接显示而非动画过渡

**验证方式**: CSS 中存在 `prefers-reduced-motion` 媒体查询

### IC-003: Dialog Confirmation

批量删除必须使用应用内确认对话框：

- 不得使用 `window.confirm()` 或 `window.alert()`
- 对话框必须显示受影响的资产数量
- 提供明确的确认和取消操作
- 模态遮罩阻止背景交互

**验证方式**: 源码中不存在 `window.confirm` 或 `window.alert` 调用

### IC-004: Toast Notifications

操作结果使用非阻断通知：

- 成功操作：3 秒自动消失
- 部分失败：5 秒自动消失，显示失败数量
- 完全失败：需手动关闭，显示错误信息
- 不使用行内反馈区域替代 Toast

### IC-005: Responsive Layout

三档响应式布局：

| 断点 | 布局 | 侧边栏 | 详情面板 |
|------|------|--------|----------|
| > 1050px | 三栏 | 固定左侧栏 | 固定右侧栏 |
| 680-1050px | 单栏 | Sheet 从左滑入 | Sheet 从右滑入 |
| < 680px | 单栏紧凑 | Sheet 从左滑入 | Sheet 从右滑入 |

## Component Mapping (组件映射)

### 替换映射

| 当前实现 | 迁移目标 | shadcn/ui 组件 |
|---------|---------|---------------|
| `<button>` | `<Button>` | Button |
| `<input type="text">` | `<Input>` | Input |
| `<input type="date">` | `<Popover>+<Calendar>` | Popover + Calendar |
| `<input type="file">` | 自定义上传按钮 | Button + hidden input |
| `<select>` | `<Select>` | Select |
| `<input type="checkbox">` | `<Checkbox>` | Checkbox |
| `window.confirm()` | `<AlertDialog>` | AlertDialog |
| 行内反馈 `<section>` | `<Toaster>` | Sonner |
| 标签芯片 `<span>` | `<Badge>` | Badge |
| 资产卡片 `<article>` | `<Card>` | Card |
| 详情面板 `<aside>` | `<Sheet>` (窄屏) | Sheet |

## Data Test IDs (测试标识)

以下 `data-testid` 属性在迁移后必须保留：

| testid | 当前位置 | 迁移后位置 |
|--------|---------|-----------|
| `file-input` | 文件选择器 | 导入区域 |
| `feedback-region` | 反馈区域 | 由 Toaster 替代，保留 aria-live |
| `health-panel` | 健康面板 | 健康区域 |
| `import-queue` | 导入队列 | 导入队列区域 |
| `asset-results` | 资产列表 | 资产列表区域 |
| `asset-detail` | 详情面板 | 详情面板 |

## Breaking Changes

| 变更 | 影响 | 缓解措施 |
|------|------|----------|
| CSS 类名从自定义类迁移到 Tailwind 工具类 | 依赖类名的测试 | 使用 data-testid 替代类名选择器 |
| `.glass-panel` 可能变为组合类 | CSS 契约测试 | 更新测试断言为验证 CSS 变量和 backdrop-filter |
| 行内反馈区域移除 | `feedback-region` testid | 迁移到 Toaster，保持 aria-live 语义 |
| 旧版前端文件删除 | 旧版契约测试 | 删除 `tests/contract/ui-static.test.ts` |
