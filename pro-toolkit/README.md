# SparkGood Pro Toolkit

**The complete AI toolkit for social impact entrepreneurs.**

Transform your desire to do good into a fully-planned venture — with research, strategy, business planning, and marketing assets powered by Claude Code.

---

## What's Inside

13 professional-grade Claude Code skills that take you from "I want to help" to "Here's my launch plan":

### Research Skills
| Skill | What It Does |
|-------|--------------|
| `social-impact-research` | Deep research on social issues, root causes, and intervention opportunities |
| `competitor-analysis` | Map the landscape of existing organizations and find your unique position |
| `audience-profiling` | Build detailed profiles of beneficiaries, donors, volunteers, and partners |

### Strategy Skills
| Skill | What It Does |
|-------|--------------|
| `social-impact-positioning` | Find your unique angle using a 7-dimension positioning framework |
| `viability-scoring` | Evaluate ideas with a Go/Refine/Pivot scoring system |
| `revenue-model-design` | Design sustainable funding models for any venture type |

### Execution Skills
| Skill | What It Does |
|-------|--------------|
| `business-plan-generator` | Create complete business or project plans tailored to your stage |
| `impact-measurement` | Design KPIs and measurement frameworks that prove your impact |
| `grant-writing-assistant` | Write compelling grant proposals with section-by-section guidance |

### Marketing Skills
| Skill | What It Does |
|-------|--------------|
| `social-impact-copywriting` | Write authentic copy that moves people to action |
| `launch-assets` | Generate landing pages, pitch decks, social posts, and emails |
| `community-outreach` | Build volunteer programs, partnerships, and grassroots support |

### Orchestration
| Skill | What It Does |
|-------|--------------|
| `sparkgood-orchestrator` | Your guide — analyzes where you are and recommends what to do next |

---

## Requirements

### Required
- **Claude Code CLI** — The terminal-based Claude interface
- **Anthropic API Key** — For Claude Code access

### Recommended (for full functionality)
- **Perplexity API Key** — Powers deep research capabilities ($5/month for 100 queries)
- **Firecrawl API Key** — Powers web scraping for competitor analysis (free tier available)

### Optional
- **Playwright MCP** — Browser automation for screenshots and interactive research (free)

---

## Installation

### Step 1: Install Claude Code

If you haven't already, install Claude Code:

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | sh

# Or with npm
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
claude --version
```

### Step 2: Get Your API Keys

#### Perplexity API (Recommended)
1. Go to [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Create an account or sign in
3. Generate an API key
4. Copy the key (starts with `pplx-`)

#### Firecrawl API (Recommended)
1. Go to [firecrawl.dev](https://www.firecrawl.dev/)
2. Create an account
3. Navigate to API Keys in your dashboard
4. Generate and copy your API key (starts with `fc-`)

### Step 3: Configure MCPs

Claude Code uses MCP (Model Context Protocol) servers to connect to external tools. You need to add the MCP configurations to your Claude Code settings.

#### Option A: Use the Setup Script (Recommended)

```bash
# Navigate to the pro-toolkit directory
cd /path/to/sparkgood/pro-toolkit

# Make the script executable
chmod +x setup/install-mcps.sh

# Run the setup script
./setup/install-mcps.sh
```

The script will:
1. Prompt you for your API keys
2. Create the MCP configuration
3. Test the connections

#### Option B: Manual Configuration

1. **Find your Claude Code config file:**
   ```bash
   # macOS
   ~/.claude/settings.json

   # Or use Claude Code's built-in command
   claude config path
   ```

2. **Add MCP servers to your config:**

   Edit your settings file (create it if it doesn't exist) and add the `mcpServers` section:

   ```json
   {
     "mcpServers": {
       "perplexity": {
         "command": "npx",
         "args": ["-y", "perplexity-mcp"],
         "env": {
           "PERPLEXITY_API_KEY": "pplx-your-actual-key-here"
         }
       },
       "firecrawl": {
         "command": "npx",
         "args": ["-y", "firecrawl-mcp"],
         "env": {
           "FIRECRAWL_API_KEY": "fc-your-actual-key-here"
         }
       },
       "playwright": {
         "command": "npx",
         "args": ["-y", "@playwright/mcp@latest"]
       }
     }
   }
   ```

3. **Restart Claude Code** to load the new MCPs.

#### Option C: Use Claude Code CLI

```bash
# Add Perplexity MCP
claude mcp add perplexity --command "npx" --args "-y perplexity-mcp" --env "PERPLEXITY_API_KEY=pplx-your-key"

# Add Firecrawl MCP
claude mcp add firecrawl --command "npx" --args "-y firecrawl-mcp" --env "FIRECRAWL_API_KEY=fc-your-key"

