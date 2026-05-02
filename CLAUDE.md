# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

StarBlog 是 Next.js 15 (App Router) + React 19 + TypeScript 个人博客，部署到 Cloudflare Workers（通过 OpenNext），数据存储在 Cloudflare D1 (SQLite)。包含公开内容页面和 `/admin/*` 管理后台。

## 命令

```bash
pnpm dev                    # Next.js 开发服务器（端口 3000）
pnpm preview                # OpenNext 本地 Cloudflare 模拟（部署前用此验证）
pnpm lint                   # ESLint
pnpm build                  # Next.js 构建（含 TS 类型检查）

pnpm db:generate            # schema.ts 改动后生成迁移 SQL
pnpm db:migrate:local       # 应用迁移到本地 D1
pnpm db:migrate:remote      # 应用迁移到生产 D1
pnpm db:seed:local          # 重新生成并应用 seed.sql 到本地
pnpm db:studio              # Drizzle Studio Web UI

pnpm test:e2e               # Playwright e2e 全量（chromium）
pnpm test:e2e:p0            # 只跑 @P0 标签用例（CI 入口）
pnpm test:e2e:ui            # Playwright UI mode 调试
pnpm test:e2e:debug         # inspector 单步调试

pnpm hash <password>        # 生成 ADMIN_PASSWORD_HASH
pnpm cf-typegen             # 重新生成 cloudflare-env.d.ts
pnpm deploy                 # 部署到生产 Cloudflare Workers（需授权）
```

## 工作流

**数据库 schema 改动**：改 `src/db/schema.ts` → `pnpm db:generate` → 审核 `drizzle/migrations/` 下新生成的 SQL → `pnpm db:migrate:local` → 启 dev 验证 → 生产 `pnpm db:migrate:remote` 必须先获得明确授权。可调用 `/db-migrate` skill 走完整流程。

**部署**：`pnpm deploy` 推送到生产环境 Cloudflare Workers，**Claude 每次执行前都要先获得明确授权**。

**提交**：commit message 使用**中文**。**主干开发**——直接在 `main` 分支提交，不创建 feature 分支。提交前可调用 `/verify` skill 跑 lint + build。

## 代码风格

- 只用 `eslint-config-next` (ESLint 9 flat config)。**不要引入 Prettier 或 Biome**。
- TypeScript strict 模式，路径别名 `@/*` → `./src/*`。
- 样式集中在 `src/styles/global.css`（CSS 变量 + `[data-theme="dark"]` 暗色模式）。**不要引入 Tailwind 或 CSS-in-JS**。

## Cloudflare / OpenNext 关键约束

- 根 layout 设置 `export const dynamic = "force-dynamic"`，因为 D1 绑定需要运行时上下文。**不要为了 SSG/ISR 优化删除它**。
- 数据库访问统一通过 `src/db/index.ts`：
  - `getDb()`（同步）用于服务端组件、Server Actions
  - `getDbAsync()`（异步）用于 middleware 等异步上下文
  - 都用 `React.cache()` 包裹做请求级去重
- Middleware 在 `AUTH_SECRET` 缺失/未配置时**故意**重定向到登录页（`?err=config`）而非放行。这是安全设计，不要"修复"成允许通过。

## 认证

- 密码哈希格式：`pbkdf2$100000$<base64-salt>$<base64-hash>`（PBKDF2-SHA256，10 万次迭代），用 WebCrypto `crypto.subtle.deriveBits` 实现以兼容 Node 与 Workers。
- Session：`jose` 签发的 JWT，cookie 名 `starblog_session`，httpOnly + sameSite=lax，prod 下 secure，TTL 24h。
- 单管理员模型，没有多用户。

## 测试

仓库使用 **Playwright e2e 套件**（`tests/e2e/`）作为唯一测试形态——业务逻辑通过端到端用例守住，不再引入 Jest / Vitest 等单元测试框架。

```bash
pnpm test:e2e              # 跑全部 e2e（chromium）
pnpm test:e2e:p0           # 只跑 @P0 标签用例（最小回归集，CI 入口）
pnpm test:e2e:ui           # Playwright UI mode 调试
pnpm test:e2e:debug        # inspector 单步调试
```

目录结构：

- `tests/e2e/admin/` — 后台用例：登录、middleware 守卫、文章 CRUD、文章列表、评论审核
- `tests/e2e/public/` — 公开站用例：smoke、首页、Writing 列表 / 文章详情、RSS、评论提交
- `tests/e2e/fixtures/` — 共享夹具：`auth.ts`（admin 登录）、`db.ts`（D1 清理 + 种子）、`test-data.ts`（凭证 / 前缀常量）
- `tests/e2e/global.setup.ts` — 跑前 apply seed.sql + 清空 `e2e-*` 残留 + 注入 fixture posts + 缓存 admin storageState
- `tests/e2e/global.teardown.ts` — 跑后清理 `[E2E]` / `e2e-` 痕迹
- `playwright.config.ts` — `webServer` 自动起 `pnpm next dev -p 3001`，CI 下 retries=2、reporter=`github`

跑 e2e 前需要本地 `.dev.vars` 提供 `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` / `AUTH_SECRET`，并先跑 `pnpm db:migrate:local`、`pnpm gen:seed`。`global.setup.ts` 会再 apply 一次 seed.sql 然后插入 fixture 文章，所以本地 D1 里临时的 `e2e-*` slug 都会被它清理掉。

**优先级标签约定**：用例描述里加 `@P0` / `@P1` / `@P2`，CI 上的 `pnpm test:e2e:p0` 通过 `--grep @P0` 只跑最小回归集。新写用例先标 P1/P2，跑稳定后再升 @P0 进 CI 主路径。

**CI**：`.github/workflows/e2e.yml` 在 `push main` 与 `workflow_dispatch` 上跑 P0 套件，artifact 留 `playwright-report/` 与 `test-results/` 7 天；`.github/workflows/ci.yml` 跑 lint + build；`.github/workflows/deploy.yml` 自动部署。

其他验证：

- 类型检查 + lint：`pnpm lint && pnpm build`（或 `/verify`）
- 功能验证：`pnpm dev` 手动点；部署前用 `pnpm preview` 在本地 Cloudflare 模拟环境验证

不要为"完整性"再引入 Jest / Vitest 单元测试框架，除非用户明确要求。

## 必需环境变量

本地开发放 `.dev.vars`（从 `.dev.vars.example` 复制）：

- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`（用 `pnpm hash <password>` 生成）/ `AUTH_SECRET`（随机长字符串）/ `SITE_URL`

生产环境：`wrangler secret put <name>` 设置同名 secret。

drizzle-kit 迁移工具需要 `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_DATABASE_ID` / `CLOUDFLARE_D1_TOKEN`。

## 种子数据

`scripts/generate-seed.mjs` 是纯 Node 脚本（无 ts-loader），种子数据**内联在脚本里**，与 `src/lib/seed-data.ts` 不会自动同步——改动种子时两处都要更新。
