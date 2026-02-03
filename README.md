# Lenbrary Server

一个基于 Express 的资产管理服务器，支持图片和视频的上传、存储、处理和管理。

## 功能特性

- 文件上传（支持图片和视频）
- 文件类型自动检测
- 图片缩略图生成
- EXIF 数据提取（仅图片）
- 资源 CRUD 操作
- SQLite 数据库存储

## 技术栈

- Node.js >= 22.18.0
- TypeScript >= 5.x
- Express 4.x
- better-sqlite3
- Sharp (图片处理)
- Multer (文件上传)
- Winston (日志记录)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 生产构建

```bash
npm run build
npm start
```

## 环境变量

创建 `.env` 文件在项目根目录：

```env
PORT=3000
UPLOAD_DIR=./uploads
TEMP_DIR=./tmp
THUMBNAIL_SIZE=512
DB_PATH=./data/assets.db
LOG_LEVEL=info
```

## API 文档

### 健康检查

```http
GET /api
```

响应：

```json
{
  "name": "lenbrary-server",
  "version": "1.0.0",
  "status": "ok"
}
```

### 上传文件

```http
POST /api/assets/upload
Content-Type: multipart/form-data

file: <binary>
```

响应：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "original_name": "example.jpg",
    "stored_name": "uuid.jpg",
    "file_path": "/path/to/file",
    "thumbnail_path": "/path/to/thumbnail",
    "mime_type": "image/jpeg",
    "file_type": "image",
    "file_size": 123456,
    "width": 1920,
    "height": 1080,
    "created_at": 1234567890,
    "exif": { ... }
  }
}
```

### 获取资源列表

```http
GET /api/assets?limit=20&offset=0&type=image
```

### 获取单个资源

```http
GET /api/assets/:id
```

### 获取资源文件

```http
GET /api/assets/:id/file
```

### 获取缩略图

```http
GET /api/assets/:id/thumbnail
```

### 获取 EXIF 数据

```http
GET /api/assets/:id/exif
```

### 删除资源

```http
DELETE /api/assets/:id
```

## 项目结构

```
src/
├── index.ts                 # 应用入口
├── app.ts                   # Express 应用配置
├── config/
│   ├── index.ts             # 配置导出
│   └── schema.sql           # 数据库 schema
├── routes/
│   ├── index.ts             # 路由聚合
│   └── assets.routes.ts     # assets 路由
├── services/
│   ├── database.service.ts  # 数据库服务
│   ├── image.service.ts     # 图片处理服务
│   └── storage.service.ts   # 文件存储服务
├── types/
│   └── assets.types.ts      # 类型定义
├── middleware/
│   ├── error-handler.ts     # 错误处理
│   ├── logger.ts            # 日志记录
│   ├── request-logger.ts    # 请求日志
│   └── upload.ts            # 文件上传中间件
└── utils/
    └── database.ts          # 数据库初始化
```

## 开发

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run typecheck
```

### 运行测试

```bash
npm test
```

### 清理构建文件

```bash
npm run clean
```

## 许可证

MIT
