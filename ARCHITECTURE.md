# Architecture

## Overview

The project is a single-page application rendered inside the WebView2 control
provided by `foo_uie_webview`.

```text
foobar2000 playback
        |
        v
foo_uie_webview host object and callbacks
        |
        v
src/main.js
  |       |         |
  |       |         +--> front artwork --> background <img>
  |       +------------> sidecar .ttml --> AMLL parser
  +--------------------> playback position / seek
                                |
                                v
                         AMLL LyricPlayer
```

## Host bridge

The synchronous host object is obtained from:

```js
chrome.webview.hostObjects.sync.foo_uie_webview
```

`foo_uie_webview` invokes named global functions. Because `src/main.js` is an ES
module, callbacks must be explicitly exposed through `Object.assign(globalThis,
...)`. Do not remove that assignment.

Important callbacks:

- `onPlaybackStarting`
- `onPlaybackNewTrack`
- `onPlaybackStop`
- `onPlaybackSeek`
- `onPlaybackTime`

## Track identification

`getFormattedText()` can follow the focused playlist item depending on
foobar2000's **Display / Selection Viewers** preference. The focused item is not
necessarily the playing item.

`currentPath()` therefore uses a `%isplaying%` guard. On manual playback, the
focused and playing items normally match and provide the exact path. During
automatic advancement, focus may remain on the previous item and return an
empty path.

For that auto-advance case, `playlistTransitionPath()` finds the previous path
inside the playing playlist and proposes the adjacent item. The exact playing
path always has priority over this fallback. There is a second short delay so a
manual activation has time to update foobar2000 state before the fallback is
used.

This ordering is an invariant:

```text
exact playing path > delayed exact path > adjacent playlist fallback
```

Never make the adjacent fallback unconditional; that previously caused manually
selected tracks to display lyrics from track 1 or track 7.

## TTML and LRC loading

The audio extension is first replaced with `.ttml`. The file is read
synchronously through `host.readAllText(path, 65001)` and parsed with
`@applemusic-like-lyrics/lyric`. If TTML is missing, empty, malformed, or has no
lyric lines, a matching `.lrc` sidecar is read with `parseLrc()`.

TTML always has priority because it can carry word timing, background vocals,
translation, and romanization. Standard LRC fallback is line-synchronized.

Parsed lines are cached by absolute audio path. `setLyricLines()` is allowed
only when a track actually changes or a new file is loaded. It must not be used
for visual settings.

Apple Music TTML `<songwriters>` metadata is deduplicated and rendered through
AMLL's native bottom-line element, keeping credits inside the lyric scroll.

## Translation and romanization

All parsed translation and romanization data stays mounted in AMLL. Visibility
is controlled with `show-translation` and `show-romanized` classes on the root
element.

This avoids resetting animation and playback state. The CSS currently targets
AMLL classes such as `FmKaba_lyricSubLine` and `FmKaba_romanWord`; review these
selectors whenever the AMLL dependency is upgraded.

## Artwork

`getArtwork("front")` may return either:

- a `data:` URI for embedded artwork, or
- a native Windows path for externally discovered artwork.

External paths are passed through `host.readImage()` when permitted, then used
as the source of the real `#albumArtBackground` image. A real image element is
used instead of a CSS pseudo-element so loading, blur, opacity and brightness
behave consistently in WebView2.

Artwork loading retries briefly because foobar2000 may emit the new-track event
before album art is ready.

## Settings

Slider input updates CSS custom properties directly. Persistence is debounced
to avoid repeated localStorage writes during dragging.

Alignment, inactive opacity, and line spacing are visual-only settings. The
player uses its native alignment anchor to keep the active line near the upper
quarter of the panel, while CSS overrides AMLL's desktop width restriction.

Translation and romanization toggles only change root CSS classes. No settings
control should query the current track, re-read TTML, or call `setLyricLines()`.

## Build output

The production deliverable must be one standalone HTML file. Depending on
separate `assets/` files caused unreliable local-file loading in WebView2, so
`embed-dist.mjs` inlines the generated JavaScript and CSS after every Vite build.
