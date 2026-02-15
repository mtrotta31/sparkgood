# SparkGood Pro Toolkit — Quick Start

**Get running in 5 minutes.**

---

## Before You Start

You'll need:
- [ ] Claude Code installed (`claude --version` should work)
- [ ] A Perplexity API key (get one at [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api))
- [ ] A Firecrawl API key (get one at [firecrawl.dev](https://www.firecrawl.dev/))

Don't have Claude Code? Install it first:
```bash
curl -fsSL https://claude.ai/install.sh | sh
```

---

## Step 1: Run the Setup Script (2 minutes)

```bash
# Navigate to the pro-toolkit folder
cd /path/to/sparkgood/pro-toolkit

# Make scripts executable
chmod +x setup/*.sh

# Run setup — it will prompt for your API keys
./setup/install-mcps.sh
```

The script will:
1. Ask for your Perplexity API key
2. Ask for your Firecrawl API key
3. Configure Claude Code to use these services
4. Install the Playwright browser automation (optional)

---

## Step 2: Install Skills (30 seconds)

```bash
# Create skills directory
mkdir -p ~/.claude/skills

# Copy SparkGood skills
cp -r skills/* ~/.claude/skills/
```

---

## Step 3: Verify (30 seconds)

```bash
./setup/verify-setup.sh
```

All green? You're ready.

---

## Step 4: Start Using (right now!)

Open a terminal, navigate to where you want to save your work:

```bash
mkdir my-venture
cd my-venture
claude
```

Then type:

```
/sparkgood-orchestrator
```

The orchestrator will guide you from there.

---

## Quick Commands

| What You Want | Command |
|---------------|---------|
| Get guidance on next steps | `/sparkgood-orchestrator` |
| Research a social issue | `/social-impact-research on [topic]` |
| See who else is doing this | `/competitor-analysis for [space]` |
| Check if your idea is viable | `/viability-scoring for [idea]` |
| Create a business plan | `/business-plan-generator` |
| Write grant proposals | `/grant-writing-assistant` |
| Create launch materials | `/launch-assets` |

---

## Example: Full Flow in 30 Minutes

```
1. /social-impact-research on youth mental health in Austin
   → Saves research to research/mental-health-austin.md

2. /competitor-analysis for youth mental health organizations in Austin
   → Saves to research/competitors.md

3. /viability-scoring for a peer support app for high school students
   → Get a Go/Refine/Pivot decision

4. /business-plan-generator for a peer support app nonprofit
   → Complete plan saved to plan/business-plan.md

5. /launch-assets for the peer support app launch
   → Landing page, pitch deck, social posts ready to use
```

---

## Need More Help?

- **Full documentation:** See `README.md`
- **Troubleshooting:** See the Troubleshooting section in `README.md`
- **Web version:** Visit [sparkgood.io](https://sparkgood.io)

---

**Ready to spark something good?**
