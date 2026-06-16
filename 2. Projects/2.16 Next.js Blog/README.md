# Project 2.16 — Next.js Blog

**Lecture Notes:** 19. Next.js Foundations, 20. Next.js Advanced

## What You're Building

A full-featured blog built with Next.js App Router. Posts are stored as Markdown
files in the repo (no database needed — this is a common pattern for personal blogs).

Features: homepage with post list, individual post pages, tag filtering, dark mode,
RSS feed, and SEO metadata.

---

## Setup

```bash
npx create-next-app@latest nextjs-blog --typescript --tailwind --app
cd nextjs-blog
npm install gray-matter next-mdx-remote
npm run dev
```

`gray-matter` parses the frontmatter (metadata) from Markdown files.
`next-mdx-remote` renders Markdown as React components on the server.

---

## Task 1 — Folder Structure

```
nextjs-blog/
  app/
    page.tsx              ← homepage (post list)
    blog/
      [slug]/
        page.tsx          ← individual post
    tags/
      [tag]/
        page.tsx          ← posts filtered by tag
    layout.tsx            ← root layout (nav + footer)
    not-found.tsx         ← 404 page
  content/
    posts/
      hello-world.md      ← your first post!
      getting-started-with-nextjs.md
      (write 3-5 posts minimum)
  lib/
    posts.ts              ← functions to read and parse posts
  components/
    PostCard.tsx          ← card for homepage list
    TagBadge.tsx          ← clickable tag pill
    ThemeToggle.tsx       ← dark/light mode switch
    TableOfContents.tsx   ← auto-generated from headings
```

---

## Task 2 — Post Frontmatter Format

Each Markdown file starts with frontmatter (YAML between `---` lines):
```markdown
---
title: "Getting Started with Next.js"
date: "2025-01-15"
description: "A beginner-friendly guide to building web apps with Next.js"
tags: ["nextjs", "react", "web-dev"]
coverImage: "/images/nextjs-cover.jpg"
---

Your post content goes here...
```

---

## Task 3 — Post Utilities (`lib/posts.ts`)

Build these functions using Node's `fs` module (safe to use server-side in Next.js):

**getAllPosts(): Post[]**
  - Read all `.md` files from `content/posts/`
  - Parse frontmatter with `gray-matter`
  - Return array of post metadata, sorted by date (newest first)

**getPostBySlug(slug: string): PostWithContent**
  - Read the specific `.md` file
  - Parse frontmatter + content
  - The slug is the filename without `.md`

**getAllTags(): string[]**
  - Get a unique list of all tags across all posts

**getPostsByTag(tag: string): Post[]**
  - Filter posts where `post.tags.includes(tag)`

Define TypeScript interfaces:
```ts
interface Post {
  slug:        string;
  title:       string;
  date:        string;
  description: string;
  tags:        string[];
  coverImage?: string;
}

interface PostWithContent extends Post {
  content: string;  // the raw Markdown content
}
```

---

## Task 4 — Homepage (`app/page.tsx`)

This is a **Server Component** — it can call `getAllPosts()` directly (no useEffect needed):
```tsx
export default async function HomePage() {
  const posts = await getAllPosts();  // or just getAllPosts() since it's synchronous
  return (
    <main>
      <h1>My Blog</h1>
      <PostList posts={posts} />
    </main>
  );
}
```

Add metadata for SEO:
```tsx
export const metadata = {
  title: 'My Blog | Home',
  description: 'Thoughts on web development, design, and learning in public.',
};
```

---

## Task 5 — Individual Post Page (`app/blog/[slug]/page.tsx`)

Two things to implement:

**generateStaticParams()** — tells Next.js which slugs to pre-render at build time:
```tsx
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

**generateMetadata()** — dynamic metadata per post:
```tsx
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    title:       `${post.title} | My Blog`,
    description: post.description,
    openGraph: {
      title:       post.title,
      description: post.description,
      type:        'article',
    },
  };
}
```

**Page component** — render the Markdown content:
```tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
// MDXRemote from /rsc works in Server Components

export default async function PostPage({ params }) {
  const post = getPostBySlug(params.slug);
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <time>{post.date}</time>
        <div>{post.tags.map(tag => <TagBadge key={tag} tag={tag} />)}</div>
      </header>
      <MDXRemote source={post.content} />
    </article>
  );
}
```

---

## Task 6 — Tag Pages (`app/tags/[tag]/page.tsx`)

Same pattern as individual posts — `generateStaticParams` returns all tags,
the page renders filtered posts for that tag.

---

## Task 7 — Dark Mode (`components/ThemeToggle.tsx`)

Use a client-side cookie or localStorage to persist the theme.
Next.js recommends using a cookie so the server can read it on first load
(prevents flash of wrong theme):

```tsx
'use client';
// Read theme from document.cookie or localStorage
// Toggle between 'light' and 'dark' class on <html>
// Store new theme in cookie: document.cookie = `theme=${newTheme}; path=/; max-age=...`
```

In your root layout, read the cookie and apply the class to `<html>`:
```tsx
// In layout.tsx (Server Component):
import { cookies } from 'next/headers';
const theme = (await cookies()).get('theme')?.value ?? 'light';
// <html className={theme}>
```

---

## Task 8 — RSS Feed (`app/feed.xml/route.ts`)

Create a Route Handler that generates an RSS XML feed:
```ts
import { getAllPosts } from '@/lib/posts';
import { NextResponse } from 'next/server';

export function GET() {
  const posts = getAllPosts();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>My Blog</title>
      <link>https://yourblog.com</link>
      ${posts.map(post => `
        <item>
          <title>${post.title}</title>
          <link>https://yourblog.com/blog/${post.slug}</link>
          <description>${post.description}</description>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        </item>
      `).join('')}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml' }
  });
}
```

---

## Stretch Goals

- Add a reading time estimate to each post (`words / 200` ≈ minutes)
- Add a search page using a Client Component with `useSearchParams`
- Add a Table of Contents that extracts `##` headings from the Markdown
- Deploy to Vercel (`npx vercel`)
