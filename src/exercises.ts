export type ExerciseId = string
export type GuideSheet = 'lower' | 'posterior' | 'core' | 'upper'
export type ExerciseVisual = { sheet: GuideSheet; slot: number }

export type Exercise = {
  id: ExerciseId
  name: string
  category: string
  focus: string
  setup: string
  camera: string
  visual: ExerciseVisual
  cameraSupported?: boolean
  wristFriendly?: boolean
}

const exercise = (id: string, name: string, category: string, focus: string, setup: string, sheet: GuideSheet, slot: number, cameraSupported = false, wristFriendly = true): Exercise => ({ id, name, category, focus, setup, camera: 'Use a side view with your whole body in frame.', visual: { sheet, slot }, cameraSupported, wristFriendly })

export const exercises: Exercise[] = [
  exercise('bodyweight-squat', 'Bodyweight squat', 'Lower body', 'Quads, glutes, and trunk control', 'Stand shoulder-width with the whole foot grounded. Let knees track with toes.', 'lower', 0, true),
  exercise('sumo-squat', 'Sumo squat', 'Lower body', 'Inner thighs, glutes, and quads', 'Take a comfortable wide stance, turn toes out slightly, and lower with control.', 'lower', 1),
  exercise('split-squat', 'Split squat', 'Lower body', 'Quads and glutes with unilateral control', 'Use a stable staggered stance, keep the front foot flat, and lower vertically.', 'lower', 2, true),
  exercise('reverse-lunge', 'Reverse lunge', 'Lower body', 'Quads, glutes, and balance', 'Step back softly and lower with a tall torso.', 'lower', 3),
  exercise('lateral-lunge', 'Lateral lunge', 'Lower body', 'Glutes, quads, and side-to-side control', 'Step wide, sit into one hip, and keep the working foot grounded.', 'lower', 4),
  exercise('curtsy-lunge', 'Curtsy lunge', 'Lower body', 'Glutes and unilateral control', 'Step diagonally behind with a stable, comfortable range.', 'lower', 5),
  exercise('step-up', 'Step-up', 'Lower body', 'Quads, glutes, and single-leg control', 'Use a stable low platform and drive through the whole working foot.', 'lower', 6),
  exercise('wall-sit', 'Wall sit', 'Lower body', 'Quads and trunk endurance', 'Keep your back supported and choose a knee angle that feels comfortable.', 'lower', 7),
  exercise('goblet-squat', 'Goblet squat', 'Lower body', 'Quads, glutes, and trunk control', 'Hold one dumbbell close to your chest and keep the whole foot grounded.', 'lower', 8),
  exercise('romanian-deadlift', 'Romanian deadlift', 'Hamstrings & glutes', 'Hamstrings, glutes, and hip-hinge control', 'Keep weights close, soften the knees, and hinge only through a comfortable range.', 'posterior', 0),
  exercise('single-leg-rdl', 'Single-leg RDL', 'Hamstrings & glutes', 'Hamstrings, glutes, and balance', 'Reach the free leg back and keep hips square as you hinge.', 'posterior', 1),
  exercise('kickstand-rdl', 'Kickstand RDL', 'Hamstrings & glutes', 'Hamstrings and glutes with balance support', 'Keep most weight on the front foot while the back toes offer light balance.', 'posterior', 2),
  exercise('glute-bridge', 'Glute bridge', 'Hamstrings & glutes', 'Glutes, hamstrings, and trunk control', 'Lie on your back, feet grounded, then lift through your hips with a long spine.', 'posterior', 3),
  exercise('hip-thrust', 'Dumbbell hip thrust', 'Hamstrings & glutes', 'Glutes and hamstrings', 'Use a stable support and lift through the hips with a comfortable range.', 'posterior', 4),
  exercise('dumbbell-leg-curl', 'Dumbbell leg curl', 'Hamstrings & glutes', 'Hamstrings and glutes', 'Lie face down and curl a light dumbbell only through a comfortable range.', 'posterior', 5),
  exercise('back-extension', 'Back extension', 'Hamstrings & glutes', 'Glutes, hamstrings, and back extensor endurance', 'Use a stable bench and move slowly through a comfortable range.', 'posterior', 6),
  exercise('calf-raise', 'Standing calf raise', 'Lower body', 'Calves and ankle control', 'Rise through the balls of your feet and lower with control.', 'posterior', 7),
  exercise('bulgarian-split-squat', 'Bulgarian split squat', 'Lower body', 'Quads, glutes, and balance', 'Use a low stable support and keep the front foot grounded.', 'posterior', 8),
  exercise('forearm-plank', 'Forearm plank', 'Core', 'Trunk stability without loading the wrists', 'Set your forearms under your shoulders and keep a comfortable long line through your body.', 'core', 0),
  exercise('russian-twist', 'Russian twist', 'Core', 'Rotational trunk control', 'Sit tall, move slowly, and keep the range comfortable.', 'core', 1),
  exercise('dead-bug', 'Dead bug', 'Core', 'Deep core control and coordination', 'Keep your back comfortable against the floor as you extend opposite limbs.', 'core', 2),
  exercise('side-plank', 'Side forearm plank', 'Core', 'Obliques and lateral trunk stability', 'Support yourself on a forearm and keep a long, comfortable line through your body.', 'core', 3),
  exercise('reverse-crunch', 'Reverse crunch', 'Core', 'Lower-abdominal control', 'Move slowly and keep the range comfortable rather than swinging your legs.', 'core', 4),
  exercise('hollow-hold', 'Hollow hold', 'Core', 'Anterior core endurance', 'Keep a gentle lower-back contact with the floor and bend knees if needed.', 'core', 5),
  exercise('bird-dog', 'Bird dog', 'Core', 'Core stability and coordination', 'Reach opposite arm and leg long while keeping the torso steady.', 'core', 6),
  exercise('seated-knee-tuck', 'Seated knee tuck', 'Core', 'Lower abs and hip flexors', 'Sit tall and move knees in with control.', 'core', 7),
  exercise('mountain-climber', 'Mountain climber', 'Core', 'Core endurance and hip flexor control', 'Keep shoulders steady over hands and drive one knee at a time.', 'core', 8, false, false),
  exercise('push-up', 'Push-up', 'Upper body', 'Chest, triceps, shoulders, and trunk control', 'Set a long line from head through hips to heels before each rep.', 'upper', 0, true, false),
  exercise('incline-push-up', 'Incline push-up', 'Upper body', 'Chest, shoulders, and triceps', 'Use a stable elevated surface and keep a long line through your body.', 'upper', 1, false, false),
  exercise('shoulder-press', 'Dumbbell shoulder press', 'Upper body', 'Shoulders and triceps', 'Use a light, comfortable load and press smoothly without forcing range.', 'upper', 2),
  exercise('tricep-extension', 'Triceps extension', 'Upper body', 'Triceps', 'Use a comfortable load and keep the upper arm steady through a pain-free range.', 'upper', 3),
  exercise('floor-press', 'Dumbbell floor press', 'Upper body', 'Chest and triceps', 'Lie with upper arms supported by the floor and press a comfortable load smoothly.', 'upper', 4),
  exercise('lateral-raise', 'Dumbbell lateral raise', 'Upper body', 'Side shoulders', 'Lift light dumbbells with a soft elbow and keep the range comfortable.', 'upper', 5),
  exercise('bent-over-row', 'Bent-over dumbbell row', 'Upper body', 'Upper back and rhomboids', 'Hinge comfortably and draw elbows back without shrugging.', 'upper', 6),
  exercise('hammer-curl', 'Hammer curl', 'Upper body', 'Biceps and forearms', 'Keep elbows near your sides and move the dumbbells smoothly.', 'upper', 7),
  exercise('front-raise', 'Dumbbell front raise', 'Upper body', 'Front shoulders', 'Lift light dumbbells smoothly to shoulder height, then lower with control.', 'upper', 8),
]

export const findExercise = (id: ExerciseId) => exercises.find((item) => item.id === id)!
