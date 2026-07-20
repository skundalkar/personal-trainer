export type ExerciseId =
  | 'bodyweight-squat' | 'sumo-squat' | 'lateral-lunge' | 'curtsy-lunge'
  | 'romanian-deadlift' | 'glute-bridge' | 'forearm-plank' | 'russian-twist'
  | 'push-up' | 'split-squat' | 'shoulder-press' | 'tricep-extension'

export type Exercise = {
  id: ExerciseId
  name: string
  category: string
  focus: string
  setup: string
  camera: string
  cameraSupported?: boolean
  wristFriendly?: boolean
}

export const exercises: Exercise[] = [
  { id: 'bodyweight-squat', name: 'Bodyweight squat', category: 'Lower body', focus: 'Quads, glutes, and trunk control', setup: 'Stand shoulder-width with the whole foot grounded. Let knees track with toes.', camera: 'Use a side view with your whole body in frame.', cameraSupported: true, wristFriendly: true },
  { id: 'sumo-squat', name: 'Sumo squat', category: 'Lower body', focus: 'Inner thighs, glutes, and quads', setup: 'Take a comfortable wide stance, turn toes out slightly, and lower with control.', camera: 'A side or front view with your whole body in frame.', wristFriendly: true },
  { id: 'lateral-lunge', name: 'Lateral lunge', category: 'Lower body', focus: 'Glutes, quads, and side-to-side control', setup: 'Step wide, sit into one hip, and keep the working foot grounded.', camera: 'Use a front view with your whole body in frame.', wristFriendly: true },
  { id: 'curtsy-lunge', name: 'Curtsy lunge', category: 'Lower body', focus: 'Glutes and unilateral control', setup: 'Step diagonally behind with a stable, comfortable range.', camera: 'Use a front or three-quarter view.', wristFriendly: true },
  { id: 'romanian-deadlift', name: 'Romanian deadlift', category: 'Lower body', focus: 'Hamstrings, glutes, and hip-hinge control', setup: 'Keep weights close, soften the knees, and hinge only through a comfortable range.', camera: 'Use a side view with your whole body in frame.', wristFriendly: true },
  { id: 'glute-bridge', name: 'Glute bridge', category: 'Core & lower body', focus: 'Glutes, hamstrings, and trunk control', setup: 'Lie on your back, feet grounded, then lift through your hips with a long spine.', camera: 'Use a side view with your whole body visible.', wristFriendly: true },
  { id: 'forearm-plank', name: 'Forearm plank', category: 'Core', focus: 'Trunk stability without loading the wrists', setup: 'Set your forearms under your shoulders and keep a comfortable long line through your body.', camera: 'Use a side view with your whole body in frame.', wristFriendly: true },
  { id: 'russian-twist', name: 'Russian twist', category: 'Core', focus: 'Rotational trunk control', setup: 'Sit tall, move slowly, and keep the range comfortable.', camera: 'Use a front or three-quarter view.', wristFriendly: true },
  { id: 'push-up', name: 'Push-up', category: 'Upper body', focus: 'Chest, triceps, shoulders, and trunk control', setup: 'Set a long line from head through hips to heels before each rep.', camera: 'Use a side view with your whole body in frame.', cameraSupported: true },
  { id: 'split-squat', name: 'Split squat', category: 'Lower body', focus: 'Quads and glutes with unilateral control', setup: 'Use a stable staggered stance, keep the front foot flat, and lower vertically.', camera: 'Use a side view with your whole body in frame.', cameraSupported: true, wristFriendly: true },
  { id: 'shoulder-press', name: 'Dumbbell shoulder press', category: 'Upper body', focus: 'Shoulders and triceps', setup: 'Use a light, comfortable load and press smoothly without forcing range.', camera: 'Use a front or side view.', wristFriendly: true },
  { id: 'tricep-extension', name: 'Triceps extension', category: 'Upper body', focus: 'Triceps', setup: 'Use a comfortable load and keep the upper arm steady through a pain-free range.', camera: 'Use a side view.', wristFriendly: true },
]

export const findExercise = (id: ExerciseId) => exercises.find((exercise) => exercise.id === id)!
