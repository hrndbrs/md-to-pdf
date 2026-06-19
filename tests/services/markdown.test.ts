import { describe, it, expect, beforeEach, vi } from "vitest";
import { exists } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { MarkdownRenderingService } from "@/services/markdown";

describe("MarkdownRenderingService", () => {
  let svc: MarkdownRenderingService;

  beforeEach(() => {
    svc = new MarkdownRenderingService();
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(convertFileSrc).mockImplementation(
      (p) => `asset://localhost${p}`,
    );
  });

  it("renders headings", async () => {
    const { html } = await svc.render("# Hello", {});
    expect(html).toContain("<h1");
    expect(html).toContain("Hello");
  });

  it("renders bold and italic", async () => {
    const { html } = await svc.render("**bold** _italic_", {});
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders GFM tables", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const { html } = await svc.render(md, {});
    expect(html).toContain("<table");
    expect(html).toContain("<td>");
  });

  it("renders task lists", async () => {
    const { html } = await svc.render("- [x] done\n- [ ] todo", {});
    expect(html).toContain('type="checkbox"');
  });

  it("renders footnotes", async () => {
    const { html } = await svc.render("Text[^1]\n\n[^1]: Note", {});
    expect(html).toContain("footnote");
  });

  it("renders strikethrough", async () => {
    const { html } = await svc.render("~~deleted~~", {});
    expect(html).toContain("<s>");
  });

  it("renders emoji shortcodes", async () => {
    const { html } = await svc.render(":smile:", {});
    expect(html).toContain("😄");
  });

  it("renders fenced code blocks with highlight.js", async () => {
    const md = "```javascript\nconst x = 1\n```";
    const { html } = await svc.render(md, {});
    expect(html).toContain("hljs");
    expect(html).toContain("const");
  });

  it("blocks raw HTML injection (html: false)", async () => {
    const { html } = await svc.render("<script>alert(1)</script>", {});
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("resolves relative image paths with basePath", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(convertFileSrc).mockReturnValue("asset://localhost/docs/img.png");

    const { html, brokenImages } = await svc.render("![alt](./img.png)", {
      basePath: "/docs",
    });
    expect(html).toContain("asset://localhost/docs/img.png");
    expect(brokenImages).toHaveLength(0);
  });

  it("adds broken image to result when file not found", async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const { brokenImages } = await svc.render("![alt](./missing.png)", {
      basePath: "/docs",
    });
    expect(brokenImages).toContain("/docs/missing.png");
  });

  it("does not rewrite remote image URLs", async () => {
    const { html } = await svc.render(
      "![alt](https://example.com/img.png)",
      {},
    );
    expect(html).toContain("https://example.com/img.png");
    expect(convertFileSrc).not.toHaveBeenCalled();
  });

  it("wraps output in full HTML document", async () => {
    const { html } = await svc.render("# Hi", {});
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });
});
