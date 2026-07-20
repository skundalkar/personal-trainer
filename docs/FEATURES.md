# Feature Set and Delivery Order

## Release 0 — Product foundation

| Feature | What it does | Why it comes first |
|---|---|---|
| Onboarding | Captures goals, equipment, time, experience, restrictions, and coaching tone | Makes every later recommendation useful and personal |
| Goal selector | Lets the user choose a body area and training goal | Provides a simple, user-led entry point |
| Exercise catalog | Stores target areas, equipment, progression options, and alternatives | Creates the explainable recommendation base |
| Recommendation explanation | Shows “why this today” and key trade-offs | Builds trust and avoids black-box coaching |
| Preference signals | Like, dislike, complete, skip, difficult, and discomfort flags | Lets the system learn adherence instead of guessing |

## Release 1 — Camera coaching MVP

| Feature | Scope |
|---|---|
| Camera calibration | Full-body framing, side/front view instructions, lighting and landmark quality gate |
| Exercise rule packs | Start with squat, push-up, and split squat; version each rule pack and its validation evidence |
| Live cues | Short stance, posture, range, and tempo prompts only when landmarks are sufficiently confident |
| Feedback summary | Show what was detected, confidence limitations, and suggested next practice step |

## Release 2 — Motivation and music

| Feature | Scope |
|---|---|
| Coaching voice | Gentle, energetic, concise, or quiet; all avoid shame or pressure |
| Adaptive encouragement | Recognizes completion, return after a break, and effort; never comments on appearance |
| Optional reminders | User-controlled schedule and opt-out, with a supportive reason to return |
| Music preferences | Workout mood, preferred genres, and explicit playlist selection |
| Spotify connection | Optional OAuth connection and user-initiated playlist/playback handoff |
| YouTube option | Recommendation or deep-link only until an approved API/policy design is complete |

## The recommendation model

`fit = target match + goal match + equipment fit + time fit + progression potential + preference/adherence + coaching confidence`

Each factor must be shown in plain language. For example: “Split squats are recommended because you selected lower body, have no equipment, completed them twice, rated them highly, and have enough time for a unilateral movement.”
