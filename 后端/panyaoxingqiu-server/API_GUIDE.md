# 潘瑶星球后端服务 - 前端联调指南

## 🚀 快速开始

### 1. 环境准备

确保本地已安装以下环境：
- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 6.x

### 2. 数据库配置

```bash
# 1. 创建数据库（或执行迁移脚本）
mysql -u root -p < migrations/001_init_schema.sql

# 2. 初始化基础数据
mysql -u root -p panyaoxingqiu < migrations/002_init_data.sql
```

### 3. 环境变量配置

编辑 `.env.local` 文件，修改以下关键配置：

```env
# 数据库密码
DB_PASSWORD=你的MySQL密码

# 微信小程序配置（从微信公众平台获取）
WX_APPID=你的微信AppID
WX_SECRET=你的微信AppSecret
```

### 4. 启动服务

```bash
# 安装依赖
npm install

# 启动开发服务
npm run start:dev
```

服务启动成功后：
- API地址: `http://localhost:3000/api/v1`
- Swagger文档: `http://localhost:3000/api/v1/docs`

---

## 📡 接口列表（共48个）

### 认证模块 (Auth) - 3个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/login` | 微信小程序登录 | ❌ |
| POST | `/auth/refresh` | 刷新Token | ❌ |
| DELETE | `/auth/logout` | 退出登录 | ✅ |

**登录接口示例：**
```typescript
// 请求体
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像URL",
    "gender": 1
  }
}

// 响应
{
  "code": 0,
  "data": {
    "token": "JWT Token",
    "expiresIn": 604800,
    "userInfo": { ... },
    "coupleInfo": { ... } // 可选，已配对时返回
  }
}
```

### 用户模块 (Users) - 5个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/users/me` | 获取当前用户信息 | ✅ |
| PUT | `/users/me` | 更新用户信息 | ✅ |
| PUT | `/users/me/avatar` | 更新用户头像 | ✅ |
| GET | `/users/me/settings` | 获取用户设置 | ✅ |
| PUT | `/users/me/settings` | 更新用户设置 | ✅ |

### 配对模块 (Couples) - 7个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/couples` | 创建配对（获取配对码） | ✅ |
| GET | `/couples/me` | 获取当前配对信息 | ✅ |
| PUT | `/couples/me` | 更新配对信息 | ✅ |
| POST | `/couples/me/bind` | 绑定配对 | ✅ |
| POST | `/couples/me/avatar` | 更新双人头像 | ✅ |
| PUT | `/couples/me/background` | 更新主页背景图 | ✅ |
| DELETE | `/couples/me` | 解除配对 | ✅ |

**配对流程：**
1. 用户A调用 `POST /couples` 创建配对，获取配对码
2. 用户B调用 `POST /couples/me/bind` 绑定配对
3. 双方绑定成功后，可获取配对信息

### 时光轴模块 (Timeline) - 6个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/timeline` | 创建时光轴事件 | ✅ |
| GET | `/timeline` | 获取时光轴列表 | ✅ |
| GET | `/timeline/important` | 获取重要纪念日列表 | ✅ |
| GET | `/timeline/:id` | 获取事件详情 | ✅ |
| PUT | `/timeline/:id` | 更新时光轴事件 | ✅ |
| DELETE | `/timeline/:id` | 删除时光轴事件 | ✅ |

### 相册模块 (Album) - 8个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/albums` | 创建相册 | ✅ |
| GET | `/albums` | 获取相册列表 | ✅ |
| GET | `/albums/:albumId` | 获取相册详情 | ✅ |
| PUT | `/albums/:albumId` | 更新相册信息 | ✅ |
| DELETE | `/albums/:albumId` | 删除相册 | ✅ |
| POST | `/albums/:albumId/photos` | 上传照片到相册 | ✅ |
| GET | `/albums/:albumId/photos` | 获取相册照片列表 | ✅ |
| DELETE | `/albums/photos/:photoId` | 删除照片 | ✅ |

