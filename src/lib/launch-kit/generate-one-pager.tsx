// Business One-Pager PDF Generator for Launch Kit V2
// Uses @react-pdf/renderer to create a single-page professional PDF

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DeepDiveData, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview, formatCurrency, parseCurrency } from "./types";

// Helper to convert hex to RGB for PDF
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? hex.replace("#", "") : "1E293B";
}

export async function generateOnePager(data: DeepDiveData): Promise<Buffer> {
  // Debug: Log financial data received
  console.log("[One-Pager] Financial data:", {
    hasFinancial: !!data.financial,
    startupCostsSummaryLength: data.financial?.startupCostsSummary?.length,
    firstStartupItem: data.financial?.startupCostsSummary?.[0],
    hasRevenueProjections: !!data.financial?.revenueProjections,
    moderateRevenue: data.financial?.revenueProjections?.moderate,
  });

  const overview = extractBusinessOverview(data);
  const colors = getCategoryColors(overview.category);
  const { foundation, financial, growth } = data;

  // Create styles with category colors
  const styles = createStyles(colors);

  // Extract data for the one-pager
  const viabilityScore = foundation?.marketViability?.overallScore || 0;
  const marketSize = foundation?.marketViability?.marketResearch?.tam || "N/A";
  const growthRate = foundation?.marketViability?.marketResearch?.growthRate || "N/A";

  // Calculate totals from financial data using parseCurrency for string values
  const startupCost = financial?.startupCostsSummary?.reduce((sum, item) => {
    return sum + parseCurrency(item.cost);
  }, 0) || 0;

  const monthlyRevenue = parseCurrency(financial?.revenueProjections?.moderate?.monthlyRevenue);
  const breakEvenMonth = financial?.revenueProjections?.moderate?.breakEvenMonth || "N/A";

  // Get pricing tiers
  const pricingStrategy = financial?.pricingStrategy;

  // Get benefits/services
  const benefits = growth?.landingPageCopy?.benefits?.slice(0, 4) || [];

  // Check if description is different from problem (avoid duplicate content)
  const hasUniqueDescription = overview.description &&
    overview.description !== overview.problem &&
    overview.description !== overview.tagline;

  // Get category label (empty string for "other" to avoid showing "BUSINESS")
  const categoryLabel = formatCategory(overview.category);

  // Create the PDF document
  const doc = (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{overview.name || "Business"}</Text>
            <Text style={styles.tagline}>{overview.tagline || " "}</Text>
          </View>
          <View style={styles.headerRight}>
            {overview.city && overview.state ? (
              <Text style={styles.location}>
                {overview.city}, {overview.state}
              </Text>
            ) : null}
            {categoryLabel ? (
              <Text style={styles.category}>{categoryLabel}</Text>
            ) : null}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Main content area - two columns */}
        <View style={styles.mainContent}>
          {/* Left Column (60%) */}
          <View style={styles.leftColumn}>
            {/* About - only show if we have unique description content */}
            {hasUniqueDescription ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.sectionText}>
                  {truncate(overview.description, 200)}
                </Text>
              </View>
            ) : null}

            {/* The Problem We Solve */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Problem We Solve</Text>
              <Text style={styles.sectionText}>
                {truncate(overview.problem || "Addressing unmet customer needs.", 220)}
              </Text>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <Text style={styles.sectionText}>
                {truncate(overview.howItWorks || data.idea.mechanism || data.idea.revenueModel || "Contact us to learn more.", 200)}
              </Text>
            </View>

            {/* What Makes Us Different */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What Makes Us Different</Text>
              {overview.differentiation ? (
                <Text style={styles.sectionText}>
                  {truncate(overview.differentiation, 180)}
                </Text>
              ) : benefits.length > 0 ? (
                <View style={styles.bulletList}>
                  {benefits.slice(0, 3).map((benefit, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{benefit.title || "Quality service"}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionText}>Local expertise and personalized service.</Text>
              )}
            </View>
          </View>

          {/* Right Column (40%) */}
          <View style={styles.rightColumn}>
            {/* Viability Score - Prominent callout */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>VIABILITY SCORE</Text>
              <Text style={styles.scoreValue}>{viabilityScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>

            {/* Market Opportunity Box */}
            <View style={styles.infoBox}>
              <Text style={styles.boxTitle}>Market Opportunity</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Market Size (TAM)</Text>
                <Text style={styles.statValue}>{marketSize || "N/A"}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Growth Rate</Text>
                <Text style={styles.statValue}>{growthRate || "N/A"}</Text>
              </View>
            </View>

            {/* Financial Snapshot Box */}
            <View style={styles.infoBox}>
              <Text style={styles.boxTitle}>Financial Snapshot</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Startup Cost</Text>
                <Text style={styles.statValue}>{formatCurrency(startupCost)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
                <Text style={styles.statValue}>{formatCurrency(monthlyRevenue)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Break-Even</Text>
                <Text style={styles.statValue}>{breakEvenMonth || "N/A"}</Text>
              </View>
            </View>

            {/* Pricing Box */}
            {pricingStrategy && pricingStrategy.recommendedPrice ? (
              <View style={styles.infoBox}>
                <Text style={styles.boxTitle}>Pricing</Text>
                <Text style={styles.pricingMain}>{pricingStrategy.recommendedPrice}</Text>
                {pricingStrategy.reasoning ? (
                  <Text style={styles.pricingNote}>
                    {truncate(pricingStrategy.reasoning, 80)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom Section - Services/Offerings */}
        {benefits.length > 0 ? (
          <View style={styles.bottomSection}>
            <View style={styles.servicesRow}>
              {benefits.slice(0, 4).map((benefit, i) => (
                <View key={i} style={styles.serviceItem}>
                  <Text style={styles.serviceTitle}>{benefit.title || " "}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              {overview.city && overview.state
                ? `${overview.city}, ${overview.state}`
                : "Contact us for more information"}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.watermark}>Built with SparkLocal.co</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}

// Create styles with category-specific colors
function createStyles(colors: CategoryColors) {
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);

  return StyleSheet.create({
    page: {
      padding: 36,
      fontFamily: "Helvetica",
      fontSize: 9,
      color: "#1E293B",
      backgroundColor: "#FFFFFF",
    },
    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      alignItems: "flex-end",
    },
    businessName: {
      fontSize: 22,
      fontWeight: "bold",
      color: `#${primary}`,
      marginBottom: 4,
    },
    tagline: {
      fontSize: 11,
      color: "#64748B",
      fontStyle: "italic",
    },
    location: {
      fontSize: 9,
      color: "#1E293B",
      marginBottom: 2,
    },
    category: {
      fontSize: 8,
      color: `#${primary}`,
      textTransform: "uppercase",
    },
    // Divider
    divider: {
      height: 2,
      backgroundColor: `#${primary}`,
      marginBottom: 16,
    },
    // Main content
    mainContent: {
      flexDirection: "row",
      flex: 1,
    },
    leftColumn: {
      width: "58%",
      paddingRight: 16,
    },
    rightColumn: {
      width: "42%",
      paddingLeft: 8,
    },
    // Sections
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: `#${primary}`,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    sectionText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: "#374151",
    },
    // Bullet list
    bulletList: {
      marginTop: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bullet: {
      width: 10,
      color: `#${primary}`,
      fontWeight: "bold",
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      color: "#374151",
    },
    // Prominent viability score box
    scoreBox: {
      backgroundColor: `#${primary}`,
      padding: 12,
      marginBottom: 10,
      borderRadius: 6,
      alignItems: "center",
    },
    scoreLabel: {
      fontSize: 8,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 4,
      letterSpacing: 1,
    },
    scoreValue: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    scoreMax: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
    },
    // Info boxes
    infoBox: {
      backgroundColor: `#${accent}`,
      padding: 10,
      marginBottom: 10,
      borderRadius: 4,
      borderLeft: `3px solid #${primary}`,
    },
    boxTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: `#${primary}`,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 8,
      color: "#64748B",
    },
    statValue: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#1E293B",
    },
    pricingMain: {
      fontSize: 14,
      fontWeight: "bold",
      color: `#${primary}`,
      marginBottom: 4,
    },
    pricingNote: {
      fontSize: 8,
      color: "#64748B",
      lineHeight: 1.4,
    },
    // Bottom section
    bottomSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: "1px solid #E5E7EB",
    },
    servicesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    serviceItem: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 8,
    },
    serviceTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#1E293B",
      textAlign: "center",
    },
    // Footer
    footer: {
      position: "absolute",
      bottom: 24,
      left: 36,
      right: 36,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
      borderTop: "1px solid #E5E7EB",
    },
    footerLeft: {
      flex: 1,
    },
    footerRight: {
      alignItems: "flex-end",
    },
    footerText: {
      fontSize: 8,
      color: "#64748B",
    },
    watermark: {
      fontSize: 7,
      color: "#9CA3AF",
    },
  });
}

// Helper to format category for display (returns empty string for "other" to avoid generic "BUSINESS" label)
function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    food_beverage: "Food & Beverage",
    health_wellness: "Health & Wellness",
    education: "Education & Coaching",
    technology: "Technology",
    ecommerce: "E-Commerce & Retail",
    professional_services: "Professional Services",
    creative_arts: "Creative & Arts",
    real_estate: "Real Estate & Property",
    social_enterprise: "Social Enterprise",
    other: "", // Empty for "other" to avoid showing generic "BUSINESS"
  };
  return labels[category] || "";
}

// Helper to truncate text
function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
