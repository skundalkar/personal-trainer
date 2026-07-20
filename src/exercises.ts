export type ExerciseId = 'bodyweight-squat' | 'push-up' | 'split-squat'

export type Exercise = {
  id: ExerciseId
  name: string
  focus: string
  setup: string
  camera: string
}

export const exercises: Exercise[] = [
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squat',
    focus: 'Quads, glutes, and trunk control',
    setup: 'Stand about shoulder-width. Keep the whole foot grounded and let knees track in the same direction as toes.',
    camera: 'Use a side view, with your whole body in frame.',
  },
  {
    id: 'push-up',
    name: 'Push-up',
    focus: 'Chest, triceps, shoulders, and trunk control',
    setup: 'Hands just outside shoulders. Set a long line from head through hips to heels before each rep.',
    camera: 'Use a side view, with your whole body in frame.',
  },
  {
    id: 'split-squat',
    name: 'Split squat',
    focus: 'Quads and glutes with unilateral control',
    setup: 'Adopt a stable staggered stance. Keep your front foot flat and lower straight down with a tall torso.',
    camera: 'Use a side view, with your whole body in frame.',
  },
]
