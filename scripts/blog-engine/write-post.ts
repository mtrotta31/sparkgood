#!/usr/bin/env npx tsx
/**
 * Write a blog post using Claude Haiku API
 *
 * Reads the selected topic, queries Supabase for real directory stats,
 * and generates a blog post with proper SEO optimization.
 *
 * Usage:
 *   npx tsx scripts/blog-engine/write-post.ts
 *   npx tsx scripts/blog-engine/write-post.ts --dry-run
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
config({ path: '.env.local' });

const CONFIG_PATH = path.join(__dirname, '../../data/blog-engine/config.json');
const SELECTED_TOPIC_PATH = path.join(__dirname, '../../data/blog-engine/selected-topic.json');
const BLOG_DIR = path.join(__dirname, '../../content/blog');

interface Config {
  minWordCount: number;
  maxWordCount: number;
  minInternalLinks: number;
  maxSparkLocalMentions: number;
  targetKeywordMinOccurrences: number;
  fillerPhraseBlocklist: string[];
  author: string;
}

interface InternalLink {
  url: string;
  label: string;
}

interface SelectedTopic {
  keyword: string;
  slug: string;
  searchVolume: number;
  difficulty: number;
  score: number;
  cluster: string;
  internalLinks: {
    categoryPages: InternalLink[];
    cityPages: InternalLink[];
    stateGuides: InternalLink[];
    otherBlogPosts: InternalLink[];
    builderCTA: string;
  };
  selectedAt: string;
}

interface DirectoryStats {
  totalListings: number;
  totalCities: number;
  categories: Record<string, number>;
  topCities: { name: string; count: number }[];
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceOverwrite = args.includes('--force');

async function getDirectoryStats(
  supabase: ReturnType<typeof createClient>
): Promise<DirectoryStats> {
  // Get total listings
  const { count: totalListings } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get total cities
  const { count: totalCities } = await supabase
    .from('resource_locations')
    .select('*', { count: 'exact', head: true });

  // Get category counts
  const { data: categoryCounts } = await supabase
    .from('resource_listings')
    .select('category')
    .eq('is_active', true);

  const categories: Record<string, number> = {};
  if (categoryCounts) {
    for (const row of categoryCounts) {
      categories[row.category] = (categories[row.category] || 0) + 1;
    }
  }

  // Get top cities by listing count
  const { data: topCitiesData } = await supabase
    .from('resource_locations')
    .select('city, state, listing_count')
    .order('listing_count', { ascending: false })
    .limit(10);

  const topCities = (topCitiesData || []).map((c) => ({
    name: `${c.city}, ${c.state}`,
    count: c.listing_count || 0,
  }));

  return {
    totalListings: totalListings || 0,
    totalCities: totalCities || 0,
    categories,
    topCities,
  };
}

function buildDirectoryContext(stats: DirectoryStats): string {
  return `
SPARKLOCAL DIRECTORY DATA (use these real numbers in the post):
- Total listings: ${stats.totalListings}
- Total cities: ${stats.totalCities}
- Grants: ${stats.categories['grant'] || 0} listings
- Coworking spaces: ${stats.categories['coworking'] || 0} listings
- Accelerators: ${stats.categories['accelerator'] || 0} listings
- SBA resources: ${stats.categories['sba'] || 0} listings
- Business attorneys: ${stats.categories['business-attorney'] || 0} listings
- Business insurance: ${stats.categories['business-insurance'] || 0} listings
- Marketing agencies: ${stats.categories['marketing-agency'] || 0} listings
- Chambers of commerce: ${stats.categories['chamber-of-commerce'] || 0} listings
- Virtual offices: ${stats.categories['virtual-office'] || 0} listings
- Commercial real estate: ${stats.categories['commercial-real-estate'] || 0} listings
- Business consultants: ${stats.categories['business-consultant'] || 0} listings
- State guides: 50 states
- Top cities by resource count: ${stats.topCities.map((c) => `${c.name} (${c.count})`).join(', ')}
  `.trim();
}

function buildSystemPrompt(): string {
  return `You are a blog writer for SparkLocal (sparklocal.co), a business resource directory that helps entrepreneurs find local resources to start and grow their businesses.

WRITING STYLE:
- Write for entrepreneurs who are just getting started. Practical, specific, actionable.
- Tone: Like a knowledgeable friend — helpful, direct, no fluff. Not corporate, not overly casual.
- Every paragraph should provide specific, actionable information. No filler.
- Use real data points, real program names, real numbers where relevant.
- DO NOT use phrases like "In today's fast-paced world" or "Whether you're a seasoned entrepreneur or just starting out" or any generic AI filler.

STRUCTURE:
- Open with a compelling first paragraph that gets to the point immediately. No throat-clearing.
- Use 5-7 H2 subheadings structured as questions or action phrases (optimized for featured snippets and People Also Ask).
- Include 2-3 H3 subheadings under longer sections.
- Paragraphs should be 2-4 sentences. Keep it scannable.
- End with a "Next Steps" H2 section containing 3-4 actionable bullet points with links.

SEO REQUIREMENTS:
- Target keyword should appear in: first paragraph, at least 2 H2 headings, and 2-3 times naturally in body text.
- Include semantic variations of the target keyword throughout.
- Write a compelling meta description (150-160 chars) that includes the target keyword and a value proposition.

SPARKLOCAL MENTIONS (CRITICAL - HARD LIMIT):
- You must mention SparkLocal BY NAME no more than 2 times in the entire post. This is a hard limit.
- One mention should reference real directory data (e.g., "SparkLocal's directory lists 170+ grants across all 50 states").
- The other can be in the Next Steps section.
- Internal links to sparklocal.co pages are fine and don't count as mentions — it's the word "SparkLocal" in visible text that's limited.
- DO NOT be promotional. Let the internal links do the selling.
- If you find yourself wanting to say "SparkLocal" more than twice, use generic phrasing like "the directory", "our resource database", or "the grants directory" instead.

INTERNAL LINKS:
- Include provided internal links naturally within the text using markdown link syntax.
- Every post must link to /builder at least once (the AI business planner).
- Link to 2-3 directory category pages.
- Link to 1-2 city hub pages or state guides if relevant.
- Link to 1-2 related blog posts if provided.

OUTPUT FORMAT:
Return ONLY the markdown content with frontmatter. No explanation, no preamble.

Frontmatter format:
---
title: "Post Title"
slug: "post-slug"
description: "Meta description (150-160 chars)"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2", "tag3"]
author: "SparkLocal"
---`;
}

function buildUserPrompt(
  topic: SelectedTopic,
  directoryContext: string,
  relatedPosts: string[],
  today: string
): string {
  const wordCount = topic.searchVolume > 1000 ? '2,000-2,500' : '1,500-2,000';

  const internalLinksSection = [
    ...topic.internalLinks.categoryPages.map((l) => `- ${l.url} (${l.label})`),
    ...topic.internalLinks.cityPages.map((l) => `- ${l.url} (${l.label})`),
    ...topic.internalLinks.stateGuides.map((l) => `- ${l.url} (${l.label})`),
    ...topic.internalLinks.otherBlogPosts.map((l) => `- ${l.url} (${l.label})`),
    `- /builder (AI Business Planner — CTA)`,
  ].join('\n');

  const relatedPostsSection = relatedPosts.length > 0
    ? relatedPosts.map((p) => `- /blog/${p}`).join('\n')
    : '(No related posts yet)';

  return `Write a blog post targeting the keyword: "${topic.keyword}"

Search volume: ${topic.searchVolume}/month
Word count: ${wordCount} words
Today's date for the frontmatter: ${today}

${directoryContext}

INTERNAL LINKS TO INCLUDE (YOU MUST USE THESE):
${internalLinksSection}

RELATED BLOG POSTS FOR CROSS-LINKING:
${relatedPostsSection}

CRITICAL REQUIREMENTS:
- You MUST include at least 3 internal links using markdown syntax like [text](/path)
- You MUST include a link to /builder somewhere in the post
- You MUST keep SparkLocal mentions to 2 or fewer

Write the post now.`;
}

function countWords(text: string): number {
  // Remove frontmatter
  const content = text.replace(/^---[\s\S]*?---/, '');
  return content.split(/\s+/).filter((w) => w.length > 0).length;
}

function countInternalLinks(text: string): number {
  const matches = text.match(/\]\(\/[^)]+\)/g) || [];
  return matches.length;
}

function countKeywordOccurrences(text: string, keyword: string): number {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const regex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return (lowerText.match(regex) || []).length;
}

function countSparkLocalMentions(text: string): number {
  // Only count mentions in body text, not frontmatter
  const bodyText = text.replace(/^---[\s\S]*?---/, '');
  return (bodyText.match(/sparklocal/gi) || []).length;
}

/**
 * Auto-replace excess SparkLocal mentions with generic phrasing.
 * Keeps the first 2 mentions, replaces the rest.
 */
