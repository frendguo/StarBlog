/**
 * Seed data — mirrors `.design/blog/project/data.js` so first-time deploys
 * have content matching the original prototype. Used by the seed.sql generator.
 */

export const SEED_TAGS = [
  { id: "cpp", label: "C++", hint: "现代 C++ 实践与底层", color: "cpp", sort: 1 },
  { id: "win", label: "Windows", hint: "Win32 / WinRT / 调试", color: "win", sort: 2 },
  { id: "ai", label: "AI", hint: "LLM 工具链与思考", color: "ai", sort: 3 },
  { id: "note", label: "随笔", hint: "关于工程师生活", color: "note", sort: 4 },
  { id: "tool", label: "工具", hint: "开发环境与小品", color: "tool", sort: 5 },
] as const;

export type SeedTagId = (typeof SEED_TAGS)[number]["id"];

export interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tagId: SeedTagId;
  series?: string;
  pinned?: boolean;
  publishedAt: string; // ISO date
}

export const SEED_POSTS: SeedPost[] = [
  {
    slug: "cpp-coroutines-deep-dive",
    title: "C++20 Coroutines: 一次彻底的源码级拆解",
    excerpt:
      "从 promise_type、coroutine_handle 到对称转移，把协程的运行模型、内存布局和调度细节一次讲清。附 MSVC 编译器实际生成的代码对照。",
    tagId: "cpp",
    series: "Modern C++",
    pinned: true,
    publishedAt: "2026-04-12",
    body: SAMPLE_CPP_COROUTINES_BODY(),
  },
  {
    slug: "windows-handle-leak-hunt",
    title: "一次诡异的 Windows 句柄泄漏排查实录",
    excerpt:
      "生产环境进程跑到 27 万句柄后崩溃。WPA、!handle、Application Verifier 三件套上场，最终问题指向了 ATL CComPtr 的一个边界情况。",
    tagId: "win",
    series: "调试日记",
    publishedAt: "2026-03-28",
    body: shortBody(
      "一次诡异的 Windows 句柄泄漏排查实录",
      "生产环境进程跑到 27 万句柄后崩溃。本篇还原排查全过程。"
    ),
  },
  {
    slug: "ai-coding-workflow-2026",
    title: "我的 2026 AI Coding 工作流",
    excerpt:
      "从 Claude Code 到本地 Continue + Ollama，一年下来的工具沉淀。哪些是真正提升效率的，哪些只是噪音 — 一份诚实的清单。",
    tagId: "ai",
    publishedAt: "2026-03-15",
    body: shortBody(
      "我的 2026 AI Coding 工作流",
      "一年下来的工具沉淀清单。"
    ),
  },
  {
    slug: "msvc-pdb-internals",
    title: "PDB 文件格式逆向笔记 (一)",
    excerpt:
      "MSF 容器、Stream Directory、TPI/IPI 流。Microsoft 没有给的文档，由 LLVM 和我们自己来补。",
    tagId: "cpp",
    series: "PDB 逆向",
    publishedAt: "2026-02-20",
    body: shortBody("PDB 文件格式逆向笔记 (一)", "MSF / Stream Directory / TPI&IPI 流。"),
  },
  {
    slug: "agentic-ide-thoughts",
    title: "关于 Agentic IDE，我想得有点多",
    excerpt:
      "我们正在见证 IDE 从「代码编辑器」到「意图协商器」的范式迁移。这不是 Copilot 的延续，而是一个全新的物种。",
    tagId: "note",
    publishedAt: "2026-02-08",
    body: shortBody("关于 Agentic IDE，我想得有点多", "范式迁移的随想。"),
  },
  {
    slug: "win32-modern-cpp-wrapper",
    title: "用 Modern C++ 包装 Win32：一份风格指南",
    excerpt:
      "RAII 封装 HANDLE、用 std::expected 替代 GetLastError、把回调地狱改写成 awaitable。代码即文档。",
    tagId: "win",
    series: "Modern C++",
    publishedAt: "2026-01-22",
    body: shortBody("用 Modern C++ 包装 Win32：一份风格指南", "RAII / expected / awaitable。"),
  },
  {
    slug: "llm-context-engineering",
    title: "Context Engineering：被低估的 LLM 实战技能",
    excerpt:
      "Prompt Engineering 已经过时了。真正决定输出质量的，是你怎么组织上下文窗口里那 200K tokens。",
    tagId: "ai",
    publishedAt: "2025-12-30",
    body: shortBody("Context Engineering", "上下文窗口的工程化。"),
  },
  {
    slug: "wsl2-dev-setup",
    title: "我的 WSL2 + Windows Terminal 开发环境",
    excerpt:
      "一份给 C++ 开发者的 dotfiles。包括 zsh、tmux、neovim、clangd 与 windbg 之间的桥接技巧。",
    tagId: "tool",
    publishedAt: "2025-12-10",
    body: shortBody("WSL2 + Windows Terminal 开发环境", "dotfiles 与桥接技巧。"),
  },
  {
    slug: "thinking-in-decades",
    title: "以十年为单位思考",
    excerpt: "工程师的职业焦虑大多来自于把时间尺度压得太短。一个小思考实验。",
    tagId: "note",
    publishedAt: "2025-11-18",
    body: shortBody("以十年为单位思考", "把时间尺度拉长。"),
  },
  {
    slug: "directx-com-revisited",
    title: "重新审视 DirectX 中的 COM",
    excerpt:
      "IUnknown、IID、智能指针 — 这套二十年前的接口范式，在 D3D12 时代为什么仍然成立？",
    tagId: "cpp",
    publishedAt: "2025-10-30",
    body: shortBody("重新审视 DirectX 中的 COM", "二十年前的范式为什么仍然成立。"),
  },
  {
    slug: "on-reading-source-code",
    title: "论读源码",
    excerpt: "读代码不是从 main 开始，是从你疼痛的那一行开始。",
    tagId: "note",
    publishedAt: "2025-10-12",
    body: shortBody("论读源码", "从你疼痛的那一行开始。"),
  },
  {
    slug: "claude-code-power-user",
    title: "Claude Code Power-User Tips",
    excerpt:
      "Hooks、子代理、自定义 slash 命令 — 让 Claude Code 成为你工作流中可编程的同事，而不是聊天机器人。",
    tagId: "ai",
    publishedAt: "2025-09-22",
    body: shortBody("Claude Code Power-User Tips", "Hooks / 子代理 / slash。"),
  },
];

