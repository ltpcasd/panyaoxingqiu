# SQLite 兼容性排查规范文档

> **项目**: 潘瑶星球情侣小程序  
> **技术栈**: NestJS + TypeORM + SQLite (Railway 免费计划)  
> **文档版本**: v1.0  
> **更新日期**: 2026-04-08

---

## 一、SQLite 与 MySQL 类型差异对照表

### 1.1 基本数据类型映射

| MySQL 类型 | SQLite 等价类型 | 说明 | 兼容性 |
|------------|-----------------|------|--------|
| `INT` | `INTEGER` | 完全兼容 | ✅ |
| `BIGINT` | `INTEGER` | SQLite 只有 INTEGER | ✅ |
| `TINYINT` | `INTEGER` | **不支持**，需要转换 | ⚠️ |
| `SMALLINT` | `INTEGER` | 完全兼容 | ✅ |
| `DECIMAL(p,s)` | `REAL` | 精度可能有差异 | ⚠️ |
| `FLOAT` | `REAL` | 完全兼容 | ✅ |
| `DOUBLE` | `REAL` | 完全兼容 | ✅ |
| `VARCHAR(n)` | `TEXT` | 完全兼容 | ✅ |
| `CHAR(n)` | `TEXT` | 完全兼容 | ✅ |
| `TEXT` | `TEXT` | 完全兼容 | ✅ |
| `LONGTEXT` | `TEXT` | 完全兼容 | ✅ |
| `DATE` | `TEXT` | 格式: 'YYYY-MM-DD' | ⚠️ |
| `DATETIME` | `TEXT` | 格式: 'YYYY-MM-DD HH:MM:SS' | ⚠️ |
| `TIMESTAMP` | `TEXT` | **不支持**，改用 datetime | ❌ |
| `JSON` | `TEXT` | **不支持**，需用 transformer | ❌ |
| `ENUM` | `TEXT` | **不支持**，改用 varchar | ❌ |
| `BOOLEAN` | `INTEGER` | 0=false, 1=true | ⚠️ |
| `BLOB` | `BLOB` | 完全兼容 | ✅ |
| `UUID` | `TEXT` | 需要特殊处理 | ⚠️ |

### 1.2 自动增长主键差异

| 数据库 | 自增语法 | 说明 |
|--------|----------|------|
| MySQL | `BIGINT AUTO_INCREMENT` | 支持任意整数类型 |
| SQLite | `INTEGER PRIMARY KEY AUTOINCREMENT` | **必须使用 INTEGER** |

> **重要**: SQLite 的 AUTOINCREMENT 只能用于 `INTEGER PRIMARY KEY`，不能用于 `BIGINT`。

---

## 二、TypeORM 装饰器在 SQLite 下的限制

### 2.1 主键装饰器

```typescript
// ❌ 错误 - bigint 自增在 SQLite 不支持
@PrimaryGeneratedColumn('increment', { type: 'bigint' })
id: string;

// ✅ 正确 - 使用 integer
@PrimaryGeneratedColumn('increment')
id: string;

// ✅ 正确 - UUID 主键
@PrimaryGeneratedColumn('uuid')
id: string;
```

### 2.2 列类型装饰器

```typescript
// ❌ 错误 - SQLite 不支持 timestamp
@Column({ type: 'timestamp' })
createdAt: Date;

// ✅ 正确 - 使用 datetime
@Column({ type: 'datetime' })
createdAt: Date;

// ❌ 错误 - SQLite 不支持 json 类型
@Column({ type: 'json' })
data: object;

// ✅ 正确 - 使用 text + transformer
@Column({ 
  type: 'text',
  transformer: {
    to: (value: object) => JSON.stringify(value),
    from: (value: string) => JSON.parse(value),
  }
})
data: object;

// ❌ 错误 - SQLite 不支持 enum 类型
@Column({ type: 'enum', enum: ['a', 'b'] })
status: string;

// ✅ 正确 - 使用 varchar
@Column({ type: 'varchar', length: 32 })
status: string;

// ❌ 错误 - SQLite 不支持 tinyint 类型声明
@Column({ type: 'tinyint' })
status: number;

// ✅ 正确 - SQLite 会自动处理，但建议使用 integer
@Column({ type: 'integer' })
status: number;

// 或使用 smallint（TypeORM 会映射到 INTEGER）
@Column({ type: 'smallint' })
status: number;
```

### 2.3 日期类型装饰器

