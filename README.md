# Formwise — Fitness Form Coach MVP

A privacy-first browser prototype for camera-based exercise setup and form cues. It uses MediaPipe Pose Landmarker in the browser to find visible body landmarks; it does not upload, save, or identify video.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL over `localhost`, grant camera access, choose an exercise, and use a side view with your full body visible.

## Current scope

- Bodyweight squat, push-up, and split-squat exercise setup
- Live 2D pose overlay
- Lightweight, explainable landmark rules for basic cues
- No account, recording, cloud upload, biometric identification, or health-data storage

## Important limits

This is not a diagnosis, medical device, personal trainer replacement, or guarantee of safe technique. Camera-only 2D landmarks cannot reliably evaluate joint rotation, load tolerance, pain, mobility limitations, depth, or injury risk. Stop if pain occurs.

## Next product milestones

1. Calibrated side/front camera setup and landmark-quality gate
2. Rep segmentation, range-of-motion trend, and confidence score
3. More exercise rule packs, each reviewed by a qualified strength-and-conditioning professional
4. Optional session history stored locally by default, with user-controlled export
5. Validation protocol: diverse participants, lighting/camera variation, expert-labelled form clips, false-positive/false-negative reporting, and human-in-the-loop review

## Architecture

`camera → MediaPipe pose landmarks → exercise rule pack → cue UI`

The form engine is intentionally separate from camera/model code so each exercise can gain a versioned, testable rule pack and evidence record before it is presented as coaching.
