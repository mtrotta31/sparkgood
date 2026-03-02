#!/usr/bin/env npx tsx
/**
 * Submit new blog post URL to search engines
 *
 * Uses IndexNow (Bing/Yandex) and Google Indexing API
 * to request immediate crawling of the new post.
 *
 * Usage:
 *   npx tsx scripts/blog-engine/submit-indexes.ts
 *   npx tsx scripts/blog-engine/submit-indexes.ts --dry-run
 */

import { config } from 'dotenv';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { submitToIndexNow } from '../../src/lib/indexnow';

// Load .env.local
config({ path: '.env.local' });

const SELECTED_TOPIC_PATH = path.join(__dirname, '../../data/blog-engine/selected-topic.json');
const SITE_URL = 'https://sparklocal.co';

interface SelectedTopic {
  keyword: string;
  slug: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getServiceAccountCredentials(): { client_email: string; private_key: string } | null {
  // Try JSON string from env var first
  const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (jsonKey) {
    try {
      return JSON.parse(jsonKey);
    } catch {
      console.warn('Warning: GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
    }
  }

  // Try file path
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath && fs.existsSync(keyPath)) {
    try {
      const data = fs.readFileSync(keyPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      console.warn(`Warning: Could not read service account key from ${keyPath}`);
    }
  }

  return null;
}

async function submitGoogleIndexing(url: string): Promise<boolean> {
  const credentials = getServiceAccountCredentials();

  if (!credentials) {
    console.log('Google Indexing: No credentials found, skipping');
    return false;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({
      version: 'v3',
      auth,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`Google Indexing: Successfully submitted ${url}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Google Indexing: Failed - ${message}`);
    return false;
  }
}

async function main() {
  console.log('Blog Engine: Submit to Search Engines');
  console.log('=====================================');

  if (isDryRun) {
    console.log('DRY RUN MODE - No submissions will be made\n');
  }

  // Load selected topic
  if (!fs.existsSync(SELECTED_TOPIC_PATH)) {
    console.error('Error: No selected topic found. Run the full pipeline first.');
    process.exit(1);
  }

  const topic: SelectedTopic = JSON.parse(fs.readFileSync(SELECTED_TOPIC_PATH, 'utf-8'));
  const postUrl = `${SITE_URL}/blog/${topic.slug}`;

  console.log(`Topic: "${topic.keyword}"`);
  console.log(`URL: ${postUrl}`);

  if (isDryRun) {
    console.log('\nWould submit to:');
    console.log('  - IndexNow (Bing/Yandex)');
    console.log('  - Google Indexing API');
    console.log('\nDry run complete. Use without --dry-run to submit.');
    return;
  }

  let indexNowSuccess = false;
  let googleSuccess = false;

  // Submit to IndexNow
  console.log('\n--- IndexNow ---');
  if (process.env.INDEXNOW_API_KEY) {
    indexNowSuccess = await submitToIndexNow([postUrl]);
  } else {
    console.log('IndexNow: INDEXNOW_API_KEY not set, skipping');
  }

  // Submit to Google Indexing API
  console.log('\n--- Google Indexing ---');
  googleSuccess = await submitGoogleIndexing(postUrl);

  // Summary
  console.log('\n--- Summary ---');
  console.log(`IndexNow: ${indexNowSuccess ? 'SUCCESS' : 'SKIPPED/FAILED'}`);
  console.log(`Google: ${googleSuccess ? 'SUCCESS' : 'SKIPPED/FAILED'}`);

  if (!indexNowSuccess && !googleSuccess) {
    console.log('\nNo submissions were successful.');
    console.log('Check your API credentials and try again.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