```typescript
// ✅ 正确 - CreateDateColumn 自动处理
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

// ✅ 正确 - UpdateDateColumn 自动处理
@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;

// ⚠️ 注意 - date 类型需要格式处理
@Column({ type: 'date' })
eventDate: Date;  // SQLite 存储为 'YYYY-MM-DD' 字符串

// ✅ 正确 - datetime 类型
@Column({ type: 'datetime', nullable: true })
completedAt: Date | null;
```

### 2.4 数组类型装饰器

```typescript
// ✅ 正确 - simple-array 类型（存储为逗号分隔字符串）
@Column({ type: 'simple-array', nullable: true })
tags: string[];

// ⚠️ 注意 - 不能包含逗号的字符串

// ✅ 正确 - 复杂数组使用 JSON transformer
@Column({ 
  type: 'text',
  nullable: true,
  transformer: {
    to: (value: string[] | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }
})
images: string[] | null;
```

---

## 三、项目实体问题清单（当前状态）

### 3.1 已修复问题 ✅

| 问题 | 原类型 | 修复后类型 | 影响实体 |
|------|--------|------------|----------|
| timestamp 不支持 | `timestamp` | `datetime` | 时间字段 |
| json 不支持 | `json` | `text` + transformer | TimelineEvent.images, QuizQuestion.options |
| enum 不支持 | `enum` | `varchar` | PointsRecord.type |
| bigint 自增不支持 | `bigint` | `integer` + increment | 所有主键 |

### 3.2 待确认问题 ⚠️

| 问题 | 当前写法 | 状态 | 建议修复 |
|------|----------|------|----------|
| tinyint 类型 | `type: 'tinyint'` | ⚠️ 可能有问题 | 改为 `integer` 或 `smallint` |
| date 类型 | `type: 'date'` | ⚠️ 需验证格式 | 确保格式为 'YYYY-MM-DD' |
| simple-array 类型 | `type: 'simple-array'` | ⚠️ 需验证 | 确保数据不含逗号 |

### 3.3 实体详细检查清单

#### User 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 0 })  gender: number;    // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
```

#### Couple 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
@Column({ type: 'date', nullable: true }) anniversaryDate: Date | null;  // 验证格式
```

#### Album 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
```

#### Photo 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
@Column({ type: 'simple-array', nullable: true })  tags: string[] | null;  // 验证数据
```

#### Task 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint' })  taskType: number;    // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
```

#### TimelineEvent 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint' })  eventType: number;    // 建议: integer
@Column({ type: 'tinyint', default: 0 })  isImportant: number;  // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
@Column({ type: 'date' })  eventDate: Date;  // 验证格式
```

#### UserTask 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 0 })  status: number;    // 建议: integer
@Column({ type: 'tinyint', default: 0 })  rewardClaimed: boolean;  // 建议: integer
@Column({ type: 'date', nullable: true })  taskDate: string | null;  // 验证格式
```

#### Letter 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 0 })  isRead: number;    // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
```

#### QuizQuestion 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 1 })  difficulty: number;  // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
```

#### QuizRecord 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint', default: 0 })  isMatch: number;    // 建议: integer
```

#### Notification 实体
```typescript
// ⚠️ 问题字段
@Column({ type: 'tinyint' })  notifyType: number;    // 建议: integer
@Column({ type: 'tinyint', default: 1 })  status: number;    // 建议: integer
@Column({ type: 'tinyint', default: 0 })  isRead: number;    // 建议: integer
```

#### PointsRecord 实体
```typescript
// ✅ 已使用 uuid 主键
@PrimaryGeneratedColumn('uuid')
id: string;

// ✅ 使用 varchar 存储枚举值
@Column({ type: 'varchar', length: 32 })
type: PointsRecordType;
```

---

## 四、SQLite 兼容性检查清单 (Checklist)

### 4.1 部署前必查项

#### 类型检查
- [ ] 所有 `timestamp` 类型已改为 `datetime`
- [ ] 所有 `json` 类型已改为 `text` + transformer
- [ ] 所有 `enum` 类型已改为 `varchar`
- [ ] 所有 `tinyint` 类型已改为 `integer` 或 `smallint`
- [ ] 主键使用 `increment` 而非 `bigint`

#### 日期字段检查
- [ ] `CreateDateColumn` 使用默认配置
- [ ] `UpdateDateColumn` 使用默认配置
- [ ] 自定义 `date` 字段格式为 'YYYY-MM-DD'
- [ ] 自定义 `datetime` 字段格式正确

#### 关联关系检查
- [ ] 外键字段类型与主键类型一致
- [ ] `@JoinColumn` 配置正确
- [ ] `@OneToOne` 关系双向配置正确

