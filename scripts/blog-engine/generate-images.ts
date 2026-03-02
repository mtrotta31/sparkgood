#!/usr/bin/env npx tsx
/**
 * Generate featured image for blog post using Satori
 *
 * Creates a 1200x630 OG image with SparkLocal branding,
 * title text, and tag pills.
 *
 * Usage:
 *   npx tsx scripts/blog-engine/generate-images.ts
 *   npx tsx scripts/blog-engine/generate-images.ts --dry-run
 */

import { config } from 'dotenv';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Load .env.local
config({ path: '.env.local' });

const SELECTED_TOPIC_PATH = path.join(__dirname, '../../data/blog-engine/selected-topic.json');
const BLOG_DIR = path.join(__dirname, '../../content/blog');
const IMAGES_DIR = path.join(__dirname, '../../public/blog/images');
const FONTS_DIR = path.join(__dirname, '../../src/lib/launch-kit/fonts');

interface SelectedTopic {
  keyword: string;
  slug: string;
  searchVolume: number;
  difficulty: number;
  score: number;
  cluster: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

async function loadFonts(): Promise<{ name: string; data: Buffer; weight: number; style: string }[]> {
  const interRegular = fs.readFileSync(path.join(FONTS_DIR, 'Inter-Regular.ttf'));
  const interBold = fs.readFileSync(path.join(FONTS_DIR, 'Inter-Bold.ttf'));

  return [
    {
      name: 'Inter',
      data: interRegular,
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Inter',
      data: interBold,
      weight: 700,
      style: 'normal',
    },
  ];
}

interface ImageOptions {
  title: string;
  tags: string[];
  slug: string;
}

async function generateFeaturedImage(options: ImageOptions): Promise<Buffer> {
  const fonts = await loadFonts();

  // Adjust font size based on title length
  let titleFontSize = 56;
  if (options.title.length > 60) {
    titleFontSize = 44;
  } else if (options.title.length > 45) {
    titleFontSize = 48;
  }

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'Inter',
        },
        children: [
          // SparkLocal branding
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      marginRight: '12px',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      color: '#f59e0b',
                      fontSize: '24px',
                      fontWeight: 700,
                    },
                    children: 'SparkLocal',
                  },
                },
              ],
            },
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                color: '#ffffff',
                fontSize: `${titleFontSize}px`,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '32px',
                maxWidth: '1000px',
              },
              children: options.title,
            },
          },
          // Tags
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              },
              children: options.tags.slice(0, 3).map((tag) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '8px 20px',
                    borderRadius: '24px',
                    fontSize: '18px',
                    fontWeight: 500,
                  },
                  children: tag,
                },
              })),
            },
          },
          // Decorative accent bar at bottom
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '6px',
                background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
              },
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: fonts as Array<{
        name: string;
        data: ArrayBuffer;
        weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
        style?: 'normal' | 'italic';
      }>,
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  return Buffer.from(resvg.render().asPng());
}

async function main() {
  console.log('Blog Engine: Generate Images');
  console.log('============================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No images will be created\n');
  }

  // Load selected topic
  if (!fs.existsSync(SELECTED_TOPIC_PATH)) {
    console.error('Error: No selected topic found. Run select-topic.ts first.');
    process.exit(1);
  }

  const topic: SelectedTopic = JSON.parse(fs.readFileSync(SELECTED_TOPIC_PATH, 'utf-8'));
  console.log(`Topic: "${topic.keyword}"`);
  console.log(`Slug: ${topic.slug}`);

  // Load the blog post to get title and tags
  const postPath = path.join(BLOG_DIR, `${topic.slug}.md`);

  if (!fs.existsSync(postPath)) {
    console.error(`Error: Blog post not found at ${postPath}`);
    console.error('Run write-post.ts first.');
    process.exit(1);
  }

  const postContent = fs.readFileSync(postPath, 'utf-8');
  const { data: frontmatter } = matter(postContent);

  const title = frontmatter.title || topic.keyword;
  const tags = frontmatter.tags || [];

  console.log(`Title: "${title}"`);
  console.log(`Tags: ${tags.join(', ')}`);

  if (isDryRun) {
    console.log('\nWould generate featured image:');
    console.log(`  Size: 1200x630`);
    console.log(`  Output: ${path.join(IMAGES_DIR, `${topic.slug}-featured.png`)}`);
    console.log('\nDry run complete. Use without --dry-run to generate.');
    return;
  }

  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Generate featured image
  console.log('\nGenerating featured image...');

  try {
    const imageBuffer = await generateFeaturedImage({
      title,
      tags,
      slug: topic.slug,
    });

    const outputPath = path.join(IMAGES_DIR, `${topic.slug}-featured.png`);
    fs.writeFileSync(outputPath, imageBuffer);

    const sizeMB = (imageBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`\nFeatured image generated:`);
    console.log(`  Path: ${outputPath}`);
    console.log(`  Size: ${sizeMB} MB`);
  } catch (error) {
    console.error('Error generating image:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