### 默契考验模块 (Quiz) - 5个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/quiz/questions` | 获取题目列表 | ✅ |
| GET | `/quiz/today` | 获取今日题目 | ✅ |
| POST | `/quiz/submit` | 提交答题 | ✅ |
| GET | `/quiz/records` | 获取答题记录 | ✅ |
| GET | `/quiz/compatibility` | 获取默契度统计 | ✅ |

### 任务模块 (Tasks) - 4个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/tasks` | 获取任务列表 | ✅ |
| GET | `/tasks/today` | 获取今日任务统计 | ✅ |
| GET | `/tasks/:taskId` | 获取任务详情 | ✅ |
| POST | `/tasks/:taskId/complete` | 完成任务 | ✅ |

### 信箱模块 (Messages) - 5个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/messages` | 发送信件 | ✅ |
| GET | `/messages` | 获取信件列表 | ✅ |
| GET | `/messages/unread` | 获取未读信件数量 | ✅ |
| GET | `/messages/:letterId` | 获取信件详情 | ✅ |
| DELETE | `/messages/:letterId` | 删除信件 | ✅ |

### 通知模块 (Notifications) - 4个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/notifications` | 获取通知列表 | ✅ |
| GET | `/notifications/unread` | 获取未读通知数量 | ✅ |
| PATCH | `/notifications/:id/read` | 标记通知已读 | ✅ |
| POST | `/notifications/read-all` | 全部标记已读 | ✅ |

### 文件上传模块 (Upload) - 2个接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/upload/image` | 上传单张图片 | ✅ |
| POST | `/upload/images` | 批量上传图片 | ✅ |

**上传类型说明：**
- `avatar` - 用户头像
- `couple` - 双人头像
- `background` - 主页背景图
- `album` - 相册照片
- `timeline` - 时光轴图片
- `common` - 其他

---

## 🔐 认证说明

### JWT Token 使用方式

所有需要认证的接口，需在请求头中携带Token：

```
Authorization: Bearer <token>
```

### Token 获取流程

1. 小程序调用 `wx.login()` 获取 `code`
2. 调用 `POST /auth/login` 接口，传入 `code`
3. 服务端返回 `token` 和用户信息
4. 后续请求携带此Token

---

## 📝 统一响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 40001,
  "message": "错误描述",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/xxx"
}
```

### 分页响应

```json
{
  "code": 0,
  "data": {
    "list": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

## 🧪 接口测试清单

### 基础功能测试

- [ ] 服务正常启动
- [ ] 数据库连接正常
- [ ] Redis连接正常
- [ ] Swagger文档可访问

### 认证模块测试

- [ ] 微信登录成功返回Token
- [ ] Token刷新功能正常
- [ ] Token验证中间件正常
- [ ] 退出登录清除会话

### 业务功能测试

- [ ] 用户信息获取/更新
- [ ] 配对创建/绑定/解除
- [ ] 时光轴CRUD
- [ ] 相册CRUD
- [ ] 照片上传/删除
- [ ] 默契题获取/提交
- [ ] 任务列表/完成
- [ ] 信件发送/读取
- [ ] 通知列表/已读
- [ ] 文件上传（单张/批量）

---

## 🔧 常见问题

### 1. 数据库连接失败

检查MySQL服务是否启动，`.env.local` 中数据库配置是否正确。

### 2. Redis连接失败

检查Redis服务是否启动：
```bash
# Windows
redis-server

# 验证连接
redis-cli ping
```

### 3. 微信登录失败

- 确认 `WX_APPID` 和 `WX_SECRET` 配置正确
- 确认小程序已发布或在开发版本中
- 检查服务器IP是否在微信后台白名单中

### 4. 文件上传失败

- 开发环境使用本地存储，确保 `uploads/` 目录可写
- 检查文件大小是否超过10MB
- 检查文件格式是否支持（jpeg/png/webp/gif）

---

## 📞 联调支持

如遇到问题，请提供以下信息：
1. 请求方法和路径
2. 请求参数
3. 响应内容
4. 服务端日志（如有）

---

**最后更新时间：2024年**
