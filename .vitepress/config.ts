import { defineConfig } from "vitepress";
import { getPosts } from "./theme/serverUtils";

const pageSize = 10;

export default defineConfig({
  title: "Baozhe",
  base: "/",
  description: "",
  ignoreDeadLinks: true,
  cleanUrls: true,
  themeConfig: {
    posts: await getPosts(pageSize),
    nav: [
      { text: "Home", link: "/" },
      { text: "Blog", link: "/blog"}, 
      { text: "Category", link: "/pages/category" },
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
          svg: '<svg xmlns="http://www.w3.org/2000/svg" aria-label="Google Scholar" role="img"viewBox=" 0 0 512 512"><rect width="512" height="512" rx="15%" fill="#4285f4"/><path fill="#ffffff" d="M213 111l-107 94h69c5 45 41 64 78 67-7 18-4 27 7 39-43 1-103 26-103 67 4 45 63 54 92 54 38 1 81-19 90-54 4-35-10-54-31-71-23-18-28-28-21-40 15-17 35-27 39-51 2-17-2-28-6-43l45-38-1 16c-3 2-5 6-5 9v103c2 13 22 11 23 0V160c0-3-2-7-5-8v-25l16-16zm58 141c-61 10-87-87-38-99 56-11 83 86 38 99zm-5 73c60 13 61 63 10 78-44 9-82-4-81-30 0-25 35-48 71-48z"/></svg>',
        },
        link: "https://scholar.google.com/citations?user=L7o6M0UAAAAJ&hl=en",
      },
    ],
  } as any,
  srcExclude: ["README.md"],

  vite: {
    server: { port: 5000 },
  },
});
