# Migrations Directory

此目录包含数据库迁移文件。

## 文件命名规范

```
V{version}__{description}.sql
```

示例:
- `V00000001__initial_schema.sql`
- `V00000002__add_indexes.sql`

## 迁移文件格式

每个迁移文件必须包含 `-- // UP` 和 `-- // DOWN` 部分：

```sql
-- Migration: Description
-- Description: More details

-- // UP
-- SQL statements to apply the migration
CREATE TABLE users (...);

-- // DOWN
-- SQL statements to rollback the migration
DROP TABLE users;
```

## 常用命令

```bash
# 查看迁移状态
npm run migrate:status

# 执行待处理的迁移
npm run migrate up

# 查看详细信息
npm run migrate info

# 回滚到指定版本
npm run migrate down 1

# 创建新的迁移文件
npm run migrate create add_new_feature
```

详细文档请参考 [MIGRATIONS.md](../../MIGRATIONS.md)
