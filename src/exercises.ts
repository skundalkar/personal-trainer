export type ExerciseId = string

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
  { id: 'reverse-lunge', name: 'Reverse lunge', category: 'Quads & glutes', focus: 'Quads, glutes, and balance', setup: 'Step back softly and lower with a tall torso.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'step-up', name: 'Step-up', category: 'Quads & glutes', focus: 'Quads, glutes, and single-leg control', setup: 'Use a stable low platform and drive through the whole working foot.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'wall-sit', name: 'Wall sit', category: 'Quads', focus: 'Quads and trunk endurance', setup: 'Keep your back supported and choose a knee angle that feels comfortable.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'goblet-squat', name: 'Goblet squat', category: 'Quads & glutes', focus: 'Quads, glutes, and trunk control', setup: 'Hold one dumbbell close to your chest and keep the whole foot grounded.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'good-morning', name: 'Good morning', category: 'Hamstrings & glutes', focus: 'Hamstrings, glutes, and hip-hinge control', setup: 'Keep a soft knee and hinge through a comfortable range.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'single-leg-rdl', name: 'Single-leg RDL', category: 'Hamstrings & glutes', focus: 'Hamstrings, glutes, and balance', setup: 'Reach the free leg back and keep hips square as you hinge.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'hamstring-walkout', name: 'Hamstring walkout', category: 'Hamstrings & glutes', focus: 'Hamstrings and glutes', setup: 'Start from a bridge and slowly walk your heels away, only as far as control allows.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'hip-thrust', name: 'Hip thrust', category: 'Hamstrings & glutes', focus: 'Glutes and hamstrings', setup: 'Use a stable support and lift through the hips with a comfortable range.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'sliding-leg-curl', name: 'Sliding leg curl', category: 'Hamstrings & glutes', focus: 'Hamstrings and glutes', setup: 'From a bridge, slowly slide your heels away and back with control.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'kickstand-rdl', name: 'Kickstand RDL', category: 'Hamstrings & glutes', focus: 'Hamstrings, glutes, and balance support', setup: 'Keep most weight on the front foot while the back toes offer light balance.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'dead-bug', name: 'Dead bug', category: 'Core', focus: 'Deep core control and coordination', setup: 'Keep your back comfortable against the floor as you extend opposite limbs.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'side-plank', name: 'Side forearm plank', category: 'Core', focus: 'Obliques and lateral trunk stability', setup: 'Support yourself on a forearm and keep a long, comfortable line through your body.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'reverse-crunch', name: 'Reverse crunch', category: 'Core', focus: 'Lower-abdominal control', setup: 'Move slowly and keep the range comfortable rather than swinging your legs.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'hollow-hold', name: 'Hollow hold', category: 'Core', focus: 'Anterior core endurance', setup: 'Keep a gentle lower-back contact with the floor and bend knees if needed.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'bird-dog', name: 'Bird dog', category: 'Core', focus: 'Core stability and coordination', setup: 'Reach opposite arm and leg long while keeping the torso steady.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'seated-knee-tuck', name: 'Seated knee tuck', category: 'Core', focus: 'Lower abs and hip flexors', setup: 'Sit tall and move knees in with control.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'floor-press', name: 'Dumbbell floor press', category: 'Upper body', focus: 'Chest and triceps', setup: 'Lie with upper arms supported by the floor and press a comfortable load smoothly.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'lateral-raise', name: 'Dumbbell lateral raise', category: 'Upper body', focus: 'Side shoulders', setup: 'Lift light dumbbells with a soft elbow and keep the range comfortable.', camera: 'Use a front view.', wristFriendly: true },
  { id: 'bent-over-row', name: 'Bent-over dumbbell row', category: 'Upper body', focus: 'Upper back and rhomboids', setup: 'Hinge comfortably and draw elbows back without shrugging.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'hammer-curl', name: 'Hammer curl', category: 'Upper body', focus: 'Biceps and forearms', setup: 'Keep elbows near your sides and move the dumbbells smoothly.', camera: 'Use a side view.', wristFriendly: true },
  { id: 'incline-push-up', name: 'Incline push-up', category: 'Upper body', focus: 'Chest, shoulders, and triceps', setup: 'Use a stable elevated surface and keep a long line through your body.', camera: 'Use a side view.', wristFriendly: true },
]

export const findExercise = (id: ExerciseId) => exercises.find((exercise) => exercise.id === id)!