# Add Playwright MCP
claude mcp add playwright --command "npx" --args "-y @playwright/mcp@latest"
```

### Step 4: Install Skills

Copy the SparkGood skills to your Claude Code skills directory:

```bash
# Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Copy all SparkGood skills
cp -r /path/to/sparkgood/pro-toolkit/skills/* ~/.claude/skills/
```

Or create a symlink to keep skills updated:
```bash
ln -s /path/to/sparkgood/pro-toolkit/skills/* ~/.claude/skills/
```

### Step 5: Verify Installation

Run the verification script:

```bash
chmod +x setup/verify-setup.sh
./setup/verify-setup.sh
```

You should see all green checkmarks. If anything fails, the script will tell you how to fix it.

---

## Usage Guide

### Getting Started: The Orchestrator

The easiest way to start is with the orchestrator skill. Open Claude Code in your project directory and type:

```
/sparkgood-orchestrator
```

The orchestrator will:
1. Ask about your venture (type, stage, goals)
2. Assess what you've already done
3. Recommend the best skill to run next
4. Guide you through the complete journey

### Recommended Skill Sequence

For a new social venture, follow this path:

```
1. DISCOVER
   └── /social-impact-research
       Research your cause area, understand the problem deeply

2. VALIDATE
   └── /competitor-analysis
       Map what exists, find gaps and opportunities
   └── /audience-profiling
       Understand who you'll serve

3. POSITION
   └── /social-impact-positioning
       Find your unique angle
   └── /viability-scoring
       Get a Go/Refine/Pivot decision

4. PLAN
   └── /revenue-model-design
       Design sustainable funding
   └── /business-plan-generator
       Create your complete plan
   └── /impact-measurement
       Define how you'll prove impact

5. PREPARE
   └── /social-impact-copywriting
       Write your core messaging
   └── /launch-assets
       Create landing page, deck, social posts
   └── /grant-writing-assistant
       Write funding applications
   └── /community-outreach
       Plan volunteer and partnership strategy

6. LAUNCH
   └── Use your assets, follow your roadmap!
```

### Running Individual Skills

Each skill can be invoked directly:

```bash
# In Claude Code, type:
/social-impact-research

# Or with context:
/competitor-analysis in the youth mental health space in Chicago

# Or with a specific request:
/business-plan-generator for a nonprofit tutoring program
```

### Skill Commands Quick Reference

| Command | Use When |
|---------|----------|
| `/sparkgood-orchestrator` | You're not sure what to do next |
| `/social-impact-research [topic]` | Starting fresh, need to understand a cause |
| `/competitor-analysis [space]` | Need to know who else is doing this work |
| `/audience-profiling` | Need to understand your beneficiaries/donors |
| `/social-impact-positioning` | Ready to define your unique angle |
| `/viability-scoring [idea]` | Need a Go/Refine/Pivot decision |
| `/revenue-model-design` | Need to figure out funding/revenue |
| `/business-plan-generator` | Ready to create a full plan |
| `/impact-measurement` | Need to define KPIs and metrics |
| `/grant-writing-assistant` | Applying for foundation/government grants |
| `/social-impact-copywriting` | Need website copy, emails, appeals |
| `/launch-assets` | Need landing page, pitch deck, social posts |
| `/community-outreach` | Building volunteer/partner programs |

### Working Across Sessions

SparkGood skills are designed to build on each other. Save your outputs:

```bash
# Create a project folder
mkdir my-venture
cd my-venture

# Run Claude Code here — outputs will be saved to this folder
claude
```

When you run skills, ask Claude to save outputs:
```
/social-impact-research on food insecurity in Austin — save findings to research/
```

Future skills will reference these saved files automatically.

---

## Skill Details

### social-impact-research

**Purpose:** Conduct deep research on a social issue before building solutions.

**Uses:** Perplexity MCP for real-time research

**Output:**
- Problem brief with scale and root causes
- Population profiles
- Existing solutions landscape
- Evidence base summary
- Opportunity identification

**Example:**
```
/social-impact-research on veteran homelessness in Los Angeles
```

---

### competitor-analysis

**Purpose:** Map the landscape of organizations working on your issue.

**Uses:** Firecrawl MCP for web scraping, Perplexity MCP for research

**Output:**
- Landscape map by organization type
- Deep profiles of 5-10 key competitors
- Positioning matrix
- Gap analysis
- Partnership opportunities

**Example:**
```
/competitor-analysis for youth coding education nonprofits in the Bay Area
```

---

### audience-profiling

**Purpose:** Build detailed profiles of the people you'll serve, fund, or engage.

**Output:**
- Demographic profiles
- Psychographic insights (motivations, fears, aspirations)
- Behavioral patterns
- Journey maps
- Persona documents

**Example:**
```
/audience-profiling for potential donors to an animal rescue nonprofit
```

---

### social-impact-positioning

**Purpose:** Find your unique positioning using a structured framework.

**Output:**
- 7-dimension positioning analysis
- Positioning statement
- Differentiation strategy
- Messaging pillars
- Competitive positioning map

**Example:**
```
/social-impact-positioning for a social enterprise teaching financial literacy
```

---

### viability-scoring

**Purpose:** Get a data-driven Go/Refine/Pivot decision on your idea.

**Output:**
- Scores across 5 dimensions (Demand, Execution, Impact, Sustainability, Timing)
- Overall viability score (1-10)
- Go/Refine/Pivot recommendation
- Specific actions for each verdict
- Risk assessment

**Example:**
```
/viability-scoring for a mobile app connecting volunteers with elderly neighbors
```

---

### revenue-model-design

**Purpose:** Design sustainable funding models for your venture type.

**Output:**
- Revenue model recommendations by venture type
- Financial projections template
- Funding source matrix
- Sustainability scorecard
- Risk assessment

**Example:**
```
/revenue-model-design for a hybrid nonprofit/social enterprise model
```

---

### business-plan-generator

**Purpose:** Create a complete business or project plan.

**Output:**
- Executive summary
- Mission and theory of change
- Market analysis
- Operations plan
- Financial projections
- Impact measurement framework
- Risk mitigation
- Action roadmap

**Example:**
```
/business-plan-generator for a community land trust in Detroit
```

---

### impact-measurement

**Purpose:** Design frameworks to track and prove your impact.

**Output:**
- Theory of change diagram
- Metric selection with SMART criteria
- Data collection plan
- Survey templates
- Impact report template

**Example:**
```
/impact-measurement for a job training program for formerly incarcerated individuals
```

---

### grant-writing-assistant

**Purpose:** Write compelling grant proposals.

**Output:**
- Funder research and fit assessment
- Letter of inquiry template
- Full proposal sections (need statement, project description, budget, evaluation)
- Budget narrative
- Reporting templates

**Example:**
```
/grant-writing-assistant for a $50,000 foundation grant for environmental education
```

---

### social-impact-copywriting

**Purpose:** Write authentic copy that moves people to action.

**Output:**
- Mission statement and tagline
- Website copy (homepage, about, programs)
- Fundraising appeals
- Email sequences
- Social media content
- Volunteer recruitment copy

**Example:**
```
/social-impact-copywriting for our refugee resettlement nonprofit's new website
```

---

### launch-assets

**Purpose:** Generate all the assets you need to launch.

**Output:**
- Landing page (copy and structure)
- Pitch deck (10-12 slides)
- Social media launch posts
- Email sequences
- Press release template
- 30-day launch roadmap

**Example:**
```
/launch-assets for launching our Kickstarter for a solar-powered water purifier
```

---

### community-outreach

**Purpose:** Build programs for volunteers, partners, and community engagement.

**Output:**
- Volunteer program design
- Role descriptions
- Recruitment materials
- Partnership proposals
- Event planning templates
- Engagement metrics dashboard

**Example:**
```
/community-outreach to build a volunteer tutoring network
```

---

## Troubleshooting

### MCPs Not Loading

**Symptom:** Skill says it can't access Perplexity/Firecrawl tools.

**Fix:**
1. Verify your config file is valid JSON (no trailing commas!)
2. Check that API keys are correct and have no extra spaces
3. Restart Claude Code completely
4. Run `claude mcp list` to see which MCPs are loaded

### Skills Not Found

**Symptom:** `/sparkgood-orchestrator` doesn't work.

**Fix:**
1. Check skills are in the right place: `ls ~/.claude/skills/`
2. Each skill needs a `SKILL.md` file in its folder
3. Restart Claude Code after adding skills

### API Rate Limits

**Symptom:** "Rate limit exceeded" errors.

**Fix:**
1. Wait a few minutes and try again
2. Perplexity free tier has low limits — consider upgrading
3. Use Firecrawl's caching features

### Outputs Too Long

**Symptom:** Claude's response gets cut off.

**Fix:**
1. Ask Claude to save to a file instead: "Save this to plan.md"
2. Request sections one at a time
3. Use "continue" if response is truncated

---

## Tips for Best Results

### 1. Work in a Project Folder
Create a folder for your venture and run Claude Code there. This keeps all outputs organized.

### 2. Save Everything
Ask Claude to save outputs to files. Future skills will reference these automatically.

### 3. Provide Context
The more context you give, the better the outputs. Share:
- Your background and experience level
- Budget constraints
- Geographic focus
- Timeline
- What you've already done

### 4. Iterate
Skills are designed for multiple passes. Run them again with refinements:
```
/viability-scoring — focus more on the sustainability dimension this time
```

### 5. Combine Skills
Ask Claude to use multiple skills in sequence:
```
Research food deserts in Phoenix, then analyze competitors, then create positioning
```

---

## Support

- **Documentation:** You're reading it!
- **Web App:** Visit [sparkgood.io](https://sparkgood.io) for the guided web experience
- **Issues:** Report bugs at [github.com/sparkgood/pro-toolkit/issues](https://github.com/sparkgood/pro-toolkit/issues)
- **Updates:** Follow [@sparkgood](https://twitter.com/sparkgood) for toolkit updates

---

## License

SparkGood Pro Toolkit is proprietary software for licensed users. See LICENSE for terms.

---

**Ready to spark something good?** Run `/sparkgood-orchestrator` to begin.
