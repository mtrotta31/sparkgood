import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  // Get one NY coworking listing - WeWork is a recognizable example
  const { data: listing } = await supabase
    .from('resource_listings')
    .select('*')
    .eq('is_active', true)
    .eq('category', 'coworking')
    .eq('city', 'New York')
    .eq('state', 'NY')
    .ilike('name', '%WeWork%')
    .limit(1)
    .single();

  if (!listing) {
    console.log('No listing found');
    return;
  }

  console.log('='.repeat(60));
  console.log('SOURCE DATA (from database)');
  console.log('='.repeat(60));
  console.log('Name:', listing.name);
  console.log('Address:', listing.address);
  console.log('Phone:', listing.phone);
  console.log('Rating:', listing.details?.rating || 'N/A');
  console.log('Hours:', listing.details?.hours || 'N/A');
  console.log('Amenities:', listing.details?.amenities?.join(', ') || 'N/A');
  console.log('Existing description:', listing.short_description || listing.description || 'None');
  console.log('');

  // Generate enrichment
  const prompt = `You are writing SEO content for a business resource directory. Generate content for this coworking space listing. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.

LISTING DATA:
Name: ${listing.name}
City: ${listing.city}, ${listing.state}
Address: ${listing.address || 'N/A'}
Phone: ${listing.phone || 'N/A'}
Rating: ${listing.details?.rating || 'N/A'}
Hours: ${listing.details?.hours || 'N/A'}
Amenities: ${listing.details?.amenities?.join(', ') || 'N/A'}
Price range: ${listing.details?.price_monthly_min ? `From $${listing.details.price_monthly_min}/mo` : 'N/A'}
Existing description: ${listing.description || listing.short_description || 'None'}

RULES:
- Be specific to THIS listing — don't write generic coworking content
- Do NOT invent pricing, membership tiers, or amenities not listed above
- If data is limited, write based on what's available and the location
- Mention the neighborhood/area based on the address

OUTPUT FORMAT:
{
  "ai_description": "150-200 word description. What this space offers, who it's ideal for, and what makes it useful for entrepreneurs and small business owners in this area.",
  "ai_faqs": [
    { "question": "What type of workspace does ${listing.name} offer?", "answer": "2-3 sentences" },
    { "question": "Where is ${listing.name} located in ${listing.city}?", "answer": "2-3 sentences about location and access" },
    { "question": "Is ${listing.name} suitable for startup founders?", "answer": "2-3 sentences" },
    { "question": "What are the hours at ${listing.name}?", "answer": "Based on data or 'Contact directly for current hours'" }
  ],
  "ai_key_details": {
    "workspace_type": "Coworking Space",
    "best_for": "e.g., Freelancers, startups, remote teams",
    "neighborhood": "e.g., Midtown Manhattan"
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  let text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Remove markdown code blocks if present
  text = text.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  const parsed = JSON.parse(text);

  console.log('='.repeat(60));
  console.log('GENERATED CONTENT');
  console.log('='.repeat(60));
  console.log('');
  console.log('--- AI Description ---');
  console.log(parsed.ai_description);
  console.log('');
  console.log('--- FAQs ---');
  parsed.ai_faqs.forEach((faq: { question: string; answer: string }, i: number) => {
    console.log(`${i + 1}. Q: ${faq.question}`);
    console.log(`   A: ${faq.answer}`);
    console.log('');
  });
  console.log('--- Key Details ---');
  console.log(JSON.stringify(parsed.ai_key_details, null, 2));
  console.log('');

  // Word count
  const allText =
    parsed.ai_description +
    ' ' +
    parsed.ai_faqs.map((f: { question: string; answer: string }) => f.question + ' ' + f.answer).join(' ');
  const wordCount = allText.split(/\s+/).length;

  console.log('='.repeat(60));
  console.log('QUALITY METRICS');
  console.log('='.repeat(60));
  console.log(`Total word count: ${wordCount} (target: 500+)`);
  console.log(`Description words: ${parsed.ai_description.split(/\s+/).length} (target: 150-200)`);
  console.log(`FAQ count: ${parsed.ai_faqs.length} (target: 4)`);
}

main().catch(console.error);
