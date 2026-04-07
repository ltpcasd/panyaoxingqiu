# 潘瑶星球 - 后端服务

> 情侣互动微信小程序后端 API 服务

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| NestJS | 10.x | 后端框架 |
| TypeScript | 5.x | 编程语言 |
| MySQL | 8.0 | 关系型数据库 |
| Redis | 7.x | 缓存/会话存储 |
| TypeORM | 0.3.x | ORM 框架 |

## 项目结构

```
panyaoxingqiu-server/
├── apps/
│   └── api-gateway/              # API 网关（主服务）
│       └── src/
│           ├── modules/
│           │   ├── auth/         # 认证模块（微信登录/JWT）
│           │   ├── users/        # 用户模块
│           │   ├── couples/      # 配对模块
│           │   ├── timeline/     # 时光轴模块
│           │   ├── album/        # 相册模块
│           │   ├── quiz/         # 默契考验模块
│           │   ├── tasks/        # 任务模块
│           │   ├── messages/     # 信箱模块
│           │   ├── notifications/# 通知模块
│           │   └── upload/       # 文件上传模块
│           ├── app.module.ts
│           └── main.ts
├── libs/
│   ├── common/                   # 公共库（守卫/拦截器/装饰器）
│   ├── database/                 # 数据库库（实体/仓储）
│   └── redis/                    # Redis 库
├── migrations/
│   ├── 001_init_schema.sql       # 数据库建表脚本
│   └── 002_seed_data.sql         # 初始化种子数据
├── docker/
│   └── mysql/my.cnf              # MySQL 配置
├── docker-compose.yml            # Docker 编排
├── Dockerfile                    # 容器化配置
├── .env.example                  # 环境变量示例
└── package.json
```

## 快速开始

### 方式一：Docker Compose（推荐）

#### 1. 克隆项目并进入目录

```bash
cd d:\ai项目\ai-test-demo\后端\panyaoxingqiu-server
```

#### 2. 创建环境变量文件

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填写以下必要配置：
- `WX_APPID` - 微信小程序 AppID
- `WX_SECRET` - 微信小程序 AppSecret
- `JWT_SECRET` - JWT 密钥（建议使用随机字符串）
- `DB_PASSWORD` - MySQL 密码（自定义）

#### 3. 启动所有服务

```bash
docker-compose up -d
```

首次启动会自动：
- 创建 MySQL 数据库和所有表
- 导入初始种子数据（默契题库、任务数据）
- 启动 Redis 缓存服务
- 启动 API 网关服务

#### 4. 验证服务

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api-gateway

# 测试 API
curl http://localhost:3000/api/v1/health
```

---

### 方式二：本地开发

#### 前置条件

- Node.js 18+
- MySQL 8.0
- Redis 7.x

#### 1. 安装依赖

```bash
cd d:\ai项目\ai-test-demo\后端\panyaoxingqiu-server
npm install
```

#### 2. 配置数据库

在 MySQL 中执行建表脚本：

```bash
mysql -u root -p < migrations/001_init_schema.sql
mysql -u root -p panyaoxingqiu < migrations/002_seed_data.sql
```

#### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填写数据库、Redis、微信配置。

#### 4. 启动开发服务

```bash
npm run start:dev
```

#### 5. 访问 API 文档

打开浏览器：[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

---

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | 否 | `development` | 运行环境 |
| `PORT` | 否 | `3000` | 监听端口 |
| `DB_HOST` | 是 | `localhost` | MySQL 主机 |
| `DB_PORT` | 否 | `3306` | MySQL 端口 |
| `DB_USERNAME` | 是 | - | 数据库用户名 |
| `DB_PASSWORD` | 是 | - | 数据库密码 |
| `DB_DATABASE` | 否 | `panyaoxingqiu` | 数据库名 |
| `REDIS_HOST` | 是 | `localhost` | Redis 主机 |
| `REDIS_PORT` | 否 | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 否 | - | Redis 密码 |
| `JWT_SECRET` | 是 | - | JWT 密钥 |
| `JWT_EXPIRES_IN` | 否 | `7d` | JWT 有效期 |
| `WX_APPID` | 是 | - | 微信小程序 AppID |
| `WX_SECRET` | 是 | - | 微信小程序 AppSecret |
| `OSS_ENABLED` | 否 | `false` | 是否启用 OSS |
| `OSS_REGION` | 否 | - | OSS 区域 |
| `OSS_ACCESS_KEY_ID` | 否 | - | OSS AccessKey |
| `OSS_ACCESS_KEY_SECRET` | 否 | - | OSS AccessSecret |
| `OSS_BUCKET` | 否 | - | OSS Bucket 名称 |
| `CDN_BASE_URL` | 否 | - | CDN 域名 |

---

## API 接口文档

### 在线文档

开发环境启动后访问：`http://localhost:3000/api/v1/docs`