#### 数据验证
- [ ] `simple-array` 字段数据不含逗号
- [ ] JSON transformer 正确处理 null 值
- [ ] 枚举值与 varchar 长度匹配

### 4.2 部署时检查项

#### 数据库配置
```typescript
// ✅ 正确的 SQLite 配置
{
  type: 'sqlite',
  database: './data/xxx.sqlite',
  entities: allEntities,
  synchronize: true,  // 开发环境 true，生产环境建议 false
  logging: false,     // 生产环境关闭
}
```

#### 文件系统检查
- [ ] 数据库文件目录存在且有写入权限
- [ ] 磁盘空间足够（Railway 免费 500MB）
- [ ] 数据库文件路径正确

#### 环境变量检查
- [ ] `USE_SQLITE=true` 已设置
- [ ] `SQLITE_DB_PATH` 路径正确
- [ ] `NODE_ENV=production` 已设置

### 4.3 部署后验证项

#### 健康检查
- [ ] 服务启动无报错
- [ ] 数据库表自动创建成功
- [ ] 基础 CRUD 操作正常
- [ ] 时间字段存取正常

#### 功能验证
- [ ] 用户注册/登录正常
- [ ] 数据查询返回正确
- [ ] 关联查询正常
- [ ] 分页查询正常

---

## 五、常见错误及解决方案

### 5.1 类型相关错误

#### 错误 1: `SQLITE_ERROR: near "AUTOINCREMENT": syntax error`
```
原因: BIGINT 类型不支持 AUTOINCREMENT
解决: 将主键改为 @PrimaryGeneratedColumn('increment')
```

#### 错误 2: `SQLITE_ERROR: no such column: timestamp`
```
原因: SQLite 不支持 TIMESTAMP 类型
解决: 将 type: 'timestamp' 改为 type: 'datetime'
```

#### 错误 3: `SQLITE_ERROR: near "json": syntax error`
```
原因: SQLite 不支持 JSON 类型
解决: 使用 text + JSON transformer
```

#### 错误 4: `SQLITE_ERROR: near "enum": syntax error`
```
原因: SQLite 不支持 ENUM 类型
解决: 使用 varchar 类型存储枚举值
```

### 5.2 数据相关错误

#### 错误 5: 日期格式不正确
```
原因: SQLite 存储日期为字符串，格式必须统一
解决: 
- 使用 CreateDateColumn/UpdateDateColumn 自动处理
- 手动日期使用 new Date().toISOString()
```

#### 错误 6: JSON 解析失败
```
原因: transformer 未正确处理 null 值
解决: transformer 中添加 null 检查
```

#### 错误 7: simple-array 数据丢失
```
原因: 数据包含逗号，被错误分割
解决: 
- 使用 JSON transformer 替代 simple-array
- 或确保数据不含逗号
```

### 5.3 配置相关错误

#### 错误 8: `SQLITE_CANTOPEN: unable to open database file`
```
原因: 数据库文件路径不存在或无权限
解决: 
- 创建数据库目录: mkdir -p ./data
- 检查目录权限
- Railway 需要确保持久化存储挂载
```

#### 错误 9: `SQLITE_FULL: database or disk is full`
```
原因: Railway 免费计划存储限制
解决: 
- 清理不必要的数据
- 升级 Railway 计划
- 考虑迁移到其他数据库
```

---

## 六、最佳实践建议

### 6.1 类型定义规范

```typescript
// ✅ 推荐的实体字段定义方式

// 主键
@PrimaryGeneratedColumn('increment')
id: number;

// 外键
@Column({ name: 'user_id', type: 'integer' })
userId: number;

// 字符串
@Column({ type: 'varchar', length: 255 })
name: string;

// 长文本
@Column({ type: 'text', nullable: true })
description: string | null;

// 整数（包括状态、类型等）
@Column({ type: 'integer', default: 0 })
status: number;

// 布尔值
@Column({ type: 'integer', default: 0 })
isActive: number;  // 0=false, 1=true

// 日期时间
@Column({ type: 'datetime', nullable: true })
happenedAt: Date | null;

// 日期
@Column({ type: 'date', nullable: true })
birthDate: Date | null;

// JSON 数据
@Column({ 
  type: 'text',
  nullable: true,
  transformer: {
    to: (value: any | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }
})
metadata: any | null;

// 数组
@Column({ 
  type: 'text',
  nullable: true,
  transformer: {
    to: (value: string[] | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }
})
tags: string[] | null;
```

### 6.2 枚举值处理规范

