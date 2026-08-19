import { LyricPlayer } from "@applemusic-like-lyrics/core";
import "@applemusic-like-lyrics/core/style.css";
import { parseTTML } from "@applemusic-like-lyrics/lyric";
import "./style.css";

const host = globalThis.chrome?.webview?.hostObjects?.sync?.foo_uie_webview;
const app = document.querySelector("#app");
const albumArtBackground = document.querySelector("#albumArtBackground");
const status = document.createElement("div");
status.className = "status";
status.textContent = "AMLL foobar2000";
app.append(status);

const player = new LyricPlayer();
player.setLyricLines([]);
app.append(player.getElement());

// AMLL emits a `line-click` event, but it does not know how to control
// foobar2000. Forward the clicked line timestamp to the WebView host.
player.addEventListener("line-click", (event) => {
  try {
    const line = player.getLyricLines()[event.lineIndex];
    const timeMs = Number(line?.startTime);
    if (!Number.isFinite(timeMs)) return;
    const timeSeconds = Math.max(0, timeMs / 1000);
    if (host?.canSeek === false) return;
    host?.seek(timeSeconds);
    player.setCurrentTime(timeMs, true);
    player.update(0);
  } catch (error) {
    setStatus(`Seek failed: ${error?.message ?? "foobar2000 rejected the seek"}`, true);
  }
});

const defaultSettings = {
  bgBrightness: 0.65,
  bgOpacity: 0.75,
  bgBlur: 12,
  textScale: 1,
  showTranslation: false,
  showRomanized: false,
  showStatus: true,
};

let settings = { ...defaultSettings };
try {
  settings = { ...settings, ...JSON.parse(localStorage.getItem("amll-foobar-settings") ?? "{}") };
} catch {
  // Ignore an invalid old settings value.
}

let lastPath = "";
let loadTimer = 0;
let artworkTimer = 0;
let settingsSaveTimer = 0;
let playbackCommand = "";
const lyricCache = new Map();

const settingsPanel = document.querySelector("#settingsPanel");
const settingsToggle = document.querySelector("#settingsToggle");
const settingsClose = document.querySelector("#settingsClose");
const settingsInputs = {
  bgBrightness: document.querySelector("#bgBrightness"),
  bgOpacity: document.querySelector("#bgOpacity"),
  bgBlur: document.querySelector("#bgBlur"),
  textScale: document.querySelector("#textScale"),
  showTranslation: document.querySelector("#showTranslation"),
  showRomanized: document.querySelector("#showRomanized"),
  showStatus: document.querySelector("#showStatus"),
};

function displayLines(lines) {
  return lines.map((line) => ({
    ...line,
    translatedLyric: line.translatedLyric ?? "",
    romanLyric: line.romanLyric ?? "",
    words: (line.words ?? []).map((word) => ({
      ...word,
      romanWord: word.romanWord ?? "",
    })),
  }));
}

function applyVisualSettings() {
  document.documentElement.style.setProperty("--bg-brightness", settings.bgBrightness);
  document.documentElement.style.setProperty("--bg-opacity", settings.bgOpacity);
  document.documentElement.style.setProperty("--bg-blur", `${settings.bgBlur}px`);
  document.documentElement.style.setProperty("--text-scale", settings.textScale);
  document.documentElement.classList.toggle("show-translation", settings.showTranslation);
  document.documentElement.classList.toggle("show-romanized", settings.showRomanized);
  status.hidden = !settings.showStatus;

  document.querySelector("#bgBrightnessValue").textContent = `${Math.round(settings.bgBrightness * 100)}%`;
  document.querySelector("#bgOpacityValue").textContent = `${Math.round(settings.bgOpacity * 100)}%`;
  document.querySelector("#bgBlurValue").textContent = `${settings.bgBlur}px`;
  document.querySelector("#textScaleValue").textContent = `${Math.round(settings.textScale * 100)}%`;
}

function applySettings() {
  applyVisualSettings();

  for (const [key, input] of Object.entries(settingsInputs)) {
    if (input.type === "checkbox") input.checked = Boolean(settings[key]);
    else input.value = settings[key];
  }
}

