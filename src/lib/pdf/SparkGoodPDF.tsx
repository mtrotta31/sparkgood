// SparkGood PDF Document
// Generates a branded PDF with all deep dive sections

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type {
  Idea,
  UserProfile,
  ViabilityReport,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
} from "@/types";

// Register fonts (using system fonts for compatibility)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

// SparkGood brand colors
const colors = {
  spark: "#F59E0B", // Amber accent
  sparkLight: "#FEF3C7",
  charcoal: "#1C1412",
  charcoalLight: "#2D2420",
  warmWhite: "#FAF9F7",
  warmWhiteMuted: "#A8A29E",
  green: "#22C55E",
  yellow: "#EAB308",
  red: "#EF4444",
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.charcoal,
    backgroundColor: "#FFFFFF",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `2px solid ${colors.spark}`,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.spark,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.charcoal,
  },
  date: {
    fontSize: 9,
    color: colors.warmWhiteMuted,
  },
  // Title section
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.charcoal,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 12,
    color: colors.warmWhiteMuted,
    marginBottom: 12,
  },
  ideaDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.charcoal,
    marginBottom: 8,
  },
  // Section headers
  sectionHeader: {
    backgroundColor: colors.spark,
    padding: 12,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Subsections
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.charcoal,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: `1px solid ${colors.sparkLight}`,
  },
  // Content
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.charcoal,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 12,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    color: colors.spark,
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.charcoal,
  },
  // Score badge
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.warmWhiteMuted,
  },
  verdict: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
  },
  // Table-like structures
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${colors.sparkLight}`,
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellHeader: {
    fontWeight: "bold",
    color: colors.charcoal,
  },
  // Competitor card
  competitorCard: {
    backgroundColor: colors.sparkLight,
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
    borderLeft: `3px solid ${colors.spark}`,
  },
  competitorName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.charcoal,
    marginBottom: 4,
  },
  competitorUrl: {
    fontSize: 8,
    color: colors.spark,
    marginBottom: 4,
  },
  // Phase card
  phaseCard: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  phaseName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.charcoal,
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 9,
    color: colors.warmWhiteMuted,
    marginBottom: 8,
  },
  // Social post
  socialCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    borderLeft: `3px solid ${colors.spark}`,
  },
  socialPlatform: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.spark,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  socialContent: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.charcoal,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTop: `1px solid ${colors.sparkLight}`,
  },
  footerText: {
    fontSize: 8,
    color: colors.warmWhiteMuted,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.warmWhiteMuted,
  },
});

// Helper function to get verdict color
function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "go":
      return colors.green;
    case "refine":
      return colors.yellow;
    case "pivot":
      return colors.red;
    default:
      return colors.warmWhiteMuted;
  }
}

// Helper function to get verdict text
function getVerdictText(verdict: string): string {
  switch (verdict) {
    case "go":
      return "GO";
    case "refine":
      return "REFINE";
    case "pivot":
      return "PIVOT";
    default:
      return verdict.toUpperCase();
  }
}

// Props for PDF document
interface SparkGoodPDFProps {
  idea: Idea;
  profile: UserProfile;
  viability: ViabilityReport | null;
  plan: BusinessPlan | null;
  marketing: MarketingAssets | null;
  roadmap: ActionRoadmap | null;
}

// Main PDF Document Component
export function SparkGoodPDF({
  idea,
  profile,
  viability,
  plan,
  marketing,
  roadmap,
}: SparkGoodPDFProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine commitment level label
  const commitmentLabel =
    profile.commitment === "weekend"
      ? "Weekend Project"
      : profile.commitment === "steady"
      ? "Steady Builder"
      : "Full Venture";

  return (
    <Document>
      {/* Cover / Overview Page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Text style={{ color: "#FFF", fontSize: 12 }}>✦</Text>
            </View>
            <Text style={styles.logoText}>SparkGood</Text>
          </View>
          <Text style={styles.date}>Generated {generatedDate}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{idea.name}</Text>
          <Text style={styles.tagline}>{idea.tagline}</Text>
          <Text style={styles.ideaDescription}>
            <Text style={{ fontWeight: "bold" }}>Problem: </Text>
            {idea.problem}
          </Text>
          <Text style={styles.ideaDescription}>
            <Text style={{ fontWeight: "bold" }}>Audience: </Text>
            {idea.audience}
          </Text>
          <Text style={styles.ideaDescription}>
            <Text style={{ fontWeight: "bold" }}>Impact: </Text>
            {idea.impact}
          </Text>
          <Text style={[styles.ideaDescription, { marginTop: 8 }]}>
            <Text style={{ fontWeight: "bold" }}>Plan Type: </Text>
            {commitmentLabel}
          </Text>
        </View>

        {/* Viability Section */}
        {viability && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>1. Viability Analysis</Text>
            </View>

            {/* Score */}
            <View style={styles.scoreBadge}>
              <Text
                style={[
                  styles.scoreNumber,
                  { color: getVerdictColor(viability.verdict) },
                ]}
              >
                {viability.viabilityScore.toFixed(1)}
              </Text>
              <View>
                <Text style={styles.scoreLabel}>Viability Score</Text>
                <View
                  style={[
                    styles.verdict,
                    { backgroundColor: getVerdictColor(viability.verdict) },
                  ]}
                >
                  <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 9 }}>
                    {getVerdictText(viability.verdict)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recommendation */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Recommendation</Text>
              <Text style={styles.paragraph}>{viability.recommendation}</Text>
            </View>

            {/* Market Size */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Market Opportunity</Text>
              <Text style={styles.paragraph}>{viability.marketSize}</Text>
            </View>

            {/* Demand */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Demand Analysis</Text>
              <Text style={styles.paragraph}>{viability.demandAnalysis}</Text>
            </View>

            {/* Strengths */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Strengths</Text>
              <View style={styles.bulletList}>
                {viability.strengths.map((strength, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{strength}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Risks */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Risks to Watch</Text>
              <View style={styles.bulletList}>
                {viability.risks.map((risk, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{risk}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Competitors (if any) */}
            {viability.competitors && viability.competitors.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Competitive Landscape</Text>
                {viability.competitors.slice(0, 3).map((comp, i) => (
                  <View key={i} style={styles.competitorCard}>
                    <Text style={styles.competitorName}>{comp.name}</Text>
                    {comp.url && (
                      <Link src={comp.url} style={styles.competitorUrl}>
                        {comp.url}
                      </Link>
                    )}
                    <Text style={styles.paragraph}>{comp.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            SparkGood | sparkgood.io | Spark something good.
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Business Plan Page */}
      {plan && (
        <Page size="A4" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Your Game Plan</Text>
          </View>

          {/* Executive Summary */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Executive Summary</Text>
            <Text style={styles.paragraph}>{plan.executiveSummary}</Text>
          </View>

          {/* Mission */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Mission</Text>
            <Text style={[styles.paragraph, { fontStyle: "italic" }]}>
              {plan.missionStatement}
            </Text>
          </View>

          {/* Impact Thesis */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Impact Thesis</Text>
            <Text style={styles.paragraph}>{plan.impactThesis}</Text>
          </View>

          {/* Revenue Streams or Volunteer Plan */}
          {plan.revenueStreams && plan.revenueStreams.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Revenue Streams</Text>
              {plan.revenueStreams.map((stream, i) => (
                <View key={i} style={styles.competitorCard}>
                  <Text style={styles.competitorName}>{stream.name}</Text>
                  <Text style={styles.paragraph}>{stream.description}</Text>
                  <Text style={[styles.paragraph, { color: colors.spark }]}>
                    Est. Revenue: {stream.estimatedRevenue} | Timeline:{" "}
                    {stream.timeline}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {plan.volunteerPlan && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Volunteer Plan</Text>
              <Text style={[styles.paragraph, { fontWeight: "bold" }]}>
                Roles Needed:
              </Text>
              <View style={styles.bulletList}>
                {plan.volunteerPlan.rolesNeeded.map((role, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{role}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.paragraph, { fontWeight: "bold", marginTop: 8 }]}>
                Recruitment:
              </Text>
              <Text style={styles.paragraph}>
                {plan.volunteerPlan.recruitmentStrategy}
              </Text>
            </View>
          )}

          {/* Budget */}
          {plan.budgetPlan && plan.budgetPlan.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Budget</Text>
              {plan.budgetPlan.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {item.category}
                  </Text>
                  <Text style={styles.tableCell}>${item.amount}</Text>
                  <Text style={styles.tableCell}>{item.priority}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Operations */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Operations</Text>
            <Text style={styles.paragraph}>{plan.operations}</Text>
          </View>

          {/* Impact Measurement */}
          {plan.impactMeasurement && plan.impactMeasurement.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Impact Measurement</Text>
              {plan.impactMeasurement.map((metric, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableCellHeader]}>
                    {metric.metric}
                  </Text>
                  <Text style={styles.tableCell}>Target: {metric.target}</Text>
                  <Text style={styles.tableCell}>{metric.frequency}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              SparkGood | sparkgood.io | Spark something good.
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}

      {/* Marketing Page */}
      {marketing && (
        <Page size="A4" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. Spread the Word</Text>
          </View>

          {/* Elevator Pitch */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Elevator Pitch</Text>
            <View style={[styles.competitorCard, { borderLeftColor: colors.spark }]}>
              <Text style={[styles.paragraph, { fontStyle: "italic" }]}>
                &quot;{marketing.elevatorPitch}&quot;
              </Text>
            </View>
          </View>

          {/* Tagline & Headline */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Tagline</Text>
            <Text style={[styles.paragraph, { fontSize: 14, fontWeight: "bold", color: colors.spark }]}>
              {marketing.tagline}
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Landing Page</Text>
            <Text style={[styles.paragraph, { fontSize: 12, fontWeight: "bold" }]}>
              {marketing.landingPageHeadline}
            </Text>
            <Text style={styles.paragraph}>{marketing.landingPageSubheadline}</Text>
          </View>

          {/* Social Posts */}
          {marketing.socialPosts && marketing.socialPosts.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Social Posts</Text>
              {marketing.socialPosts.map((post, i) => (
                <View key={i} style={styles.socialCard}>
                  <Text style={styles.socialPlatform}>{post.platform}</Text>
                  <Text style={styles.socialContent}>{post.content}</Text>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <Text style={[styles.socialContent, { color: colors.spark, marginTop: 4 }]}>
                      {post.hashtags.map((h) => `#${h}`).join(" ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Email Template */}
          {marketing.emailTemplate && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Email Template</Text>
              <View style={styles.socialCard}>
                <Text style={[styles.socialPlatform, { color: colors.charcoal }]}>
                  Subject: {marketing.emailTemplate.subject}
                </Text>
                <Text style={styles.socialContent}>
                  {marketing.emailTemplate.body}
                </Text>
              </View>
            </View>
          )}

          {/* CTA */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Primary Call to Action</Text>
            <View
              style={[
                styles.competitorCard,
                { backgroundColor: colors.spark, borderLeftColor: colors.spark },
              ]}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
                {marketing.primaryCTA}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              SparkGood | sparkgood.io | Spark something good.
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}

      {/* Roadmap Page */}
      {roadmap && (
        <Page size="A4" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. Start Here - Your Roadmap</Text>
          </View>

          {/* Quick Wins */}
          {roadmap.quickWins && roadmap.quickWins.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Quick Wins (Do This Week)</Text>
              {roadmap.quickWins.map((win, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{win.task}</Text>
                  <Text style={styles.tableCell}>{win.timeframe}</Text>
                  <Text style={[styles.tableCell, { color: win.cost === "free" ? colors.green : colors.charcoal }]}>
                    {win.cost}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Phases */}
          {roadmap.phases && roadmap.phases.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Phased Plan</Text>
              {roadmap.phases.map((phase, i) => (
                <View key={i} style={styles.phaseCard}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <Text style={styles.phaseDuration}>{phase.duration}</Text>
                  <View style={styles.bulletList}>
                    {phase.tasks.map((task, j) => (
                      <View key={j} style={styles.bulletItem}>
                        <Text style={styles.bullet}>
                          {task.priority === "critical" ? "★" : "•"}
                        </Text>
                        <Text style={styles.bulletText}>
                          {task.task}
                          {task.cost !== "free" && (
                            <Text style={{ color: colors.warmWhiteMuted }}>
                              {" "}
                              ({task.cost})
                            </Text>
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Skip List */}
          {roadmap.skipList && roadmap.skipList.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>What NOT to Do Yet</Text>
              <View style={styles.bulletList}>
                {roadmap.skipList.map((item, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={[styles.bullet, { color: colors.red }]}>✗</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Final encouragement */}
          <View
            style={[
              styles.subsection,
              {
                marginTop: 20,
                padding: 16,
                backgroundColor: colors.sparkLight,
                borderRadius: 8,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: colors.charcoal,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Ready to start?
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.charcoal,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              The best time to start was yesterday. The second best time is now.
              Pick one quick win and do it today. Spark something good.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              SparkGood | sparkgood.io | Spark something good.
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}
    </Document>
  );
}

export default SparkGoodPDF;
