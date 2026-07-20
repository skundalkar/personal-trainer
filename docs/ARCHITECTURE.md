# Architecture

```mermaid
flowchart LR
  U[User] --> UI[React browser UI]
  UI --> S[Session builder]
  UI --> P[Today list]
  S --> R[Explainable fit model]
  P --> R
  R --> C[Exercise catalog and alternatives]
  UI --> L[(Local browser storage)]
  L --> S
  L --> R
  UI --> CAM[Opt-in camera]
  CAM --> MP[MediaPipe Pose Landmarker]
  MP --> RP[Versioned rule pack]
  RP --> UI
  CAM -. never recorded or uploaded .-> UI
```

The browser owns all user-entered preferences, session history, and camera processing by default. Camera frames stay on-device; the coaching engine produces only short, confidence-aware cues.

## Recommendation path

```mermaid
flowchart TD
  A[Goal and target area] --> F[Fit factors]
  B[Equipment and available time] --> F
  C[Explicit restrictions and exclusions] --> F
  D[Likes, completions, skips, replacements] --> F
  E[Progression and camera-coaching confidence] --> F
  F --> X[Three explained options]
  X --> Y[Today session plan]
  Y --> Z[Live changes become explicit signals]
```

Fit is a personal, transparent decision aid—not a medical assessment or universal exercise ranking.
