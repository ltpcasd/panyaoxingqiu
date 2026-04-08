# 阿里云函数计算自定义运行时Dockerfile
# 用于构建潘瑶星球后端服务

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY dist ./dist
COPY bootstrap ./

# 创建数据目录
RUN mkdir -p /mnt/data

# 设置权限
RUN chmod +x bootstrap

# 暴露端口
EXPOSE 9000

# 启动命令
ENTRYPOINT ["./bootstrap"]
