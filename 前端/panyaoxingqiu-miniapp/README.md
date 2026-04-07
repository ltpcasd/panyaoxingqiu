# 潘瑶星球小程序配置

## 开发环境配置

### 1. 微信小程序 AppID
在 `project.config.json` 中修改 `appid` 为你的小程序 AppID：
```json
{
  "appid": "your-appid-here"
}
```

### 2. API 地址配置
在 `src/config/index.ts` 中配置后端 API 地址：

**开发环境：**
```typescript
export const API_BASE_URL = 'http://localhost:3000/api/v1'
```

**生产环境：**
```typescript
export const API_BASE_URL_PROD = 'https://api.panyaoxingqiu.com/api/v1'
```

### 3. 服务器域名配置
在微信公众平台后台配置服务器域名：
- request 合法域名：`https://api.panyaoxingqiu.com`
- uploadFile 合法域名：`https://api.panyaoxingqiu.com`
- downloadFile 合法域名：`https://api.panyaoxingqiu.com`

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务
```bash
npm run dev:mp-weixin
```

### 构建生产版本
```bash
npm run build:mp-weixin
```

## 联调测试

### 测试前准备
1. 确保后端服务已启动：`http://localhost:3000`
2. 检查后端 API 文档：`http://localhost:3000/api/v1/docs`
3. 确保微信开发者工具已安装

### 测试清单

#### 登录模块
- [ ] 微信授权登录
- [ ] 获取用户信息
- [ ] 更新用户信息
- [ ] 退出登录

#### 配对模块
- [ ] 生成配对码
- [ ] 通过配对码配对
- [ ] 获取配对信息
- [ ] 更新纪念日
- [ ] 更新双人头像
- [ ] 更新背景图

#### 时光轴模块
- [ ] 获取时光轴列表
- [ ] 创建事件
- [ ] 更新事件
- [ ] 删除事件
- [ ] 点赞功能

#### 相册模块
- [ ] 获取相册列表
- [ ] 创建相册
- [ ] 上传照片
- [ ] 删除照片
- [ ] 设置相册封面

#### 默契考验模块
- [ ] 获取今日问题
- [ ] 提交答案
- [ ] 查看答题历史
- [ ] 查看默契度

#### 任务模块
- [ ] 获取任务列表
- [ ] 领取任务奖励
- [ ] 查看积分历史

#### 信箱模块
- [ ] 获取信件列表
- [ ] 发送信件
- [ ] 标记已读
- [ ] 获取未读数量

#### 上传模块
- [ ] 上传头像
- [ ] 上传双人头像
- [ ] 上传背景图
- [ ] 上传时光轴图片
- [ ] 上传相册照片

## 生产部署

### 1. 更新配置
- 修改 `project.config.json` 中的 AppID
- 确认 `API_BASE_URL_PROD` 地址正确

### 2. 构建打包
```bash
npm run build:mp-weixin
```

### 3. 上传代码
使用微信开发者工具上传代码到微信后台

### 4. 提交审核
在微信公众平台提交审核

## 常见问题

### Q: 开发环境请求失败？
A: 
1. 检查后端服务是否启动
2. 在微信开发者工具中勾选"不校验合法域名"
3. 检查 API_BASE_URL 配置是否正确

### Q: 登录失败？
A:
1. 检查微信登录接口是否正常
2. 检查后端是否正确配置微信 AppID 和 AppSecret
3. 查看控制台错误日志

### Q: 上传失败？
A:
1. 检查文件大小是否超过限制
2. 检查后端上传接口是否正常
3. 检查存储服务配置
