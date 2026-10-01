---
name: obsidianflow-audio
description: Multi-track audio mixing, ducking, volume curves, and audio grouping for ObsidianFlow compositions.
---

# ObsidianFlow Audio Mixing Skill

This skill guides AI agents in authoring synchronized audio, background soundtracks, voiceovers, sound effects, and automated volume ducking in ObsidianFlow compositions.

## 1. Audio Groups & Tracks

Audio in ObsidianFlow is declared using `<of-audio-group>` containers and standard HTML5 `<audio>` tags:

```html
<of-audio-group data-fx-chain="compression,reverb">
  <!-- Background Music Track -->
  <audio
    id="bg-soundtrack"
    src="assets/synthwave-ambience.mp3"
    data-track="music"
    data-start="0s"
    data-duration="15s"
    data-volume="0.6"
    data-fade-in="1.5s"
    data-fade-out="2.0s"
    data-ducking="dialogue"
  ></audio>

  <!-- Sound Effect -->
  <audio
    id="sfx-eruption"
    src="assets/sub-bass-drop.wav"
    data-track="sfx"
    data-start="4.8s"
    data-duration="3.0s"
    data-volume="0.8"
  ></audio>

  <!-- Voiceover / Dialogue (Triggers ducking on music) -->
  <audio
    id="vo-line-1"
    src="assets/valerie-warning.mp3"
    data-track="dialogue"
    data-start="5.5s"
    data-duration="3.8s"
    data-volume="1.0"
    data-generated-by="elevenlabs"
  ></audio>
</of-audio-group>
```

---

## 2. Track Attributes

- `data-track` (required): Role of the track. Typical values:
  - `music`: Background score or soundtrack.
  - `dialogue`: Spoken dialogue or AI voiceover.
  - `sfx`: Foley, impact hits, whooshes, ambient room tone.
- `data-start`: Timeline offset in seconds when the audio should begin playing.
- `data-duration`: Length of the audio segment.
- `data-volume`: Float between `0.0` (silent) and `1.0` (unity gain).
- `data-ducking="dialogue"`: When set, ObsidianFlow's audio mixer applies sidechain compression to reduce this track's volume whenever a `dialogue` track is speaking.
- `data-fade-in`: Fade-in duration in seconds (e.g. `1s`, `500ms`).
- `data-fade-out`: Fade-out duration in seconds before the track ends.
- `data-generated-by`: AI audio model attribution (e.g. `elevenlabs`, `suno-v3`, `udio`).

---

## 3. How Audio Ducking Works

When `data-ducking="dialogue"` is present on a music track:
1. The producer pipeline analyzes all tracks marked `data-track="dialogue"`.
2. FFmpeg's `sidechaincompress` filter is dynamically wired between the music stream and dialogue stream:
   `[music][dialogue]sidechaincompress=threshold=0.12:ratio=4:attack=50:release=350[ducked_music]`
3. While the dialogue is active, the music drops ~10-14 dB, ensuring crystal clear speech intelligibility.
4. As soon as the speaker finishes, the music smoothly ramps back up.

---

## 4. Linting Audio Configurations

To verify that all referenced audio files exist and have valid settings:

```bash
npx obsidianflow lint index.html
```

Lint rules applied:
- `OF005`: Warning if an audio track exceeds the composition's total duration.
- `OF008`: Warning if `data-ducking` references a non-existent track.
- `OF031`: Error if local audio files cannot be resolved on disk.
- `OF037`: Warning if `data-volume` is outside the `0.0` - `1.0` range.
- `OF038`: Warning if using unsupported audio container formats.
