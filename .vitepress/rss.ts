import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

export const siteUrl = "https://baozhezhang.com/";
export const rssUrl = new URL("feed.xml", siteUrl).href;

export async function generateRss(siteConfig: SiteConfig) {
  const posts = await createContentLoader("posts/*.md", {
    render: true,
  }).load();

  const datedPosts = posts
    .map((post) => ({
      ...post,
      publishedAt: new Date(post.frontmatter.date),
    }))
    .filter((post) => !Number.isNaN(post.publishedAt.getTime()))
    .sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime());

  const feed = new Feed({
    title: "Baozhe Zhang's Blog",
    description: "Notes on robotics, motion planning, control, and software.",
    id: siteUrl,
    link: siteUrl,
    feed: rssUrl,
    feedLinks: { rss: rssUrl },
    language: "en",
    favicon: new URL("favicon.ico", siteUrl).href,
    copyright: `Copyright © 2024-${new Date().getFullYear()} Baozhe Zhang`,
    updated: datedPosts[0]?.publishedAt,
    generator: "VitePress",
    author: {
      name: "Baozhe Zhang",
      link: siteUrl,
    },
  });

  for (const post of datedPosts) {
    const postUrl = new URL(post.url, siteUrl).href;
    const tags = Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags : [];

    feed.addItem({
      title: post.frontmatter.title,
      id: postUrl,
      link: postUrl,
      date: post.publishedAt,
      published: post.publishedAt,
      description: post.frontmatter.description,
      content: post.html,
      author: [{ name: "Baozhe Zhang", link: siteUrl }],
      category: tags.map((name) => ({ name })),
    });
  }

  await writeFile(resolve(siteConfig.outDir, "feed.xml"), feed.rss2(), "utf8");
}
