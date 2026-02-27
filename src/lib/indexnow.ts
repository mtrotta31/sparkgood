// IndexNow Protocol Implementation
// Enables instant indexing on Bing, Yandex, and other participating search engines
// https://www.indexnow.org/

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'sparklocal.co';
const MAX_URLS_PER_REQUEST = 10000;

/**
 * Submit URLs to IndexNow for instant indexing
 * @param urls Array of full URLs to submit (max 10,000 per request)
 * @returns true if submission succeeded, false otherwise
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_API_KEY;

  if (!key) {
    console.warn('IndexNow: INDEXNOW_API_KEY not set, skipping submission');
    return false;
  }

  if (urls.length === 0) {
    console.log('IndexNow: No URLs to submit');
    return true;
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList: urls.slice(0, MAX_URLS_PER_REQUEST),
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`IndexNow: Successfully submitted ${Math.min(urls.length, MAX_URLS_PER_REQUEST)} URLs`);
      return true;
    } else {
      const text = await response.text();
      console.error(`IndexNow: Submission failed with status ${response.status}: ${text}`);
      return false;
    }
  } catch (error) {
    console.error('IndexNow: Submission failed:', error);
    return false;
  }
}

/**
 * Submit URLs in batches (for when you have more than 10,000 URLs)
 * @param urls Array of full URLs to submit
 * @param delayMs Delay between batches in milliseconds (default 1000ms)
 */
export async function submitToIndexNowBatched(
  urls: string[],
  delayMs: number = 1000
): Promise<{ submitted: number; failed: number }> {
  const key = process.env.INDEXNOW_API_KEY;

  if (!key) {
    console.warn('IndexNow: INDEXNOW_API_KEY not set, skipping submission');
    return { submitted: 0, failed: urls.length };
  }

  let submitted = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const batch = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    const batchNum = Math.floor(i / MAX_URLS_PER_REQUEST) + 1;
    const totalBatches = Math.ceil(urls.length / MAX_URLS_PER_REQUEST);

    console.log(`IndexNow: Submitting batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`);

    const success = await submitToIndexNow(batch);

    if (success) {
      submitted += batch.length;
    } else {
      failed += batch.length;
    }

    // Delay between batches to be respectful
    if (i + MAX_URLS_PER_REQUEST < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { submitted, failed };
}
