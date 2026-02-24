// Business One-Pager PDF Generator for Launch Kit V2
// Uses @react-pdf/renderer to create a single-page professional PDF

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DeepDiveData, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview, formatCurrency } from "./types";

// Helper to convert hex to RGB for PDF
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? hex.replace("#", "") : "1E293B";
}

export async function generateOnePager(data: DeepDiveData): Promise<Buffer> {
  const overview = extractBusinessOverview(data);
  const colors = getCategoryColors(overview.category);
  const { foundation, financial, growth } = data;

  // Create styles with category colors
  const styles = createStyles(colors);

  // Extract data for the one-pager
  const viabilityScore = foundation?.marketViability?.overallScore || 0;
  const marketSize = foundation?.marketViability?.marketResearch?.tam || "N/A";
  const growthRate = foundation?.marketViability?.marketResearch?.growthRate || "N/A";

  // Calculate totals from financial data
  const startupCost = financial?.startupCostsSummary?.reduce((sum, item) => {
    const cost = parseFloat(String(item.cost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0) || 0;

  const monthlyRevenue = financial?.revenueProjections?.moderate?.monthlyRevenue || 0;
  const breakEvenMonth = financial?.revenueProjections?.moderate?.breakEvenMonth || "N/A";

  // Get pricing tiers
  const pricingStrategy = financial?.pricingStrategy;

  // Get benefits/services
  const benefits = growth?.landingPageCopy?.benefits?.slice(0, 4) || [];

  // Create the PDF document
  const doc = (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{overview.name}</Text>
            <Text style={styles.tagline}>{overview.tagline}</Text>
          </View>
          <View style={styles.headerRight}>
            {overview.city && overview.state && (
              <Text style={styles.location}>
                {overview.city}, {overview.state}
              </Text>
            )}
            <Text style={styles.category}>
              {formatCategory(overview.category)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Main content area - two columns */}
        <View style={styles.mainContent}>
          {/* Left Column (60%) */}
          <View style={styles.leftColumn}>
            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>
                {truncate(overview.description || overview.tagline, 200)}
              </Text>
            </View>

            {/* The Problem We Solve */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Problem We Solve</Text>
              <Text style={styles.sectionText}>
                {truncate(overview.problem, 180)}
              </Text>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <Text style={styles.sectionText}>
                {truncate(overview.howItWorks || data.idea.mechanism || data.idea.revenueModel || "", 180)}
              </Text>
            </View>

            {/* What Makes Us Different */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What Makes Us Different</Text>
              {overview.differentiation ? (
                <Text style={styles.sectionText}>
                  {truncate(overview.differentiation, 150)}
                </Text>
              ) : (
                <View style={styles.bulletList}>
                  {benefits.slice(0, 3).map((benefit, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{benefit.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Right Column (40%) */}
          <View style={styles.rightColumn}>
            {/* Market Opportunity Box */}
            <View style={styles.infoBox}>
              <Text style={styles.boxTitle}>Market Opportunity</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Viability Score</Text>
                <Text style={styles.statValue}>{viabilityScore}/100</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Market Size (TAM)</Text>
                <Text style={styles.statValue}>{marketSize}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Growth Rate</Text>
                <Text style={styles.statValue}>{growthRate}</Text>
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
                <Text style={styles.statValue}>{breakEvenMonth}</Text>
              </View>
            </View>

            {/* Pricing Box */}
            {pricingStrategy && (
              <View style={styles.infoBox}>
                <Text style={styles.boxTitle}>Pricing</Text>
                <Text style={styles.pricingMain}>{pricingStrategy.recommendedPrice}</Text>
                <Text style={styles.pricingNote}>
                  {truncate(pricingStrategy.reasoning, 80)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Section - Services/Offerings */}
        <View style={styles.bottomSection}>
          <View style={styles.servicesRow}>
            {benefits.slice(0, 4).map((benefit, i) => (
              <View key={i} style={styles.serviceItem}>
                <Text style={styles.serviceTitle}>{benefit.title}</Text>
              </View>
            ))}
          </View>
        </View>

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

// Helper to format category for display
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
    other: "Business",
  };
  return labels[category] || "Business";
}

// Helper to truncate text
function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
