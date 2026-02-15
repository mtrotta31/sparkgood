#!/bin/bash

# ============================================================================
# SparkGood Pro Toolkit — MCP Installation Script
# ============================================================================
# This script configures Claude Code with the MCP servers needed for
# SparkGood skills: Perplexity (research), Firecrawl (scraping), Playwright
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
echo -e "${YELLOW}║${NC}   ${GREEN}SparkGood Pro Toolkit${NC} — MCP Setup                            ${YELLOW}║${NC}"
echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
echo -e "${YELLOW}║${NC}   This script will configure Claude Code with the tools       ${YELLOW}║${NC}"
echo -e "${YELLOW}║${NC}   needed for SparkGood skills.                                 ${YELLOW}║${NC}"
echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    echo "Install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

# Check for Claude Code
if ! command -v claude &> /dev/null; then
    echo -e "${RED}Error: Claude Code CLI is not installed.${NC}"
    echo ""
    echo "Install Claude Code first:"
    echo "  curl -fsSL https://claude.ai/install.sh | sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Claude Code CLI found"
echo -e "${GREEN}✓${NC} Node.js found ($(node --version))"
echo ""

# ============================================================================
# Collect API Keys
# ============================================================================

echo -e "${BLUE}Step 1: API Keys${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Perplexity API Key
echo -e "${YELLOW}Perplexity API Key${NC} (for research skills)"
echo "Get one at: https://www.perplexity.ai/settings/api"
echo ""
read -p "Enter your Perplexity API key (or press Enter to skip): " PERPLEXITY_KEY
echo ""

if [ -z "$PERPLEXITY_KEY" ]; then
    echo -e "${YELLOW}⚠${NC}  Skipping Perplexity — research skills will have limited functionality"
else
    echo -e "${GREEN}✓${NC}  Perplexity API key saved"
fi
echo ""

# Firecrawl API Key
echo -e "${YELLOW}Firecrawl API Key${NC} (for competitor analysis)"
echo "Get one at: https://www.firecrawl.dev/"
echo ""
read -p "Enter your Firecrawl API key (or press Enter to skip): " FIRECRAWL_KEY
echo ""

if [ -z "$FIRECRAWL_KEY" ]; then
    echo -e "${YELLOW}⚠${NC}  Skipping Firecrawl — competitor analysis will have limited functionality"
else
    echo -e "${GREEN}✓${NC}  Firecrawl API key saved"
fi
echo ""

# Playwright (no key needed)
echo -e "${YELLOW}Playwright${NC} (for browser automation — no API key needed)"
read -p "Install Playwright MCP? (y/n, default: y): " INSTALL_PLAYWRIGHT
INSTALL_PLAYWRIGHT=${INSTALL_PLAYWRIGHT:-y}
echo ""

# ============================================================================
# Determine config file location
# ============================================================================

echo -e "${BLUE}Step 2: Configuring Claude Code${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Claude Code config locations
CLAUDE_DIR="$HOME/.claude"
CONFIG_FILE="$CLAUDE_DIR/settings.json"

# Create .claude directory if it doesn't exist
if [ ! -d "$CLAUDE_DIR" ]; then
    mkdir -p "$CLAUDE_DIR"
    echo -e "${GREEN}✓${NC}  Created $CLAUDE_DIR"
fi

# ============================================================================
# Build MCP configuration
# ============================================================================

# Start building the mcpServers object
MCP_SERVERS="{"

# Add Perplexity if key provided
if [ -n "$PERPLEXITY_KEY" ]; then
    MCP_SERVERS="$MCP_SERVERS
    \"perplexity\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"perplexity-mcp\"],
      \"env\": {
        \"PERPLEXITY_API_KEY\": \"$PERPLEXITY_KEY\"
      }
    }"
    NEED_COMMA=true
fi

# Add Firecrawl if key provided
if [ -n "$FIRECRAWL_KEY" ]; then
    if [ "$NEED_COMMA" = true ]; then
        MCP_SERVERS="$MCP_SERVERS,"
    fi
    MCP_SERVERS="$MCP_SERVERS
    \"firecrawl\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"firecrawl-mcp\"],
      \"env\": {
        \"FIRECRAWL_API_KEY\": \"$FIRECRAWL_KEY\"
      }
    }"
    NEED_COMMA=true
fi

# Add Playwright if requested
if [ "$INSTALL_PLAYWRIGHT" = "y" ] || [ "$INSTALL_PLAYWRIGHT" = "Y" ]; then
    if [ "$NEED_COMMA" = true ]; then
        MCP_SERVERS="$MCP_SERVERS,"
    fi
    MCP_SERVERS="$MCP_SERVERS
    \"playwright\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@playwright/mcp@latest\"]
    }"
