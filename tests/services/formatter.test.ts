import { describe, it, expect } from "vitest";
import { FormatterService } from "@/services/formatter";

describe("FormatterService", () => {
  it("formats valid markdown and returns a string", async () => {
    const svc = new FormatterService();
    const result = await svc.format("# Hello\n\nsome text");
    expect(typeof result).toBe("string");
    expect(result).toContain("# Hello");
    expect(result).toContain("some text");
  });

  it("adds trailing newline to output", async () => {
    const svc = new FormatterService();
    const result = await svc.format("# Hello");
    expect(result.endsWith("\n")).toBe(true);
  });

  it("preserves prose wrap (does not reflow paragraphs)", async () => {
    const svc = new FormatterService();
    const input =
      "This is a short sentence.\nThis is another sentence on the next line.";
    const result = await svc.format(input);
    expect(result).toContain("This is a short sentence.");
    expect(result).toContain("This is another sentence on the next line.");
  });
});