function persistSettings() {
  window.clearTimeout(settingsSaveTimer);
  settingsSaveTimer = window.setTimeout(() => {
    localStorage.setItem("amll-foobar-settings", JSON.stringify(settings));
  }, 180);
}

function toggleSettings(force) {
  const shouldOpen = force === undefined ? settingsPanel.hasAttribute("hidden") : force;
  if (shouldOpen) settingsPanel.removeAttribute("hidden");
  else settingsPanel.setAttribute("hidden", "");
}

document.querySelector("#settingsReset").addEventListener("click", () => {
  settings = { ...defaultSettings };
  applySettings();
  persistSettings();
});
for (const [key, input] of Object.entries(settingsInputs)) {
  input.addEventListener("input", () => {
    settings[key] = input.type === "checkbox" ? input.checked : Number(input.value);
    if (input.type === "checkbox") {
      applyVisualSettings();
    } else {
      // Sliders only update CSS. They must not reset lyrics or query the
      // currently playing track while the thumb is being dragged.
      applyVisualSettings();
    }
    persistSettings();
  });
}

function setStatus(text, forceVisible = false) {
  status.textContent = text;
  status.hidden = forceVisible ? false : !settings.showStatus;
}

function currentPath() {
  if (!host) return "";
  try {
    // getFormattedText normally follows the selected playlist item. The
    // isplaying guard makes it return a path only for the actual playing item.
    return String(host.getFormattedText("$if(%isplaying%,%path%,)") ?? "").trim();
  } catch {
    return "";
  }
}

function playlistTransitionPath(previousPath, command = "") {
  if (!host || !previousPath) return "";
  try {
    const playlistIndex = Number(host.playingPlaylist);
    if (!Number.isInteger(playlistIndex) || playlistIndex < 0) return "";
    const items = JSON.parse(String(host.getPlaylistItems(playlistIndex) ?? "[]"));
    const previousIndex = items.findIndex((item) => String(item?.path ?? "").toLowerCase() === previousPath.toLowerCase());
    if (previousIndex < 0 || items.length < 2) return "";

    const backwards = /previous/i.test(command);
    const nextIndex = backwards
      ? (previousIndex - 1 + items.length) % items.length
      : (previousIndex + 1) % items.length;
    return String(items[nextIndex]?.path ?? "").trim();
  } catch {
    return "";
  }
}

function rememberedPath() {
  try {
    return localStorage.getItem("amll-last-track-path") ?? "";
  } catch {
    return "";
  }
}

function sidecarPath(path, extension) {
  return path.replace(/\.[^\\/.]+$/, extension);
}

function artworkSource(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // Embedded artwork is already returned as a data URI. External artwork is
  // returned by foo_webview2 as a native Windows path, which must be turned
  // into a file URI before WebView2 can use it in CSS.
  if (/^(data:|https?:|blob:|file:)/i.test(raw)) return raw;
  if (/^[a-z]:[\\/]/i.test(raw)) {
    return `file:///${raw.replace(/\\/g, "/").replace(/#/g, "%23").replace(/\?/g, "%3F")}`;
  }
  if (raw.startsWith("\\\\")) {
    return `file:${raw.replace(/\\/g, "/").replace(/#/g, "%23").replace(/\?/g, "%3F")}`;
  }
  return raw;
}

function updateArtwork() {
  if (!host) return false;
  try {
    let raw = String(host.getArtwork("front") ?? "").trim();
    // getArtwork() returns a native path when artwork is found through an
    // external search pattern. Reading it through the host converts it to a
    // data URI and avoids WebView2 file-URI/path restrictions.
    if (/^[a-z]:[\\/]/i.test(raw) || raw.startsWith("\\\\")) {
      try {
        raw = String(host.readImage(raw) ?? "").trim() || raw;
      } catch {
        // Fall back to the converted file URI below if file reading is denied.
      }
    }
    const source = artworkSource(raw);
    if (!source) {
      albumArtBackground.removeAttribute("src");
      return false;
    }
    if (albumArtBackground.src !== source) albumArtBackground.src = source;
    return true;
  } catch {
    // Artwork is optional.
    return false;
  }
}

