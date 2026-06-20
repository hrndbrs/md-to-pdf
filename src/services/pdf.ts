import { invoke } from "@tauri-apps/api/core";
import { AppError } from "@/types/errors";
import { type ExportOptions, PAGE_SIZES, MARGINS } from "@/types/export";

export class PDFExportService {
  async export(html: string, options: ExportOptions): Promise<void> {
    const { width, height } = PAGE_SIZES[options.layout];
    const marginPx = MARGINS[options.margin].px;
    const preparedHtml = this.prepareHtml(html, options, width, marginPx);

    await invoke("export_pdf_native", {
      html: preparedHtml,
      outputPath: options.outputPath,
      pageWidthPx: width,
      pageHeightPx: height,
    }).catch((err: unknown) => {
      throw new AppError("PDF_RENDER_FAILED", String(err));
    });
  }

  private prepareHtml(
    html: string,
    options: ExportOptions,
    pageWidth: number,
    marginPx: number,
  ): string {
    let result = options.includeToc ? this.injectToc(html) : html;

    result = result.replace(
      /<details(?![^>]*\bopen\b)([^>]*)>/gi,
      "<details open$1>",
    );

    const contentWidth = pageWidth - marginPx * 2;
    const printStyle = `<style>
      @page {
        size: ${pageWidth}px ${PAGE_SIZES[options.layout].height}px;
        margin: 0;
      }
      body.markdown-body {
        padding: ${marginPx}px !important;
        width: ${pageWidth}px !important;
        max-width: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      table {
        width: 100% !important;
        max-width: ${contentWidth}px !important;
        table-layout: fixed !important;
      }
      td, th {
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: none !important;
      }
      td pre, th pre {
        white-space: pre-wrap !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }
      td code, th code {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        max-width: 100% !important;
      }
      pre, code {
        white-space: pre-wrap !important;
        word-break: break-word !important;
        max-width: 100% !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      .toc { margin-bottom: 2em; }
      .toc h2 { font-size: 1.2em; margin-bottom: 0.5em; }
      .toc ul { list-style: none; padding: 0; }
      .toc li { padding: 2px 0; }
      .toc li a { text-decoration: none; color: inherit; }
      .toc-h2 { padding-left: 1em; }
      .toc-h3 { padding-left: 2em; }
      .toc-h4 { padding-left: 3em; }
      details > *:not(summary) { display: block !important; }
    </style>`;

    return result.replace("</head>", `${printStyle}</head>`);
  }

  private injectToc(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4"));

    if (headings.length === 0) return html;

    const items = headings
      .map((h) => {
        const level = h.tagName.toLowerCase();
        const id =
          h.id ||
          h.textContent?.trim().toLowerCase().replace(/\s+/g, "-") ||
          "";
        return `<li class="toc-${level}"><a href="#${id}">${h.textContent}</a></li>`;
      })
      .join("\n");

    const toc = `<nav class="toc"><h2>Table of Contents</h2><ul>${items}</ul></nav>`;
    return html.replace(
      '<body class="markdown-body">',
      `<body class="markdown-body">${toc}`,
    );
  }
}

export const pdfExportService = new PDFExportService();
