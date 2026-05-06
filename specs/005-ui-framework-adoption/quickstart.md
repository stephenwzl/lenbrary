# Quickstart: UI 框架采纳与前端重构验证

**Feature Branch**: `005-ui-framework-adoption`
**Date**: 2026-05-06

## Prerequisites

- Node.js >= 20
- npm >= 10
- 运行中的 Express 后端（`npm run dev:server`）

## Setup

```bash
# 安装依赖（包含新增的 Tailwind CSS、shadcn/ui 相关包）
npm install

# 初始化 shadcn/ui（如果尚未初始化）
npx shadcn@latest init
```

## Development

```bash
# 终端 1: 启动后端
npm run dev:server

# 终端 2: 启动 Vite 前端开发服务器
npm run dev:ui
```

访问 http://127.0.0.1:5173

## Validation Steps

### Step 1: 液体玻璃视觉验证

1. 打开应用，确认暗色主题
2. 检查所有面板（toolbar, sidebar, content, detail）呈现半透明玻璃效果
3. 调整窗口大小，面板背景应有模糊效果
4. 验证焦点环在 Tab 导航时清晰可见

**Expected**: 所有面板呈现液体玻璃风格，与迁移前视觉一致

### Step 2: 导入交互验证

1. 点击导入按钮，选择多个不同类型的媒体文件
2. 验证文件选择器支持多文件
3. 观察导入队列：每种状态有图标和颜色区分
4. 验证进度指示平滑更新
5. 检查失败项有明确的错误描述

**Expected**: 导入流程交互比旧版更清晰，状态视觉区分明显

### Step 3: 筛选交互验证

1. 展开各筛选下拉菜单，验证选项可滚动
2. 在标签输入框输入文字，验证自动补全
3. 设置日期范围，验证日期选择器可用
4. 应用多个筛选条件，验证活跃条件以芯片形式显示
5. 点击清除按钮，验证所有筛选被重置

**Expected**: 筛选交互更紧凑、更直观

### Step 4: 批量操作验证

1. 选择 3+ 个资产
2. 验证浮动工具栏出现，显示选择数量
3. 点击批量删除，验证 AlertDialog 弹出（非浏览器原生弹窗）
4. 确认对话框显示影响数量
5. 执行操作后验证 Toast 通知反馈

**Expected**: 批量操作有专业的交互流程和反馈

### Step 5: 详情面板验证

1. 点击资产卡片打开详情
2. 验证元数据按类别分组
3. 编辑标签，输入文字后验证下拉搜索
4. 在窄屏下验证详情以 Sheet 形式从右侧滑入

**Expected**: 详情面板信息层次清晰，标签编辑更方便

### Step 6: 响应式验证

1. 在 >1050px 宽度下验证三栏布局
2. 缩小到 680-1050px 验证单栏布局
3. 缩小到 <680px 验证紧凑布局
4. 在窄屏下点击筛选图标，验证侧边栏以 Sheet 滑入

**Expected**: 三档布局切换平滑

### Step 7: 无障碍验证

1. 使用 Tab 键遍历所有交互元素，验证焦点环
2. 打开浏览器设置 `prefers-reduced-motion`，验证动画被禁用
3. 使用屏幕阅读器验证 aria-label 和 aria-live 区域

**Expected**: 键盘和辅助技术可用

## Automated Validation

```bash
# 运行全量测试
npm test

# 运行类型检查
npm run typecheck

# 运行 lint
npm run lint

# 构建生产版本
npm run build

# 验证构建产物
ls -la dist/ui/
```

## Key Files to Verify

| 文件 | 验证内容 |
|------|----------|
| `src/ui/react/globals.css` | CSS 变量、Tailwind 指令、玻璃态样式 |
| `src/ui/react/components/ui/` | shadcn/ui 组件是否正确安装 |
| `src/ui/react/App.tsx` | 使用 shadcn/ui 组件替代原生 HTML |
| `vite.config.ts` | 路径别名和 Tailwind 插件配置 |
| `tsconfig.json` | 路径别名配置 |
| `package.json` | 新增依赖列表 |

## Rollback

如果迁移出现严重问题，可以回退到迁移前的状态：

```bash
git checkout main -- src/ui/react/
git checkout main -- vite.config.ts tsconfig.json package.json
npm install
```
