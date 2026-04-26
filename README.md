# StarBlog

一个面向开发者的个人博客 — 设计稿来自 Claude Design，部署运行在 Cloudflare Workers。

- **公开站**：Home / Writing / 文章详情 / Projects / Now / About，亮暗双主题、`⌘K` 命令面板、键盘快捷键 `g h/w/p/n/a`、RSS、sitemap。
- **后台管理 (`/admin`)**：Dashboard、文章 CRUD + Markdown 编辑器、标签管理、评论审核、订阅者导出、站点配置。

## 技术栈

| 维度 | 选型 |
| --- | --- |
| 框架 | Next.js 15 · App Router · React 19 |
| 部署适配 | [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) → Cloudflare Workers |
| 数据库 | Cloudflare D1（SQLite, edge-replicated） |
| ORM | Drizzle ORM + drizzle-kit |
| Markdown | unified · remark-gfm · rehype-pretty-code (shiki) |
| 认证 | PBKDF2-SHA256 + JWT (jose) · 单管理员 cookie session |
| 字体 | Newsreader（衬线） + JetBrains Mono（等宽） + Inter |

## 本地开发

```powershell
pnpm install

# 1) 在 Cloudflare 上创建 D1 数据库（只需一次）
wrangler d1 create starblog-db
#  把返回的 database_id 写入 wrangler.jsonc 里那条占位符。

# 2) 应用 schema 到本地 D1
pnpm db:migrate:local

# 3) 灌入设计稿里的 12 篇示例文章 + 5 个项目
pnpm db:seed:local

# 4) 设置本地 admin 凭证
pnpm hash my-strong-password   # 复制输出的 pbkdf2$... 字符串
cp .dev.vars.example .dev.vars
#  编辑 .dev.vars，填入 ADMIN_USERNAME / ADMIN_PASSWORD_HASH / AUTH_SECRET

# 5) 启动开发服务器（普通 Next dev）
pnpm dev

# 或用 wrangler 模拟 Cloudflare runtime
pnpm preview
```

打开 <http://localhost:3000> 查看公开站，<http://localhost:3000/admin/login> 进入后台。
也可以在公开站按 `⌘K` 搜 "Admin Studio"。

## 部署到 Cloudflare

```powershell
# 1) 应用迁移到生产 D1
pnpm db:migrate:remote
pnpm db:seed:remote   # 仅首次部署需要灌种子数据

# 2) 设置 worker 上的密钥（生产环境的 ADMIN/AUTH 凭证）
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD_HASH
wrangler secret put AUTH_SECRET

# 3) 一键发布
pnpm deploy
```

部署后访问 `https://starblog.<your-account>.workers.dev`。
绑自定义域名走 Cloudflare Dashboard → Workers → 该 worker → Custom Domains。

## 项目结构

```
src/
├─ app/
│  ├─ layout.tsx              # 根布局（注入 TopNav / SearchPalette / Hotkeys）
│  ├─ page.tsx                # 首页（hero + 计数器 + 终端 + featured + recent + topics + newsletter）
│  ├─ writing/                # /writing 列表 + /writing/[slug] 详情（含 TOC + 阅读进度）
│  ├─ projects/  now/  about/
│  ├─ feed.xml/  sitemap.ts  robots.ts
│  ├─ admin/                  # 后台 — 共享 AdminShell
│  │  ├─ login/  posts/[id]  posts/new  tags/  comments/  subscribers/  settings/
│  └─ actions/                # Server Actions：auth · posts · tags · comments · newsletter
├─ components/                # TopNav · SearchPalette · Hotkeys · HeroCounters · HeroTerminal …
├─ db/                        # Drizzle schema + getDb() 包装
├─ lib/                       # site-config · format · markdown · posts (DAL) · auth · client-events
├─ middleware.ts              # /admin/* 守卫
└─ styles/global.css          # 复刻自设计稿（28 KB CSS 变量化的 design tokens）

drizzle/
├─ migrations/0000_init.sql   # drizzle-kit 自动生成
└─ seed.sql                   # 由 scripts/generate-seed.mjs 生成

.design/                      # 原始设计稿包（git ignored）
```

## 设计来源

`/.design/blog/project/` 下保留了原始 HTML/CSS/JSX 原型 — 用作视觉对照参考（不在 git 跟踪范围内）。
本仓库的 React/Next 实现只复刻视觉，结构按 Next.js 15 最佳实践重新组织。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | Next.js 开发模式 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | OpenNext + wrangler 本地模拟部署 |
| `pnpm deploy` | 部署到 Cloudflare Workers |
| `pnpm db:generate` | 从 schema 生成新迁移 |
| `pnpm db:migrate:local` / `:remote` | 应用迁移 |
| `pnpm db:seed:local` / `:remote` | 重灌种子数据 |
| `pnpm db:studio` | 启动 Drizzle Studio 浏览 D1 |
| `pnpm hash <password>` | 生成 ADMIN_PASSWORD_HASH |
| `pnpm cf-typegen` | 重新生成 Cloudflare 绑定的 TS 类型 |
