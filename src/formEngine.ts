import type { ExerciseId } from './exercises'

export type Point = { x: number; y: number; visibility?: number }
export type Cue = { level: 'good' | 'attention' | 'setup'; text: string }

// BlazePose landmark indexes. This MVP uses 2D geometry only, so it gives coaching
// prompts—not a diagnosis or a clearance to train through pain.
const L = { leftShoulder: 11, rightShoulder: 12, leftHip: 23, rightHip: 24, leftKnee: 25, rightKnee: 26, leftAnkle: 27, rightAnkle: 28 }

const angle = (a: Point, b: Point, c: Point) => {
  const ab = Math.atan2(a.y - b.y, a.x - b.x)
  const cb = Math.atan2(c.y - b.y, c.x - b.x)
  let result = Math.abs((ab - cb) * 180 / Math.PI)
  return result > 180 ? 360 - result : result
}

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
const visible = (points: Point[]) => points.every((point) => (point.visibility ?? 1) > .55)

export function coach(exercise: ExerciseId, points: Point[]): Cue[] {
  if (!points.length || !visible([points[L.leftShoulder], points[L.rightShoulder], points[L.leftHip], points[L.rightHip]])) {
    return [{ level: 'setup', text: 'Step back until your shoulders, hips, knees, and ankles are visible.' }]
  }
  const shoulder = midpoint(points[L.leftShoulder], points[L.rightShoulder])
  const hip = midpoint(points[L.leftHip], points[L.rightHip])
  const leftKnee = angle(points[L.leftHip], points[L.leftKnee], points[L.leftAnkle])
  const rightKnee = angle(points[L.rightHip], points[L.rightKnee], points[L.rightAnkle])
  const cues: Cue[] = []

  if (exercise === 'bodyweight-squat') {
    const knee = Math.min(leftKnee, rightKnee)
    if (knee > 155) cues.push({ level: 'setup', text: 'Begin a controlled descent. Keep your weight balanced across the whole foot.' })
    else if (knee > 105) cues.push({ level: 'attention', text: 'Continue only as far as you can keep your trunk controlled and feet grounded.' })
    else cues.push({ level: 'good', text: 'Depth detected. Drive through the floor and keep knees tracking with toes.' })
  }

  if (exercise === 'push-up') {
    const torso = Math.abs(shoulder.y - hip.y)
    if (torso > .14) cues.push({ level: 'attention', text: 'Brace your midline: aim for a straighter head-to-heel line.' })
    else cues.push({ level: 'good', text: 'Your torso line looks steady. Lower with control and keep elbows comfortable.' })
  }

  if (exercise === 'split-squat') {
    const knee = Math.min(leftKnee, rightKnee)
    if (knee > 155) cues.push({ level: 'setup', text: 'Use a longer, stable stance before lowering. Keep your front foot fully planted.' })
    else cues.push({ level: 'good', text: 'Lower vertically with a tall torso. Keep pressure centered over your front foot.' })
  }

  cues.push({ level: 'setup', text: 'If you feel pain, stop. This camera estimate cannot assess injury risk or replace a qualified coach.' })
  return cues
}
