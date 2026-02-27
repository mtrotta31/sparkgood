// Blog utilities for reading and parsing markdown posts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  content: string; // Raw markdown
  htmlContent?: string; // Rendered HTML
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

/**
 * Get all blog post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/**
 * Get metadata for all blog posts, sorted by date (newest first)
 */
export function getAllPostsMeta(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  const posts = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(BLOG_DIR, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: data.slug || file.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        description: data.description || "",
        date: data.date || "",
        author: data.author || "SparkLocal",
        tags: data.tags || [],
      } as BlogPostMeta;
    });

  // Sort by date, newest first
  return posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single blog post by slug, with rendered HTML content
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!fs.existsSync(BLOG_DIR)) {
    return null;
  }

  // Try to find the file by slug
  const files = fs.readdirSync(BLOG_DIR);
  const matchingFile = files.find((file) => {
    if (!file.endsWith(".md")) return false;

    const filePath = path.join(BLOG_DIR, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    // Match by frontmatter slug or filename
    const fileSlug = data.slug || file.replace(/\.md$/, "");
    return fileSlug === slug;
  });

  if (!matchingFile) {
    return null;
  }

  const filePath = path.join(BLOG_DIR, matchingFile);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(content);
  const htmlContent = processedContent.toString();

  return {
    slug: data.slug || matchingFile.replace(/\.md$/, ""),
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "SparkLocal",
    tags: data.tags || [],
    content,
    htmlContent,
  };
}

/**
 * Format a date string for display
 */
export function formatBlogDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
