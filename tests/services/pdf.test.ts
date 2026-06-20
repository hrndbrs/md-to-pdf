import { describe, it, expect, beforeEach } from "vitest";
import { PDFExportService } from "@/services/pdf";
import type { ExportOptions } from "@/types/export";

const baseOptions: ExportOptions = {
  outputPath: "/tmp/test.pdf",
  layout: "a4",
  margin: "normal",
  includeToc: false,
};

describe("PDFExportService", () => {
  let svc: PDFExportService;

  beforeEach(() => {
    svc = new PDFExportService();
  });

  it("injects @page padding style into html for normal margin", () => {
    const html = `<!DOCTYPE html><html><head></head><body class="markdown-body"><h1 id="hello">Hello</h1></body></html>`;
    // Access private method via cast for unit testing
    const prepared = (
      svc as unknown as {
        prepareHtml: (
          h: string,
          o: ExportOptions,
          w: number,
          m: number,
        ) => string;
      }
    ).prepareHtml(html, baseOptions, 794, 96);
    expect(prepared).toContain("padding: 96px");
  });

  it("injects TOC when includeToc is true", () => {
    const html = `<!DOCTYPE html><html><head></head><body class="markdown-body"><h1 id="intro">Intro</h1><h2 id="section">Section</h2></body></html>`;
    const prepared = (
      svc as unknown as {
        prepareHtml: (
          h: string,
          o: ExportOptions,
          w: number,
          m: number,
        ) => string;
      }
    ).prepareHtml(html, { ...baseOptions, includeToc: true }, 794, 96);
    expect(prepared).toContain('class="toc"');
    expect(prepared).toContain("Table of Contents");
    expect(prepared).toContain("#intro");
  });

  it("skips TOC when includeToc is false", () => {
    const html = `<!DOCTYPE html><html><head></head><body class="markdown-body"><h1 id="intro">Intro</h1></body></html>`;
    const prepared = (
      svc as unknown as {
        prepareHtml: (
          h: string,
          o: ExportOptions,
          w: number,
          m: number,
        ) => string;
      }
    ).prepareHtml(html, baseOptions, 794, 96);
    expect(prepared).not.toContain('class="toc"');
  });

  it("does not inject TOC when no headings present", () => {
    const html = `<!DOCTYPE html><html><head></head><body class="markdown-body"><p>No headings here.</p></body></html>`;
    const prepared = (
      svc as unknown as {
        prepareHtml: (
          h: string,
          o: ExportOptions,
          w: number,
          m: number,
        ) => string;
      }
    ).prepareHtml(html, { ...baseOptions, includeToc: true }, 794, 96);
    expect(prepared).not.toContain('class="toc"');
  });
});
