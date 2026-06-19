import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItTaskLists from "markdown-it-task-lists";
import { full as markdownItEmoji } from "markdown-it-emoji";
import hljs from "highlight.js";
import { exists } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";

// CSS is imported as raw strings and injected into the iframe <style> tags
import previewCssRaw from "@/assets/styles/preview.css?raw";
import hljsLightCssRaw from "highlight.js/styles/github.css?raw";
import hljsDarkCssRaw from "highlight.js/styles/github-dark.css?raw";

export interface RenderOptions {
  basePath?: string;
  theme?: "light" | "dark";
}

export interface RenderResult {
  html: string;
  brokenImages: string[];
}

export class MarkdownRenderingService {
  private readonly md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: false, // Non-negotiable: prevents XSS via raw HTML passthrough
      linkify: true,
      typographer: true,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
        }
        return `<pre class="hljs"><code>${this.md.utils.escapeHtml(code)}</code></pre>`;
      },
    })
      .use(markdownItAnchor)
      .use(markdownItFootnote)
      .use(markdownItTaskLists, { enabled: true })
      .use(markdownItEmoji);
  }

  async render(content: string, options: RenderOptions): Promise<RenderResult> {
    const brokenImages: string[] = [];
    let processedContent = content;

    if (options.basePath) {
      processedContent = await this.resolveImagePaths(
        content,
        options.basePath,
        brokenImages,
      );
    }

    const bodyHtml = this.md.render(processedContent);
    const theme = options.theme ?? "light";
    const html = this.wrapDocument(bodyHtml, theme);

    return { html, brokenImages };
  }

  private async resolveImagePaths(
    content: string,
    basePath: string,
    brokenImages: string[],
  ): Promise<string> {
    // Match ![alt](path) where path is relative (not http/https/data//)
    const imageRegex =
      /!\[([^\]]*)\]\((?!https?:\/\/)(?!data:)(?!\/\/)([^)]+)\)/g;
    const matches = [...content.matchAll(imageRegex)];
    if (matches.length === 0) return content;

    let result = content;
    for (const match of matches) {
      const [fullMatch, alt, relativePath] = match;
      // Normalize: strip leading ./
      const cleaned = relativePath.startsWith("./")
        ? relativePath.slice(2)
        : relativePath;
      const separator = basePath.includes("\\") ? "\\" : "/";
      const absolutePath = `${basePath}${separator}${cleaned}`;

      const fileFound = await exists(absolutePath).catch(() => false);
      if (fileFound) {
        const assetUrl = convertFileSrc(absolutePath);
        result = result.replaceAll(fullMatch, `![${alt}](${assetUrl})`);
      } else {
        brokenImages.push(absolutePath);
      }
    }
    return result;
  }

  private wrapDocument(bodyHtml: string, theme: "light" | "dark"): string {
    const hljsCss = theme === "dark" ? hljsDarkCssRaw : hljsLightCssRaw;
    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${previewCssRaw}</style>
<style>${hljsCss}</style>
</head>
<body class="markdown-body">
${bodyHtml}
</body>
</html>`;
  }
}

export const markdownService = new MarkdownRenderingService();
