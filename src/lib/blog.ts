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
  featuredImage?: string; // Optional custom featured image path
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
    featuredImage: data.featured_image || data.featuredImage || undefined,
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

/**
 * Extract FAQ items from markdown content
 * Looks for H2 headings that end with a question mark
 */
export function extractFAQsFromContent(
  content: string
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Split content by H2 headings
  const sections = content.split(/^## /m);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Split first line (heading) from rest
    const lines = section.split("\n");
    const heading = lines[0].trim();

    // Check if heading ends with ?
    if (!heading.endsWith("?")) continue;

    // Get the first paragraph as the answer
    const restContent = lines.slice(1).join("\n").trim();
    const paragraphs = restContent.split(/\n\n/);
    const firstParagraph = paragraphs[0]?.trim();

    // Skip if answer is too short or is another heading
    if (
      !firstParagraph ||
      firstParagraph.length < 50 ||
      firstParagraph.startsWith("#")
    ) {
      continue;
    }

    // Clean up the answer (remove markdown links, bold, etc.)
    const cleanAnswer = firstParagraph
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/`([^`]+)`/g, "$1"); // Remove code

    faqs.push({
      question: heading,
      answer: cleanAnswer,
    });
  }

  return faqs;
}
