import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { writeFile } from "@tauri-apps/plugin-fs";
import { AppError } from "@/types/errors";
import { type ExportOptions, PAGE_SIZES, MARGINS } from "@/types/export";

export class PDFExportService {
  async export(html: string, options: ExportOptions): Promise<void> {
    const { width, height } = PAGE_SIZES[options.layout];
    const marginPx = MARGINS[options.margin].px;

    // Detect theme from HTML before preparing — used for background fill
    const isDark = html.includes('data-theme="dark"');
    const bgHex = isDark ? "#0d1117" : "#ffffff";
    const bgR = parseInt(bgHex.slice(1, 3), 16);
    const bgG = parseInt(bgHex.slice(3, 5), 16);
    const bgB = parseInt(bgHex.slice(5, 7), 16);

    const preparedHtml = this.prepareHtml(html, options, width, marginPx, bgHex);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:${height}px;border:none;visibility:hidden`;
    document.body.appendChild(iframe);

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new AppError("PDF_TIMEOUT", "PDF render timed out")),
          30_000,
        );
        iframe.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        iframe.onerror = () => {
          clearTimeout(timeout);
          reject(new AppError("PDF_LOAD_FAILED", "Failed to load content for PDF generation"));
        };
        iframe.srcdoc = preparedHtml;
      });

      // Allow fonts/images to settle
      await new Promise<void>((r) => setTimeout(r, 600));

      const body = iframe.contentDocument?.body;
      if (!body) throw new AppError("PDF_RENDER_FAILED", "Could not access rendered content");

      // Force background directly on DOM node — overrides any CSS cascade
      body.style.setProperty("background-color", bgHex, "important");
      iframe.contentDocument!.documentElement.style.setProperty("background-color", bgHex, "important");

      const iframeDoc = iframe.contentDocument!;
      const totalHeight = body.scrollHeight;
      const pageBreaks = this.calculatePageBreaks(iframeDoc, height, totalHeight);
      const slices = [0, ...pageBreaks, totalHeight];

      // One canvas at scale=1 + JPEG to stay within memory limits
      const canvas = await html2canvas(body, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        width,
        windowWidth: width,
        backgroundColor: bgHex,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const renderedHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height],
      });

      for (let i = 0; i < slices.length - 1; i++) {
        if (i > 0) pdf.addPage();
        const yStart = slices[i];
        const yEnd = slices[i + 1];

        pdf.addImage(imgData, "JPEG", 0, -yStart, width, renderedHeight);

        // Fill remainder of page with document bg color — no visible stripe
        const usedHeight = yEnd - yStart;
        if (usedHeight < height) {
          pdf.setFillColor(bgR, bgG, bgB);
          pdf.rect(0, usedHeight, width, height - usedHeight, "F");
        }
      }

      const bytes = new Uint8Array(pdf.output("arraybuffer") as ArrayBuffer);
      await writeFile(options.outputPath, bytes);
    } finally {
      document.body.removeChild(iframe);
    }
  }

  private calculatePageBreaks(doc: Document, pageHeight: number, totalHeight: number): number[] {
    const breaks: number[] = [];
    let target = pageHeight;
    while (target < totalHeight) {
      const smartBreak = this.findSmartBreak(doc, target, pageHeight);
      breaks.push(smartBreak);
      target = smartBreak + pageHeight;
    }
    return breaks;
  }

  private findSmartBreak(doc: Document, target: number, pageHeight: number): number {
    const TOLERANCE = Math.min(80, pageHeight * 0.08);
    const blockSelectors = "h1,h2,h3,h4,h5,h6,p,tr,li,pre,blockquote,figure,img";
    const elements = Array.from(doc.querySelectorAll(blockSelectors)) as HTMLElement[];

    let breakPoint = target;

    for (const el of elements) {
      const top = this.getDocumentTop(el);
      const bottom = top + el.offsetHeight;

      if (top < target && bottom > target) {
        if (target - top <= TOLERANCE && top > 0) {
          breakPoint = top;
        } else if (bottom - target <= TOLERANCE) {
          breakPoint = bottom;
        }
        // else element too tall — keep target
        break;
      }
    }

    // Look-behind: if the element just above the break is a heading, pull break before it
    // so headings never strand alone at the bottom of a page
    for (const el of elements) {
      const top = this.getDocumentTop(el);
      const bottom = top + el.offsetHeight;
      if (bottom <= breakPoint && bottom > breakPoint - TOLERANCE * 2) {
        if (/^H[1-6]$/.test(el.tagName) && top > 0) {
          breakPoint = top;
        }
        break;
      }
    }

    return breakPoint;
  }

  private getDocumentTop(el: HTMLElement): number {
    let top = 0;
    let current: HTMLElement | null = el;
    const body = el.ownerDocument.body;
    while (current && current !== body) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return top;
  }

  private prepareHtml(
    html: string,
    options: ExportOptions,
    pageWidth: number,
    marginPx: number,
    bgHex: string,
  ): string {
    let result = options.includeToc ? this.injectToc(html) : html;

    const contentWidth = pageWidth - marginPx * 2;
    const printStyle = `<style>
      /* Explicit background — overrides compound-selector rules that html2canvas misses */
      html, body.markdown-body {
        background-color: ${bgHex} !important;
      }
      body.markdown-body {
        padding: ${marginPx}px !important;
        width: ${pageWidth}px !important;
        max-width: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        background: #ffffff !important;
      }
      table {
        width: 100% !important;
        max-width: ${contentWidth}px !important;
        table-layout: fixed !important;
        overflow: visible !important;
      }
      td, th {
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        overflow: visible !important;
        hyphens: auto !important;
      }
      /* code blocks inside table cells: wrap, never clip */
      td pre, th pre, td code, th code {
        white-space: pre-wrap !important;
        word-break: break-all !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
        overflow: visible !important;
      }
      /* standalone pre/code outside tables */
      pre, code {
        white-space: pre-wrap !important;
        word-break: break-word !important;
        max-width: 100% !important;
        overflow: visible !important;
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
        const id = h.id || h.textContent?.trim().toLowerCase().replace(/\s+/g, "-") || "";
        return `<li class="toc-${level}"><a href="#${id}">${h.textContent}</a></li>`;
      })
      .join("\n");

    const toc = `<nav class="toc"><h2>Table of Contents</h2><ul>${items}</ul></nav>`;
    return html.replace('<body class="markdown-body">', `<body class="markdown-body">${toc}`);
  }
}

export const pdfExportService = new PDFExportService();
