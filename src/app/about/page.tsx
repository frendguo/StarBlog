import type { Metadata } from "next";
import Link from "next/link";
import { SectionTabs } from "@/components/SectionTabs";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "关于",
  description: `${siteConfig.author.realName} (${siteConfig.author.name}) — ${siteConfig.tagline}`,
};

export default function AboutPage() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <SectionTabs />
      <div className="page-eyebrow">/about · 介绍我自己</div>
      <h1 className="page-title">关于</h1>
      <div className="about-intro-card">
        <div className="about-avatar">郭</div>
        <div>
          <h2 className="about-intro-title">
            你好，我是 <span style={{ color: "var(--accent)" }}>{siteConfig.author.name}</span>
          </h2>
          <p className="about-intro-copy">
            常驻 {siteConfig.author.location}，2018 年加入开发。主栈是系统软件、C++、Windows 与 AI 工程化。
          </p>
          <div className="about-intro-meta">
            <span>📍 {siteConfig.author.location}</span>
            <span>⌘ 2018 加入开发</span>
          </div>
        </div>
      </div>

      <div className="prose" style={{ maxWidth: "none" }}>
        <p>
          你好。我是 <strong>{siteConfig.author.name}</strong> — 真名{siteConfig.author.realName} —
          一个住在 <strong>{siteConfig.author.location}</strong> 的软件工程师。 目前在一家不能透露名字的公司写
          C++ 和一些 Windows 平台的底层代码，业余时间研究 AI 工具链，偶尔写写文字。
        </p>

        <h2 id="about-work">我做什么</h2>
        <p>
          白天的工作是 <strong>系统软件</strong> — Win32、COM、DirectX、调试器协议这一类。
          我喜欢这种「离金属比较近」的工作，因为它让你不得不诚实：内存就是内存， 指令周期就是指令周期，你没有办法靠堆砌抽象来糊弄过去。
        </p>
        <p>
          晚上和周末，我在做几个开源项目（见{" "}
          <Link href="/projects" style={{ color: "var(--accent)" }}>
            Projects
          </Link>
          ）， 以及把 AI 编程工具集成到这套底层工作流里。 后者比想象中有趣得多 — 它不是
          「AI 帮你写代码」，而是 <em>「AI 让你愿意去碰你以前嫌麻烦的代码」</em>。
        </p>

        <h2 id="about-write">我写什么</h2>
        <p>主要三类：</p>
        <ul>
          <li>
            <strong>技术深挖</strong>：源码拆解、调试日记、C++ 和 Windows 的怪异角落。
          </li>
          <li>
            <strong>AI 工程</strong>：作为一个老派工程师，怎么和 LLM 协作而不被它牵着走。
          </li>
          <li>
            <strong>随笔</strong>：偶尔写一些关于这个行业、关于做工程师本身的零散思考。
          </li>
        </ul>

        <h2 id="about-stack">这个博客本身</h2>
        <p>
          用 <code>Next.js 15</code> + <code>OpenNext</code> 部署在 Cloudflare Workers，
          数据存 D1，自写主题。字体是 <code>Newsreader</code> + <code>JetBrains Mono</code>。
          源码开放在 GitHub。 没有 cookie，没有埋点 — 因为我也想知道有没有人读，但不想知道你是谁。
        </p>

        <h2 id="about-contact">联系</h2>
        <p>
          欢迎邮件给我：
          <a href={`mailto:${siteConfig.author.email}`} style={{ color: "var(--accent)" }}>
            {siteConfig.author.email}
          </a>
          。 或者在{" "}
          <a
            href={`https://twitter.com/${siteConfig.author.twitter}`}
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--accent)" }}
          >
            X / Twitter
          </a>{" "}
          上发 DM。 回信可能慢，但都会回。
        </p>

        <p
          style={{
            marginTop: 56,
            fontFamily: "var(--mono)",
            fontSize: "0.75rem",
            color: "var(--ink-4)",
          }}
        >
          ── 谢谢你读到这里 ──
        </p>
      </div>
    </div>
  );
}