export const SEED_PROJECTS = [
  {
    name: "wcap",
    description: "一个轻量的 Windows 屏幕录制器，C++ + WinRT 写成，输出 MP4/WebM。",
    language: "C++",
    stars: "2.4k",
    year: "2025—",
    state: "maintained",
    url: "https://github.com/frendguo/wcap",
    sort: 1,
  },
  {
    name: "pdb-explorer",
    description: "PDB 文件的图形化浏览器。配合 PDB 逆向系列文章使用。",
    language: "C++",
    stars: "380",
    year: "2024—",
    state: "wip",
    url: null,
    sort: 2,
  },
  {
    name: "claude-md-toolkit",
    description: "一组 Claude Code 项目模板与 hooks，加速你的 AI 工作流配置。",
    language: "TypeScript",
    stars: "1.1k",
    year: "2025—",
    state: "maintained",
    url: null,
    sort: 3,
  },
  {
    name: "modern-win32",
    description: "把 Win32 API 用 C++23 重新包装一遍。RAII、coroutines、std::expected。",
    language: "C++",
    stars: "210",
    year: "2024—2025",
    state: "paused",
    url: null,
    sort: 4,
  },
  {
    name: "this-blog",
    description: "你正在看的这个博客。Next.js + Cloudflare D1。源码开放。",
    language: "TypeScript",
    stars: "—",
    year: "2026—",
    state: "live",
    url: null,
    sort: 5,
  },
] as const;

function shortBody(title: string, lede: string): string {
  return `## 引子

${lede}

这是占位文字。在后台编辑器把真实内容写进来，前台会自动用 Markdown 渲染。

## 一些段落

> 工程师的诚实，藏在他写代码的细节里。

- 第一条要点
- 第二条要点
- 第三条要点

## 收束

把"${title}"这一篇写完后，我会回到 Claude Code 把脚手架补完。`;
}