function scheduleArtwork(retries = 12) {
  window.clearTimeout(artworkTimer);
  const attempt = (remaining) => {
    if (!updateArtwork() && remaining > 0) {
      artworkTimer = window.setTimeout(() => attempt(remaining - 1), 250);
    }
  };
  attempt(retries);
}

function syncPlaybackPosition() {
  try {
    const position = Number(host?.position ?? 0);
    player.setCurrentTime(Number.isFinite(position) ? position * 1000 : 0);
    player.update(0);
  } catch {
    player.setCurrentTime(0);
    player.update(0);
  }
}

function loadLyrics(pathOverride = "") {
  if (host && !host.isPlaying) {
    player.setLyricLines([]);
    setStatus("No active track — press Play", true);
    return false;
  }

  const path = pathOverride || currentPath();
  if (!path) {
    // A selected-but-not-playing item must never replace the current lyrics.
    if (lastPath && host?.isPlaying) return true;
    setStatus("Waiting for playing track…", true);
    return false;
  }

  if (path === lastPath) return true;
  try {
    const cached = lyricCache.get(path);
    if (cached) {
      player.setLyricLines(displayLines(cached));
      lastPath = path;
      syncPlaybackPosition();
      updateArtwork();
      setStatus("AMLL foobar2000");
      return true;
    }
    const ttml = host.readAllText(sidecarPath(path, ".ttml"), 65001);
    const parsed = parseTTML(ttml);
    const lines = parsed.lines ?? parsed;
    lyricCache.set(path, lines);
    player.setLyricLines(displayLines(lines));
    lastPath = path;
    syncPlaybackPosition();
    try {
      localStorage.setItem("amll-last-track-path", path);
    } catch {
      // Persistent track memory is optional.
    }
    updateArtwork();
    setStatus("AMLL foobar2000");
    return true;
  } catch (error) {
    player.setLyricLines([]);
    setStatus(`No TTML: ${error?.message ?? "file not found"}`, true);
    return false;
  }
}

function scheduleLoad(retries = 5, pathOverride = "") {
  window.clearTimeout(loadTimer);
  const attempt = (remaining) => {
    const loaded = loadLyrics(pathOverride);
    if (!loaded && remaining > 0) {
      loadTimer = window.setTimeout(() => attempt(remaining - 1), 250);
    }
  };
  attempt(retries);
}

function onPlaybackStarting(command = "") {
  playbackCommand = String(command ?? "");
  window.setTimeout(() => {
    scheduleArtwork();
    scheduleLoad(10);
  }, 100);
}

function onPlaybackNewTrack() {
  const previousPath = lastPath;
  const transitionPath = playlistTransitionPath(previousPath, playbackCommand);
  lastPath = "";
  window.setTimeout(() => {
    scheduleArtwork();
    // A manually started track is normally also the focused playlist item, so
    // currentPath() can identify it exactly. Only use the adjacent-track guess
    // when auto-advance leaves the focus on the previous item.
    const playingPath = currentPath();
    if (playingPath) {
      scheduleLoad(10, playingPath);
      return;
    }

    // Give manual playlist activation one more moment to update foobar's
    // selection state before falling back to sequential auto-advance.
    window.setTimeout(() => {
      scheduleLoad(10, currentPath() || transitionPath);
    }, 200);
  }, 100);
  playbackCommand = "";
}

function onPlaybackStop() {
  syncPlaybackPosition();
}

function onPlaybackSeek(time) {
  player.setCurrentTime(time * 1000, true);
  player.update(0);
}

function onPlaybackTime(time) {
  player.setCurrentTime(time * 1000);
  player.update(16);
}

function animationFrame() {
  try {
    if (host?.isPlaying && !host.isPaused) {
      player.setCurrentTime(host.position * 1000);
      player.update(16);
    }
  } catch {
    // The panel can also be previewed outside foobar2000.
  }
  requestAnimationFrame(animationFrame);
}

// foo_webview2 calls playback callbacks by their names on the page global.
// This file is an ES module, so explicitly expose them on globalThis.
Object.assign(globalThis, {
  onPlaybackStarting,
  onPlaybackNewTrack,
  onPlaybackStop,
  onPlaybackSeek,
  onPlaybackTime,
});

applySettings();
scheduleArtwork();
scheduleLoad();
animationFrame();
