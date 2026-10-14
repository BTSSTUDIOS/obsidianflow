---
name: obsidianflow
description: Direct and compose frame-accurate video productions using the OBSIDIAN FLOW MCP server and deterministic cinema rendering engine.
---

# OBSIDIAN FLOW MCP Cinema Production Skill

This skill guides AI coding agents (Claude, Cursor, Antigravity, Windsurf, Copilot) in authoring frame-accurate, deterministic video productions using **OBSIDIAN FLOW MCP**.

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

## 4. Multi-Track Audio, Ducking & Volume Keyframes

OBSIDIAN FLOW features built-in FFmpeg sidechain audio ducking, manual volume keyframing, and automatic EBU R128 (-14 LUFS) broadcast loudness normalization:

```html
<!-- Voiceover Track (Dialogue Group) -->
<audio
  src="assets/voiceover.mp3"
  data-track="dialogue"
  data-start="1s"
  data-duration="8s"
  data-volume="1.0"
></audio>

<!-- Background Music Track (Auto-ducked by dialogue to 20% volume) -->
<audio
  src="assets/ambient.mp3"
  data-track="music"
  data-start="0s"
  data-duration="10s"
  data-volume="0.7"
  data-duck="dialogue"
  data-duck-ratio="0.2"
></audio>

<!-- Manual Rubber-Band Volume Keyframing -->
<audio
  src="assets/sfx-riser.mp3"
  data-track="sfx"
  data-start="2s"
  data-duration="6s"
  data-volume-keyframes="0s:0.0, 2s:0.5, 4s:1.0, 6s:0.0"
></audio>
```

---

## 5. SMPTE Transition Wipes

Use standard SMPTE 258M / 287M transition wipe codes between scenes:

```html
<!-- SMPTE Wipe 1: Horizontal wipe (left-to-right) with 15% edge softness -->
<of-transition
  type="smpte-wipe"
  code="1"
  data-softness="15"
  data-start="4.5s"
  data-duration="1.0s"
  data-from="#scene-1"
  data-to="#scene-2"
></of-transition>
```

Supported codes: `1` (horizontal line), `2` (vertical line), `21-26` (barn door / box), `101-104` (circle iris), `201-204` (clock sweep).

---

## 6. Cinematography & Camera Work (24 Directing Techniques)

AI agents can orchestrate cinematic motion using native CSS transforms, filters, and audio timeline offsets. Always specify **[Duration · Speed · Subject]** (e.g. *"Over 3s / slowly / towards subject"*) for precision.

### A. Camera Movements (01-08)
- **Pan (01)**: Horizontal swivel (`transform: translate3d(-15%, 0, 0)`).
- **Tilt (02)**: Vertical swivel (`transform: translate3d(0, -12%, 0)` with perspective pitch).
- **Dolly In (03)**: Physical forward motion with true parallax depth (`transform: scale(1.35) translate3d(0, 0, 50px)`).
- **Zoom In (04)**: Optical lens magnification (`transform: scale(1.25); transform-origin: 50% 40%`).
- **Tracking Shot (05)**: Subject pinned center while background translates across viewport.
- **Orbit / Arc Shot (06)**: 3D arc around subject (`transform: perspective(1000px) rotateY(25deg)`).
- **Crane Up (07)**: Ascending boom arm (`transform: translateY(-35%) rotateX(10deg)`).
- **Dolly Zoom / Vertigo (08)**: Subject fixed (`scale(1.0)`), background expands (`scale(1.8)`).

### B. Shot Style & Time Manipulation (09-16)
- **Rack Focus (09)**: Shifting focus plane (`filter: blur(0px) -> blur(10px)` on foreground, inverse on background).
- **Handheld (10)**: Organic deterministic micro-shake keyframes (`rotate(±0.4deg) translate(±2px, ±3px)`).
- **FPV Drone (11)**: High-speed dynamic traversal with banked roll (`rotateZ(-18deg) scale(1.5)`).
- **Dutch Angle (12)**: Stylized psychological roll tilt (`transform: rotate(-12deg) scale(1.15)`).
- **Slow Motion (13)**: Overcranked playback (`data-speed="0.25"`).
- **Speed Ramp (14)**: Piecewise acceleration (`data-speed-curve="0s:1.0, 1.5s:0.2, 3s:1.0"`).
- **Time-lapse (15)**: Extreme temporal speedup (`data-speed="8.0"`).
- **Freeze Frame (16)**: Time stops on hero moment (`data-freeze-at="2.5s" data-freeze-duration="2s"`).

