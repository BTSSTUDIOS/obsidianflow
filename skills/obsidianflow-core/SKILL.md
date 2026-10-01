---
name: obsidianflow-core
description: Authoring deterministic HTML/CSS compositions, clip tracks, and seekable animations for the ObsidianFlow video rendering engine.
---

# ObsidianFlow Core Composition Skill

This skill teaches AI agents how to author valid, deterministic video compositions for the **ObsidianFlow** video rendering engine.

## 1. Composition Document Structure

ObsidianFlow compositions are standard HTML5 documents annotated with `data-*` attributes on the root `<html>` or `<body>` element:

```html
<!DOCTYPE html>
<html
  lang="en"
  data-composition-id="scene-01-intro"
  data-width="1920"
  data-height="1080"
  data-fps="30"
  data-duration="10s"
>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="styles.css" />
  <!-- ObsidianFlow Browser Runtime -->
  <script src="@obsidianflow/core/runtime.js"></script>
</head>
<body>
  <!-- Clips live here -->
</body>
</html>
```

### Essential Root Attributes:
- `data-composition-id` (string): Unique identifier for the scene.
- `data-width` (integer, even number): Video width in pixels (e.g., `1920` for 1080p, `3840` for 4K, `1080` for 9:16).
- `data-height` (integer, even number): Video height in pixels (e.g., `1080`, `2160`, `1920`).
- `data-fps` (integer): Frame rate (typically `24`, `30`, or `60`).
- `data-duration` (string): Total video length (e.g. `10s`, `15.5s`, `5000ms`, `01:30`).

---

## 2. Clips & Tracks

Clips are represented by elements having the `.clip` CSS class:

```html
<div class="clip" id="hero-shot" data-start="0s" data-duration="5s" data-track="video-1">
  <video
    src="assets/hero-shot.mp4"
    data-media-start="1.5s"
    data-generated-by="veo-3.1"
    data-generation-id="gen_01j7xyz"
  ></video>

  <!-- Overlay title clip nested inside -->
  <div class="clip title-card" data-start="0.5s" data-duration="4s" data-track="text-overlay">
    <h1>CYBERNETIC HORIZON</h1>
  </div>
</div>
```

### Clip Timing:
- `data-start`: Time offset in seconds from the beginning of the composition.
- `data-duration`: How long the clip remains active and visible.
- `data-track`: The timeline track identifier (e.g. `video-1`, `b-roll`, `subtitles`).

---

## 3. Transitions

Transitions between clips or scenes are declared with the `<of-transition>` custom element:

```html
<of-transition
  type="lava-flow"
  data-start="4.5s"
  data-duration="1.0s"
  data-from="hero-shot"
  data-to="dialogue-shot"
></of-transition>
```

Supported transition types:
- `lava-flow`: Signature molten lava wipe with glowing edges.
- `obsidian-shatter`: Crystalline fragmentation effect.
- `volcanic-wipe`: Ash and ember directional transition.
- `ember-dissolve`: Particle dissolve.
- `fade` / `dissolve`: Smooth crossfade.

---

## 4. Deterministic Animation Guidelines

Because ObsidianFlow renders frame-by-frame via headless Chrome, **wall-clock time and real-time intervals do not apply**:

### ❌ FORBIDDEN (Causes desync and jitter):
- `setInterval()` and `setTimeout()`
- `requestAnimationFrame()` loops
- `Math.random()` (use fixed seeds or deterministic formulas)
- `Date.now()` or `new Date()`
- CSS animations with `iteration-count: infinite` unless scrubbed via WAAPI

### ✅ REQUIRED:
Register animations on `window.__timelines` using a seekable adapter:

```html
<script>
  // Option A: NativeTimelineAdapter (zero dependencies)
  const tl = new window.NativeTimelineAdapter();
  tl.fromTo('.title-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0, ease: 'easeOutCubic' }, 0.5);
  tl.to('.title-card', { opacity: 0, y: -20, duration: 0.8, ease: 'easeInCubic' }, 4.0);

  if (window.__obsidianflow) {
    window.__obsidianflow.registerTimeline('scene-01-intro', tl);
  }
</script>
```

---

## 5. Verification Commands

Always run the linter and check commands before rendering:

```bash
# Static analysis check
npx obsidianflow lint index.html

# Structure inspection
npx obsidianflow check index.html

# Render to MP4
npx obsidianflow render index.html -o final.mp4 --fps 30 --bitrate 10M
```
