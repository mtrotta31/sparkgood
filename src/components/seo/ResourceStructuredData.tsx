// Schema.org Structured Data for Resource Listings
// Provides JSON-LD markup for rich search results

import { type ResourceCategory, type ResourceListing } from "@/types/resources";

interface ResourceStructuredDataProps {
  listing: ResourceListing;
}

export default function ResourceStructuredData({ listing }: ResourceStructuredDataProps) {
  const structuredData = generateStructuredData(listing);

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

function generateStructuredData(listing: ResourceListing): Record<string, unknown> | null {
  const baseData = {
    "@context": "https://schema.org",
    name: listing.name,
    description: listing.description || listing.short_description,
    url: listing.website || `https://sparkgood.io/resources/listing/${listing.slug}`,
  };

  // Add address if available
  const addressData = listing.address || (listing.city && listing.state)
    ? {
        address: {
          "@type": "PostalAddress",
          ...(listing.address && { streetAddress: listing.address }),
          ...(listing.city && { addressLocality: listing.city }),
          ...(listing.state && { addressRegion: listing.state }),
          ...(listing.zip && { postalCode: listing.zip }),
          addressCountry: listing.country || "US",
        },
      }
    : {};

  // Add contact info if available
  const contactData: Record<string, unknown> = {};
  if (listing.phone) {
    contactData.telephone = listing.phone;
  }
  if (listing.email) {
    contactData.email = listing.email;
  }

  // Add logo/image if available
  const imageData = listing.logo_url
    ? {
        image: listing.logo_url,
        logo: {
          "@type": "ImageObject",
          url: listing.logo_url,
        },
      }
    : {};

  // Generate schema based on category
  switch (listing.category as ResourceCategory) {
    case "grant":
      return generateGrantSchema(listing, baseData);

    case "coworking":
    case "event_space":
      return {
        "@type": "LocalBusiness",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
        priceRange: getPriceRange(listing),
        ...(listing.latitude && listing.longitude && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }),
        // Coworking-specific
        ...(listing.category === "coworking" && {
          "@type": "LocalBusiness",
          additionalType: "https://schema.org/CoworkingSpace",
        }),
      };

    case "accelerator":
    case "incubator":
      return {
        "@type": "Organization",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
        // Add funding info if available
        ...getFundingInfo(listing),
      };

    case "sba":
      return {
        "@type": "GovernmentOrganization",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
        parentOrganization: {
          "@type": "GovernmentOrganization",
          name: "U.S. Small Business Administration",
          url: "https://www.sba.gov",
        },
      };

    case "mentorship":
    case "pitch_competition":
      return {
        "@type": "Organization",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
      };

    case "legal":
    case "accounting":
    case "marketing":
      return {
        "@type": "ProfessionalService",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
        priceRange: "$$",
      };

    case "investor":
      return {
        "@type": "Organization",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
        additionalType: "https://schema.org/InvestmentFund",
      };

    default:
      return {
        "@type": "Organization",
        "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
        ...baseData,
        ...addressData,
        ...contactData,
        ...imageData,
      };
  }
}

// Generate MonetaryGrant schema for grants
function generateGrantSchema(
  listing: ResourceListing,
  baseData: Record<string, unknown>
): Record<string, unknown> {
  const details = listing.details as {
    amount_min?: number;
    amount_max?: number;
    deadline?: string;
    eligibility?: string;
    grant_type?: string;
  };

  return {
    "@type": "MonetaryGrant",
    "@id": `https://sparkgood.io/resources/listing/${listing.slug}`,
    ...baseData,
    // Funder information
    funder: {
      "@type": listing.details && (listing.details as { grant_type?: string }).grant_type === "federal"
        ? "GovernmentOrganization"
        : "Organization",
      name: listing.name,
      ...(listing.website && { url: listing.website }),
    },
    // Amount
    ...(details.amount_max && {
      amount: {
        "@type": "MonetaryAmount",
        currency: "USD",
        maxValue: details.amount_max,
        ...(details.amount_min && { minValue: details.amount_min }),
      },
    }),
    // Eligibility
    ...(details.eligibility && {
      eligibilityCriteria: details.eligibility,
    }),
    // Geographic area
    ...(listing.is_nationwide
      ? {
          areaServed: {
            "@type": "Country",
            name: "United States",
          },
        }
      : listing.state && {
          areaServed: {
            "@type": "State",
            name: listing.state,
          },
        }),
  };
}

// Get price range for coworking spaces
function getPriceRange(listing: ResourceListing): string {
  const details = listing.details as {
    price_monthly_min?: number;
    price_monthly_max?: number;
  };

  if (!details.price_monthly_min && !details.price_monthly_max) {
    return "$$";
  }

  const maxPrice = details.price_monthly_max || details.price_monthly_min || 0;

  if (maxPrice < 200) return "$";
  if (maxPrice < 500) return "$$";
  if (maxPrice < 1000) return "$$$";
  return "$$$$";
}

// Get funding information for accelerators
function getFundingInfo(listing: ResourceListing): Record<string, unknown> {
  const details = listing.details as {
    funding_provided?: number;
    equity_taken?: number;
  };

  if (!details.funding_provided) return {};

  return {
    funding: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: details.funding_provided,
    },
  };
}
