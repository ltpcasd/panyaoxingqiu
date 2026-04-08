# SQLite 兼容性快速检查清单

> 快速检查卡片 - 部署前必查

---

## ⚡ 快速检查命令

```powershell
# PowerShell 检查命令
cd d:\ai项目\ai-test-demo\后端\panyaoxingqiu-server

# 检查不支持类型
Select-String -Path ".\libs\database\src\entities\*.ts" -Pattern "type: 'timestamp'" | Select-Object Filename, LineNumber
Select-String -Path ".\libs\database\src\entities\*.ts" -Pattern "type: 'json'" | Select-Object Filename, LineNumber
Select-String -Path ".\libs\database\src\entities\*.ts" -Pattern "type: 'enum'" | Select-Object Filename, LineNumber
Select-String -Path ".\libs\database\src\entities\*.ts" -Pattern "type: 'tinyint'" | Select-Object Filename, LineNumber
```

---

## ✅ 类型映射速查表

| MySQL 类型 | SQLite 替换 | 是否支持 |
|------------|-------------|----------|
| `timestamp` | `datetime` | ❌ 必改 |
| `json` | `text` + transformer | ❌ 必改 |
| `enum` | `varchar` | ❌ 必改 |
| `tinyint` | `integer` | ⚠️ 建议改 |
| `bigint` | `integer` | ⚠️ 主键用 increment |
| `datetime` | `datetime` | ✅ 支持 |
| `date` | `date` | ✅ 支持 |
| `varchar` | `varchar` | ✅ 支持 |
| `text` | `text` | ✅ 支持 |
| `int` | `integer` | ✅ 支持 |

---

## 📋 部署前 Checklist

### 类型检查
- [ ] 无 `type: 'timestamp'`
- [ ] 无 `type: 'json'`
- [ ] 无 `type: 'enum'`
- [ ] 无 `type: 'tinyint'` (或已确认兼容)
- [ ] 主键使用 `@PrimaryGeneratedColumn('increment')`

### 配置检查
- [ ] 环境变量 `USE_SQLITE=true`
- [ ] 数据库路径 `SQLITE_DB_PATH` 正确
- [ ] 生产环境 `NODE_ENV=production`

### 文件检查
- [ ] 数据库目录 `./data` 存在
- [ ] 目录有写入权限

---

## 🚨 常见错误速查

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `near "AUTOINCREMENT": syntax error` | bigint 自增 | 用 `@PrimaryGeneratedColumn('increment')` |
| `no such column: timestamp` | timestamp 类型 | 改为 `datetime` |
| `near "json": syntax error` | json 类型 | 用 `text` + transformer |
| `near "enum": syntax error` | enum 类型 | 用 `varchar` |
| `unable to open database file` | 路径不存在 | 创建 `./data` 目录 |

---

## 🔧 标准写法模板

```typescript
// 主键
@PrimaryGeneratedColumn('increment')
id: number;

// 状态字段
@Column({ type: 'integer', default: 1 })
status: number;

// JSON 数据
@Column({ 
  type: 'text',
  nullable: true,
  transformer: {
    to: (value: any | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }
})
data: any | null;

// 枚举值
export type Status = 'active' | 'inactive';

@Column({ type: 'varchar', length: 16, default: 'active' })
status: Status;

// 时间字段
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;
```

---

## 📊 项目当前状态

### 已修复 ✅
- timestamp → datetime
- json → text + transformer  
- enum → varchar
- bigint → integer

### 待确认 ⚠️
- tinyint 类型（建议改为 integer）
- date 格式验证
- simple-array 数据验证

---

**详细文档**: 参考 `SQLite兼容性排查规范.md`
