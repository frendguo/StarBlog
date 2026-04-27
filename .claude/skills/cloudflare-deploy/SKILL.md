---
name: cloudflare-deploy
description: StarBlog 部署到 Cloudflare Workers 的实战流程。每当用户要部署 StarBlog、运行 Cloudflare/OpenNext/Wrangler CLI、处理 D1 生产迁移/seed、绑定自定义域名、排查 Worker 500、Worker size 超限、pnpm/OpenNext 打包问题、wrangler.jsonc 绑定问题时都使用本 skill；即使用户只说“上线”“发布”“部署到 Cloudflare”“帮我跑 deploy”，也要先按这里的检查表执行。
---

# StarBlog Cloudflare Deploy

这个 skill 固化 StarBlog 这次从本地配置到 Cloudflare Workers 生产发布的完整经验。目标不是“把命令跑完”，而是把生产 D1、OpenNext bundle、Workers 限制、pnpm 布局和线上 smoke test 都纳入同一条部署链路。

## 基本原则

- 生产操作必须有用户明确授权：`pnpm db:migrate:remote`、`pnpm db:seed:remote`、`pnpm run deploy` 都会影响线上。
- 部署前先验证：按 `verify` skill 的顺序跑 `pnpm lint` 和 `pnpm build`，失败就停。
- 使用 `pnpm run deploy`，不要直接用 `pnpm deploy`。在当前 pnpm 版本中，`pnpm deploy` 会被解析成 pnpm 内置命令，可能报 `ERR_PNPM_CANNOT_DEPLOY`。
- 本项目是 OpenNext + Cloudflare Workers + D1，不要改掉根 layout 的 `dynamic = "force-dynamic"` 来追求 SSG。
- 遇到网络/代理类异常时，优先在单次命令环境里清理代理变量，不要全局改用户环境：
  ```powershell
  Remove-Item Env:\HTTP_PROXY -ErrorAction SilentlyContinue
  Remove-Item Env:\HTTPS_PROXY -ErrorAction SilentlyContinue
  Remove-Item Env:\ALL_PROXY -ErrorAction SilentlyContinue
  $env:WRANGLER_SEND_METRICS='false'
  ```

## 部署检查表

### 1. 确认 Cloudflare 登录和配置

```powershell
pnpm exec wrangler whoami
```

检查 `wrangler.jsonc`：

- `name` 应为 `starblog`
- `main` 应为 `.open-next/worker.js`
- `assets.directory` 应为 `.open-next/assets`
- `vars.SITE_URL` 应为生产站点 URL
- `d1_databases` 只保留代码实际使用的 `DB` binding
- `database_id` 必须是真实 D1 ID，不应是 `REPLACE_WITH_REAL_ID_AFTER_wrangler_d1_create`
- 不要额外加同库的 `"remote": true` D1 binding；它会让 `initOpenNextCloudflareForDev()` 在构建期启动 remote binding proxy，可能导致构建访问异常地址并失败

### 2. 确认 secrets

```powershell
pnpm exec wrangler secret list
```

应至少有：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SECRET`

如果要生成密码哈希：

```powershell
pnpm hash <password>
pnpm exec wrangler secret put ADMIN_PASSWORD_HASH
```

不要在聊天或日志里输出真实 secret 值。

### 3. 验证本地构建

```powershell
pnpm lint
pnpm build
```

`next lint` 的废弃提示不阻塞部署。`jose` 关于 `CompressionStream` / `DecompressionStream` 的 Edge Runtime warning 需要关注，但如果当前功能和 preview 正常，不一定是阻塞项。

### 4. 生产 D1 迁移

用户明确授权后执行：

```powershell
pnpm db:migrate:remote
```

如果是首次上线或确实要灌入种子数据，先查远程数据量：

```powershell
pnpm exec wrangler d1 execute starblog-db --remote --command "SELECT 'posts' AS table_name, COUNT(*) AS count FROM posts UNION ALL SELECT 'tags', COUNT(*) FROM tags UNION ALL SELECT 'projects', COUNT(*) FROM projects UNION ALL SELECT 'settings', COUNT(*) FROM settings;"
```

只有确认远程表为空，或用户明确接受覆盖数据时，才执行：

```powershell
pnpm db:seed:remote
```

原因：`scripts/generate-seed.mjs` / `drizzle/seed.sql` 会先 `DELETE FROM comments/posts/tags/projects/subscribers/settings`，不是无害的增量 seed。

### 5. 本地 Cloudflare preview

部署前最好跑一次 OpenNext + Wrangler runtime 预览：

```powershell
pnpm exec opennextjs-cloudflare build
pnpm exec opennextjs-cloudflare preview
```

然后请求首页：

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8787' -UseBasicParsing -SkipHttpErrorCheck
```

如果本地 preview 返回 500，先不要部署；本地能复现的 Worker runtime 错误通常比线上 tail 更好查。

### 6. 生产部署

```powershell
pnpm run deploy
```