function SAMPLE_CPP_COROUTINES_BODY(): string {
  return `## 引子

C++20 的协程是一个奇怪的特性。它的语法极其简洁 — 只需要 \`co_await\`、\`co_yield\`、\`co_return\` 三个关键字 — 但它的运行模型却是我见过最复杂的 C++ 特性之一。**简洁的表面之下，藏着大量编译器自动生成的代码**。

这篇文章不打算从「协程是什么」讲起。如果你正在阅读，我假设你已经知道生成器和 awaitable 的基本用法。我们要做的是更进一步：*钻到编译器生成的代码里去看看*，理解 C++ 协程到底是怎么工作的。

> "Coroutines are not a feature, they are a building block." — 一位 ISO C++ 委员会成员，2017 年的 Kona 会议上。

## 运行模型

一个 C++ 协程在被调用时，会经历五个明确的阶段。让我们用一个最小的例子来说明 — 一个简单的 \`task<int>\`：

\`\`\`cpp
struct task {
  struct promise_type {
    int value;
    task get_return_object() { return task{*this}; }
    std::suspend_never initial_suspend() noexcept { return {}; }
    std::suspend_always final_suspend() noexcept { return {}; }
    void return_value(int v) { value = v; }
    void unhandled_exception() { std::terminate(); }
  };
  std::coroutine_handle<promise_type> h;
};
\`\`\`

当编译器看到任何返回 \`task\` 且包含 \`co_*\` 关键字的函数，它会做以下五件事：

1. 分配协程帧 (frame)，通常通过 \`operator new\`
2. 构造 \`promise_type\` 实例，存入帧中
3. 调用 \`get_return_object()\` 拿到返回值
4. \`co_await initial_suspend()\` 决定是否立即执行
5. 执行函数体，遇到 \`co_*\` 关键字时挂起或返回

注意第 1 步的「通常」。如果编译器能证明协程帧的生命周期不会逃逸，它可以省略堆分配 — 这就是 **HALO 优化**（Heap Allocation eLision Optimization）。GCC 和 Clang 在 \`-O2\` 下大多能做到，MSVC 直到 17.8 才稳定支持。

## 内存布局

协程帧在内存里长什么样？这是一个被严重低估的细节。Standard 没有规定具体布局，但所有主流实现都遵循类似的模式：

| Offset | Field | 说明 |
| --- | --- | --- |
| 0x00 | \`resume_fn\` | function pointer |
| 0x08 | \`destroy_fn\` | function pointer |
| 0x10 | \`promise_type\` | user-defined state |
| 0x?? | parameters | copied by-value |
| 0x?? | locals + temporaries | spilled across suspend points |
| 0x?? | state index | which suspend point |

\`coroutine_handle<T>\` 本质上就是一个对协程帧地址的薄包装。它的 \`resume()\` 调用 \`resume_fn\`，\`destroy()\` 调用 \`destroy_fn\`。整个协程系统的运行时开销，*仅此而已*。

## 对称转移

这是 C++20 协程最精妙的设计。如果 \`await_suspend()\` 返回的是另一个 \`coroutine_handle\`，编译器会把它编译成一个 **tail call**，而不是真的「先返回，再 resume」。

这意味着：连续 await 1000 个协程，栈深度仍然是常量。这是 C++ 协程能写「递归」awaitable 的关键。

## MSVC 实际生成的代码

理论说够了。让我们看 MSVC \`cl.exe 19.40\` 在 \`/O2\` 下对最开头那个 task 实际生成了什么。我把汇编简化成可读的伪代码：

\`\`\`cpp
// my_coro$_ResumeCoro@4:
resume(frame*) {
  switch (frame->state) {
  case 0:
    frame->promise.value = compute();
    frame->state = 2; // final
    return;
  case 2:
    // final_suspend, do nothing
    return;
  }
}
\`\`\`

看起来很无聊？这正是要点。**编译器把所有的复杂性吃掉了，留给你的只是一个 switch**。这也是为什么协程的运行时开销可以做到接近零。

## 收束

关于 C++ 协程，你应该带走三件事：

- 它是一个底层构件，不是一个开箱即用的特性 — 你需要自己 / 第三方实现 task 类型。
- 它的运行时开销主要在堆分配，HALO 优化能把它消除到接近零。
- 对称转移让深层组合的 awaitable 在常量栈空间下工作 — 这是它最被低估的能力。

下一篇我会写一下我自己实现的 \`task<T>\` 类型，和如何用它把 Win32 异步 API 包装成可 await 的形式。敬请期待。`;
}
