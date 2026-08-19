# AMLL foobar2000 Panel

An Apple Music-like synchronized TTML lyrics panel for foobar2000, built with
[`@applemusic-like-lyrics`](https://github.com/amll-dev/applemusic-like-lyrics)
and hosted through `foo_uie_webview` / WebView2.

## Current features

- Word-by-word TTML lyrics with click-to-seek
- Sidecar `.ttml` loading from the playing track folder
- Automatic lyric and artwork updates on track changes
- Blurred album-art background
- SF Pro font support when installed on Windows
- Live brightness, opacity, blur, and lyric-size controls
- Translation and romanization visibility toggles without reloading lyrics

## Build

```bash
npm install
npm run build
```

The build creates a standalone `index.html` with its JavaScript and CSS embedded.
`embed-dist.mjs` also copies it to the configured local output locations.

In the WebView component preferences, enable **Read files** so the panel can read
sidecar TTML files and external artwork.