记录输出里的：

- Worker URL，例如 `https://starblog.<account>.workers.dev`
- Current Version ID
- Worker bindings
- Total Upload / gzip
- Worker Startup Time

### 7. 线上 smoke test

至少检查：

```powershell
Invoke-WebRequest -Uri 'https://starblog.<account>.workers.dev' -UseBasicParsing -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://starblog.<account>.workers.dev/writing/cpp-coroutines-deep-dive' -UseBasicParsing -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://starblog.<account>.workers.dev/admin/login' -UseBasicParsing -SkipHttpErrorCheck
```

期望都是 `200`。如果自定义域名已绑定，也检查 `https://frendguo.com` 是否打到新 Worker；如果仍是旧站，说明还需要配置 Cloudflare Custom Domain / route。

## 这次部署踩过的坑

### `pnpm deploy` 不是项目 deploy 脚本

现象：

```text
ERR_PNPM_CANNOT_DEPLOY A deploy is only possible from inside a workspace
```

处理：使用 `pnpm run deploy`。

### 构建访问 `103.246.246.144:443` 被拒绝

现象：

```text
connect ECONNREFUSED 103.246.246.144:443
```

本次根因：`wrangler.jsonc` 里多了一个同库 D1 binding，且设置了 `"remote": true`。OpenNext dev context 在构建期通过 Wrangler `getPlatformProxy()` 尝试创建 remote binding proxy。

处理：

- 保留代码实际使用的 `DB` binding
- 删除多余的 `starblog_db` / `"remote": true` binding
- 清理代理环境变量后重试

### remote seed 网络失败

现象：SQL 文件上传后 Wrangler 报 `fetch failed`。日志里 API 可能已经返回 200，但命令仍因后续请求失败退出。

处理：

1. 先查远程表计数，确认是否回滚或部分写入。
2. 用清理代理 + 关闭 metrics 的环境重试。
3. 不要盲目重复 seed，因为 seed 会清表。

### Worker size 超过免费计划 3 MiB

现象：

```text
Your Worker exceeded the size limit of 3 MiB. Please upgrade to a paid plan to deploy Workers up to 10 MiB.
```

本次最大来源是 `rehype-pretty-code` 顶层引入 `shiki` full bundle，哪怕传自定义 highlighter，bundler 仍把大量语言包带进 Worker。

可选处理：

- 免费计划优先：移除服务端 Shiki/`rehype-pretty-code`，保留普通 Markdown `<pre><code>` 和 CSS 样式。
- 要保留高亮：升级 Workers paid plan，或改为构建期预渲染/静态化高亮，或实现只打包必要语言且确认不会从 `shiki` full bundle 顶层引入。

### 部署成功但线上所有路径 500

现象：`/`、`/admin/login`、`/robots.txt` 都返回 `500 Internal Server Error`。

本地 preview 复现后日志显示：

```text
Dynamic require of "/.next/server/middleware-manifest.json" is not supported
```

根因：OpenNext + pnpm 默认 symlink `node_modules` 布局在 Windows/Workers 打包中可能漏掉 manifest 动态 require。公开案例建议 hoisted 布局。

处理：新增仓库级 `.npmrc`：

```ini
node-linker=hoisted
shamefully-hoist=true
```

然后重装依赖：

```powershell
$env:CI='true'
pnpm install
```

再重新 `opennextjs-cloudflare build`、preview、deploy。

### `.open-next` 无法删除

现象：

```text
EPERM, Permission denied: ... .open-next
```

根因通常是 `wrangler preview/tail/workerd` 进程仍持有文件。

处理：查并停止当前项目相关的 `wrangler` / `workerd` / `esbuild` 进程，再重试构建。不要杀掉无关系统进程或其他项目服务。

## 输出给用户的汇报格式

部署结束后用简短报告说明：

- 是否部署成功
- Worker URL
- Version ID
- 已执行的生产 D1 操作
- smoke test 结果
- 留下的代码/配置改动
- 仍需用户手动处理的事项，例如自定义域名绑定

示例：

```text
已部署成功。
Worker URL: https://starblog.<account>.workers.dev
Version ID: ...

验证：
- lint/build 通过
- D1 migration 已应用
- seed 写入 posts/tags/projects
- /、/writing/...、/admin/login 均返回 200

注意：frendguo.com 仍指向旧站，需要在 Cloudflare Custom Domains/routes 绑定到 starblog Worker。
```

## 触发后的决策

- 用户只是问“怎么部署”：解释流程，不执行生产命令。
- 用户说“帮我执行/部署吧”：视为生产授权，但仍先跑 lint/build 和必要配置检查。
- 用户要求 seed：先检查远程表计数并提醒会清表。
- 用户遇到 500：优先跑本地 `opennextjs-cloudflare preview` 复现，再看 Wrangler 日志。
- 用户在免费计划遇到 size limit：先分析 bundle 来源，再给出“移除服务端高亮/升级计划/改构建期高亮”的取舍。
