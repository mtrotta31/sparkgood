// API route for PDF export
// Generates a branded PDF with all deep dive sections

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SparkGoodPDF } from "@/lib/pdf/SparkGoodPDF";
import type {
  Idea,
  UserProfile,
  ViabilityReport,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
} from "@/types";

interface ExportPDFRequest {
  idea: Idea;
  profile: UserProfile;
  viability: ViabilityReport | null;
  plan: BusinessPlan | null;
  marketing: MarketingAssets | null;
  roadmap: ActionRoadmap | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, profile, viability, plan, marketing, roadmap } =
      body as ExportPDFRequest;

    // Validate required fields
    if (!idea || !profile) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: idea or profile" },
        { status: 400 }
      );
    }

    // Check that we have at least some content to export
    if (!viability && !plan && !marketing && !roadmap) {
      return NextResponse.json(
        { success: false, error: "No content to export. Generate at least one section first." },
        { status: 400 }
      );
    }

    console.log(`Generating PDF for: ${idea.name}`);

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      SparkGoodPDF({
        idea,
        profile,
        viability,
        plan,
        marketing,
        roadmap,
      })
    );

    // Create filename from idea name
    const safeName = idea.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
    const filename = `sparkgood-${safeName}-${Date.now()}.pdf`;

    console.log(`PDF generated successfully: ${filename} (${pdfBuffer.length} bytes)`);

    // Convert Buffer to Uint8Array for Response API compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as download
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}
