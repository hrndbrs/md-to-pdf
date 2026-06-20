# Changelog

## 0.2.0 (2026-06-20)

### Features

* add app layout shell, toolbar, status bar, and error banner ([a4a7e53](https://github.com/hrndbrs/md-to-pdf/commit/a4a7e53725f0453f6add6485dcafddf68febfeb4))
* add DocumentStore with full test coverage ([0e599e1](https://github.com/hrndbrs/md-to-pdf/commit/0e599e1cc4191cb0dd0ad7f2bdff15964df11733))
* add FileSystemService with Tauri plugin wrappers ([09dff1a](https://github.com/hrndbrs/md-to-pdf/commit/09dff1a7453460a46d5acfc1a2d04c7ea29043f1))
* add Google Fonts (Inter, JetBrains Mono, Material Symbols) and fix pane divider ([78a9d05](https://github.com/hrndbrs/md-to-pdf/commit/78a9d053c859d33428db384ec191317a35c545aa))
* add icon-filled utility and global button cursor styles ([18cdd91](https://github.com/hrndbrs/md-to-pdf/commit/18cdd91a02304251cfa4d1446ebad98546572705))
* add live preview pane with debounced markdown rendering and drag-and-drop ([75a0ec2](https://github.com/hrndbrs/md-to-pdf/commit/75a0ec239c5a70d5ef80b6d1bc97ade96ded11da))
* add MarkdownRenderingService with GFM, syntax highlighting, and image resolution ([36154e1](https://github.com/hrndbrs/md-to-pdf/commit/36154e1fa304bcd817d8d056144cce0a191a7cb8))
* add PDF export via window.print() with pre-flight broken image warning ([d9ebea9](https://github.com/hrndbrs/md-to-pdf/commit/d9ebea9d5883be1dcd9a95b6bf036022760f2584))
* add Precision PDF design tokens to main.css (Tailwind v4) ([71cb86e](https://github.com/hrndbrs/md-to-pdf/commit/71cb86ee2b34ae39e8ba28034015b87d3a3e0357))
* add reveal_in_finder Rust command and scope fs permissions to $HOME/** ([7a74dd3](https://github.com/hrndbrs/md-to-pdf/commit/7a74dd331c8165e49f83d8281fc80cdbca3b6609))
* add settings dialog, loading overlay, window close guard, and broken image warning ([02451cd](https://github.com/hrndbrs/md-to-pdf/commit/02451cd3a14b37c06aeac86d365a7bc06dc06467))
* add SettingsStore and PreviewStore ([fcab7f6](https://github.com/hrndbrs/md-to-pdf/commit/fcab7f6cb427c70023704395534272b6730e3f97))
* add TypeScript types and Vitest test infrastructure ([b8c2d02](https://github.com/hrndbrs/md-to-pdf/commit/b8c2d02e4dd97537ca81f5bc078c6efb0ce8f536))
* add useDocument, useTheme, and useKeyboard composables ([e725657](https://github.com/hrndbrs/md-to-pdf/commit/e725657cc8130e0514d9cb0fd0548c9a0abaab70))
* configure window, CSP, and register Pinia ([279bd84](https://github.com/hrndbrs/md-to-pdf/commit/279bd841e0a24632fbfbf3fe912fdf02516b8786))
* **editor:** replace monaco with codemirror 6, add vim mode and format-on-save ([853fa3b](https://github.com/hrndbrs/md-to-pdf/commit/853fa3b526a3626b40b6c5ee82e9ab63ccd8910e))
* **formatter:** add FormatterService wrapping prettier for markdown ([116d5bd](https://github.com/hrndbrs/md-to-pdf/commit/116d5bd9c98f38bb9dea9a6c8df5db9847bde6e2))
* implement PDF export service with per-page html2canvas rendering ([dc3c345](https://github.com/hrndbrs/md-to-pdf/commit/dc3c34548bae6f92ace14d6e506eec5fbd710660))
* integrate Monaco editor with store sync and theme support ([0574e6e](https://github.com/hrndbrs/md-to-pdf/commit/0574e6e8a7e4f2aa2c2a8b9e6062acbeca3ffb95))
* **pdf:** implement native webview PDF export via platform APIs ([a46cb52](https://github.com/hrndbrs/md-to-pdf/commit/a46cb52a3ee04c2df70f111ac7e7073a1247c2cb))
* redesign ExportDialog with loading state and reveal-in-finder on success ([10580bb](https://github.com/hrndbrs/md-to-pdf/commit/10580bb350061ce5f70eccd1a9a56e36476f3c3b))
* register Tauri fs, dialog, and store plugins ([b107655](https://github.com/hrndbrs/md-to-pdf/commit/b107655204fd396aa359398627232e21e6d22ec9))
* restyle AppToolbar with Precision PDF tokens and Material Symbols ([c220dff](https://github.com/hrndbrs/md-to-pdf/commit/c220dff9a4cea639ae476d48bb8a3581e17e8169))
* restyle ExportDialog with Precision PDF tokens and Material Symbols ([40da0c0](https://github.com/hrndbrs/md-to-pdf/commit/40da0c0ed366f79cfec212d10a25f1ef78e5f65e))
* restyle PreviewEmpty with Precision PDF empty state design ([70cb220](https://github.com/hrndbrs/md-to-pdf/commit/70cb220022536d3c7b007ec2b9d95271bb66e279))
* restyle PreviewPane and LoadingOverlay with Precision PDF tokens ([3ada0e3](https://github.com/hrndbrs/md-to-pdf/commit/3ada0e360931b7e7beff9a0980a14c7df6751a5d))
* restyle SettingsDialog with segmented controls and Precision PDF tokens ([2ffd5a3](https://github.com/hrndbrs/md-to-pdf/commit/2ffd5a3525932895655d962a89f75eaeadb4eead))
* restyle StatusBar and ErrorBanner with Precision PDF tokens ([d44f4df](https://github.com/hrndbrs/md-to-pdf/commit/d44f4df67173beb11414f91e305e529348ea2e8c))
* **settings:** add vimMode and formatOnSave settings with persistence ([901463f](https://github.com/hrndbrs/md-to-pdf/commit/901463f0f3acc01a9eaaa82a85817b162d5f84d7))

### Bug Fixes

* add @types/node to tsconfig.node.json to resolve node:url and process.env types ([85effe2](https://github.com/hrndbrs/md-to-pdf/commit/85effe2c2f44ef18f41ad1f6fd3f4c116b53c95f))
* correct emit type cast and iframe visibility when render error is set ([0a31d22](https://github.com/hrndbrs/md-to-pdf/commit/0a31d220b7be188f43b2c7af4b4d5ebe13210772))
* darken primary color in dark mode for readable button text contrast ([6a2821a](https://github.com/hrndbrs/md-to-pdf/commit/6a2821a9ec9504a12b30bcfcd423953e619ad804))
* guard against double-resolve in PDFExportService.export() ([913c7fd](https://github.com/hrndbrs/md-to-pdf/commit/913c7fd85c2996a86d8b34b14ed29c61f958ba03))
* import main.css in main.ts so Tailwind styles apply ([ee4d75e](https://github.com/hrndbrs/md-to-pdf/commit/ee4d75eebb8b2cfed918d7174e2b524170fff252))
* include tests/ in tsconfig.json so IDE resolves @/ imports in test files ([63a67a2](https://github.com/hrndbrs/md-to-pdf/commit/63a67a220d8fa170677f7a6b316270bf50798bca))
* **linux:** remove unused gtk prelude import ([cd65be1](https://github.com/hrndbrs/md-to-pdf/commit/cd65be18bac92cea759ab75323a9cda6a373a520))
* **linux:** use gtk prelude and correct PrintOperation setter signatures ([d1450fe](https://github.com/hrndbrs/md-to-pdf/commit/d1450fe64b6c8a4ed2bf60dfb399eab741b06f7e))
* move @types/markdown-it to devDeps, use replaceAll in resolveImagePaths ([445e6fb](https://github.com/hrndbrs/md-to-pdf/commit/445e6fbfa2684f2c4507c186bd058193f9451df9))
* narrow worker.format type to satisfy Vite UserConfig ([f67e9ed](https://github.com/hrndbrs/md-to-pdf/commit/f67e9ed44edbe25c6f603907939e29e6af7719f9))
* **pdf:** force all details elements open before export ([de059f6](https://github.com/hrndbrs/md-to-pdf/commit/de059f612ff00f4344182877df999c0f52c86b41))
* **pdf:** use body.scrollHeight to avoid blank pages on short documents ([6d437c4](https://github.com/hrndbrs/md-to-pdf/commit/6d437c4a1b12f880931b61976c7dfb13ba5a536a))
* **permissions:** add core:window:allow-set-title capability ([ad85653](https://github.com/hrndbrs/md-to-pdf/commit/ad85653820afe009985cf05ba84b5b773e027ea3))
* restore print.css selectors, allow Google Fonts in CSP, use adaptive tokens for dark mode banners ([fc498e0](https://github.com/hrndbrs/md-to-pdf/commit/fc498e09cfe9cb3e3582b7a777b1db708d30df98))
* SettingsDialog UX (backdrop/Escape dismiss, radix, a11y) and deep watch on brokenImagePaths ([9aa9710](https://github.com/hrndbrs/md-to-pdf/commit/9aa971045ed7278fd1fc1796834a3173a670aabc))
* **tests:** stabilize setup mocks for reliable test isolation ([f0902be](https://github.com/hrndbrs/md-to-pdf/commit/f0902bee21fdb23e07e8249e0dc6e9b65a8656e1))
* use main.css reference in AppToolbar scoped style so custom tokens resolve in [@apply](https://github.com/apply) ([78892e7](https://github.com/hrndbrs/md-to-pdf/commit/78892e74cd5017a830f5425f21d36b3ed4e39b92))
* use Tailwind v4 canonical class names (important suffix, named scale) ([67a7ede](https://github.com/hrndbrs/md-to-pdf/commit/67a7ede2f1024b6b3995399b1fcb05574822e986))

## [0.1.0] - 2026-06-19

### Added

- Markdown editor with live preview (Monaco + markdown-it)
- PDF export via OS print dialog with page layout and margin controls
- Light/dark theme toggle
- Settings dialog (theme, editor font size, paper size)
- Export dialog with destination picker, page layout, margins, and TOC option
- Precision PDF design system (Tailwind v4 design tokens, Material Symbols icons)
- Broken image detection with warning banner
- Unsaved changes guard on window close
- macOS, Windows, and Linux release builds via GitHub Actions
