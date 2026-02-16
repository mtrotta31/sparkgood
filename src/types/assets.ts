// Asset types for "Build This For Me" feature

export type AssetType =
  | "landing_page"
  | "social_post"
  | "email"
  | "flyer"
  | "pitch_script"
  | "volunteer_post"
  | "partnership_email"
  | "press_release"
  | "grant_intro";

export interface BuildAssetRequest {
  taskDescription: string;
  assetType: AssetType;
  idea: {
    name: string;
    tagline: string;
    problem: string;
    audience: string;
    impact: string;
    revenueModel?: string;
    causeAreas: string[];
  };
  profile: {
    ventureType: string;
    format: string;
    experience: string;
    budget: string;
    commitment: string;
  };
  // Optional customization
  platform?: string; // For social posts: twitter, linkedin, instagram, facebook, nextdoor
  tone?: string; // casual, professional, urgent, inspiring
}

export interface GeneratedAsset {
  type: AssetType;
  title: string;
  content: string;
  // For landing pages, this is the full HTML
  // For social posts, this is the post text
  // For emails, this includes subject and body
  metadata?: {
    subject?: string; // For emails
    platform?: string; // For social posts
    hashtags?: string[]; // For social posts
    filename?: string; // Suggested filename for downloads
    wordCount?: number;
  };
}

// Map task keywords to asset types
export const ASSET_TYPE_KEYWORDS: Record<AssetType, string[]> = {
  landing_page: [
    "landing page", "website", "carrd", "notion page", "simple page",
    "web page", "signup page", "waitlist page"
  ],
  social_post: [
    "social media", "post on", "facebook", "instagram", "twitter",
    "linkedin", "nextdoor", "social post", "announce"
  ],
  email: [
    "email", "outreach email", "welcome email", "reminder email",
    "follow-up", "newsletter", "send a message"
  ],
  flyer: [
    "flyer", "poster", "handout", "door hanger", "print",
    "one-pager", "info sheet"
  ],
  pitch_script: [
    "pitch", "elevator pitch", "script", "talking points",
    "what to say", "explain", "presentation"
  ],
  volunteer_post: [
    "recruit volunteer", "volunteer post", "call for volunteers",
    "looking for help", "need volunteers"
  ],
  partnership_email: [
    "partner", "partnership", "sponsor", "reach out to",
    "approach", "collaborate"
  ],
  press_release: [
    "press release", "media", "news", "announcement",
    "publicity"
  ],
  grant_intro: [
    "grant", "funding", "foundation", "apply for",
    "letter of inquiry", "LOI"
  ]
};

// Detect asset type from task description
export function detectAssetType(taskDescription: string): AssetType | null {
  const lowerTask = taskDescription.toLowerCase();

  for (const [assetType, keywords] of Object.entries(ASSET_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTask.includes(keyword)) {
        return assetType as AssetType;
      }
    }
  }

  return null;
}

// Check if a task is buildable (has a detectable asset type)
export function isBuildableTask(taskDescription: string): boolean {
  return detectAssetType(taskDescription) !== null;
}

// Get friendly name for asset type
export function getAssetTypeName(assetType: AssetType): string {
  const names: Record<AssetType, string> = {
    landing_page: "Landing Page",
    social_post: "Social Post",
    email: "Email",
    flyer: "Flyer",
    pitch_script: "Pitch Script",
    volunteer_post: "Volunteer Recruitment Post",
    partnership_email: "Partnership Email",
    press_release: "Press Release",
    grant_intro: "Grant Introduction"
  };
  return names[assetType];
}