```typescript
// ✅ 推荐方式：使用类型 + varchar

export type TaskStatus = 'pending' | 'completed' | 'failed';

@Entity('tasks')
export class Task {
  @Column({ 
    type: 'varchar', 
    length: 16,
    default: 'pending' 
  })
  status: TaskStatus;
}
```

### 6.3 关联关系规范

```typescript
// ✅ OneToOne 关系
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => UserProfile)
  @JoinColumn({ name: 'profile_id' })
  profile: UserProfile;
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;  // 外键类型与 User.id 一致
}
```

---

## 七、迁移检查脚本

### 7.1 自动检查脚本

```bash
#!/bin/bash
# SQLite 兼容性检查脚本

echo "=== SQLite 兼容性检查 ==="

# 检查不支持类型
echo "1. 检查不支持的类型..."
grep -rn "type: 'timestamp'" --include="*.entity.ts" && echo "❌ 发现 timestamp 类型" || echo "✅ 无 timestamp 类型"
grep -rn "type: 'json'" --include="*.entity.ts" && echo "❌ 发现 json 类型" || echo "✅ 无 json 类型"
grep -rn "type: 'enum'" --include="*.entity.ts" && echo "❌ 发现 enum 类型" || echo "✅ 无 enum 类型"
grep -rn "type: 'tinyint'" --include="*.entity.ts" && echo "⚠️ 发现 tinyint 类型" || echo "✅ 无 tinyint 类型"

# 检查主键
echo ""
echo "2. 检查主键定义..."
grep -rn "PrimaryGeneratedColumn('increment',.*bigint" --include="*.entity.ts" && echo "❌ 发现 bigint 主键" || echo "✅ 主键定义正确"

echo ""
echo "=== 检查完成 ==="
```

### 7.2 TypeScript 检查工具

```typescript
// sqlite-compat-check.ts
import * as fs from 'fs';
import * as path from 'path';

const entitiesDir = './libs/database/src/entities';

const issues: string[] = [];

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  // 检查不支持的类型
  if (content.includes("type: 'timestamp'")) {
    issues.push(`${fileName}: 发现 timestamp 类型`);
  }
  if (content.includes("type: 'json'")) {
    issues.push(`${fileName}: 发现 json 类型`);
  }
  if (content.includes("type: 'enum'")) {
    issues.push(`${fileName}: 发现 enum 类型`);
  }
  if (content.includes("type: 'tinyint'")) {
    issues.push(`${fileName}: 发现 tinyint 类型 (建议改为 integer)`);
  }
  if (content.includes("type: 'bigint'")) {
    issues.push(`${fileName}: 发现 bigint 类型 (SQLite 只有 integer)`);
  }
}

// 遍历检查
fs.readdirSync(entitiesDir)
  .filter(f => f.endsWith('.entity.ts'))
  .forEach(f => checkFile(path.join(entitiesDir, f)));

// 输出结果
if (issues.length > 0) {
  console.log('⚠️ 发现以下兼容性问题：');
  issues.forEach(i => console.log(`  - ${i}`));
  process.exit(1);
} else {
  console.log('✅ 所有实体文件通过 SQLite 兼容性检查');
  process.exit(0);
}
```

---

## 八、附录

### A. SQLite 数据类型亲和性

| 声明类型 | 亲和类型 | 说明 |
|----------|----------|------|
| INT, INTEGER, TINYINT, SMALLINT, BIGINT | INTEGER | 所有整数类型映射到 INTEGER |
| CHARACTER, VARCHAR, TEXT, CLOB | TEXT | 所有文本类型映射到 TEXT |
| BLOB | BLOB | 无类型时默认 BLOB |
| REAL, DOUBLE, FLOAT | REAL | 浮点数 |
| NUMERIC, DECIMAL, BOOLEAN, DATE, DATETIME | NUMERIC | 混合类型，自动转换 |

### B. Railway SQLite 限制

| 限制项 | 免费计划 | 说明 |
|--------|----------|------|
| 存储空间 | 500MB | 数据库文件大小 |
| 内存 | 512MB | 运行时内存 |
| CPU | 0.5 vCPU | 计算资源 |
| 网络 | 500MB/月 | 出站流量 |

### C. 相关文档链接

- [SQLite 官方文档 - 数据类型](https://www.sqlite.org/datatype3.html)
- [TypeORM 官方文档 - SQLite](https://typeorm.io/#/sqlite)
- [Railway 文档 - 数据库限制](https://docs.railway.app/databases)

---

**文档维护**: 运维团队  
**最后更新**: 2026-04-08
