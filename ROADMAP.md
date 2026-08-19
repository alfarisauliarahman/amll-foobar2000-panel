# Roadmap

This file records ideas, not promises. Confirm behavior and update the
architecture notes before implementing items that affect playback state.

## Packaging and onboarding

- Publish versioned GitHub Release ZIP files with standalone `index.html`.
- Add an end-user installation guide with screenshots.
- Document the required `foo_uie_webview` version and download link.
- Add an automated release build and checksum.

## Display customization

- Per-section settings collapse/expand controls.
- Auto-hide settings button.

## Lyrics

- Configurable sidecar search paths.
- Better empty-state and malformed-TTML reporting.
- Optional translation and romanization style controls.

## Playback reliability

- Correct random, shuffle and playback-queue track resolution without relying
  on adjacent playlist order.
- Test Previous across playlist boundaries.
- Add a small host integration test page for callback diagnostics.

## Native component option

A dedicated `.fb2k-component` could eventually bundle the panel and expose a
direct now-playing path. This would require a maintained C++ component, foobar2000
SDK builds for x86/x64, WebView2 integration and separate release packaging. It
is intentionally out of scope for the current template-based version.
