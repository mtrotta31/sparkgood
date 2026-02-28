#!/usr/bin/env npx tsx
/**
 * Submit SparkLocal URLs to Google Indexing API for faster crawling
 *
 * SETUP INSTRUCTIONS:
 * ===================
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create a new project (or select existing one)
 * 3. Enable the "Web Search Indexing API":
 *    - Go to APIs & Services > Library
 *    - Search for "Web Search Indexing API" (also called "Indexing API")
 *    - Click Enable
 * 4. Create a Service Account:
 *    - Go to APIs & Services > Credentials
 *    - Click "Create Credentials" > "Service Account"
 *    - Give it a name (e.g., "sparklocal-indexing")
 *    - Click Create and Continue (skip optional steps)
 * 5. Create a JSON key for the service account:
 *    - Click on the service account you just created
 *    - Go to "Keys" tab
 *    - Click "Add Key" > "Create new key" > "JSON"
 *    - Save the downloaded JSON file securely
 * 6. Add the service account email as an owner in Google Search Console:
 *    - Go to Google Search Console (https://search.google.com/search-console)
 *    - Select your property (sparklocal.co)
 *    - Go to Settings > Users and permissions
 *    - Click "Add user"
 *    - Enter the service account email (found in the JSON file as "client_email")
 *    - Set permission to "Owner"
 *    - Click Add
 * 7. Set environment variable:
 *    - Option A: Set GOOGLE_SERVICE_ACCOUNT_KEY to the JSON string (escaped)
 *    - Option B: Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH to the file path
 *    - Add to .env.local:
 *      GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
 *
 * IMPORTANT NOTES:
 * ================
 * - Google Indexing API has a default quota of 200 requests/day
 * - This script tracks submitted URLs to avoid resubmitting
 * - Run daily to gradually submit all URLs
 * - The API is designed for job posting and livestream pages but works for other content
 *
 * DEPENDENCIES:
 * =============
 * Install googleapis if not present:
 *   npm install googleapis
 *
 * USAGE:
 * ======
 *   npx tsx scripts/submit-google-indexing.ts              # Submit up to 200 URLs
 *   npx tsx scripts/submit-google-indexing.ts --dry-run    # Preview without submitting
 *   npx tsx scripts/submit-google-indexing.ts --reset      # Clear submission history and start fresh
 *   npx tsx scripts/submit-google-indexing.ts --status     # Show submission stats
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { STATE_GUIDES } from '../src/data/state-guides';

// Load .env.local
config({ path: '.env.local' });

const SITE_URL = 'https://sparklocal.co';
const DAILY_QUOTA = 200;
const SUBMITTED_FILE = path.join(__dirname, 'indexing-submitted.json');
const BLOG_DIR = path.join(__dirname, '../content/blog');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isReset = args.includes('--reset');
const isStatus = args.includes('--status');

interface SubmissionRecord {
  url: string;
  submittedAt: string;
  status: 'success' | 'error';
  response?: string;
}

interface SubmissionHistory {
  lastRun: string;
  totalSubmitted: number;
  submissions: Record<string, SubmissionRecord>;
}

function loadSubmissionHistory(): SubmissionHistory {
  if (isReset) {
    return {
      lastRun: '',
      totalSubmitted: 0,
      submissions: {},
    };
  }

  try {
    if (fs.existsSync(SUBMITTED_FILE)) {
      const data = fs.readFileSync(SUBMITTED_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Warning: Could not load submission history, starting fresh');
  }

  return {
    lastRun: '',
    totalSubmitted: 0,
    submissions: {},
  };
}

function saveSubmissionHistory(history: SubmissionHistory): void {
  fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(history, null, 2));
}

function getServiceAccountCredentials(): { client_email: string; private_key: string } {
  // Try JSON string from env var first
  const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (jsonKey) {
    try {
      return JSON.parse(jsonKey);
    } catch {
      console.error('Error: GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
      process.exit(1);
    }
  }

  // Try file path
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath) {
    try {
      const data = fs.readFileSync(keyPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error: Could not read service account key from ${keyPath}`);
      process.exit(1);
    }
  }

  console.error('Error: No Google service account credentials found');
  console.error('Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_PATH');
  process.exit(1);
}

async function getAllUrls(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const urls: string[] = [];

  // 1. Fetch listing slugs (paginate to get all)
  console.log('Fetching listing slugs...');
  const allListings: { slug: string }[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: listings, error } = await supabase
      .from('resource_listings')
      .select('slug')
      .eq('is_active', true)
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching listings:', error.message);
      process.exit(1);
    }

    if (!listings || listings.length === 0) break;

    allListings.push(...listings);
    offset += pageSize;

    if (listings.length < pageSize) break;
  }

  const listingUrls = allListings.map((l) => `${SITE_URL}/resources/listing/${l.slug}`);
  urls.push(...listingUrls);
  console.log(`  Found ${listingUrls.length} listing pages`);

  // 2. Fetch city slugs
  console.log('Fetching city slugs...');
  const { data: cities, error: citiesError } = await supabase
    .from('resource_locations')
    .select('slug');

  if (citiesError) {
    console.error('Error fetching cities:', citiesError.message);
    process.exit(1);
  }

  const cityUrls = (cities || []).map((c) => `${SITE_URL}/resources/${c.slug}`);
  urls.push(...cityUrls);
  console.log(`  Found ${cityUrls.length} city pages`);

  // 3. State guide pages
  console.log('Adding state guide pages...');
  const stateUrls = [
    `${SITE_URL}/resources/start-business`,
    ...STATE_GUIDES.map((s) => `${SITE_URL}/resources/start-business/${s.slug}`),
  ];
  urls.push(...stateUrls);
  console.log(`  Found ${stateUrls.length} state guide pages`);

  // 4. Blog posts
  console.log('Adding blog pages...');
  const blogUrls: string[] = [];
  if (fs.existsSync(BLOG_DIR)) {
    const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
    for (const file of blogFiles) {
      const slug = file.replace('.md', '');
      blogUrls.push(`${SITE_URL}/blog/${slug}`);
    }
  }
  urls.push(...blogUrls);
  console.log(`  Found ${blogUrls.length} blog pages`);

  // 5. Static/category pages
  const staticPages = [
    `${SITE_URL}`,
    `${SITE_URL}/resources`,
    `${SITE_URL}/resources/grant`,
    `${SITE_URL}/resources/coworking`,
    `${SITE_URL}/resources/accelerator`,
    `${SITE_URL}/resources/sba`,
    `${SITE_URL}/builder`,
    `${SITE_URL}/pricing`,
  ];
  urls.push(...staticPages);
  console.log(`  Added ${staticPages.length} static pages`);

  return urls;
}

async function submitUrl(
  indexing: ReturnType<typeof google.indexing>,
  url: string
): Promise<{ success: boolean; response?: string }> {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    return {
      success: true,
      response: JSON.stringify(response.data),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      response: message,
    };
  }
}

async function main() {
  console.log('Google Indexing API Submission Script');
  console.log('=====================================');

  const history = loadSubmissionHistory();

  // Status mode - just show stats
  if (isStatus) {
    const successCount = Object.values(history.submissions).filter(
      (s) => s.status === 'success'
    ).length;
    const errorCount = Object.values(history.submissions).filter(
      (s) => s.status === 'error'
    ).length;

    console.log(`Last run: ${history.lastRun || 'Never'}`);
    console.log(`Total URLs submitted: ${history.totalSubmitted}`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Errors: ${errorCount}`);
    return;
  }

  if (isReset) {
    saveSubmissionHistory(history);
    console.log('Submission history reset.');
    return;
  }

  if (isDryRun) {
    console.log('DRY RUN MODE - URLs will not be submitted\n');
  }

  // Validate Supabase environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Get credentials (will exit if not found)
  let credentials: { client_email: string; private_key: string } | null = null;
  if (!isDryRun) {
    credentials = getServiceAccountCredentials();
    console.log(`Using service account: ${credentials.client_email}\n`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get all URLs
  const allUrls = await getAllUrls(supabase);
  console.log(`\nTotal URLs in site: ${allUrls.length}`);

  // Filter out already submitted URLs
  const pendingUrls = allUrls.filter((url) => !history.submissions[url]);
  console.log(`Already submitted: ${allUrls.length - pendingUrls.length}`);
  console.log(`Pending: ${pendingUrls.length}`);

  if (pendingUrls.length === 0) {
    console.log('\nAll URLs have been submitted! Use --reset to start fresh.');
    return;
  }

  // Take only up to daily quota
  const urlsToSubmit = pendingUrls.slice(0, DAILY_QUOTA);
  console.log(`\nWill submit: ${urlsToSubmit.length} URLs (daily quota: ${DAILY_QUOTA})`);

  if (isDryRun) {
    console.log('\nURLs to be submitted (first 20):');
    urlsToSubmit.slice(0, 20).forEach((url) => console.log(`  ${url}`));
    if (urlsToSubmit.length > 20) {
      console.log(`  ... and ${urlsToSubmit.length - 20} more`);
    }
    console.log('\nDry run complete. Use without --dry-run to submit.');
    return;
  }

  // Initialize Google Indexing API
  const auth = new google.auth.GoogleAuth({
    credentials: credentials!,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({
    version: 'v3',
    auth,
  });

  // Submit URLs
  console.log('\nSubmitting URLs...');
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urlsToSubmit.length; i++) {
    const url = urlsToSubmit[i];
    const progress = `[${i + 1}/${urlsToSubmit.length}]`;

    const result = await submitUrl(indexing, url);

    history.submissions[url] = {
      url,
      submittedAt: new Date().toISOString(),
      status: result.success ? 'success' : 'error',
      response: result.response,
    };

    if (result.success) {
      successCount++;
      console.log(`${progress} OK: ${url}`);
    } else {
      errorCount++;
      console.log(`${progress} ERROR: ${url} - ${result.response}`);
    }

    history.totalSubmitted++;

    // Save progress every 10 URLs
    if ((i + 1) % 10 === 0) {
      saveSubmissionHistory(history);
    }

    // Small delay to avoid rate limiting
    if (i < urlsToSubmit.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Final save
  history.lastRun = new Date().toISOString();
  saveSubmissionHistory(history);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=====================================');
  console.log('Submission Complete');
  console.log(`  Submitted: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`  Remaining: ${pendingUrls.length - urlsToSubmit.length}`);

  if (pendingUrls.length > DAILY_QUOTA) {
    console.log(`\nRun again tomorrow to submit more URLs.`);
  }

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
