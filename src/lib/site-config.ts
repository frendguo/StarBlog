export const siteConfig = {
  name: "frendguo",
  tagline: "写代码、读源码，以及一些关于写代码的文字",
  description:
    "一个软件工程师的博客，记录 C++、Windows、AI 工程化的实践笔记与随想。",
  author: {
    name: "frendguo",
    realName: "郭潇",
    email: "hello@frendguo.com",
    location: "杭州",
    twitter: "frendguo",
    github: "frendguo",
  },
  url: "https://frendguo.com",
  rssUrl: "/feed.xml",
  repoUrl: "https://github.com/frendguo/StarBlog",
  issuesUrl: "https://github.com/frendguo/StarBlog/issues",
  newsletterCount: 312,
  yearsWriting: 5,
  keyboardShortcuts: {
    home: "h",
    writing: "w",
    projects: "p",
    now: "n",
    about: "a",
  },
} as const;

export const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/" },
  { id: "writing", label: "Writing", href: "/writing" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "now", label: "Now", href: "/now" },
  { id: "about", label: "About", href: "/about" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];
