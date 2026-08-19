# Installation

This panel requires Windows, foobar2000 2.x, Microsoft Edge WebView2, and the
`foo_uie_webview` component. The release ZIP already contains the compiled
standalone HTML; Node.js is not required.

## 1. Install the WebView component

Download `foo_uie_webview.fbk2-component` from the
[`foo_uie_webview` releases page](https://github.com/stuerp/foo_uie_webview/releases).

Open it directly or install it through:

```text
foobar2000 > File > Preferences > Components > Install...
```

Restart foobar2000 when requested.

## 2. Extract this panel

Download `amll-foobar2000-panel-v0.1.0.zip` from this project's GitHub Release
and extract it to a permanent folder. Do not run `index.html` in a normal web
browser; it needs the foobar2000 WebView host object.

## 3. Add the panel

1. Enter foobar2000 Layout Editing Mode.
2. Add a **WebView** panel to the desired area.
3. Open `File > Preferences > Display > WebView`.
4. Select the WebView instance used for lyrics.
5. Set **Template file path** to the extracted `index.html`.
6. Enable **Read files**.
7. Apply the settings and leave Layout Editing Mode.

## 4. Add lyrics

Place an Apple Music-compatible TTML file beside the audio file, using exactly
the same basename:

```text
01. Song.m4a
01. Song.ttml
```

The panel currently reads `.ttml` only. `.lrc` fallback is planned but not yet
implemented.

## Troubleshooting

- **Blank panel:** verify that the template path points to the extracted
  standalone `index.html`, then restart foobar2000.
- **No lyrics:** confirm that **Read files** is enabled and the TTML basename
  exactly matches the audio basename.
- **No artwork:** ensure the track has embedded front artwork or matches a
  foobar2000 album-art search pattern.
- **Wrong lyrics after a track change:** use the latest release and report the
  playback order, queue state, and exact reproduction steps.
- **No SF Pro:** install SF Pro separately if legally available to you; otherwise
  the panel uses Segoe UI automatically.

The panel settings button controls background brightness, opacity, blur, lyric
size, translation, romanization, and status visibility.

