import sanitizeHtml from "sanitize-html";

/**
 * Permissive sanitization for Launch Kit landing pages.
 * Allows most HTML tags and styling attributes but strips
 * event handlers and javascript: URLs to prevent XSS.
 */
export function sanitizeLandingPageHTML(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      // Document structure
      "html", "head", "body", "meta", "title",
      // Layout/semantic
      "section", "header", "footer", "nav", "main", "article", "aside",
      "div", "span", "p",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Links and media
      "a", "img", "video", "source", "iframe", "figure", "figcaption",
      // Lists
      "ul", "ol", "li",
      // Tables
      "table", "tr", "td", "th", "thead", "tbody", "tfoot",
      // Forms
      "form", "input", "button", "textarea", "label", "select", "option",
      // Text formatting
      "br", "hr", "strong", "em", "b", "i", "u", "blockquote", "pre", "code",
      // Style tags (for inline CSS and Google Fonts)
      "style", "link",
    ],
    allowedAttributes: {
      "*": [
        "style", "class", "id",
        "src", "href", "alt", "title",
        "target", "rel",
        "width", "height",
        "name", "content", "type",
        "placeholder", "value",
        "action", "method",
      ],
      link: ["href", "rel", "type"],
      meta: ["name", "content", "charset"],
    },
    // Strip all on* event handler attributes (onclick, onerror, onload, etc.)
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    // This prevents javascript: URLs
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
      img: ["http", "https", "data"],
      iframe: ["http", "https"],
    },
    // Disallow script tags entirely (they're not in allowedTags)
    // Also filter out event handler attributes
    transformTags: {
      "*": (tagName, attribs) => {
        // Remove any on* event handler attributes
        const cleanAttribs: Record<string, string> = {};
        for (const [key, value] of Object.entries(attribs)) {
          if (!key.toLowerCase().startsWith("on")) {
            cleanAttribs[key] = value;
          }
        }
        return {
          tagName,
          attribs: cleanAttribs,
        };
      },
    },
  });
}

/**
 * Stricter sanitization for AI Advisor messages and checklist guides.
 * Only allows basic text formatting tags.
 */
export function sanitizeContentHTML(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br",
      "strong", "em", "b", "i", "u",
      "ul", "ol", "li",
      "a",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "pre", "code",
      "hr",
      "span", "div",
      "table", "tr", "td", "th",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
    },
    // Strip all on* event handler attributes
    transformTags: {
      "*": (tagName, attribs) => {
        const cleanAttribs: Record<string, string> = {};
        for (const [key, value] of Object.entries(attribs)) {
          if (!key.toLowerCase().startsWith("on")) {
            cleanAttribs[key] = value;
          }
        }
        return {
          tagName,
          attribs: cleanAttribs,
        };
      },
    },
  });
}
