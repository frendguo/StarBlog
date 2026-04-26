import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-narrow" style={{ paddingTop: 120, textAlign: "center" }}>
      <div className="page-eyebrow">404 · 没找到</div>
      <h1 className="page-title">这里什么也没有。</h1>
      <p className="page-lede" style={{ margin: "0 auto 32px" }}>
        你访问的链接已经被搬走，或者从未存在过。回到主页继续浏览。
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link className="btn btn-primary" href="/">
          回首页
        </Link>
        <Link className="btn" href="/writing">
          浏览文章
        </Link>
      </div>
    </div>
  );
}
