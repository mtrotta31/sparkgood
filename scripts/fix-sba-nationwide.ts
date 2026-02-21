// Fix SBA resources that have a city but are incorrectly marked as nationwide
// These are local offices like SCORE Denver, Colorado SBDC Network

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSbaNationwide() {
  // First, show current state of SBA resources
  console.log("Current SBA resources:");
  const { data: allSba } = await supabase
    .from("resource_listings")
    .select("id, name, city, state, is_nationwide, is_remote")
    .eq("category", "sba")
    .limit(30);

  allSba?.forEach((r) =>
    console.log(`  ${r.name} | city: ${r.city || "null"} | nationwide: ${r.is_nationwide} | remote: ${r.is_remote}`)
  );

  console.log("\nFinding SBA resources with city but marked nationwide...");

  // First, find them
  const { data: toFix, error: findError } = await supabase
    .from("resource_listings")
    .select("id, name, city, state, is_nationwide")
    .eq("category", "sba")
    .eq("is_nationwide", true)
    .not("city", "is", null)
    .neq("city", "");

  if (findError) {
    console.error("Error finding records:", findError);
    return;
  }

  console.log(`Found ${toFix?.length || 0} records to fix:`);
  toFix?.forEach((r) => console.log(`  - ${r.name} (${r.city}, ${r.state})`));

  if (!toFix || toFix.length === 0) {
    console.log("No records to fix.");
    return;
  }

  // Update them
  const ids = toFix.map((r) => r.id);
  const { data: updated, error: updateError } = await supabase
    .from("resource_listings")
    .update({ is_nationwide: false })
    .in("id", ids)
    .select("id, name, city, state, is_nationwide");

  if (updateError) {
    console.error("Error updating records:", updateError);
    return;
  }

  console.log(`\nSuccessfully updated ${updated?.length || 0} records to is_nationwide=false`);
}

async function checkNewYork() {
  console.log("\n\n=== Checking New York specifically ===");

  // What the homepage query would return (is_remote = false, city = New York)
  const { data: homepageQuery } = await supabase
    .from("resource_listings")
    .select("category, city, state, is_remote, is_nationwide")
    .eq("is_active", true)
    .eq("is_remote", false)
    .eq("city", "New York");

  console.log("\nHomepage query (is_remote=false, city=New York):");
  const byCategory: Record<string, number> = {};
  homepageQuery?.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  // What the city hub query would return (city = New York, state = NY)
  const { data: cityHubQuery } = await supabase
    .from("resource_listings")
    .select("category, city, state, is_remote, is_nationwide")
    .eq("is_active", true)
    .eq("city", "New York")
    .eq("state", "NY");

  console.log("\nCity hub query (city=New York, state=NY, no is_remote filter):");
  const byCategory2: Record<string, number> = {};
  cityHubQuery?.forEach((r) => {
    byCategory2[r.category] = (byCategory2[r.category] || 0) + 1;
  });
  Object.entries(byCategory2).forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  // Show the differences
  console.log("\nDifferences (resources in city hub but not homepage):");
  const cityHubIds = new Set(cityHubQuery?.map(r => `${r.category}-${r.city}-${r.state}`));
  const homepageIds = new Set(homepageQuery?.map(r => `${r.category}-${r.city}-${r.state}`));

  const inCityHubOnly = cityHubQuery?.filter(r => {
    return r.is_remote === true || r.is_nationwide === true;
  });
  console.log(`Resources in city hub with is_remote=true or is_nationwide=true:`);
  inCityHubOnly?.forEach(r => console.log(`  ${r.category} | remote: ${r.is_remote} | nationwide: ${r.is_nationwide}`));
}

fixSbaNationwide().then(() => checkNewYork()).catch(console.error);
