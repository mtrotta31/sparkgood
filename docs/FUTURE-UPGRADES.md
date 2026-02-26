# SparkLocal — Future Upgrades Backlog

Items saved for later implementation. Add new ideas to the bottom.

---

## 1. Business Name Rename + Content Propagation
Allow users to rename their business and have the new name propagate through all generated content (deep dive tabs, Launch Kit landing page, pitch deck, social graphics, one-pager). Start with project title rename + "regenerate to update" note, then build full propagation later if demand exists.

## 2. Logo Generation Tool
AI-generated logo (via DALL-E, Ideogram, or similar) integrated into the Launch Kit. Would need: image generation API, selection/regeneration UI, integration into landing page and other assets. Consider as a premium add-on. Quality matters here — bad AI logo hurts more than no logo. Typography-only branding works fine for now.

## 3. Firecrawl MCP Integration
Firecrawl now supports MCP (Model Context Protocol) for real-time web scraping from AI tools. Current Firecrawl API usage for competitor analysis is working fine. MCP would be most relevant if the AI Advisor needs live web data mid-conversation (e.g., "what's the current price of X"). Revisit when AI Advisor capabilities expand. Setup guide: https://www.firecrawl.dev/mcp

## 4. AI Advisor Real-Time Web Access
Let the AI Advisor pull live web data during conversations — current prices, regulations, competitor info, etc. Would pair with Firecrawl MCP (#3 above). Adds complexity and API cost but could be a strong differentiator.

## 5. Landing Page Editor
Simple WYSIWYG editor for Launch Kit landing pages — let users customize colors, text, images, and layout after generation.

## 6. Custom Domain Support
Let users point their own domain to their Launch Kit landing page (e.g., austinpourco.com → sparklocal.co/sites/austin-pour-co).

## 7. Additional Social Graphic Sizes
TikTok, Pinterest, YouTube thumbnail, Twitter/X header formats for Launch Kit social graphics.

## 8. Grant Application Draft Generator
Auto-generate draft grant applications using matched directory resources + business plan data. Pro/subscription tier feature.

## 9. Share/Collaboration
Public read-only share link for deep dives. Invite co-founders to view/edit projects.

## 10. Export to Google Docs
Export deep dive content directly to Google Docs format.
