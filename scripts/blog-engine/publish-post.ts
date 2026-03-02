#!/usr/bin/env npx tsx
/**
 * Publish blog post via git commit
 *
 * Adds the markdown file and featured image to git,
 * commits with an [automated] tag, and updates cross-links
 * in related posts.
 *
 * NOTE: Does NOT push to remote (Phase 1 is manual review)
 *
 * Usage:
 *   npx tsx scripts/blog-engine/publish-post.ts
 *   npx tsx scripts/blog-engine/publish-post.ts --dry-run
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Load .env.local
config({ path: '.env.local' });

const SELECTED_TOPIC_PATH = path.join(__dirname, '../../data/blog-engine/selected-topic.json');
const BLOG_DIR = path.join(__dirname, '../../content/blog');
const IMAGES_DIR = path.join(__dirname, '../../public/blog/images');

interface SelectedTopic {
  keyword: string;
  slug: string;
  cluster: string;
}

interface PostMeta {
  slug: string;
  title: string;
  tags: string[];
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getExistingPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  const posts: PostMeta[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data } = matter(content);

    posts.push({
      slug: file.replace('.md', ''),
      title: data.title || '',
      tags: data.tags || [],
    });
  }

  return posts;
}

function findRelatedPosts(newPostTags: string[], existingPosts: PostMeta[], newSlug: string): PostMeta[] {
  // Find posts that share at least one tag
  const related = existingPosts
    .filter((post) => {
      if (post.slug === newSlug) return false;
      if (post.slug.includes('welcome')) return false; // Skip announcement posts

      const sharedTags = post.tags.filter((tag) =>
        newPostTags.some((newTag) => newTag.toLowerCase() === tag.toLowerCase())
      );

      return sharedTags.length > 0;
    })
    .slice(0, 3);

  return related;
}

function countCrossLinks(content: string): number {
  // Count links to /blog/
  const matches = content.match(/\]\(\/blog\//g) || [];
  return matches.length;
}

function insertCrossLink(content: string, newPost: PostMeta): string {
  // Find the "Next Steps" section or end of content
  const nextStepsMatch = content.match(/^## Next Steps/m);

  if (nextStepsMatch && nextStepsMatch.index !== undefined) {
    // Insert before Next Steps
    const insertPoint = nextStepsMatch.index;
    const relatedSection = `\n**Related:** [${newPost.title}](/blog/${newPost.slug})\n\n`;

    return (
      content.slice(0, insertPoint) +
      relatedSection +
      content.slice(insertPoint)
    );
  }

  // Otherwise, append before the last closing ---
  const lines = content.split('\n');
  const lastLineIndex = lines.length - 1;

  // Find a good spot near the end
  for (let i = lastLineIndex; i >= 0; i--) {
    if (lines[i].trim().length > 0 && !lines[i].startsWith('---')) {
      lines.splice(i + 1, 0, '', `**Related:** [${newPost.title}](/blog/${newPost.slug})`);
      break;
    }
  }

  return lines.join('\n');
}

function runGitCommand(command: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`  [DRY RUN] Would run: ${command}`);
    return;
  }

  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
  } catch (error) {
    console.error(`Git command failed: ${command}`);
    throw error;
  }
}

async function main() {
  console.log('Blog Engine: Publish Post');
  console.log('=========================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No git operations will be performed\n');
  }

  // Load selected topic
  if (!fs.existsSync(SELECTED_TOPIC_PATH)) {
    console.error('Error: No selected topic found. Run the full pipeline first.');
    process.exit(1);
  }

  const topic: SelectedTopic = JSON.parse(fs.readFileSync(SELECTED_TOPIC_PATH, 'utf-8'));
  console.log(`Topic: "${topic.keyword}"`);
  console.log(`Slug: ${topic.slug}`);

  // Verify files exist
  const postPath = path.join(BLOG_DIR, `${topic.slug}.md`);
  const imagePath = path.join(IMAGES_DIR, `${topic.slug}-featured.png`);

  if (!fs.existsSync(postPath)) {
    console.error(`Error: Blog post not found at ${postPath}`);
    process.exit(1);
  }

  const imageExists = fs.existsSync(imagePath);
  if (!imageExists) {
    console.warn(`Warning: Featured image not found at ${imagePath}`);
  }

  // Get new post metadata
  const postContent = fs.readFileSync(postPath, 'utf-8');
  const { data: frontmatter } = matter(postContent);

  const newPost: PostMeta = {
    slug: topic.slug,
    title: frontmatter.title || topic.keyword,
    tags: frontmatter.tags || [],
  };

  console.log(`\nPost: "${newPost.title}"`);
  console.log(`Tags: ${newPost.tags.join(', ')}`);

  // Find related posts for cross-linking
  const existingPosts = getExistingPosts();
  const relatedPosts = findRelatedPosts(newPost.tags, existingPosts, topic.slug);

  console.log(`\nRelated posts found: ${relatedPosts.length}`);
  relatedPosts.forEach((p) => console.log(`  - ${p.slug}`));

  // Update cross-links in related posts
  const updatedFiles: string[] = [];

  for (const related of relatedPosts) {
    const relatedPath = path.join(BLOG_DIR, `${related.slug}.md`);
    let content = fs.readFileSync(relatedPath, 'utf-8');

    // Skip if already links to new post
    if (content.includes(`/blog/${topic.slug}`)) {
      console.log(`  ${related.slug} already links to new post, skipping`);
      continue;
    }

    // Skip if already has 3+ cross-links
    const linkCount = countCrossLinks(content);
    if (linkCount >= 3) {
      console.log(`  ${related.slug} already has ${linkCount} cross-links, skipping`);
      continue;
    }

    // Insert cross-link
    content = insertCrossLink(content, newPost);

    if (!isDryRun) {
      fs.writeFileSync(relatedPath, content);
    }

    updatedFiles.push(related.slug);
    console.log(`  Updated ${related.slug} with cross-link`);
  }

  // Git operations
  console.log('\nGit operations:');

  // Add new post
  const relativePostPath = `content/blog/${topic.slug}.md`;
  runGitCommand(`git add "${relativePostPath}"`, isDryRun);
  console.log(`  Added: ${relativePostPath}`);

  // Add featured image if it exists
  if (imageExists) {
    const relativeImagePath = `public/blog/images/${topic.slug}-featured.png`;
    runGitCommand(`git add "${relativeImagePath}"`, isDryRun);
    console.log(`  Added: ${relativeImagePath}`);
  }

  // Add updated related posts
  for (const slug of updatedFiles) {
    const relativeFilePath = `content/blog/${slug}.md`;
    runGitCommand(`git add "${relativeFilePath}"`, isDryRun);
    console.log(`  Added: ${relativeFilePath} (cross-link update)`);
  }

  // Commit
  const commitMessage = `blog: ${topic.slug} [automated]`;
  if (!isDryRun) {
    runGitCommand(`git commit -m "${commitMessage}"`, isDryRun);
    console.log(`\nCommitted: "${commitMessage}"`);
  } else {
    console.log(`\n  [DRY RUN] Would commit: "${commitMessage}"`);
  }

  // Reminder about manual push
  console.log('\n---');
  console.log('Phase 1: Manual review required');
  console.log('Review the commit, then run: git push origin main');
  console.log('---');

  if (isDryRun) {
    console.log('\nDry run complete. Use without --dry-run to make changes.');
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
