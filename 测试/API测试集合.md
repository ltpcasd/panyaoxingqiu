# API测试集合 - Postman脚本

## 环境变量

```
BASE_URL=http://localhost:3000/api/v1
TOKEN=你的JWT_Token
```

---

## 一、认证模块 (Auth)

### 1.1 微信登录

**POST** `{{BASE_URL}}/auth/login`

```json
{
  "code": "test_code_001",
  "userInfo": {
    "nickName": "测试用户A",
    "avatarUrl": "https://via.placeholder.com/100",
    "gender": 1
  }
}
```

**测试脚本**：
```javascript
// 保存Token到环境变量
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("TOKEN", response.data.accessToken);
    pm.environment.set("REFRESH_TOKEN", response.data.refreshToken);
    pm.environment.set("USER_ID", response.data.user.id);
    console.log("Token已保存");
}
```

---

### 1.2 刷新Token

**POST** `{{BASE_URL}}/auth/refresh`

```json
{
  "refreshToken": "{{REFRESH_TOKEN}}"
}
```

---

### 1.3 退出登录

**POST** `{{BASE_URL}}/auth/logout`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 二、配对模块 (Couples)

### 2.1 生成配对码

**POST** `{{BASE_URL}}/couples`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

**测试脚本**：
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("PAIR_CODE", response.data.pairCode);
    console.log("配对码: " + response.data.pairCode);
}
```

---

### 2.2 验证配对码

**GET** `{{BASE_URL}}/couples/verify?code={{PAIR_CODE}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 2.3 加入配对

**POST** `{{BASE_URL}}/couples/join`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "pairCode": "{{PAIR_CODE}}",
  "anniversaryDate": "2026-01-01"
}
```

---

### 2.4 获取配对信息

**GET** `{{BASE_URL}}/couples/me`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 2.5 获取配对状态

**GET** `{{BASE_URL}}/couples/me/status`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 2.6 更新配对信息

**PUT** `{{BASE_URL}}/couples/me`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "coupleName": "甜蜜恋人",
  "anniversaryDate": "2026-01-01"
}
```

---

### 2.7 解除配对

**DELETE** `{{BASE_URL}}/couples/me`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 三、时光轴模块 (Timeline)

### 3.1 创建事件

**POST** `{{BASE_URL}}/timeline`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "title": "相识纪念日",
  "description": "我们第一次见面的日子",
  "eventDate": "2025-12-25",
  "eventType": "anniversary",
  "isImportant": true,
  "reminderEnabled": true,
  "reminderDays": [7, 1]
}
```

**测试脚本**：
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("EVENT_ID", response.data.id);
}
```

---

### 3.2 获取时光轴列表

**GET** `{{BASE_URL}}/timeline?page=1&limit=10`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 3.3 获取重要纪念日

**GET** `{{BASE_URL}}/timeline/important`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 3.4 获取事件详情