### 接口规范

**Base URL:** `http://your-server/api/v1`

**认证方式：** Bearer Token
```
Authorization: Bearer <JWT_TOKEN>
```

**统一响应格式：**
```json
{
  "code": 200,
  "data": {},
  "message": "success",
  "timestamp": 1703000000000,
  "requestId": "uuid-xxx"
}
```

### 接口列表

#### 认证模块 `/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 微信小程序登录 |
| POST | `/auth/refresh` | 刷新 Token |
| POST | `/auth/logout` | 退出登录 |

#### 用户模块 `/users`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users/me` | 获取当前用户信息 |
| PUT | `/users/me` | 更新用户资料 |
| PUT | `/users/me/settings` | 更新用户设置 |

#### 配对模块 `/couples`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/couples` | 创建配对（获取配对码）|
| GET | `/couples/me` | 获取当前配对信息 |
| PUT | `/couples/me` | 更新配对信息 |
| POST | `/couples/me/bind` | 绑定配对（输入对方配对码）|
| PUT | `/couples/me/background` | 更新背景图 |
| DELETE | `/couples/me` | 解除配对 |
| GET | `/couples/pair-code/:code` | 验证配对码 |

#### 时光轴模块 `/timeline`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/timeline` | 创建事件 |
| GET | `/timeline` | 获取事件列表 |
| GET | `/timeline/important` | 获取重要纪念日 |
| GET | `/timeline/:id` | 获取事件详情 |
| PUT | `/timeline/:id` | 更新事件 |
| DELETE | `/timeline/:id` | 删除事件 |

#### 相册模块 `/albums`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/albums` | 创建相册 |
| GET | `/albums` | 获取相册列表 |
| GET | `/albums/:albumId` | 获取相册详情 |
| PUT | `/albums/:albumId` | 更新相册 |
| DELETE | `/albums/:albumId` | 删除相册 |
| POST | `/albums/:albumId/photos` | 上传照片 |
| GET | `/albums/:albumId/photos` | 获取照片列表 |
| DELETE | `/albums/photos/:photoId` | 删除照片 |

#### 默契考验模块 `/quiz`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/quiz/questions` | 获取题目列表 |
| GET | `/quiz/today` | 获取今日题目 |
| POST | `/quiz/submit` | 提交答题 |
| GET | `/quiz/records` | 获取答题记录 |
| GET | `/quiz/compatibility` | 获取默契度统计 |

#### 任务模块 `/tasks`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/tasks` | 获取任务列表 |
| GET | `/tasks/today` | 获取今日任务统计 |
| GET | `/tasks/:taskId` | 获取任务详情 |
| POST | `/tasks/:taskId/complete` | 完成任务 |

#### 信箱模块 `/messages`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/messages` | 发送信件 |
| GET | `/messages` | 获取信件列表 |
| GET | `/messages/unread` | 获取未读数量 |
| GET | `/messages/:letterId` | 获取信件详情 |
| DELETE | `/messages/:letterId` | 删除信件 |

#### 通知模块 `/notifications`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/notifications` | 获取通知列表 |
| GET | `/notifications/unread` | 获取未读数量 |
| PATCH | `/notifications/:id/read` | 标记已读 |
| POST | `/notifications/read-all` | 全部标记已读 |

#### 上传模块 `/upload`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/upload/image` | 上传单张图片 |
| POST | `/upload/images` | 批量上传图片 |

