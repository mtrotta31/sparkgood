#!/usr/bin/env npx tsx
/**
 * Run the complete blog engine pipeline
 *
 * Executes all steps in sequence:
 * 1. Discover keywords
 * 2. Select topic
 * 3. Write post
 * 4. Generate images
 * 5. Publish (git commit)
 * 6. Submit to search engines
 *
 * Usage:
 *   npx tsx scripts/blog-engine/run-all.ts
 *   npx tsx scripts/blog-engine/run-all.ts --dry-run
 *   npx tsx scripts/blog-engine/run-all.ts --skip-discovery   # Use existing keyword pool
 */

import { config } from 'dotenv';
import { execSync, spawn, SpawnOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
config({ path: '.env.local' });

const SCRIPTS_DIR = __dirname;
const KEYWORD_POOL_PATH = path.join(__dirname, '../../data/blog-engine/keyword-pool.json');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipDiscovery = args.includes('--skip-discovery');

interface StepResult {
  step: string;
  success: boolean;
  duration: number;
  error?: string;
}

async function runScript(name: string, description: string, extraArgs: string[] = []): Promise<StepResult> {
  const scriptPath = path.join(SCRIPTS_DIR, `${name}.ts`);
  const startTime = Date.now();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Step: ${description}`);
  console.log(`${'='.repeat(50)}`);

  const allArgs = isDryRun ? ['--dry-run', ...extraArgs] : extraArgs;

  return new Promise((resolve) => {
    const child = spawn('npx', ['tsx', scriptPath, ...allArgs], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
      shell: true,
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;

      if (code === 0) {
        resolve({
          step: name,
          success: true,
          duration,
        });
      } else {
        resolve({
          step: name,
          success: false,
          duration,
          error: `Exit code ${code}`,
        });
      }
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        step: name,
        success: false,
        duration,
        error: error.message,
      });
    });
  });
}

function hasKeywordsInPool(): boolean {
  try {
    if (!fs.existsSync(KEYWORD_POOL_PATH)) return false;
    const pool = JSON.parse(fs.readFileSync(KEYWORD_POOL_PATH, 'utf-8'));
    return pool.keywords && pool.keywords.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Blog Engine: Full Pipeline');
  console.log('==========================');
  console.log(`Time: ${new Date().toISOString()}`);

  if (isDryRun) {
    console.log('\nDRY RUN MODE - No actual changes will be made');
  }

  if (skipDiscovery) {
    console.log('\nSkipping keyword discovery (--skip-discovery flag)');
  }

  const results: StepResult[] = [];
  const totalStartTime = Date.now();

  // Step 1: Discover keywords (optional)
  if (!skipDiscovery) {
    const result = await runScript('discover-keywords', '1. Discover Keywords');
    results.push(result);

    if (!result.success && !isDryRun) {
      console.error('\nKeyword discovery failed. Aborting pipeline.');
      showSummary(results, totalStartTime);
      process.exit(1);
    }
  } else {
    if (!hasKeywordsInPool()) {
      console.error('\nError: No keywords in pool and --skip-discovery was set.');
      console.error('Run without --skip-discovery first to populate the keyword pool.');
      process.exit(1);
    }
    console.log('\nUsing existing keyword pool');
  }

  // Step 2: Select topic
  const selectResult = await runScript('select-topic', '2. Select Topic');
  results.push(selectResult);

  if (!selectResult.success && !isDryRun) {
    console.error('\nTopic selection failed. Aborting pipeline.');
    showSummary(results, totalStartTime);
    process.exit(1);
  }

  // Step 3: Write post
  const writeResult = await runScript('write-post', '3. Write Post');
  results.push(writeResult);

  if (!writeResult.success && !isDryRun) {
    console.error('\nPost writing failed. Aborting pipeline.');
    showSummary(results, totalStartTime);
    process.exit(1);
  }

  // Step 4: Generate images
  const imageResult = await runScript('generate-images', '4. Generate Images');
  results.push(imageResult);

  if (!imageResult.success && !isDryRun) {
    console.warn('\nImage generation failed. Continuing without image.');
  }

  // Step 5: Publish (git commit)
  const publishResult = await runScript('publish-post', '5. Publish (Git Commit)');
  results.push(publishResult);

  if (!publishResult.success && !isDryRun) {
    console.error('\nPublish failed. Aborting pipeline.');
    showSummary(results, totalStartTime);
    process.exit(1);
  }

  // Step 6: Submit to search engines
  const indexResult = await runScript('submit-indexes', '6. Submit to Search Engines');
  results.push(indexResult);

  if (!indexResult.success && !isDryRun) {
    console.warn('\nSearch engine submission failed. Post is still published.');
  }

  // Show summary
  showSummary(results, totalStartTime);

  // Final status
  const allSuccess = results.every((r) => r.success);
  if (!allSuccess && !isDryRun) {
    process.exit(1);
  }
}

function showSummary(results: StepResult[], startTime: number) {
  const totalDuration = Date.now() - startTime;

  console.log('\n' + '='.repeat(50));
  console.log('PIPELINE SUMMARY');
  console.log('='.repeat(50));

  for (const result of results) {
    const status = result.success ? 'OK' : 'FAILED';
    const duration = (result.duration / 1000).toFixed(1);
    console.log(`  ${result.step}: ${status} (${duration}s)`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }

  console.log('---');
  console.log(`Total time: ${(totalDuration / 1000).toFixed(1)}s`);

  const successCount = results.filter((r) => r.success).length;
  const totalCount = results.length;
  console.log(`Steps: ${successCount}/${totalCount} succeeded`);

  if (successCount === totalCount) {
    console.log('\nPipeline completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review the generated post');
    console.log('  2. Run: git push origin main');
    console.log('  3. Vercel will auto-deploy');
  }
}

main().catch((error) => {
  console.error('Pipeline failed:', error);
  process.exit(1);
});