fi

MCP_SERVERS="$MCP_SERVERS
  }"

# ============================================================================
# Write or merge config
# ============================================================================

if [ -f "$CONFIG_FILE" ]; then
    # Config exists — we need to merge
    echo "Existing config found at $CONFIG_FILE"
    echo ""

    # Check if it already has mcpServers
    if grep -q "mcpServers" "$CONFIG_FILE"; then
        echo -e "${YELLOW}⚠${NC}  Your config already has mcpServers defined."
        echo ""
        echo "Options:"
        echo "  1. Backup existing config and create new one"
        echo "  2. Show me what to add manually"
        echo "  3. Cancel"
        echo ""
        read -p "Choose (1/2/3): " MERGE_CHOICE

        case $MERGE_CHOICE in
            1)
                BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d%H%M%S)"
                cp "$CONFIG_FILE" "$BACKUP_FILE"
                echo -e "${GREEN}✓${NC}  Backed up to $BACKUP_FILE"
                # Write new config
                echo "{
  \"mcpServers\": $MCP_SERVERS
}" > "$CONFIG_FILE"
                echo -e "${GREEN}✓${NC}  Created new config at $CONFIG_FILE"
                ;;
            2)
                echo ""
                echo "Add this to your mcpServers in $CONFIG_FILE:"
                echo ""
                echo -e "${BLUE}$MCP_SERVERS${NC}"
                echo ""
                echo "Then restart Claude Code."
                exit 0
                ;;
            *)
                echo "Cancelled."
                exit 0
                ;;
        esac
    else
        # Has config but no mcpServers — we can add it
        # This is a simple approach; for complex merging, use jq
        echo -e "${YELLOW}Note:${NC} Adding mcpServers to existing config."
        echo "You may need to manually verify $CONFIG_FILE is valid JSON."

        # Backup first
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

        # Try to add mcpServers (simple approach)
        # Remove trailing } and add mcpServers
        sed -i.tmp 's/}$/,/' "$CONFIG_FILE"
        echo "  \"mcpServers\": $MCP_SERVERS
}" >> "$CONFIG_FILE"
        rm -f "$CONFIG_FILE.tmp"

        echo -e "${GREEN}✓${NC}  Updated config at $CONFIG_FILE"
    fi
else
    # No config exists — create new one
    echo "{
  \"mcpServers\": $MCP_SERVERS
}" > "$CONFIG_FILE"
    echo -e "${GREEN}✓${NC}  Created config at $CONFIG_FILE"
fi

echo ""

# ============================================================================
# Pre-download MCP packages (optional, speeds up first use)
# ============================================================================

echo -e "${BLUE}Step 3: Pre-installing MCP packages${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will download packages now so they're ready when you use Claude Code."
echo ""

read -p "Pre-install packages? (y/n, default: y): " PREINSTALL
PREINSTALL=${PREINSTALL:-y}

if [ "$PREINSTALL" = "y" ] || [ "$PREINSTALL" = "Y" ]; then
    echo ""

    if [ -n "$PERPLEXITY_KEY" ]; then
        echo "Installing perplexity-mcp..."
        npx -y perplexity-mcp --version 2>/dev/null || echo -e "${YELLOW}(Will install on first use)${NC}"
    fi

    if [ -n "$FIRECRAWL_KEY" ]; then
        echo "Installing firecrawl-mcp..."
        npx -y firecrawl-mcp --version 2>/dev/null || echo -e "${YELLOW}(Will install on first use)${NC}"
    fi

    if [ "$INSTALL_PLAYWRIGHT" = "y" ] || [ "$INSTALL_PLAYWRIGHT" = "Y" ]; then
        echo "Installing @playwright/mcp..."
        npx -y @playwright/mcp@latest --version 2>/dev/null || echo -e "${YELLOW}(Will install on first use)${NC}"
    fi

    echo ""
fi

# ============================================================================
# Done!
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                                                                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}   ${GREEN}Setup Complete!${NC}                                             ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                                ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "  1. Install SparkGood skills:"
echo "     ${BLUE}mkdir -p ~/.claude/skills${NC}"
echo "     ${BLUE}cp -r skills/* ~/.claude/skills/${NC}"
echo ""
echo "  2. Verify setup:"
echo "     ${BLUE}./setup/verify-setup.sh${NC}"
echo ""
echo "  3. Start Claude Code and run:"
echo "     ${BLUE}/sparkgood-orchestrator${NC}"
echo ""
echo -e "${YELLOW}Ready to spark something good!${NC}"
echo ""
