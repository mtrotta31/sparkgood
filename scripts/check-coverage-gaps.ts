#!/usr/bin/env npx tsx
/**
 * Check coverage gaps in resource listings
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Top 50 US cities by population (2024 estimates)
  const top50Cities = [
    { city: 'New York', state: 'NY', pop: 8336817 },
    { city: 'Los Angeles', state: 'CA', pop: 3979576 },
    { city: 'Chicago', state: 'IL', pop: 2693976 },
    { city: 'Houston', state: 'TX', pop: 2320268 },
    { city: 'Phoenix', state: 'AZ', pop: 1608139 },
    { city: 'Philadelphia', state: 'PA', pop: 1584064 },
    { city: 'San Antonio', state: 'TX', pop: 1547253 },
    { city: 'San Diego', state: 'CA', pop: 1423851 },
    { city: 'Dallas', state: 'TX', pop: 1343573 },
    { city: 'San Jose', state: 'CA', pop: 1021795 },
    { city: 'Austin', state: 'TX', pop: 978908 },
    { city: 'Jacksonville', state: 'FL', pop: 949611 },
    { city: 'Fort Worth', state: 'TX', pop: 918915 },
    { city: 'Columbus', state: 'OH', pop: 905748 },
    { city: 'Charlotte', state: 'NC', pop: 874579 },
    { city: 'Indianapolis', state: 'IN', pop: 867125 },
    { city: 'San Francisco', state: 'CA', pop: 874961 },
    { city: 'Seattle', state: 'WA', pop: 749256 },
    { city: 'Denver', state: 'CO', pop: 715522 },
    { city: 'Washington', state: 'DC', pop: 689545 },
    { city: 'Boston', state: 'MA', pop: 675647 },
    { city: 'El Paso', state: 'TX', pop: 681728 },
    { city: 'Nashville', state: 'TN', pop: 689447 },
    { city: 'Detroit', state: 'MI', pop: 639111 },
    { city: 'Oklahoma City', state: 'OK', pop: 681054 },
    { city: 'Portland', state: 'OR', pop: 652503 },
    { city: 'Las Vegas', state: 'NV', pop: 641903 },
    { city: 'Memphis', state: 'TN', pop: 633104 },
    { city: 'Louisville', state: 'KY', pop: 628594 },
    { city: 'Baltimore', state: 'MD', pop: 585708 },
    { city: 'Milwaukee', state: 'WI', pop: 577222 },
    { city: 'Albuquerque', state: 'NM', pop: 564559 },
    { city: 'Tucson', state: 'AZ', pop: 546574 },
    { city: 'Fresno', state: 'CA', pop: 542107 },
    { city: 'Sacramento', state: 'CA', pop: 524943 },
    { city: 'Mesa', state: 'AZ', pop: 504258 },
    { city: 'Kansas City', state: 'MO', pop: 508090 },
    { city: 'Atlanta', state: 'GA', pop: 498715 },
    { city: 'Long Beach', state: 'CA', pop: 466742 },
    { city: 'Colorado Springs', state: 'CO', pop: 478961 },
    { city: 'Raleigh', state: 'NC', pop: 467665 },
    { city: 'Omaha', state: 'NE', pop: 486051 },
    { city: 'Miami', state: 'FL', pop: 449514 },
    { city: 'Virginia Beach', state: 'VA', pop: 459470 },
    { city: 'Oakland', state: 'CA', pop: 433031 },
    { city: 'Minneapolis', state: 'MN', pop: 429954 },
    { city: 'Tulsa', state: 'OK', pop: 413066 },
    { city: 'Tampa', state: 'FL', pop: 387050 },
    { city: 'Arlington', state: 'TX', pop: 394266 },
    { city: 'New Orleans', state: 'LA', pop: 383997 },
  ];

  // 1. Top 50 US cities by population with fewer than 10 coworking listings
  console.log('='.repeat(70));
  console.log('1. TOP 50 US CITIES BY POPULATION WITH <10 COWORKING LISTINGS');
  console.log('='.repeat(70));

  const gaps: Array<{ city: string; state: string; pop: number; count: number }> = [];

  for (const c of top50Cities) {
    const { count, error } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'coworking')
      .ilike('city', c.city)
      .eq('state', c.state)
      .eq('is_active', true);

    if (error) {
      console.error('Error querying:', c.city, error.message);
      continue;
    }

    if (count !== null && count < 10) {
      gaps.push({ ...c, count });
    }
  }

  gaps.sort((a, b) => a.count - b.count);

  console.log('\nCity                          State   Coworking   Population');
  console.log('-'.repeat(60));
  for (const g of gaps) {
    const cityPad = g.city.padEnd(30);
    const statePad = g.state.padEnd(6);
    const countPad = String(g.count).padStart(3);
    console.log(`${cityPad} ${statePad}  ${countPad}        ${g.pop.toLocaleString()}`);
  }
  console.log(`\nTotal cities with <10 coworking: ${gaps.length}/50`);

  // 2. Bottom 20 states by total listing count
  console.log('\n' + '='.repeat(70));
  console.log('2. BOTTOM 20 STATES BY TOTAL LISTING COUNT');
  console.log('='.repeat(70));

  const { data: stateData } = await supabase
    .from('resource_listings')
    .select('state')
    .eq('is_active', true);

  const stateCounts: Record<string, number> = {};
  for (const row of stateData || []) {
    if (row.state) {
      stateCounts[row.state] = (stateCounts[row.state] || 0) + 1;
    }
  }

  const statesSorted = Object.entries(stateCounts)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 20);

  console.log('\nState   Listings');
  console.log('-'.repeat(20));
  for (const [state, count] of statesSorted) {
    console.log(`${state.padEnd(8)} ${count}`);
  }

  // 3. Total listings by category
  console.log('\n' + '='.repeat(70));
  console.log('3. TOTAL LISTINGS BY CATEGORY');
  console.log('='.repeat(70));

  const categories = ['coworking', 'grant', 'accelerator', 'sba'];
  console.log('\nCategory      Count');
  console.log('-'.repeat(25));

  for (const cat of categories) {
    const { count } = await supabase
      .from('resource_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat)
      .eq('is_active', true);

    console.log(`${cat.padEnd(14)} ${count}`);
  }

  // Total
  const { count: total } = await supabase
    .from('resource_listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log('-'.repeat(25));
  console.log(`${'TOTAL'.padEnd(14)} ${total}`);
}

main().catch(console.error);
