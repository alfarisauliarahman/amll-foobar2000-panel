# AMLL foobar2000 Panel v0.1.0

Initial public preview release.

## Highlights

- Apple Music-like word-synchronized TTML lyrics
- Click a lyric line to seek
- Automatic lyric and artwork updates on track changes
- Blurred album-art background
- SF Pro support when installed, with Segoe UI fallback
- Live brightness, opacity, blur, and lyric-size controls
- Translation and romanization toggles without lyric reloads
- Single standalone HTML file; Node.js is not required for users

## Requirements

- Windows 10 or later
- foobar2000 2.x
- Microsoft Edge WebView2
- `foo_uie_webview`
- Sidecar `.ttml` files with matching audio basenames

Read `INSTALL.md` inside the ZIP before installing.

## Known limitation

Random, shuffle, queue jumps, and unusual playlist mutations require more
testing because the current WebView host does not expose a direct now-playing
path. Default sequential playback and manual track selection are supported.

Licensed under GNU AGPL v3. Source code is available in this repository.

