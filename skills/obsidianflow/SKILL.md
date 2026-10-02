---
name: obsidianflow
description: Let AI agents compose deterministic videos by writing standard HTML & CSS with the OBSIDIAN FLOW rendering engine.
---

# OBSIDIAN FLOW Video Composition Skill

This skill guides AI coding agents (Claude, Cursor, Antigravity, Windsurf, Copilot) in authoring frame-accurate, deterministic video productions using **OBSIDIAN FLOW**.

## 1. Core Principles

1. **Native Web Standards**: Author compositions using standard HTML5 and CSS. No React hooks or proprietary JSX runtime required.
2. **Explicit Time Semantics**: Use `data-*` attributes for composition resolution, framerate, duration, and clip start times.
3. **Deterministic Animations**: Animate via CSS Keyframes (Native frame adapter), GSAP Timelines, or Web Animations API (WAAPI). Never use non-deterministic `setInterval` or `requestAnimationFrame` without the master clock.
4. **Pre-Render Validation**: Always validate compositions against the 30+ static analysis rules (`obsidianflow lint`) before rendering.

---

## 2. Minimal Composition Template

```html
<!DOCTYPE html>
<html
  lang="en"
  data-composition-id="hero-production"
  data-width="1920"
  data-height="1080"
  data-fps="30"
  data-duration="10s"
>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="styles.css" />
  <script src="@obsidianflow/core/runtime.js"></script>
</head>
<body>
  <!-- Video Track 1 -->
  <div class="clip" id="scene-1" data-start="0s" data-duration="5s" data-track="main">
    <video src="assets/shot1.mp4" data-media-start="0s"></video>
  </div>

  <!-- Text Overlay Track -->
  <div class="clip" id="title-card" data-start="1s" data-duration="4s" data-track="overlay">
    <h1 class="headline">FUTURE OF VIDEO</h1>
  </div>

  <!-- Background Music with Dialogue Ducking -->
  <audio
    src="assets/music.mp3"
    data-track="music"
    data-volume="0.8"
    data-duck="true"
    data-duck-group="dialogue"
    data-duck-ratio="0.25"
  ></audio>
</body>
</html>
```

---

## 3. Clip & Animation Authoring

### Root Composition Attributes
- `data-composition-id`: Unique identifier for the scene.
- `data-width`: Video width in pixels (e.g. `1920` for 1080p, `1080` for 9:16 vertical).
- `data-height`: Video height in pixels (e.g. `1080` for 1080p, `1920` for vertical).
- `data-fps`: Target frame rate (`24`, `30`, `60`).
- `data-duration`: Total video duration (e.g. `10s`, `15.5s`, `01:30`).

### Clip Attributes
- `class="clip"`: Identifies a seekable timeline segment.
- `data-start`: Absolute start timecode within the composition.
- `data-duration`: Length of the clip.
- `data-track`: Track assignment (e.g. `video-1`, `b-roll`, `overlay`, `captions`).

### Deterministic Animations
```javascript
// Register a seekable timeline
if (window.NativeTimelineAdapter) {
  const tl = new window.NativeTimelineAdapter();
  tl.fromTo('.headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0 }, 1.0);
  window.__obsidianflow.registerTimeline('title-animation', tl);
}
```

---

## 4. Multi-Track Audio & Sidechain Ducking

OBSIDIAN FLOW features built-in FFmpeg sidechain audio ducking:

```html
<!-- Voiceover Track (Dialogue Group) -->
<audio
  src="assets/voiceover.mp3"
  data-track="dialogue"
  data-start="1s"
  data-duration="8s"
  data-duck-group="dialogue"
  data-volume="1.0"
></audio>

<!-- Background Music Track (Auto-ducked) -->
<audio
  src="assets/ambient.mp3"
  data-track="bgm"
  data-start="0s"
  data-duration="10s"
  data-volume="0.7"
  data-duck="true"
  data-duck-group="dialogue"
  data-duck-ratio="0.2"
></audio>
```

---

## 5. CLI Commands for AI Agents

Validate and render compositions:

```bash
# Structure check
obsidianflow check ./index.html --json

# Run 30+ deterministic static lint rules
obsidianflow lint ./index.html --json

# Render deterministic MP4 video
obsidianflow render ./index.html -o output.mp4 --fps 30 --bitrate 10M
```
