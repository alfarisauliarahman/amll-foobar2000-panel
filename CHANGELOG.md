# Changelog

All notable changes to this project will be documented here.

## [0.2.0] - 2026-08-19

### Added

- Left, center, and right lyric alignment.
- Configurable inactive-line opacity.
- Wider lyric content with the active line anchored near the upper quarter.
- Line-spacing control.
- Standard `.lrc` fallback when TTML is unavailable or invalid.
- Songwriter credits from Apple Music TTML metadata at the end of the lyrics.

### Changed

- Simplified visual settings by retaining practical lyric and background controls.
- Expanded the internal lyric content width while preserving normal wrapping.
- Kept songwriter credits clear instead of applying inactive-line blur.

## [0.1.0] - 2026-08-19

### Added

- Word-synchronized TTML playback with AMLL.
- Lyric-line click seeking.
- Sidecar TTML discovery and parsing.
- Automatic playback position synchronization.
- Manual and sequential next-track lyric switching.
- Blurred front-artwork background with loading retries.
- SF Pro font preference with system fallbacks.
- Brightness, opacity, blur and lyric-size controls.
- Translation, romanization and status visibility settings.
- Standalone single-file HTML build.

### Fixed

- Prevented selected non-playing playlist items from replacing active lyrics.
- Prevented slider movement from reloading lyrics.
- Prevented translation and romanization toggles from resetting AMLL.
- Corrected Windows artwork paths and external artwork loading.
- Prioritized manually played tracks over sequential fallback guesses.
