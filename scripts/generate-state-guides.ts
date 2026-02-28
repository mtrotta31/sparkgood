#!/usr/bin/env npx tsx
/**
 * Generate State Business Guides
 *
 * Creates SEO content for "How to Start a Business in [State]" pages.
 * Uses Claude Haiku to generate factual guides covering registration,
 * taxes, permits, and key industries for each US state.
 *
 * Usage:
 *   npx tsx scripts/generate-state-guides.ts --dry-run          # Preview 3 states
 *   npx tsx scripts/generate-state-guides.ts --dry-run --all    # Preview all states
 *   npx tsx scripts/generate-state-guides.ts                    # Generate all states
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const DELAY_MS = 300; // Delay between API calls
const DRY_RUN_STATES = ['Texas', 'California', 'New York']; // States for dry run

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// US STATES DATA
// ============================================================================

const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL', slug: 'alabama' },
  { name: 'Alaska', abbreviation: 'AK', slug: 'alaska' },
  { name: 'Arizona', abbreviation: 'AZ', slug: 'arizona' },
  { name: 'Arkansas', abbreviation: 'AR', slug: 'arkansas' },
  { name: 'California', abbreviation: 'CA', slug: 'california' },
  { name: 'Colorado', abbreviation: 'CO', slug: 'colorado' },
  { name: 'Connecticut', abbreviation: 'CT', slug: 'connecticut' },
  { name: 'Delaware', abbreviation: 'DE', slug: 'delaware' },
  { name: 'Florida', abbreviation: 'FL', slug: 'florida' },
  { name: 'Georgia', abbreviation: 'GA', slug: 'georgia' },
  { name: 'Hawaii', abbreviation: 'HI', slug: 'hawaii' },
  { name: 'Idaho', abbreviation: 'ID', slug: 'idaho' },
  { name: 'Illinois', abbreviation: 'IL', slug: 'illinois' },
  { name: 'Indiana', abbreviation: 'IN', slug: 'indiana' },
  { name: 'Iowa', abbreviation: 'IA', slug: 'iowa' },
  { name: 'Kansas', abbreviation: 'KS', slug: 'kansas' },
  { name: 'Kentucky', abbreviation: 'KY', slug: 'kentucky' },
  { name: 'Louisiana', abbreviation: 'LA', slug: 'louisiana' },
  { name: 'Maine', abbreviation: 'ME', slug: 'maine' },
  { name: 'Maryland', abbreviation: 'MD', slug: 'maryland' },
  { name: 'Massachusetts', abbreviation: 'MA', slug: 'massachusetts' },
  { name: 'Michigan', abbreviation: 'MI', slug: 'michigan' },
  { name: 'Minnesota', abbreviation: 'MN', slug: 'minnesota' },
  { name: 'Mississippi', abbreviation: 'MS', slug: 'mississippi' },
  { name: 'Missouri', abbreviation: 'MO', slug: 'missouri' },
  { name: 'Montana', abbreviation: 'MT', slug: 'montana' },
  { name: 'Nebraska', abbreviation: 'NE', slug: 'nebraska' },
  { name: 'Nevada', abbreviation: 'NV', slug: 'nevada' },
  { name: 'New Hampshire', abbreviation: 'NH', slug: 'new-hampshire' },
  { name: 'New Jersey', abbreviation: 'NJ', slug: 'new-jersey' },
  { name: 'New Mexico', abbreviation: 'NM', slug: 'new-mexico' },
  { name: 'New York', abbreviation: 'NY', slug: 'new-york' },
  { name: 'North Carolina', abbreviation: 'NC', slug: 'north-carolina' },
  { name: 'North Dakota', abbreviation: 'ND', slug: 'north-dakota' },
  { name: 'Ohio', abbreviation: 'OH', slug: 'ohio' },
  { name: 'Oklahoma', abbreviation: 'OK', slug: 'oklahoma' },
  { name: 'Oregon', abbreviation: 'OR', slug: 'oregon' },
  { name: 'Pennsylvania', abbreviation: 'PA', slug: 'pennsylvania' },
  { name: 'Rhode Island', abbreviation: 'RI', slug: 'rhode-island' },
  { name: 'South Carolina', abbreviation: 'SC', slug: 'south-carolina' },
  { name: 'South Dakota', abbreviation: 'SD', slug: 'south-dakota' },
  { name: 'Tennessee', abbreviation: 'TN', slug: 'tennessee' },
  { name: 'Texas', abbreviation: 'TX', slug: 'texas' },
  { name: 'Utah', abbreviation: 'UT', slug: 'utah' },
  { name: 'Vermont', abbreviation: 'VT', slug: 'vermont' },
  { name: 'Virginia', abbreviation: 'VA', slug: 'virginia' },
  { name: 'Washington', abbreviation: 'WA', slug: 'washington' },
  { name: 'West Virginia', abbreviation: 'WV', slug: 'west-virginia' },
  { name: 'Wisconsin', abbreviation: 'WI', slug: 'wisconsin' },
  { name: 'Wyoming', abbreviation: 'WY', slug: 'wyoming' },
];

// ============================================================================
// TYPES
// ============================================================================

interface StateGuide {
  name: string;
  abbreviation: string;
  slug: string;
  guide: string;
  faqs: Array<{ question: string; answer: string }>;
  cities: Array<{ city: string; slug: string }>;
  generatedAt: string;
}

interface GenerationStats {
  total: number;
  generated: number;
  failed: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCitiesForState(stateAbbreviation: string): Promise<Array<{ city: string; slug: string }>> {
  const { data, error } = await supabase
    .from('resource_locations')
    .select('city, slug')
    .eq('state', stateAbbreviation)
    .order('city');

  if (error) {
    console.error(`Error fetching cities for ${stateAbbreviation}:`, error.message);
    return [];
  }

  return data || [];
}

function getStateGuidePrompt(stateName: string, cities: string[]): string {
  const citiesList = cities.length > 0
    ? `Major cities in ${stateName} with business resources include: ${cities.slice(0, 10).join(', ')}${cities.length > 10 ? ', and more' : ''}.`
    : '';

  return `Write a factual, comprehensive guide about starting a business in ${stateName}. The guide should be 600-800 words.

IMPORTANT RULES:
- Do NOT mention SparkLocal or any specific platform
- Do NOT invent specific fees, URLs, or phone numbers you're unsure about — instead say "check the current fee at the Secretary of State website" or similar
- Focus on factual, evergreen information
- Write in a helpful, professional tone

REQUIRED SECTIONS (integrate naturally, don't use section headers):

1. BUSINESS ENTITY REGISTRATION
- Types of business structures available (LLC, Corporation, Sole Proprietorship, Partnership)
- The registration agency (Secretary of State or equivalent for ${stateName})
- General registration process overview
- Registered agent requirements

2. STATE TAXES
- Whether ${stateName} has state income tax
- Sales tax overview (if applicable)
- Franchise tax or business privilege tax (if applicable)
- Any notable tax advantages or considerations

3. LICENSES AND PERMITS
- General business license requirements
- Industry-specific permits that may be needed
- Local vs state-level licensing
- Professional licensing boards (if relevant)

4. KEY INDUSTRIES
- Major industries and economic sectors in ${stateName}
- Emerging industries or growth areas
- Any state programs supporting specific industries

${citiesList}

CRITICAL FORMATTING REQUIREMENTS:
- Write as flowing prose paragraphs ONLY
- Do NOT use any markdown headers (#, ##, etc.)
- Do NOT use bullet points or numbered lists
- Do NOT use bold (**) or other markdown formatting
- Just write clear, well-organized paragraphs
- Each paragraph should flow naturally into the next
- Use transitional phrases between topics

Return ONLY the plain text guide, nothing else.`;
}

function getFAQPrompt(stateName: string): string {
  return `Generate 4-5 frequently asked questions about starting a business in ${stateName}.

IMPORTANT RULES:
- Questions should be specific to ${stateName}, not generic
- Do NOT invent specific fees, URLs, or phone numbers — use phrases like "check the Secretary of State website for current fees"
- Do NOT mention SparkLocal or any specific platform
- Answers should be 2-4 sentences, factual and helpful

Example topics:
- State-specific registration requirements
- Tax obligations unique to ${stateName}
- Timeline for business formation
- Popular business types in the state
- State-specific programs or incentives

Return the FAQs as a JSON array with this exact structure:
[
  {"question": "Question text here?", "answer": "Answer text here."},
  {"question": "Question text here?", "answer": "Answer text here."}
]

Return ONLY the JSON array, nothing else.`;
}

async function generateGuideContent(stateName: string): Promise<string | null> {
  // First get cities for this state
  const stateData = US_STATES.find(s => s.name === stateName);
  if (!stateData) return null;

  const cities = await getCitiesForState(stateData.abbreviation);
  const cityNames = cities.map(c => c.city);

  const prompt = getStateGuidePrompt(stateName, cityNames);

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    return null;
  } catch (error) {
    console.error(`Claude API error for ${stateName} guide:`, error);
    return null;
  }
}

async function generateFAQs(stateName: string): Promise<Array<{ question: string; answer: string }> | null> {
  const prompt = getFAQPrompt(stateName);

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Parse the JSON response
      const text = content.text.trim();
      // Handle potential markdown code blocks
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error(`Claude API error for ${stateName} FAQs:`, error);
    return null;
  }
}

async function generateStateGuide(state: typeof US_STATES[0]): Promise<StateGuide | null> {
  console.log(`  Generating guide for ${state.name}...`);

  // Get cities first
  const cities = await getCitiesForState(state.abbreviation);

  // Generate guide content
  const guide = await generateGuideContent(state.name);
  if (!guide) {
    console.log(`    FAILED: Could not generate guide`);
    return null;
  }

  await sleep(DELAY_MS);

  // Generate FAQs
  const faqs = await generateFAQs(state.name);
  if (!faqs) {
    console.log(`    FAILED: Could not generate FAQs`);
    return null;
  }

  console.log(`    SUCCESS: ${guide.length} chars, ${faqs.length} FAQs, ${cities.length} cities`);

  return {
    name: state.name,
    abbreviation: state.abbreviation,
    slug: state.slug,
    guide,
    faqs,
    cities: cities.map(c => ({ city: c.city, slug: c.slug })),
    generatedAt: new Date().toISOString(),
  };
}

function generateDataFileContent(guides: StateGuide[]): string {
  return `// Auto-generated state business guides
// Generated: ${new Date().toISOString()}
// Do not edit manually - regenerate using scripts/generate-state-guides.ts

export interface StateGuide {
  name: string;
  abbreviation: string;
  slug: string;
  guide: string;
  faqs: Array<{ question: string; answer: string }>;
  cities: Array<{ city: string; slug: string }>;
  generatedAt: string;
}

export const STATE_GUIDES: StateGuide[] = ${JSON.stringify(guides, null, 2)};

export const STATE_GUIDES_MAP: Record<string, StateGuide> = STATE_GUIDES.reduce(
  (acc, guide) => {
    acc[guide.slug] = guide;
    return acc;
  },
  {} as Record<string, StateGuide>
);

export function getStateGuide(slug: string): StateGuide | undefined {
  return STATE_GUIDES_MAP[slug];
}

export function getAllStateSlugs(): string[] {
  return STATE_GUIDES.map(g => g.slug);
}
`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const processAll = args.includes('--all');

  console.log('============================================================');
  console.log('Generate State Business Guides');
  console.log('============================================================');
  console.log('');

  let statesToProcess = US_STATES;
  if (dryRun && !processAll) {
    statesToProcess = US_STATES.filter(s => DRY_RUN_STATES.includes(s.name));
    console.log(`Mode: DRY RUN (${statesToProcess.length} states: ${DRY_RUN_STATES.join(', ')})`);
  } else if (dryRun && processAll) {
    console.log(`Mode: DRY RUN ALL (${statesToProcess.length} states - preview only)`);
  } else {
    console.log(`Mode: LIVE (generating ${statesToProcess.length} states)`);
  }
  console.log('');

  const stats: GenerationStats = {
    total: statesToProcess.length,
    generated: 0,
    failed: 0,
  };

  const guides: StateGuide[] = [];

  for (let i = 0; i < statesToProcess.length; i++) {
    const state = statesToProcess[i];
    const progress = `[${i + 1}/${statesToProcess.length}]`;
    console.log(`${progress} ${state.name}`);

    const guide = await generateStateGuide(state);

    if (guide) {
      guides.push(guide);
      stats.generated++;

      if (dryRun) {
        // Show preview of generated content
        console.log('');
        console.log(`--- PREVIEW: ${state.name} ---`);
        console.log(`Guide (first 500 chars):`);
        console.log(guide.guide.substring(0, 500) + '...');
        console.log('');
        console.log(`FAQs:`);
        guide.faqs.forEach((faq, idx) => {
          console.log(`  ${idx + 1}. ${faq.question}`);
          console.log(`     ${faq.answer.substring(0, 100)}...`);
        });
        console.log('');
        console.log(`Cities: ${guide.cities.map(c => c.city).slice(0, 5).join(', ')}${guide.cities.length > 5 ? ` +${guide.cities.length - 5} more` : ''}`);
        console.log('--- END PREVIEW ---');
        console.log('');
      }
    } else {
      stats.failed++;
    }

    // Delay between states
    if (i < statesToProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Write output file if not dry run
  if (!dryRun && guides.length > 0) {
    const outputPath = path.join(process.cwd(), 'src', 'data', 'state-guides.ts');
    const outputDir = path.dirname(outputPath);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileContent = generateDataFileContent(guides);
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`\nOutput written to: ${outputPath}`);
  }

  // Summary
  console.log('');
  console.log('============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  console.log(`  Total states: ${stats.total}`);
  console.log(`  Generated: ${stats.generated}`);
  console.log(`  Failed: ${stats.failed}`);

  if (dryRun) {
    console.log('');
    console.log('This was a dry run. Run without --dry-run to generate all states.');
  }
}

main().catch(console.error);
