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

// Brand colors
const SPARK = "#f59e0b";
const ACCENT = "#f97316";
const AMBER = "#fbbf24";

// SparkLocal icon SVG paths (from sparklocal-icon.svg, scaled)
const ICON_PATHS = {
  // Main flame shape (amber/yellow)
  flame1: "M 29.988281 103.925781 C 30.03125 103.871094 30.082031 103.84375 30.148438 103.835938 C 30.214844 103.832031 30.273438 103.851562 30.320312 103.898438 C 34.453125 107.996094 36.683594 113.023438 38.042969 118.714844 C 38.117188 119.007812 38.300781 119.363281 38.601562 119.777344 C 38.71875 119.945312 38.867188 120.078125 39.046875 120.175781 C 39.222656 120.277344 39.414062 120.335938 39.617188 120.347656 C 39.820312 120.363281 40.019531 120.335938 40.207031 120.261719 C 40.398438 120.191406 40.566406 120.082031 40.707031 119.933594 C 43.265625 117.289062 45.230469 115.082031 46.609375 113.316406 C 48.890625 110.402344 50.765625 108.109375 52.238281 106.4375 C 55.742188 102.453125 59.878906 97.222656 64.648438 90.742188 C 71.621094 81.261719 76.695312 69.960938 80.78125 58.417969 C 81.042969 57.683594 81.488281 56.957031 82.121094 56.238281 C 82.253906 56.085938 82.417969 55.984375 82.613281 55.9375 C 82.808594 55.886719 83.003906 55.898438 83.191406 55.964844 C 84.464844 56.441406 85.597656 57.179688 86.585938 58.1875 C 90.1875 61.847656 93.734375 66.316406 97.230469 71.59375 C 104.207031 82.15625 107.082031 94.027344 106.613281 106.601562 C 106.5625 108.058594 106.101562 110.355469 105.230469 113.484375 C 104.667969 115.519531 103.800781 117.695312 102.628906 120 C 100.109375 124.96875 96.585938 130.449219 92.0625 136.4375 C 89.582031 139.726562 87.164062 142.539062 84.804688 144.871094 C 82 147.65625 80.25 149.449219 79.554688 150.25 C 70.460938 160.785156 63.574219 171.464844 58.882812 182.296875 C 55.617188 189.832031 54.414062 198.113281 55.273438 207.148438 C 55.527344 209.765625 56.195312 213.082031 57.285156 217.097656 C 59.027344 223.507812 60.207031 227.179688 62.957031 232.546875 C 63.835938 234.265625 64.285156 236.324219 64.996094 237.75 C 65.050781 237.855469 65.054688 237.96875 65.007812 238.078125 C 64.964844 238.191406 64.886719 238.269531 64.773438 238.3125 C 63.457031 238.792969 61.914062 238.925781 60.46875 238.609375 C 57.136719 237.855469 51.527344 236.914062 47.070312 234.894531 C 42.089844 232.648438 37.171875 230.832031 32.984375 227.472656 C 27.558594 223.105469 22.179688 217.472656 16.839844 210.582031 C 9.347656 200.898438 5.761719 189.429688 5.375 176.753906 C 4.921875 161.953125 7.554688 148.296875 13.28125 135.78125 C 15.992188 129.867188 22.847656 118.652344 26.664062 109.445312 C 27.550781 107.304688 28.75 105.640625 29.988281 103.925781 Z M 29.988281 103.925781",
  // Secondary flame shape (amber/yellow)
  flame2: "M 120.921875 179.714844 C 120.183594 179.34375 119.546875 178.722656 119.003906 177.851562 C 114.484375 170.628906 109.359375 164.019531 103.632812 158.023438 C 101.894531 156.203125 100.515625 154.210938 99.5 152.054688 C 99.386719 151.8125 99.378906 151.574219 99.480469 151.328125 C 100.324219 149.273438 101.40625 147.296875 102.730469 145.402344 C 109.992188 134.980469 115.480469 122.839844 117.792969 110.347656 C 119.300781 102.175781 118.738281 95.382812 117.433594 85.511719 C 117.269531 84.300781 117.148438 82.636719 117.066406 80.523438 C 117.058594 80.324219 117.140625 80.171875 117.308594 80.066406 C 117.476562 79.960938 117.648438 79.957031 117.824219 80.050781 C 127.007812 85.089844 134.09375 91.773438 139.085938 100.097656 C 143.550781 107.558594 146.355469 115.574219 147.492188 124.140625 C 148.585938 132.351562 147.5625 140.75 144.421875 149.332031 C 142.277344 155.203125 139.414062 160.472656 135.832031 165.144531 C 131.601562 170.660156 126.839844 175.5 121.542969 179.65625 C 121.351562 179.808594 121.144531 179.828125 120.921875 179.714844 Z M 120.921875 179.714844",
  // Pin base (orange)
  pin: "M 28.761719 246.875 C 29.890625 247.046875 31.230469 247.425781 32.78125 248.019531 C 41.464844 251.339844 50.386719 253.507812 59.722656 255.195312 C 68.871094 256.851562 77.933594 256.9375 86.917969 255.453125 C 91.832031 254.636719 95.632812 250.328125 99.203125 246.738281 C 105.316406 240.578125 110.871094 233.878906 115.867188 226.644531 C 116.878906 225.175781 118.691406 222.023438 121.308594 217.179688 C 123.082031 213.902344 126.144531 206.585938 130.496094 195.238281 C 131.121094 193.609375 132.058594 192 133.304688 190.398438 C 134.675781 188.65625 138.089844 184.898438 143.550781 179.132812 C 145.199219 177.394531 147.777344 174.101562 151.292969 169.253906 C 154.847656 164.34375 157.585938 158.675781 159.511719 152.242188 C 160.148438 150.121094 160.890625 147.578125 161.738281 144.613281 C 161.78125 144.472656 161.871094 144.390625 162.015625 144.367188 C 162.160156 144.34375 162.273438 144.394531 162.355469 144.511719 C 167.296875 151.539062 170.914062 158.808594 171.8125 167.878906 C 172.613281 175.871094 172.734375 183.492188 172.171875 190.75 C 171.640625 197.679688 170.265625 204.828125 168.054688 212.199219 C 165.53125 220.625 163.03125 227.472656 160.5625 232.742188 C 156.628906 241.121094 153.613281 246.96875 151.523438 250.289062 C 147.328125 256.945312 145.226562 260.28125 145.222656 260.289062 C 143.109375 264.035156 140.777344 266.894531 138.339844 270.832031 C 136.597656 273.640625 134.195312 276.628906 132.140625 279.582031 C 129.621094 283.207031 126.585938 286.277344 123.976562 289.839844 C 123.140625 290.988281 122.042969 292.351562 120.683594 293.933594 C 113.859375 301.871094 109.128906 307.25 106.492188 310.070312 C 102.71875 314.101562 96.980469 318.640625 91.640625 319.773438 C 85.808594 321.011719 77.828125 314.128906 74.105469 310.484375 C 67.121094 303.628906 60.628906 296.230469 54.636719 288.289062 C 49.558594 281.5625 43.417969 273.179688 36.207031 263.132812 C 32.320312 257.714844 30.261719 253.25 28.484375 247.191406 C 28.460938 247.105469 28.476562 247.027344 28.539062 246.957031 C 28.597656 246.886719 28.671875 246.859375 28.761719 246.875 Z M 28.761719 246.875",
};

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
          // SparkLocal branding with icon
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              },
              children: [
                // Flame-pin icon (scaled down)
                {
                  type: 'svg',
                  props: {
                    width: 32,
                    height: 32,
                    viewBox: '0 0 375 375',
                    style: { marginRight: '10px' },
                    children: [
                      {
                        type: 'path',
                        props: {
                          fill: AMBER,
                          d: ICON_PATHS.flame1,
                        },
                      },
                      {
                        type: 'path',
                        props: {
                          fill: AMBER,
                          d: ICON_PATHS.flame2,
                        },
                      },
                      {
                        type: 'path',
                        props: {
                          fill: ACCENT,
                          d: ICON_PATHS.pin,
                        },
                      },
                      {
                        type: 'circle',
                        props: {
                          cx: 89,
                          cy: 200,
                          r: 25,
                          fill: SPARK,
                        },
                      },
                    ],
                  },
                },
                // SparkLocal text with proper coloring
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'baseline',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: 700,
                          },
                          children: 'Spark',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            color: SPARK,
                            fontSize: '24px',
                            fontWeight: 700,
                          },
                          children: 'Local',
                        },
                      },
                    ],
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
