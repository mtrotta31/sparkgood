// Script to clean up duplicate projects in the database
// Keeps the project with the most deep dive content, deletes others

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SavedIdea {
  id: string;
  user_id: string;
  idea_data: {
    name: string;
    tagline: string;
  };
  created_at: string;
}

interface DeepDiveResult {
  id: string;
  idea_id: string;
  viability: unknown;
  business_plan: unknown;
  marketing: unknown;
  roadmap: unknown;
  checklist: unknown;
  foundation: unknown;
  growth: unknown;
  financial: unknown;
}

async function countContent(deepDive: DeepDiveResult | null): Promise<number> {
  if (!deepDive) return 0;
  let count = 0;
  // V1 fields
  if (deepDive.viability) count++;
  if (deepDive.business_plan) count++;
  if (deepDive.marketing) count++;
  if (deepDive.roadmap) count++;
  // V2 fields
  if (deepDive.checklist) count++;
  if (deepDive.foundation) count++;
  if (deepDive.growth) count++;
  if (deepDive.financial) count++;
  return count;
}

async function main() {
  console.log("Fetching all saved ideas...");
  
  // Get all saved ideas
  const { data: savedIdeas, error: ideasError } = await supabase
    .from("saved_ideas")
    .select("id, user_id, idea_data, created_at")
    .order("created_at", { ascending: true });

  if (ideasError) {
    console.error("Error fetching saved ideas:", ideasError);
    process.exit(1);
  }

  console.log(`Found ${savedIdeas.length} total saved ideas`);

  // Get all deep dive results
  const { data: deepDives, error: deepDiveError } = await supabase
    .from("deep_dive_results")
    .select("*");

  if (deepDiveError) {
    console.error("Error fetching deep dives:", deepDiveError);
    process.exit(1);
  }

  // Create a map of idea_id to deep dive
  const deepDiveMap = new Map<string, DeepDiveResult>();
  for (const dd of deepDives || []) {
    deepDiveMap.set(dd.idea_id, dd);
  }

  // Group ideas by user + name + tagline
  const groups = new Map<string, SavedIdea[]>();
  
  for (const idea of savedIdeas as SavedIdea[]) {
    const key = `${idea.user_id}::${idea.idea_data.name}::${idea.idea_data.tagline}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(idea);
  }

  // Find duplicates
  const duplicateGroups = Array.from(groups.entries()).filter(([_, ideas]) => ideas.length > 1);
  
  console.log(`\nFound ${duplicateGroups.length} groups with duplicates`);
  
  const toDelete: string[] = [];
  const deepDivesToDelete: string[] = [];

  for (const [key, ideas] of duplicateGroups) {
    const [userId, name, tagline] = key.split("::");
    console.log(`\n"${name}" - ${ideas.length} copies`);

    // Score each idea by content
    const scored = await Promise.all(
      ideas.map(async (idea) => {
        const deepDive = deepDiveMap.get(idea.id);
        const contentCount = await countContent(deepDive || null);
        return { idea, deepDive, contentCount };
      })
    );

    // Sort by content count (descending), then by created_at (oldest first as tiebreaker)
    scored.sort((a, b) => {
      if (b.contentCount !== a.contentCount) {
        return b.contentCount - a.contentCount;
      }
      return new Date(a.idea.created_at).getTime() - new Date(b.idea.created_at).getTime();
    });

    // Keep the first one (most content or oldest), delete the rest
    const [keep, ...duplicates] = scored;
    console.log(`  Keeping: ${keep.idea.id} (${keep.contentCount} sections, created ${keep.idea.created_at})`);
    
    for (const dup of duplicates) {
      console.log(`  Deleting: ${dup.idea.id} (${dup.contentCount} sections, created ${dup.idea.created_at})`);
      toDelete.push(dup.idea.id);
      if (dup.deepDive) {
        deepDivesToDelete.push(dup.deepDive.id);
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total duplicates to delete: ${toDelete.length}`);
  console.log(`Deep dive records to delete: ${deepDivesToDelete.length}`);

  if (toDelete.length === 0) {
    console.log("No duplicates to delete!");
    return;
  }

  // Ask for confirmation
  console.log("\nProceeding with deletion...");

  // Delete deep dive results first (foreign key constraint)
  if (deepDivesToDelete.length > 0) {
    const { error: ddDeleteError } = await supabase
      .from("deep_dive_results")
      .delete()
      .in("id", deepDivesToDelete);

    if (ddDeleteError) {
      console.error("Error deleting deep dive results:", ddDeleteError);
      process.exit(1);
    }
    console.log(`Deleted ${deepDivesToDelete.length} deep dive records`);
  }

  // Delete saved ideas
  const { error: ideaDeleteError } = await supabase
    .from("saved_ideas")
    .delete()
    .in("id", toDelete);

  if (ideaDeleteError) {
    console.error("Error deleting saved ideas:", ideaDeleteError);
    process.exit(1);
  }
  console.log(`Deleted ${toDelete.length} duplicate saved ideas`);

  console.log("\nCleanup complete!");
}

main().catch(console.error);
