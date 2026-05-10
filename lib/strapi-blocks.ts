/**
 * Minimal utilities to convert between:
 * - Strapi v5 Blocks format (JSON array)
 * - Quill editor HTML (string)
 *
 * NOTE: This intentionally preserves content (text) first.
 * Formatting support can be expanded later.
 */

type StrapiTextChild = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type StrapiBlock = {
  type: string;
  level?: number;
  children?: Array<StrapiTextChild | any>;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTextFromChildren(children: any): string {
  if (!Array.isArray(children)) return "";
  return children
    .map((c) => {
      if (!c) return "";
      if (typeof c.text === "string") return c.text;
      // Fallback for nested nodes
      if (Array.isArray(c.children)) return getTextFromChildren(c.children);
      return "";
    })
    .join("");
}

/** Convert Strapi blocks (or HTML) into readable plain text (for tables/search/etc). */
export function blocksToPlainText(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    // Already HTML or plain text
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  if (!Array.isArray(value)) return "";

  const blocks = value as StrapiBlock[];
  return blocks
    .map((block) => getTextFromChildren(block.children))
    .join("\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

/** Convert Strapi blocks (array) to a simple HTML string for Quill. */
export function blocksToHtml(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  const blocks = value as StrapiBlock[];

  return blocks
    .map((block) => {
      const text = escapeHtml(getTextFromChildren(block.children));

      switch (block.type) {
        case "heading": {
          const level = Math.min(6, Math.max(1, Number(block.level ?? 2)));
          return `<h${level}>${text}</h${level}>`;
        }
        case "paragraph":
        default:
          return `<p>${text}</p>`;
      }
    })
    .join("");
}

/**
 * Convert Quill HTML to Strapi blocks.
 *
 * We map basic block elements to blocks, but keep it conservative to avoid invalid shapes.
 */
export function htmlToBlocks(html: string): StrapiBlock[] {
  const safeHtml = (html ?? "").trim();
  if (!safeHtml) return [];

  // DOMParser is available in the browser (this file is used by client components)
  const parser = new DOMParser();
  const doc = parser.parseFromString(safeHtml, "text/html");

  const blocks: StrapiBlock[] = [];

  const pushParagraph = (text: string) => {
    const cleaned = (text ?? "").replace(/\s+/g, " ").trim();
    if (!cleaned) return;
    blocks.push({
      type: "paragraph",
      children: [{ type: "text", text: cleaned }],
    });
  };

  const elements = Array.from(doc.body.children);

  if (elements.length === 0) {
    pushParagraph(doc.body.textContent ?? "");
    return blocks;
  }

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();
    const text = el.textContent ?? "";

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1));
      const cleaned = text.replace(/\s+/g, " ").trim();
      if (!cleaned) continue;
      blocks.push({
        type: "heading",
        level,
        children: [{ type: "text", text: cleaned }],
      });
      continue;
    }

    if (tag === "p" || tag === "div") {
      pushParagraph(text);
      continue;
    }

    // Fallback: treat any other top-level element as a paragraph
    pushParagraph(text);
  }

  return blocks;
}
