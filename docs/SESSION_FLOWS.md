# Session and Persona Flows

## Start small and build momentum

```mermaid
flowchart TD
  A[Open app] --> B{Ready for a full session?}
  B -- Yes --> C[Show ready-to-start Today list]
  B -- Not today --> D[Start one five-minute movement]
  D --> E{User chooses to continue?}
  E -- Yes --> F[Add a small, explained extension]
  E -- No --> G[Celebrate completion and save explicit feedback]
  F --> H[Continue through Today list]
  C --> H
  H --> I[Finish or change remaining plan]
```

## Replace an exercise

```mermaid
flowchart TD
  A[Today list item] --> B[Replace]
  B --> C{Reason selected or quick swap?}
  C --> D[Filter compatible alternatives]
  D --> E[Show target, equipment, complexity, and trade-off]
  E --> F[User selects substitute]
  F --> G[Update remaining session and preference signals]
  C -. pain or discomfort .-> H[Show stop-for-pain guidance; no diagnosis]
```

## Persona journeys

| Persona | Lowest-friction entry | Helpful guidance | Control retained |
| --- | --- | --- | --- |
| Maya, consistency seeker | Five-minute start | Gentle invitation to extend | Stop counts as success; reminders optional |
| Jordan, gym learner | Explained Today list | Set-up, alternatives, camera calibration | Camera is opt-in and confidence-gated |
| Alex, time-constrained | Saved defaults | Compact session and progression note | One-tap start with live pacing changes |
