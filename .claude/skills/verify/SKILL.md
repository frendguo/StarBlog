---
name: verify
description: 运行 pnpm lint 和 pnpm build 验证代码改动。作为提交前 / 部署前的快速检查。
---

依次执行以下两步，遇到错误立即停止并报告。

1. `pnpm lint`
2. `pnpm build`（Next.js 构建会顺带做 TypeScript 类型检查）

如果都通过，简要汇报结果（"lint + build 都通过"即可）。如果失败，定位到具体文件 + 行号 + 错误信息，建议修复方式。

不要自动运行 `pnpm preview`（用户明确要求时再跑）——`pnpm build` 已经覆盖构建层验证。