**GET** `{{BASE_URL}}/timeline/{{EVENT_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 3.5 更新事件

**PUT** `{{BASE_URL}}/timeline/{{EVENT_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "title": "相识纪念日（更新）",
  "description": "美好的回忆"
}
```

---

### 3.6 删除事件

**DELETE** `{{BASE_URL}}/timeline/{{EVENT_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 四、相册模块 (Album)

### 4.1 创建相册

**POST** `{{BASE_URL}}/albums`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "name": "我们的回忆",
  "description": "记录我们的点点滴滴",
  "cover": "https://via.placeholder.com/300"
}
```

**测试脚本**：
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("ALBUM_ID", response.data.id);
}
```

---

### 4.2 获取相册列表

**GET** `{{BASE_URL}}/albums?page=1&limit=10`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 4.3 获取相册详情

**GET** `{{BASE_URL}}/albums/{{ALBUM_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 4.4 更新相册

**PUT** `{{BASE_URL}}/albums/{{ALBUM_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "name": "甜蜜回忆",
  "description": "我们的照片"
}
```

---

### 4.5 上传照片

**POST** `{{BASE_URL}}/albums/{{ALBUM_ID}}/photos`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "photos": [
    {
      "url": "https://via.placeholder.com/800",
      "description": "美好的瞬间",
      "takenAt": "2026-04-02T10:00:00Z"
    }
  ]
}
```

---

### 4.6 获取相册照片

**GET** `{{BASE_URL}}/albums/{{ALBUM_ID}}/photos?page=1&limit=20`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 4.7 删除照片

**DELETE** `{{BASE_URL}}/albums/photos/{{PHOTO_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 4.8 删除相册

**DELETE** `{{BASE_URL}}/albums/{{ALBUM_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 五、任务模块 (Tasks)

### 5.1 获取任务列表

**GET** `{{BASE_URL}}/tasks?page=1&limit=10&status=pending`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 5.2 获取今日任务

**GET** `{{BASE_URL}}/tasks/today`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

**测试脚本**：
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.length > 0) {
        pm.environment.set("TASK_ID", response.data[0].id);
    }
}
```

---

### 5.3 获取等级信息

**GET** `{{BASE_URL}}/tasks/level`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 5.4 获取任务详情

**GET** `{{BASE_URL}}/tasks/{{TASK_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 5.5 获取任务进度

**GET** `{{BASE_URL}}/tasks/{{TASK_ID}}/progress`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 5.6 完成任务

**POST** `{{BASE_URL}}/tasks/{{TASK_ID}}/complete`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "evidence": "任务完成证明",
  "comment": "轻松完成！"
}
```

---

### 5.7 领取奖励

**POST** `{{BASE_URL}}/tasks/{{TASK_ID}}/claim`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 六、信箱模块 (Messages)

### 6.1 发送信件

**POST** `{{BASE_URL}}/messages`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "title": "写给亲爱的你",
  "content": "这是一封温暖的信，记录我们的美好时光...",
  "letterType": "love",
  "mood": "happy",
  "isAnonymous": false
}
```

**测试脚本**：
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("LETTER_ID", response.data.id);
}
```

---

### 6.2 获取信件列表

**GET** `{{BASE_URL}}/messages?page=1&limit=10&isRead=false`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 6.3 获取未读数量

**GET** `{{BASE_URL}}/messages/unread-count`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 6.4 获取信件历史

**GET** `{{BASE_URL}}/messages/history?page=1&limit=10`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 6.5 获取信件详情

**GET** `{{BASE_URL}}/messages/{{LETTER_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 6.6 标记已读

**PUT** `{{BASE_URL}}/messages/{{LETTER_ID}}/read`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 6.7 删除信件

**DELETE** `{{BASE_URL}}/messages/{{LETTER_ID}}`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 七、用户模块 (Users)

### 7.1 获取当前用户信息

**GET** `{{BASE_URL}}/users/me`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 7.2 更新用户信息

**PUT** `{{BASE_URL}}/users/me`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

```json
{
  "nickname": "新的昵称",
  "avatar": "https://via.placeholder.com/100",
  "birthday": "1995-01-01"
}
```

---

## 八、通知模块 (Notifications)

### 8.1 获取通知列表

**GET** `{{BASE_URL}}/notifications?page=1&limit=10`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

### 8.2 标记通知已读

**PUT** `{{BASE_URL}}/notifications/{{NOTIFICATION_ID}}/read`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
```

---

## 九、文件上传模块 (Upload)

### 9.1 上传单个文件

**POST** `{{BASE_URL}}/upload`

**Headers**：
```
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data
```

**Body** (form-data):
```
file: [选择文件]
type: image
```

---

## 测试执行顺序建议

1. **认证流程**：Auth Login → 保存Token
2. **用户信息**：获取/更新用户信息
3. **配对流程**：生成配对码 → 另一用户加入配对
4. **时光轴**：创建事件 → 查看列表 → 更新 → 删除
5. **相册**：创建相册 → 上传照片 → 查看照片 → 删除
6. **任务**：查看今日任务 → 完成任务 → 领取奖励
7. **信箱**：发送信件 → 接收信件 → 标记已读

---

## 断言示例

```javascript
// 基础断言
pm.test("状态码为200", function() {
    pm.response.to.have.status(200);
});

pm.test("响应包含code字段", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property('code');
});

pm.test("code为200", function() {
    const json = pm.response.json();
    pm.expect(json.code).to.eql(200);
});

pm.test("data不为空", function() {
    const json = pm.response.json();
    pm.expect(json.data).to.not.be.null;
});

// 响应时间断言
pm.test("响应时间小于500ms", function() {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

**导入Postman**：
1. 打开Postman
2. 点击 Import
3. 选择 "Raw text"
4. 复制上述内容
5. 粘贴并导入