function reduceSparkLocalMentions(markdown: string, maxMentions: number): string {
  // Split into frontmatter and body
  const frontmatterMatch = markdown.match(/^(---[\s\S]*?---)/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  let body = frontmatter ? markdown.slice(frontmatter.length) : markdown;

  // Find all SparkLocal mentions in body
  const mentions = [...body.matchAll(/SparkLocal('s)?/gi)];

  if (mentions.length <= maxMentions) {
    return markdown;
  }

  // Replacement phrases to cycle through
  const replacements = [
    'the directory',
    'the resource directory',
    'our directory',
    'the grants directory',
    'the business resource directory',
  ];

  // Replace mentions beyond the limit (keep first maxMentions)
  let replacementIndex = 0;
  let mentionCount = 0;

  body = body.replace(/SparkLocal('s)?/gi, (match) => {
    mentionCount++;
    if (mentionCount <= maxMentions) {
      return match; // Keep first N mentions
    }
    // Replace with generic phrasing
    const replacement = replacements[replacementIndex % replacements.length];
    replacementIndex++;

    // Handle possessive form
    if (match.toLowerCase().endsWith("'s")) {
      return replacement + "'s";
    }
    return replacement;
  });

  return frontmatter + body;
}

function containsFillerPhrase(text: string, blocklist: string[]): string | null {
  const lowerText = text.toLowerCase();
  for (const phrase of blocklist) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return phrase;
    }
  }
  return null;
}

function hasH2Headings(text: string): boolean {
  return /^## /m.test(text);
}

function validatePost(
  markdown: string,
  topic: SelectedTopic,
  config: Config
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const wordCount = countWords(markdown);
  if (wordCount < config.minWordCount) {
    issues.push(`Word count too low: ${wordCount} (min: ${config.minWordCount})`);
  }
  if (wordCount > config.maxWordCount) {
    issues.push(`Word count too high: ${wordCount} (max: ${config.maxWordCount})`);
  }

  const linkCount = countInternalLinks(markdown);
  if (linkCount < config.minInternalLinks) {
    issues.push(`Too few internal links: ${linkCount} (min: ${config.minInternalLinks})`);
  }

  const keywordCount = countKeywordOccurrences(markdown, topic.keyword);
  if (keywordCount < config.targetKeywordMinOccurrences) {
    issues.push(`Keyword appears too few times: ${keywordCount} (min: ${config.targetKeywordMinOccurrences})`);
  }

  const sparkLocalCount = countSparkLocalMentions(markdown);
  if (sparkLocalCount > config.maxSparkLocalMentions) {
    issues.push(`SparkLocal mentioned too many times: ${sparkLocalCount} (max: ${config.maxSparkLocalMentions})`);
  }

  const fillerPhrase = containsFillerPhrase(markdown, config.fillerPhraseBlocklist);
  if (fillerPhrase) {
    issues.push(`Contains filler phrase: "${fillerPhrase}"`);
  }

  if (!hasH2Headings(markdown)) {
    issues.push('No H2 headings found');
  }

  // Check frontmatter
  if (!markdown.startsWith('---')) {
    issues.push('Missing frontmatter');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function extractFAQs(markdown: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Find H2 headings that end with ?
  const h2Pattern = /^## (.+\?)\s*\n([\s\S]*?)(?=\n## |\n---|\Z)/gm;
  let match;

  while ((match = h2Pattern.exec(markdown)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().split('\n\n')[0]; // First paragraph
    if (answer.length > 50) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

async function main() {
  console.log('Blog Engine: Write Post');
  console.log('=======================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No content will be written\n');
  }

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables');
    process.exit(1);
  }

  if (!anthropicKey && !isDryRun) {
    console.error('Error: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  // Load config and selected topic
  const blogConfig: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

  if (!fs.existsSync(SELECTED_TOPIC_PATH)) {
    console.error('Error: No selected topic found. Run select-topic.ts first.');
    process.exit(1);
  }

  const topic: SelectedTopic = JSON.parse(fs.readFileSync(SELECTED_TOPIC_PATH, 'utf-8'));
  console.log(`Topic: "${topic.keyword}"`);
  console.log(`Slug: ${topic.slug}`);

  // Check if post already exists
  const postPath = path.join(BLOG_DIR, `${topic.slug}.md`);
  if (fs.existsSync(postPath) && !forceOverwrite) {
    console.error(`Error: Post already exists at ${postPath}`);
    console.error('Use --force to overwrite.');
    process.exit(1);
  }
  if (fs.existsSync(postPath) && forceOverwrite) {
    console.log(`Overwriting existing post (--force)`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get directory stats
  console.log('\nFetching directory stats...');
  const stats = await getDirectoryStats(supabase);
  console.log(`  Total listings: ${stats.totalListings}`);
  console.log(`  Total cities: ${stats.totalCities}`);

  const directoryContext = buildDirectoryContext(stats);

  // Get related blog posts
  const existingPosts: string[] = [];
  if (fs.existsSync(BLOG_DIR)) {
    const files = fs.readdirSync(BLOG_DIR);
    for (const file of files) {
      if (file.endsWith('.md') && !file.includes('welcome')) {
        existingPosts.push(file.replace('.md', ''));
      }
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(topic, directoryContext, existingPosts, today);

  if (isDryRun) {
    console.log('\nSystem prompt:');
    console.log(systemPrompt.slice(0, 500) + '...\n');
    console.log('User prompt:');
    console.log(userPrompt);
    console.log('\nDry run complete. Use without --dry-run to generate.');
    return;
  }

  // Generate content with Claude
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  console.log('\nGenerating content...');
  let markdown = '';
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`  Attempt ${attempts}/${maxAttempts}...`);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    markdown = (response.content[0] as { type: string; text: string }).text;

    // Strip markdown code blocks if present
    markdown = markdown.replace(/^```(?:markdown|md)?\n?/i, '').replace(/\n?```$/i, '').trim();

    // Auto-fix: reduce excess SparkLocal mentions
    const originalMentions = countSparkLocalMentions(markdown);
    markdown = reduceSparkLocalMentions(markdown, blogConfig.maxSparkLocalMentions);
    const fixedMentions = countSparkLocalMentions(markdown);
    if (originalMentions > fixedMentions) {
      console.log(`  Auto-fixed SparkLocal mentions: ${originalMentions} → ${fixedMentions}`);
    }

    // Validate
    const validation = validatePost(markdown, topic, blogConfig);

    if (validation.valid) {
      console.log('  Content validated successfully');
      break;
    }

    console.log('  Validation failed:');
    validation.issues.forEach((issue) => console.log(`    - ${issue}`));

    if (attempts < maxAttempts) {
      console.log('  Retrying with adjusted prompt...');
      // Could add specific fixes to the prompt here
    } else {
      console.warn('  Warning: Publishing despite validation issues');
    }
  }

  // Ensure blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  // Write markdown file
  fs.writeFileSync(postPath, markdown);
  console.log(`\nPost written to: ${postPath}`);

  // Extract and save FAQs
  const faqs = extractFAQs(markdown);
  if (faqs.length > 0) {
    const faqPath = path.join(__dirname, '../../data/blog-engine/last-post-faqs.json');
    fs.writeFileSync(faqPath, JSON.stringify({ slug: topic.slug, faqs }, null, 2));
    console.log(`FAQs extracted: ${faqs.length} items`);
  }

  // Show stats
  const wordCount = countWords(markdown);
  const linkCount = countInternalLinks(markdown);
  console.log(`\nPost stats:`);
  console.log(`  Word count: ${wordCount}`);
  console.log(`  Internal links: ${linkCount}`);
  console.log(`  FAQs: ${faqs.length}`);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
