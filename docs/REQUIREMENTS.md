# Personal Trainer — Product Requirements

## Product statement

Personal Trainer helps people choose exercises they are likely to perform consistently, understand why each exercise fits their goal, and receive supportive camera-based form guidance for a small, validated exercise set.

## Users and jobs

The primary user is a person who wants useful exercise direction without an intimidating gym-program experience. They need to choose a body area and goal, receive equipment-appropriate options, learn from prior preference and completion data, and feel encouraged rather than judged.

## Functional requirements

### 1. Profile and constraints

- Collect goals, experience level, available equipment, time, preferred training styles, and voluntary exercise restrictions.
- Let the person update or delete any profile field.
- Never infer health status, injury, or ability from camera footage.

### 2. Personalized recommendations

- Accept a target area: lower body, upper body, chest, back, shoulders, biceps, triceps, core, or full body.
- Consider goal, available equipment, session duration, stated restrictions, previous completion, explicit ratings, and skips.
- Present an explanation for every recommendation.
- Offer alternatives with a concise comparison of target muscles, equipment, complexity, and trade-offs.

### 3. Exercise efficiency

- Calculate a transparent fit score—not a universal “best exercise” score.
- Show the factors: target-muscle match, goal match, equipment fit, time fit, progression potential, personal adherence, and camera-coaching confidence.
- Do not claim clinical, medical, or guaranteed outcomes.

### 4. Form coaching

- Start with a limited set of bodyweight exercises that have dedicated, reviewed rule packs.
- Show camera framing/setup instructions before analysis.
- Show confidence-aware cues; when visibility is poor, request a better view rather than giving form advice.
- Give short, actionable, non-shaming cues and a clear stop-for-pain message.

### 5. Motivation and return engagement

- Celebrate effort, consistency, and self-reported improvement rather than weight, body size, or punishment.
- Allow tone selection: gentle, energetic, concise, or quiet.
- Provide an optional check-in/reminder schedule. Never use guilt, streak-loss threats, or manipulative urgency.
- Surface a supportive “welcome back” message informed by the user’s stated goal and recent history.

### 6. Music

- Let users select a training mood and optionally connect a Spotify account for playback control.
- Offer a browser-safe fallback: user-selected playlists or links; do not scrape or rehost copyrighted music.
- Treat YouTube as a link-out/recommendation destination unless an approved API and playback policy are implemented.
- Music integrations are optional and must continue working when disconnected.

### 7. Privacy and safety

- Process camera video locally by default and never record by default.
- Store only data the user chooses to retain; provide delete/export controls.
- Clearly distinguish general fitness guidance from medical advice and injury assessment.

## Acceptance criteria for the first usable release

- A user can complete onboarding and choose a goal/body area/equipment/time.
- The app returns three ranked recommendations and explains each ranking.
- The user can like, dislike, complete, or skip an exercise and receives a revised next-session recommendation.
- The app provides supportive encouragement that respects the selected tone.
- The user can launch camera coaching for one supported exercise and sees a clear calibration state.

## Non-goals for release 1

- Diagnosing pain or injury
- Autonomous training-plan changes without an explanation
- Guaranteed muscle-growth or injury-prevention claims
- Advanced barbell or Olympic-lifting evaluation
- Mandatory accounts, cloud video processing, or social ranking
