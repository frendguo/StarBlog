---
name: db-migrate
description: 引导完成 Cloudflare D1 schema 改动的标准流程（generate → 审核 SQL → local migrate → 验证 → 询问是否 remote）。当用户改动了 src/db/schema.ts 或要求"做迁移""跑迁移"时调用。
---

按以下顺序执行，**每步完成后再进行下一步**。生产迁移那一步必须先获得用户明确授权，绝不自作主张。

## 1. 生成迁移 SQL

```
pnpm db:generate
```

drizzle-kit 会在 `drizzle/migrations/` 下生成新的 `.sql` 文件。

## 2. 审核 SQL（关键）

读取 `drizzle/migrations/` 下最新生成的 `.sql` 文件，向用户展示并解释改动内容：

- 新增的表 / 列 / 索引
- **删除/重命名的列**（D1 的 SQLite 不支持直接 DROP/RENAME COLUMN，迁移可能失败或丢数据）
- 新增的 `NOT NULL` 列且没有默认值（已有数据会迁移失败）
- 唯一约束变化（已有重复数据会迁移失败）
- 数据类型改变

如果 SQL 不符合预期或有风险，停下来让用户决定：改 schema 重新 generate，还是手动编辑迁移文件。

## 3. 本地迁移

```
pnpm db:migrate:local
```

## 4. 本地验证

提示用户启动 `pnpm dev` 验证功能；如需直观查看本地数据，可用 `pnpm db:studio`。

## 5. 询问是否上生产

**只有在用户明确说"上生产 / 跑 remote / 部署"等之后**才执行：

```
pnpm db:migrate:remote
```

如果用户说"先到这里"或没回应，就停在第 4 步。
