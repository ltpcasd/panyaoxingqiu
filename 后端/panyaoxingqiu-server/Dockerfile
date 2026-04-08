# 使用 Node.js 18 Alpine 镜像
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 安装依赖（允许 sqlite3 等原生模块编译）
RUN npm install

# 再次确保所有依赖安装完整
RUN npm install

# 复制源代码
COPY apps/ ./apps/
COPY libs/ ./libs/

# 构建应用
RUN npm run build:api-gateway

# =================== 生产镜像 ===================
FROM node:18-alpine AS production

WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# 创建上传目录和 SQLite 数据目录
RUN mkdir -p uploads data

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main"]
