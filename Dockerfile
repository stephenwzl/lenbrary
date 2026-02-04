# 使用 Node.js 22 官方镜像
FROM node:22-bookworm-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
# ffmpeg: 视频处理
# exiftool: 读取图片和视频元数据
# python3: better-sqlite3 编译需要
# make/g++: 编译原生模块
RUN apt-get update && apt-get install -y \
    ffmpeg \
    exiftool \
    python3 \
    make \
    g++ \
    pkg-config \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安装生产依赖
RUN npm ci --only=production

# 安装 TypeScript 和构建工具（仅用于构建时）
RUN npm install -D typescript

# 复制源代码
COPY tsconfig.json ./
COPY src/ ./src/

# 构建项目
RUN npx tsc

# 删除开发依赖以减小镜像体积
RUN npm prune --production

# 创建必要的目录
RUN mkdir -p /app/uploads /app/data /app/tmp

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3000 \
    UPLOAD_DIR=/app/uploads \
    TEMP_DIR=/app/tmp \
    THUMBNAIL_SIZE=512 \
    DB_PATH=/app/data/assets.db

# 启动应用
CMD ["npm", "start"]
