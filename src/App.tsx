import { DrawingUtils, FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import { coach, type Cue } from './formEngine'
import { exercises, type ExerciseId } from './exercises'

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export default function App() {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const landmarker = useRef<PoseLandmarker | null>(null)
  const frame = useRef<number | null>(null)
  const [exerciseId, setExerciseId] = useState<ExerciseId>('bodyweight-squat')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Choose an exercise, position your camera, then start the coach.')
  const [cues, setCues] = useState<Cue[]>([])
  const exercise = exercises.find((item) => item.id === exerciseId)!

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current)
    video.current?.srcObject && (video.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
    setRunning(false)
    setCues([])
    setStatus('Camera stopped. No video is uploaded or stored by this app.')
  }

  useEffect(() => () => stop(), [])

  async function start() {
    try {
      setLoading(true)
      setStatus('Requesting camera access…')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      video.current!.srcObject = stream
      await video.current!.play()
      if (!landmarker.current) {
        setStatus('Loading the on-device pose model…')
        const vision = await FilesetResolver.forVisionTasks(WASM)
        landmarker.current = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL }, runningMode: 'VIDEO', numPoses: 1 })
      }
      setRunning(true)
      setStatus('Live coaching is running on this device.')
      tick()
    } catch (error) {
      setStatus(`Could not start the camera: ${error instanceof Error ? error.message : 'unknown error'}`)
    } finally { setLoading(false) }
  }

  function tick() {
    const camera = video.current, overlay = canvas.current, detector = landmarker.current
    if (!camera || !overlay || !detector || camera.readyState < 2) { frame.current = requestAnimationFrame(tick); return }
    overlay.width = camera.videoWidth; overlay.height = camera.videoHeight
    const result = detector.detectForVideo(camera, performance.now())
    const context = overlay.getContext('2d')!
    context.clearRect(0, 0, overlay.width, overlay.height)
    const draw = new DrawingUtils(context)
    const points = result.landmarks[0]
    if (points) {
      draw.drawConnectors(points, PoseLandmarker.POSE_CONNECTIONS, { color: '#79f3c0', lineWidth: 4 })
      draw.drawLandmarks(points, { color: '#f9dc68', radius: 4 })
      setCues(coach(exerciseId, points))
    } else setCues([{ level: 'setup', text: 'I cannot see a full body yet. Move back and improve lighting.' }])
    frame.current = requestAnimationFrame(tick)
  }

  return <main>
    <header><span className="brand">FORMWISE</span><span className="tag">private camera coaching · MVP</span></header>
    <section className="hero"><div><p className="eyebrow">TRAIN WITH FEEDBACK</p><h1>Move with a clearer point of view.</h1><p className="lede">A browser-based prototype for live form cues, exercise setup, and safer progression prompts.</p></div><div className="privacy">🔒 <strong>On-device by design</strong><br />Video stays in your browser. This app does not upload or retain camera footage.</div></section>
    <section className="workspace">
      <div className="stage"><video ref={video} playsInline muted /><canvas ref={canvas} aria-label="Pose overlay" />{!running && <div className="empty">Camera preview will appear here</div>}</div>
      <aside>
        <label>Exercise<select value={exerciseId} onChange={(event) => setExerciseId(event.target.value as ExerciseId)} disabled={running}>{exercises.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <div className="card"><h2>{exercise.name}</h2><p><b>Focus</b><br />{exercise.focus}</p><p><b>Set-up</b><br />{exercise.setup}</p><p><b>Camera</b><br />{exercise.camera}</p></div>
        <button onClick={running ? stop : start} disabled={loading}>{loading ? 'Starting…' : running ? 'Stop camera' : 'Start live coach'}</button>
        <p className="status">{status}</p>
      </aside>
    </section>
    <section className="feedback"><div><p className="eyebrow">LIVE CUES</p><h2>What the coach sees</h2></div><div className="cue-list">{cues.length ? cues.map((cue, index) => <p key={index} className={`cue ${cue.level}`}><span>{cue.level === 'good' ? '✓' : cue.level === 'attention' ? '!' : '→'}</span>{cue.text}</p>) : <p className="cue setup"><span>→</span>Start the camera to receive landmark-based setup and form cues.</p>}</div></section>
    <footer>Not medical advice. The MVP estimates visible body landmarks only; it cannot diagnose injury, assess load tolerance, or guarantee safe form.</footer>
  </main>
}
