---
name: mixxx-cpp
description: Mixxx DJ software C++ development — architecture patterns, beat system, waveform rendering, protobuf serialization, analyzer pipeline, and Track Properties dialog
---

# Mixxx C++ Development

## Build & Test

```bash
# Build (IMMER -j4, nie mehr!)
CC=/usr/bin/gcc CXX=/usr/bin/g++ cmake --build build -j4

# Nur Library (schneller)
CC=/usr/bin/gcc CXX=/usr/bin/g++ cmake --build build -j4 --target mixxx-lib

# Tests
CC=/usr/bin/gcc CXX=/usr/bin/g++ cmake --build build -j4 --target mixxx-test
./build/mixxx-test --gtest_filter="*Beat*:*Bar*"
```

## Architecture Patterns

### Waveform Rendering

Zwei Rendering-Backends:

| Backend | Base class | Drawing |
|---|---|---|
| **allshader** | `rendergraph::GeometryNode` | GPU geometry nodes, textures |
| **legacy** | `WaveformRendererAbstract` | `QPainter` on `QPaintEvent` |

**allshader renderers** (`src/waveform/renderers/allshader/`):
- Inherit from `GeometryNode` (not `Node`)
- `preprocess()` runs each frame; enable with `setUsePreprocess(true)`
- `UniColorMaterial` for solid colors, `TextureMaterial` for text/images

**Legacy renderers** (`src/waveform/renderers/`):
- Override `draw(QPainter*, QPaintEvent*)`
- `QLineF` vectors + `painter->drawLines()`

### Beat System

- `src/track/beats.h` — Immutable `Beats` class (via `shared_ptr<const Beats>`)
- `BeatMarker` vector + last marker position/BPM
- Beat-to-bar: `globalBeatIndex = it - trackBeats->cfirstmarker()`
- Downbeat: `((globalBeatIndex % beatsPerBar) + beatsPerBar) % beatsPerBar == 0`
- Mutations return `std::optional<BeatsPointer>` (new immutable copy)

**Per-track time signature:**
- `Beats::beatsPerBar()` — 0 = "nicht erkannt", Renderer fällt auf globale Einstellung zurück
- `Beats::downbeatOffset()` — 0 = Standard-Anker
- `trySetBeatsPerBar(int)` / `trySetDownbeatOffset(int)` — Mutation-Methoden
- Bestehende Mutations preserven beide Felder

**Renderer-Fallback-Pattern:**
```cpp
const int beatsPerBar = (m_pTrackBeats && m_pTrackBeats->beatsPerBar() > 0)
        ? m_pTrackBeats->beatsPerBar()
        : m_beatsPerBar;  // globale WaveformWidgetFactory-Einstellung
```

### Protobuf Serialization

- `src/proto/beats.proto` — BeatGrid and BeatMap messages
- New fields must be `optional` for backward compatibility
- BeatGrid: `bpm`, `first_beat`, `beats_per_bar`, `downbeat_offset`
- BeatMap: `beat` (repeated), `beats_per_bar`, `downbeat_offset`
- `const_cast` on freshly-created `BeatsPointer` is safe for setting fields after construction

### Analyzer Pipeline

- `AnalyzerBeatsPlugin` base → `AnalyzerQueenMaryBeats` (QM-DSP)
- QM-DSP `DownBeat` class for time signature detection (multi-candidate bpb 3-7)
- `AnalyzerBeats::storeResults()` → `BeatFactory::makePreferredBeats()` → Track

### Track Properties Dialog

- BPM tab: `spinBeatsPerBar` QSpinBox, range 0-32, 0="Auto"
- Load: `reloadTrackBeats()`, Save: `saveTrack()` via `trySetBeatsPerBar()`
- Disabled when BPM locked

## Code Style Quick Reference

| Element | Convention |
|---|---|
| Braces | Same-line (Google style) |
| Members | `m_camelCase`, pointers `m_pCamelCase` |
| Constants | `kPascalCase` |
| Strings | `QStringLiteral("...")` |
| Enums | `enum class` only |
| Memory | `std::make_unique` / `std::make_shared` / `make_parented` |
| Guards | `#pragma once` |
| Overrides | `override` always, no redundant `virtual` |
| Signals | Direct method pointer connects preferred over lambdas |
| Formatting | `clang-format`; only format touched code |
