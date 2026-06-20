import prettier from "prettier/standalone";
import markdownPlugin from "prettier/plugins/markdown";

export class FormatterService {
  async format(content: string): Promise<string> {
    return prettier.format(content, {
      parser: "markdown",
      plugins: [markdownPlugin],
      proseWrap: "preserve",
    });
  }
}

export const formatterService = new FormatterService();
