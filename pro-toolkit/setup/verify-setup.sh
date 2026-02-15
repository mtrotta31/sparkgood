#!/bin/bash

# ============================================================================
# SparkGood Pro Toolkit — Setup Verification
# ============================================================================
# Checks that everything is properly configured for SparkGood skills
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
WARN=0
FAIL=0

# Print banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   ${GREEN}SparkGood Pro Toolkit${NC} — Setup Verification                   ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                                                ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Check 1: Claude Code CLI
# ============================================================================

echo -e "${BLUE}Checking Claude Code...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v claude &> /dev/null; then
    VERSION=$(claude --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓${NC} Claude Code CLI installed (version: $VERSION)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Claude Code CLI not found"
    echo "  Install: curl -fsSL https://claude.ai/install.sh | sh"
    ((FAIL++))
fi
echo ""

# ============================================================================
# Check 2: Node.js
# ============================================================================

echo -e "${BLUE}Checking Node.js...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed ($NODE_VERSION)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "  Install from: https://nodejs.org/"
    ((FAIL++))
fi
echo ""

# ============================================================================
# Check 3: Claude Code Config
# ============================================================================

echo -e "${BLUE}Checking Claude Code configuration...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONFIG_FILE="$HOME/.claude/settings.json"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✓${NC} Config file exists at $CONFIG_FILE"
    ((PASS++))

    # Check for mcpServers
    if grep -q "mcpServers" "$CONFIG_FILE"; then
        echo -e "${GREEN}✓${NC} mcpServers section found"
        ((PASS++))

        # Check for specific MCPs
        if grep -q "perplexity" "$CONFIG_FILE"; then
            echo -e "${GREEN}  ✓${NC} Perplexity MCP configured"
            ((PASS++))
        else
            echo -e "${YELLOW}  ⚠${NC} Perplexity MCP not configured (research skills limited)"
            ((WARN++))
        fi

        if grep -q "firecrawl" "$CONFIG_FILE"; then
            echo -e "${GREEN}  ✓${NC} Firecrawl MCP configured"
            ((PASS++))
        else
            echo -e "${YELLOW}  ⚠${NC} Firecrawl MCP not configured (competitor analysis limited)"
            ((WARN++))
        fi

        if grep -q "playwright" "$CONFIG_FILE"; then
            echo -e "${GREEN}  ✓${NC} Playwright MCP configured"
            ((PASS++))
        else
            echo -e "${YELLOW}  ⚠${NC} Playwright MCP not configured (optional)"
            ((WARN++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} No mcpServers section found"
        echo "  Run: ./setup/install-mcps.sh"
        ((WARN++))
    fi

    # Validate JSON
    if command -v python3 &> /dev/null; then
        if python3 -c "import json; json.load(open('$CONFIG_FILE'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Config is valid JSON"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} Config has invalid JSON syntax"
            echo "  Check for trailing commas or syntax errors"
            ((FAIL++))
        fi
    elif command -v jq &> /dev/null; then
        if jq . "$CONFIG_FILE" &>/dev/null; then
            echo -e "${GREEN}✓${NC} Config is valid JSON"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} Config has invalid JSON syntax"
            ((FAIL++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Could not validate JSON (install python3 or jq)"
        ((WARN++))
    fi
else
    echo -e "${RED}✗${NC} Config file not found at $CONFIG_FILE"
    echo "  Run: ./setup/install-mcps.sh"
    ((FAIL++))
fi
echo ""

# ============================================================================
# Check 4: Skills Directory
# ============================================================================

echo -e "${BLUE}Checking skills installation...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SKILLS_DIR="$HOME/.claude/skills"

if [ -d "$SKILLS_DIR" ]; then
    echo -e "${GREEN}✓${NC} Skills directory exists at $SKILLS_DIR"
    ((PASS++))

    # Count SparkGood skills
    SPARKGOOD_SKILLS=(
        "sparkgood-orchestrator"
        "social-impact-research"
        "competitor-analysis"
        "audience-profiling"
        "social-impact-positioning"
        "viability-scoring"
        "revenue-model-design"
        "business-plan-generator"
        "impact-measurement"
        "grant-writing-assistant"
        "social-impact-copywriting"
        "launch-assets"
        "community-outreach"
    )

    INSTALLED=0
    MISSING=()

    for skill in "${SPARKGOOD_SKILLS[@]}"; do
        if [ -f "$SKILLS_DIR/$skill/SKILL.md" ]; then
            ((INSTALLED++))
        else
            MISSING+=("$skill")
        fi
    done

    if [ $INSTALLED -eq ${#SPARKGOOD_SKILLS[@]} ]; then
        echo -e "${GREEN}✓${NC} All 13 SparkGood skills installed"
        ((PASS++))
    elif [ $INSTALLED -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} $INSTALLED of 13 SparkGood skills installed"
        echo "  Missing: ${MISSING[*]}"
        ((WARN++))
    else
        echo -e "${RED}✗${NC} No SparkGood skills found"
        echo "  Run: cp -r skills/* ~/.claude/skills/"
        ((FAIL++))
    fi

    # List installed skills
    if [ $INSTALLED -gt 0 ]; then
        echo ""
        echo "  Installed skills:"
        for skill in "${SPARKGOOD_SKILLS[@]}"; do
            if [ -f "$SKILLS_DIR/$skill/SKILL.md" ]; then
                echo -e "    ${GREEN}✓${NC} $skill"
            fi
        done
    fi
else
    echo -e "${RED}✗${NC} Skills directory not found at $SKILLS_DIR"
    echo "  Run: mkdir -p ~/.claude/skills && cp -r skills/* ~/.claude/skills/"
    ((FAIL++))
fi
echo ""

# ============================================================================
# Check 5: API Keys (Environment Variables)
# ============================================================================

echo -e "${BLUE}Checking environment variables...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: These are set in the config, not environment, but we check both
if [ -n "$PERPLEXITY_API_KEY" ]; then
    echo -e "${GREEN}✓${NC} PERPLEXITY_API_KEY set in environment"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} PERPLEXITY_API_KEY not in environment (may be in config)"
    ((WARN++))
fi

if [ -n "$FIRECRAWL_API_KEY" ]; then
    echo -e "${GREEN}✓${NC} FIRECRAWL_API_KEY set in environment"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} FIRECRAWL_API_KEY not in environment (may be in config)"
    ((WARN++))
fi
echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((PASS + WARN + FAIL))

echo "Results:"
echo -e "  ${GREEN}✓ Passed:${NC}   $PASS"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARN"
echo -e "  ${RED}✗ Failed:${NC}   $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    if [ $WARN -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${NC}                                                                ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC}   ${GREEN}All checks passed!${NC}                                          ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC}                                                                ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC}   Start Claude Code and run:                                   ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC}   ${BLUE}/sparkgood-orchestrator${NC}                                     ${GREEN}║${NC}"
        echo -e "${GREEN}║${NC}                                                                ${GREEN}║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}   ${GREEN}Setup complete with warnings${NC}                                ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}   Some features may be limited. Review warnings above.         ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}   You can still start with:                                    ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}   ${BLUE}/sparkgood-orchestrator${NC}                                     ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}                                                                ${YELLOW}║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    fi
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}                                                                ${RED}║${NC}"
    echo -e "${RED}║${NC}   ${RED}Setup incomplete${NC}                                             ${RED}║${NC}"
    echo -e "${RED}║${NC}                                                                ${RED}║${NC}"
    echo -e "${RED}║${NC}   Please fix the issues above before using SparkGood.         ${RED}║${NC}"
    echo -e "${RED}║${NC}                                                                ${RED}║${NC}"
    echo -e "${RED}║${NC}   Need help? See README.md for troubleshooting.               ${RED}║${NC}"
    echo -e "${RED}║${NC}                                                                ${RED}║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
echo ""
