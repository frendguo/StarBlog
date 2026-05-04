# Changelog

记录 StarBlog 已发布到主分支的可见变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号沿用 `package.json`（当前 `0.1.0`，仍在 pre-1.0 阶段）。

最新版本始终对应 `main` HEAD；提交粒度 commit 详见 `git log`。

## [Unreleased]

### Added
- 公开站底部 footer 增加 GitHub Issues / 源码链接，并引入 `.github/ISSUE_TEMPLATE/`（bug / feature 两个最小模板 + 邮件 contact link），打开外部反馈通道。
- README 顶部新增「问题反馈 / Feedback」段落，并指向 `CHANGELOG.md`。
- 公开站接入 OpenGraph 图片（`src/app/opengraph-image.tsx`，1200×630 静态预渲染品牌图）。
- 写作详情页注入 `BlogPosting` JSON-LD（含标题、摘要、发布 / 修改时间、作者、关键字、字数与阅读时长）。
- 首页注入 `WebSite` JSON-LD（站点级实体 + 作者发布者）。
- 写作详情页 metadata 补充 canonical、OG `url`、`tags` 与 `twitter` summary_large_image card。

### Changed
- _(留空)_

### Fixed
- _(留空)_

## [0.1.0] - 2026-05

首个跑通 Cloudflare Workers + D1 的可用版本。截至 commit `066d06a` 之前，主要特性：

### 基础平台
- Next.js 15 (App Router) + React 19 + TypeScript strict + ESLint 9 flat config。
- 通过 `@opennextjs/cloudflare` 部署到 Cloudflare Workers，数据存储 Cloudflare D1（SQLite）。
- Drizzle ORM + drizzle-kit 管理 schema；`scripts/generate-seed.mjs` 生成 seed 数据。
- GitHub Actions 三条 workflow：`ci.yml`（lint + build）、`e2e.yml`（push main / 手动跑 P0 套件）、`deploy.yml`（自动部署）。

### 公开站
- 首页：hero + counters + 终端动画 + featured / recent / topics + newsletter band。
- `/writing` 文章列表（含按 tag 过滤的 query string）、`/writing/[slug]` 文章详情（TOC + 阅读进度 + ProseEnhancer + 评论提交与展示）。
- `/projects` `/now` `/about` 静态页面、`/feed.xml` RSS、`sitemap.ts` 与 `robots.ts`。
- 全站 `⌘K` 命令面板与 `g h/w/p/n/a` 快捷键、亮暗双主题（`[data-theme="dark"]` CSS 变量切换）。
- 移动端适配。
- 字体堆栈强化：Inter / Newsreader 西文优先，CJK 落到 PingFang / 思源系列依次回退。
- 排版：CJK-friendly Markdown（remark-cjk-friendly），`heti` 风格中文标点（`palt`/`hanging-punctuation`），shiki 双主题代码高亮（`github-light` / `github-dark-dimmed`）。

### 内容渲染
- Markdown 流水线：unified · remark-parse · remark-gfm · remark-cjk-friendly → remark-rehype → rehype-shift-headings · rehype-img-alt-fallback · rehype-figure · `@shikijs/rehype/core` (shiki ^3.16) · rehype-slug · rehype-autolink-headings · rehype-stringify。
- shiki 用 `shiki/core` + 显式 langs 列表替代 bundle-full，把 Worker handler 从 13.24 MiB 压到 5.66 MiB（gzip 1.23 MiB）。
- 修复 TOC 重复、heading 层级、图片 alt 与 CJK 标点。

### 后台 `/admin/*`
- 单管理员模型：PBKDF2-SHA256 (10 万次 WebCrypto) + `jose` JWT cookie session，TTL 24h。
- middleware 守卫所有 `/admin/*`，`AUTH_SECRET` 缺失时刻意重定向到 `?err=config` 而非放行（安全设计）。
- Dashboard、文章 CRUD + Markdown 编辑器、标签管理、评论审核、订阅者导出、站点配置。

### 测试
- Playwright e2e 套件作为唯一测试形态。`tests/e2e/` 覆盖：
  - public：smoke / 首页 / Writing 列表 / 文章详情（G1-G3 回归）/ RSS / 评论提交。
  - admin：登录 / middleware 守卫 / 文章 CRUD / 文章列表 / 评论审核。
- 优先级标签 `@P0` / `@P1` / `@P2`，CI 入口 `pnpm test:e2e:p0`。
- `playwright.config.ts` 自动起 `next dev -p 3001`，CI 下 retries=2、reporter=`github`。

### 已知遗留
- 公开站 footer 暂只在首页存在，writing 列表 / 文章详情 / projects 等页面没有显式 footer。
- 没有 OpenGraph 图片或 JSON-LD 结构化数据（roadmap 上）。
- `/writing` 暂无搜索 / 关键字过滤（roadmap 上）。
- 公开 `/tags` 发现页未上线（admin 有标签后台，公开站只能从文章里的 tag 链接进入 `/writing?tag=...`）。

[Unreleased]: https://github.com/frendguo/StarBlog/compare/main...HEAD
[0.1.0]: https://github.com/frendguo/StarBlog/tree/main
