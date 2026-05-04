import Link from "next/link";
import { fmtDate, fmtMonthDay } from "@/lib/format";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { HeroCounters } from "@/components/HeroCounters";
import { HeroTerminal } from "@/components/HeroTerminal";
import { HoverRow } from "@/components/HoverList";
import { NewsletterForm } from "@/components/NewsletterForm";

const NOW_SUMMARY = "shipping wcap v2 · writing PDB series #2";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts({ status: "published" });
  const tags = await getAllTags();
  const featured = posts.find((p) => p.pinned) ?? posts[0];
  const recent = posts.filter((p) => p.slug !== featured?.slug).slice(0, 5);
  const totalWords = posts.reduce((s, p) => s + p.words, 0);

  return (
    <div className="home-page">
      <section className="hero">
        <div
          className="ambient"
          style={{
            width: 380,
            height: 380,
            background: "#FFD9C4",
            top: -140,
            left: -80,
          }}
        />
        <div
          className="ambient"
          style={{
            width: 320,
            height: 320,
            background: "#FFF0AC",
            top: 40,
            right: -60,
          }}
        />

        <div className="hero-row">
          <div>
          <span className="hero-greeting">
            <span className="wave">👋</span> 你好，我是 {siteConfig.author.name} ·{" "}
            {siteConfig.author.location}
          </span>
          <h1 className="hero-title">
            <span className="underline">写代码</span>，读源码，<br />
            以及一些 <span className="accent">关于写代码</span>
            <br />
            的文字。
          </h1>
          <p className="hero-lede">
            我是一个软件工程师，专注于 C++ 和 Windows 平台。
          </p>
          <p className="hero-manifesto">
            <span className="hero-manifesto-slash">{"//"}</span>{" "}
            调试日记 · 源码拆解 · AI 工程化 — 慢但认真，每周大约一篇。
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/writing">
              浏览所有文章 <span>→</span>
            </Link>
            <Link className="btn" href="/about">
              关于我
            </Link>
            <Link className="btn btn-ghost" href="/feed.xml">
              ⌁ RSS
            </Link>
          </div>

          <div className="home-feature-row">
            {featured && (
              <Link href={`/writing/${featured.slug}`} className="home-feature-card">
                <div className="home-feature-eyebrow">
                  <span style={{ color: "var(--accent)" }}>★</span> 最新这篇
                </div>
                <div className="home-feature-title">{featured.title}</div>
                <div className="home-feature-foot">
                  <span>
                    {featured.readTime} min · {featured.tagLabel}
                  </span>
                  <span>↗</span>
                </div>
              </Link>
            )}
            <div className="home-feature-card home-feature-topics">
              <div className="home-feature-eyebrow">
                <span>#</span> 按主题
              </div>
              <div className="home-feature-tags">
                {tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/writing?tag=${t.id}`}
                    className={`tag ${t.id}`}
                  >
                    #{t.label}
                    <span style={{ marginLeft: 4, opacity: 0.55 }}>{t.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          </div>

          <div className="hero-col-aside">
            <div className="hero-stats-card">
              <HeroCounters
                posts={posts.length}
                words={totalWords}
                years={siteConfig.yearsWriting}
              />
            </div>
            <HeroTerminal postCount={posts.length} nowSummary={NOW_SUMMARY} />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
        <section id="featured" className="home-section">
          <div className="section-label">
            <span style={{ color: "var(--accent)" }}>★</span> Featured
          </div>
          <Link
            href={`/writing/${featured.slug}`}
            className="featured-hero"
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span className={`tag ${featured.tagId}`}>{featured.tagLabel}</span>
                {featured.series && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.6875rem",
                      color: "var(--ink-3)",
                    }}
                  >
                    SERIES · {featured.series}
                  </span>
                )}
              </div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  lineHeight: 1.15,
                  marginBottom: 14,
                  letterSpacing: "-0.018em",
                }}
              >
                {featured.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.0625rem",
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}
              >
                {featured.excerpt}
              </p>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "var(--ink-3)",
                }}
              >
                {featured.publishedAt ? fmtDate(featured.publishedAt) : ""} ·{" "}
                {featured.readTime} min read · 继续阅读 →
              </div>
            </div>
            <div className="featured-side">
              <div>
                <div style={{ color: "#999", marginBottom: 8 }}>{"// in this piece"}</div>
                <div style={{ color: "#666", lineHeight: 1.7 }}>
                  <div>
                    · <span style={{ color: "#FF5722" }}>promise_type</span>
                  </div>
                  <div>
                    · <span style={{ color: "#2563EB" }}>coroutine_handle</span>
                  </div>
                  <div>· symmetric transfer</div>
                  <div>· HALO 优化</div>
                  <div>· MSVC 19.40 实测</div>
                </div>
              </div>
              <div style={{ marginTop: 16, color: "#aaa", fontSize: "0.625rem" }}>
                {featured.words.toLocaleString()} words
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* BREAK — full-width pull quote for cadence */}
      <section className="home-break" aria-hidden="true">
        <div className="home-break-inner">
          <div className="home-break-mark">¶</div>
          <p className="home-break-quote">
            &ldquo;离金属比较近的工作让你不得不诚实 — 内存就是内存，指令周期就是指令周期。&rdquo;
          </p>
          <div className="home-break-cite">— 摘自 /about</div>
        </div>
      </section>

      {/* RECENT */}
      <section id="recent" className="home-section">
        <div className="recent-head">
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.14em",
              color: "var(--ink-4)",
              textTransform: "uppercase",
            }}
          >
            § Recent writing
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          <Link
            className="btn btn-ghost"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            href="/writing"
          >
            View all {posts.length} →
          </Link>
        </div>
        <div className="recent-list">
          {recent.map((p) => (
            <HoverRow
              key={p.slug}
              href={`/writing/${p.slug}`}
              className="recent-row"
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6875rem",
                  color: "var(--ink-4)",
                  letterSpacing: "0.02em",
                }}
              >
                {p.publishedAt ? fmtMonthDay(p.publishedAt) : ""}
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.1875rem",
                    fontWeight: 500,
                    marginBottom: 4,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "0.875rem",
                    color: "var(--ink-3)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.excerpt.slice(0, 92)}…
                </p>
              </div>
              <span className={`tag ${p.tagId} recent-row-tag`} style={{ justifySelf: "start" }}>
                {p.tagLabel}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6875rem",
                  color: "var(--ink-4)",
                  textAlign: "right",
                }}
              >
                {p.readTime}m →
              </span>
            </HoverRow>
          ))}
        </div>
      </section>

      {/* TOPICS strip */}
      <section className="home-section">
        <div className="home-meta-grid">
          <div>
            <div className="section-label">
              <span>#</span> Topics
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/writing?tag=${t.id}`}
                  className={`tag ${t.id}`}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    fontSize: "0.7813rem",
                  }}
                >
                  #{t.label}
                  <span style={{ marginLeft: 4, opacity: 0.55 }}>{t.count}</span>
                </Link>
              ))}
            </div>
            <p
              style={{
                marginTop: 16,
                fontFamily: "var(--serif)",
                fontSize: "0.875rem",
                color: "var(--ink-3)",
                lineHeight: 1.5,
              }}
            >
              这五个标签覆盖了我所有的写作范围。 点开任意一个都可以筛选对应文章。
            </p>
          </div>
          <div>
            <div className="section-label">
              <span>◌</span> Now
            </div>
            <div
              className="card now-card"
              style={{
                padding: 22,
                background: "var(--bg-tint-3)",
                border: "1px solid rgba(0,0,0,.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6875rem",
                  color: "var(--accent-3)",
                  marginBottom: 8,
                }}
              >
                ● UPDATED 4 DAYS AGO
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.9688rem",
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                正在写 <strong>PDB 逆向系列</strong> 的第二篇，关于 TPI Stream。 同时在做{" "}
                <code
                  style={{
                    background: "var(--bg-card)",
                    padding: "1px 6px",
                    borderRadius: 3,
                    fontSize: "0.8125rem",
                    fontFamily: "var(--mono)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  wcap v2
                </code>
                ，把 Win32 异步 API 全包装成可 await 的协程。
              </p>
              <Link
                href="/now"
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
              >
                查看完整 Now 页 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="home-section" style={{ scrollMarginTop: 80 }}>
        <div className="newsletter-band">
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,87,34,.15)",
              filter: "blur(40px)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6875rem",
                color: "var(--accent)",
                letterSpacing: "0.16em",
                marginBottom: 10,
              }}
            >
              NEWSLETTER · 每月一封
            </div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.75rem",
                fontWeight: 600,
                marginBottom: 10,
                letterSpacing: "-0.015em",
              }}
            >
              新文章上线第一时间送到你邮箱
            </h3>
            <p
              style={{
                fontSize: "0.9063rem",
                color: "rgba(255,255,255,.7)",
                lineHeight: 1.55,
              }}
            >
              不会发广告，不会卖东西。只是文章更新提醒 + 一些没发到博客上的零散思考。随时可退订。
            </p>
          </div>
          <NewsletterForm subscriberCount={siteConfig.newsletterCount} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <span>© {new Date().getFullYear()} {siteConfig.author.name} · built with care</span>
        <span className="home-footer-links">
          <a
            href={siteConfig.issuesUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            反馈 / Issues
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            源码 / GitHub
          </a>
          <span aria-hidden="true">·</span>
          <span>
            v3.0 · last deploy <span style={{ color: "var(--accent-3)" }}>●</span>{" "}
            on Cloudflare
          </span>
        </span>
      </footer>
    </div>
  );
}
