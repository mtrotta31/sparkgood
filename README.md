# SparkGood

**Spark something good.**

SparkGood helps people turn their desire to make a difference into real-world action. Answer a few questions about what matters to you, get personalized social impact ideas, and receive a complete launch package — all powered by AI.

## What It Does

1. **Discovery** — Answer questions about your causes, experience, budget, and commitment level
2. **Ideas** — Get 4 tailored social impact concepts (community projects, nonprofits, or social businesses)
3. **Deep Dive** — For your chosen idea, get:
   - Viability analysis with market research
   - Business/project plan
   - Marketing assets and copy
   - Action roadmap with quick wins

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **AI:** Claude API (Anthropic)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (optional — app works with mock data without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sparkgood.git
cd sparkgood

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API key to .env.local
# ANTHROPIC_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Claude API key. Without it, app uses mock data. |

## Project Structure

```
sparkgood/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   ├── ui/        # Reusable UI components
│   │   ├── steps/     # Questionnaire step components
│   │   ├── results/   # Idea display components
│   │   └── deep-dive/ # Deep dive section components
│   ├── lib/           # Utilities and API clients
│   ├── prompts/       # AI prompt templates
│   └── types/         # TypeScript types
├── public/            # Static assets
└── pro-toolkit/       # Claude Code skills (Pro tier)
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy

## License

MIT

---

Built with Claude Code
