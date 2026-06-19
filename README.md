# md-to-pdf

Markdown editor with live preview and PDF export. Runs locally, no cloud.

Built with Tauri v2, Vue 3, Monaco Editor.

## Usage

```bash
npm install
npx tauri dev   # dev
npx tauri build # production build
npm test        # unit tests
```

## Release

Releases are built automatically on version tag push (e.g., `git tag v1.0.0`).

Required GitHub secrets for signed installers:

- `APPLE_CERTIFICATE` — base64-encoded `.p12` Apple Developer ID certificate
- `APPLE_CERTIFICATE_PASSWORD` — password for the certificate
- `APPLE_SIGNING_IDENTITY` — e.g. `Developer ID Application: Name (TEAMID)`
- `APPLE_ID` — Apple ID email for notarization
- `APPLE_PASSWORD` — app-specific password for notarization
- `APPLE_TEAM_ID` — Apple Developer Team ID
- `TAURI_SIGNING_PRIVATE_KEY` — Tauri updater signing key (for auto-updates)
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — password for the signing key