### C. Editorial Cuts & Split Audio (17-24)
- **Jump Cut (17)**: Direct cut advancing time within same framing.
- **Match Cut (18)**: Graphic/kinetic match connecting two scenes.
- **Whip Pan (19)**: Directional high-speed blur transition (`<of-transition type="whip-pan">`).
- **Cross Dissolve (20)**: Linear opacity dissolve between scenes.
- **Wipe (21)**: Edge boundary wipe (SMPTE 258M codes 1-204).
- **Smash Cut (22)**: Abrupt hard cut with contrasting audio and visual intensity.
- **J-Cut (23)**: Audio leads video — Scene 2 audio begins playing 1.5s before Scene 1 video cuts:
  ```html
  <div class="clip" id="scene-1" data-start="0s" data-duration="5s">...</div>
  <audio src="scene2-vo.mp3" data-track="dialogue" data-start="3.5s" data-duration="6s"></audio>
  <div class="clip" id="scene-2" data-start="5s" data-duration="5s">...</div>
  ```
- **L-Cut (24)**: Audio lingers — Scene 1 dialogue continues playing underneath the start of Scene 2 video.

---

## 7. OBSIDIAN FLOW MCP Tools for AI Agents

When connected via Model Context Protocol (`npx -y obsidianflow mcp`), the agent has native access to:
- `render_frame`: Capture a single PNG frame at any timecode in &lt;300ms for visual layout and typography verification directly in chat.
- `extract_frame`: Extract first/last frames for video generative anchor prompting (Veo, Kling, Runway).
- `inspect_timeline`: Retrieve full JSON breakdown of all video tracks, durations, audio stems, and ducking rules.
- `lint_composition`: Run 30+ static deterministic lint checks before rendering.
- `render_video`: Trigger background FFmpeg rendering with async job tracking.

---

## 7. CLI Commands for AI Agents

Validate and render compositions:

```bash
# Start MCP server over stdio
obsidianflow mcp

# Install MCP skills across agent environments
npx obsidianflow mcp install

# Structure check
obsidianflow check ./index.html --json

# Run 30+ deterministic static lint rules
obsidianflow lint ./index.html --json

# Render deterministic MP4 video
obsidianflow render ./index.html -o output.mp4 --fps 30 --bitrate 10M
```

---

## 8. Official Production Starter Templates (Higgsfield & Seedance Presets)

Scaffold complete battle-tested productions using:
```bash
npx obsidianflow init <project-name> --template <template-id>
```

| Template ID | Aspect Ratio | Duration | FPS | Genre & Formula |
| :--- | :--- | :--- | :--- | :--- |
| `vertical-drama` | 9:16 (1080x1920) | 15s | 30 | High-retention micro-drama hook (Crash Zoom, Dutch Tilt, Helicopter Cue, Paywall Cliffhanger) |
| `cinematic-action`| 16:9 (1920x1080) | 15s | 24 | Kurosawa / Villeneuve duel (2.39:1 Anamorphic, Vertigo Dolly Zoom, Crane Pedestal Up, Katana Snap Cut) |
| `commercial-product`| 9:16 (1080x1920) | 12s | 60 | Luxury brand & product commercial (Higgsfield 360 Turntable Orbit, Macro Liquid Mist, Audio Ducking) |
| `short-drama` | 16:9 (1920x1080) | 15s | 30 | Narrative multi-scene drama with dialogue cards and volcanic wipe transitions |
| `blank` | 16:9 (1920x1080) | 10s | 30 | Minimal clean canvas with native master clock animation rig |

