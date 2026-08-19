# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

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