---

## 数据库设计

### 表结构概览

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `user_settings` | 用户设置表 |
| `couples` | 配对关系表 |
| `timeline_events` | 时光轴事件表 |
| `albums` | 相册表 |
| `photos` | 照片表 |
| `quiz_questions` | 默契考验题目表 |
| `quiz_records` | 答题记录表 |
| `tasks` | 任务表 |
| `user_tasks` | 用户任务记录表 |
| `letters` | 信件表 |
| `notifications` | 通知表 |

---

## 亲密度等级系统

| 等级 | 称号 | 所需分数 |
|------|------|---------|
| 1 | 初识 | 0 |
| 2 | 相识 | 100 |
| 3 | 熟悉 | 300 |
| 4 | 暧昧 | 600 |
| 5 | 表白 | 1000 |
| 6 | 牵手 | 1500 |
| 7 | 相恋 | 2100 |
| 8 | 热恋 | 2800 |
| 9 | 默契 | 3600 |
| 10 | 依赖 | 4500 |
| 11 | 承诺 | 5500 |
| 12 | 甜蜜恋人 | 6600 |
| 13 | 灵魂伴侣 | 7800 |
| 14 | 命中注定 | 9100 |
| 15 | 永恒之爱 | 10500 |

### 亲密度获取途径

| 行为 | 亲密度 |
|------|--------|
| 发送信件 | +20 |
| 创建时光轴事件 | +10 |
| 上传照片（每张）| +5 |
| 答题正确 | +20 |
| 完成日常任务 | +15 |
| 完成周任务 | +50 |
| 完成挑战任务 | +100 |

---

## 开发注意事项

### IDE 提示的"找不到模块"错误

这类错误均因 `node_modules` 尚未安装导致，执行 `npm install` 后会自动消失。

### 微信小程序配置

1. 在微信公众平台申请小程序
2. 获取 `AppID` 和 `AppSecret`
3. 填写到环境变量中

### OSS 图片上传

开发环境默认使用本地存储（`./uploads` 目录）

生产环境配置阿里云 OSS：
1. 开通阿里云 OSS 服务
2. 创建 Bucket（建议设置 CDN）
3. 填写 `OSS_*` 相关环境变量
4. 设置 `OSS_ENABLED=true`

---

## 生产部署

### 1. 服务器要求

- CPU：2核+
- 内存：4GB+
- 磁盘：50GB+（SSD 推荐）
- OS：Ubuntu 20.04 / CentOS 7+

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash
systemctl start docker
systemctl enable docker
```

### 3. 安装 Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 4. 部署应用

```bash
# 上传项目到服务器
scp -r panyaoxingqiu-server user@server:/app/

# 登录服务器
ssh user@server

# 进入目录
cd /app/panyaoxingqiu-server

# 创建生产环境配置
cp .env.example .env.local
# 编辑 .env.local 填写生产配置

# 启动服务
docker-compose up -d --build

# 查看状态
docker-compose ps
```

### 5. 配置 HTTPS（可选）

推荐使用 Nginx + Let's Encrypt 配置 HTTPS：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 常见问题

**Q: 启动时提示数据库连接失败？**

A: 检查 MySQL 是否运行，以及 `.env.local` 中的数据库配置是否正确。

**Q: 微信登录返回 `invalid code`？**

A: 检查 `WX_APPID` 和 `WX_SECRET` 是否正确，且 code 未过期（5分钟内）。

**Q: 图片上传失败？**

A: 开发环境检查 `uploads` 目录权限；生产环境检查 OSS 配置。

**Q: Redis 连接失败？**

A: 确认 Redis 服务已启动，检查 `REDIS_HOST` 和 `REDIS_PASSWORD` 配置。

---

## 联调说明

后端服务就绪后，请告知前端以下信息：

1. **API Base URL**：`http://your-server:3000/api/v1`
2. **API 文档地址**：`http://your-server:3000/api/v1/docs`（仅开发环境）
3. **认证方式**：Bearer Token（登录接口返回 `token` 字段）

---

*潘瑶星球后端服务 v1.0.0*
