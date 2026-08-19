# Development

## Requirements

- Windows 10 or later
- foobar2000 2.x
- `foo_uie_webview`
- Microsoft Edge WebView2 Runtime
- Node.js and npm

## Install dependencies

```bash
npm install
```

The lockfile is committed. Avoid upgrading AMLL or Vite as part of an unrelated
change because generated DOM class names and lyric behavior may change.

## Build

```bash
npm run build
```

The build has two stages:

1. Vite writes normal assets to `dist/`.
2. `embed-dist.mjs` embeds the generated JavaScript and CSS into one standalone
   `index.html`.

The standalone file is copied to:

- `../../outputs/amll-foobar-panel/index.html`, relative to this project
- `%USERPROFILE%/Downloads/index.html`

The first path is the template currently used for local development. Do not
commit either generated copy.

## Source layout

```text
index.html          Static panel and settings markup
src/main.js         Host integration, TTML loading, playback and settings
src/style.css       AMLL overrides, artwork background and settings UI
embed-dist.mjs      Standalone HTML packager
vite.config.js      Relative-path Vite configuration
```

## Local foobar2000 setup

1. Install `foo_uie_webview`.
2. Add a WebView panel to the foobar2000 layout.
3. Set its template path to the generated standalone `index.html`.
4. Enable **Read files** in the WebView preferences.
5. Place a TTML file beside each audio file with the same basename.

Example:

```text
01. Song.m4a
01. Song.ttml
```

## Verification checklist

After a behavioral change, verify all of these in foobar2000:

- Starting a track manually loads that track's TTML.
- Next and Previous update lyrics without double-clicking the playlist item.
- Clicking a lyric line seeks playback.
- Selecting a non-playing playlist item does not replace current lyrics.
- Artwork changes with the playing track.
- Dragging every slider does not reset or reload lyrics.
- Translation and romanization toggles do not call `setLyricLines()`.
- Alignment, opacity, and spacing update live.
- A same-basename `.lrc` loads when `.ttml` is absent or invalid.
- The settings panel remains clickable above the lyric player.

## Releases

For end users, publish a ZIP containing the standalone `index.html` and an
installation guide. Do not rename the ZIP or HTML to `.fb2k-component`; this
project is a template that depends on the separate native `foo_uie_webview`
component.
