import { defineConfig } from "vitepress";
import { getPosts } from "./theme/serverUtils";
import { generateRss } from "./rss";
// import mathjax3 from "markdown-it-mathjax3";
import footnote from "markdown-it-footnote";

const pageSize = 10;

export default defineConfig({
  title: "BAOZHE",
  base: "/",
  description: "Baozhe Zhang's personal website on robotics, motion planning, control, and reinforcement learning.",
  ignoreDeadLinks: true,
  cleanUrls: true,
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }],
    ["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" }],
    ["link", { rel: "alternate", type: "application/rss+xml", title: "Baozhe Zhang's Blog", href: "/feed.xml" }],
    ["meta", { name: "author", content: "Baozhe Zhang" }],
    ["meta", { name: "keywords", content: "Baozhe Zhang, robotics, motion planning, control, reinforcement learning" }],
  ],
  markdown: {
    math: true, 
    config: (md) => {
      md.use(footnote);
    }, 
  },
  themeConfig: {
    pageSize,
    posts: await getPosts(),
    nav: [
      { text: "Home", link: "/" },
      { text: "Blog", link: "/blog" },
      // { text: "Category", link: "/pages/category" },
      { text: "Archives", link: "/pages/archives" },
      { text: "Tags", link: "/pages/tags" },
    ],
    search: {
      provider: "local",
    },
    //outline:[2,3],
    // outline: {
    //   label: "outline",
    // },
    socialLinks: [
      { icon: "github", link: "https://github.com/zhangbaozhe" },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" aria-label="Google Scholar" role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M5.242 13.769 0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269M12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14"/></svg>',
        },
        ariaLabel: "Google Scholar",
        link: "https://scholar.google.com/citations?user=L7o6M0UAAAAJ&hl=en",
      },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" aria-label="RSS" role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24zM3.291 17.415a3.3 3.3 0 0 1 3.293 3.295A3.303 3.303 0 0 1 3.283 24C1.47 24 0 22.526 0 20.71s1.475-3.294 3.291-3.295M15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91"/></svg>',
        },
        ariaLabel: "Subscribe via RSS",
        link: "/feed.xml",
      },
    ],
  } as any,
  srcExclude: ["README.md"],

  buildEnd: generateRss,

  vite: {
    server: { port: 5000 },
  },
});
