// HTML Sanitization Utility
// Uses DOMPurify to prevent XSS attacks from AI-generated content

import DOMPurify from "isomorphic-dompurify";

// Safe configuration for AI-generated HTML content
// Allows common formatting while blocking scripts, event handlers, etc.
const SAFE_HTML_CONFIG = {
  // Allowed tags for formatting and layout
  ALLOWED_TAGS: [
    // Text formatting
    "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "strike",
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Lists
    "ul", "ol", "li",
    // Links and images
    "a", "img",
    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    // Code
    "code", "pre",
    // Semantic
    "blockquote", "cite", "q",
    "section", "article", "header", "footer", "nav", "main", "aside",
    // Forms (display only, no inputs that could be abused)
    "label",
  ],
  // Allowed attributes (safe subset)
  ALLOWED_ATTR: [
    // Common
    "class", "id", "style",
    // Links
    "href", "target", "rel",
    // Images
    "src", "alt", "width", "height",
    // Tables
    "colspan", "rowspan",
    // Accessibility
    "role", "aria-label", "aria-describedby", "aria-hidden",
  ],
  // Force safe link behavior
  ADD_ATTR: ["target", "rel"],
  // Prevent data: and javascript: URLs
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  // Return as string, not TrustedHTML
  RETURN_TRUSTED_TYPE: false,
};

// Stricter config for markdown-converted content (AI advisor, checklist guides)
const MARKDOWN_HTML_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "span",
    "strong", "b", "em", "i",
    "ul", "ol", "li",
    "a", "code", "pre",
  ],
  ALLOWED_ATTR: [
    "class", "href", "target", "rel",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize HTML content from AI/Claude responses
 * Use this for full HTML pages like landing pages
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, SAFE_HTML_CONFIG) as string;
}

/**
 * Sanitize markdown-converted HTML (stricter)
 * Use this for AI advisor messages, checklist guides, etc.
 */
export function sanitizeMarkdownHTML(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, MARKDOWN_HTML_CONFIG) as string;
}

/**
 * Sanitize plain text (strips ALL HTML)
 * Use when you want to ensure no HTML renders at all
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as string;
}
