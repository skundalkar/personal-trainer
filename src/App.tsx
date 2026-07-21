import { DrawingUtils, FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useEffect, useMemo, useRef, useState } from 'react'
import { coach, type Cue } from './formEngine'
import { exercises, findExercise, type ExerciseId } from './exercises'
import exerciseGuide from './assets/exercise-guide.png'
import lungeGuide from './assets/lunge-guide.png'

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
type Pace = { work: number; rest: number; rounds: number }
type SessionItem = { id: ExerciseId; reason: string; completed?: boolean }
const defaultPace: Pace = { work: 45, rest: 45, rounds: 4 }
const defaultQueue: SessionItem[] = [
  { id: 'sumo-squat', reason: 'Matches your squat preference and no-equipment setup.' },
  { id: 'romanian-deadlift', reason: 'Builds your preferred hip-hinge work with a clear progression.' },
  { id: 'glute-bridge', reason: 'Adds lower-body work without loading through your wrists.' },
  { id: 'forearm-plank', reason: 'Builds core stability while staying wrist-friendly.' },
  { id: 'shoulder-press', reason: 'Uses your preferred overhead dumbbell movement.' },
  { id: 'tricep-extension', reason: 'Adds a floor or standing triceps option with simple setup.' },
]
const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function App() {
  const saved = typeof window === 'undefined' ? null : localStorage.getItem('formwise-pace')
  const [pace, setPace] = useState<Pace>(saved ? JSON.parse(saved) : defaultPace)
  const [queue, setQueue] = useState<SessionItem[]>(defaultQueue)
  const [screen, setScreen] = useState<'today' | 'active'>('today')
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [sessionRounds, setSessionRounds] = useState(pace.rounds)
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [seconds, setSeconds] = useState(pace.work)
  const [paused, setPaused] = useState(false)
  const [momentum, setMomentum] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showPace, setShowPace] = useState(false)
  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [swapReason, setSwapReason] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraStatus, setCameraStatus] = useState('Camera coaching is optional and processed on this device.')
  const [cues, setCues] = useState<Cue[]>([])
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const landmarker = useRef<PoseLandmarker | null>(null)
  const frame = useRef<number | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const current = queue[index]
  const currentExercise = current ? findExercise(current.id) : null
  const estimatedMinutes = Math.round(queue.length * pace.rounds * (pace.work + pace.rest) / 60)
  const alternatives = useMemo(() => {
    if (swapIndex === null) return []
    const source = queue[swapIndex]
    const filtered = exercises.filter((exercise) => exercise.id !== source.id && (swapReason === 'Wrist discomfort' ? exercise.wristFriendly : true))
    return filtered.slice(0, 3)
  }, [queue, swapIndex, swapReason])

  useEffect(() => {
    if (screen !== 'active' || paused || finished) return
    const timer = window.setInterval(() => { playTone(520, .035); setSeconds((value) => value - 1) }, 1000)
    return () => window.clearInterval(timer)
  }, [screen, paused, finished])

  useEffect(() => {
    if (seconds >= 0 || finished) return
    if (phase === 'work') { playPattern('rest'); setPhase('rest'); setSeconds(pace.rest); return }
    if (round < sessionRounds) { playPattern('work'); setRound((value) => value + 1); setPhase('work'); setSeconds(pace.work); return }
    const nextIndex = index + 1
    if (nextIndex < queue.length && !momentum) {
      playPattern('next')
      setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: true } : item))
      setIndex(nextIndex); setRound(1); setPhase('work'); setSeconds(pace.work)
    } else {
      playPattern('complete')
      setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: true } : item))
      setFinished(true); setPaused(true)
    }
  }, [seconds, phase, round, sessionRounds, pace, index, queue.length, momentum, finished])

  useEffect(() => () => stopCamera(), [])

  function begin(startSmall = false) {
    prepareAudio(); playPattern('start')
    setMomentum(startSmall)
    setQueue((items) => startSmall ? [{ ...items[0], completed: false }] : items.map((item) => ({ ...item, completed: false })))
    setIndex(0); setRound(1); setSessionRounds(startSmall ? 3 : pace.rounds); setPhase('work'); setSeconds(pace.work); setFinished(false); setPaused(false); setScreen('active')
  }
  function useCameraGuidedSquat() {
    setQueue((items) => items.map((item, itemIndex) => itemIndex === 0 ? { id: 'bodyweight-squat', reason: 'Selected for camera-supported setup and landmark-based squat cues.' } : item))
  }
  function prepareAudio() {
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Audio) return
    if (!audioContext.current) audioContext.current = new Audio()
    if (audioContext.current.state === 'suspended') void audioContext.current.resume()
  }
  function playTone(frequency: number, duration = .09, delay = 0) {
    const context = audioContext.current
    if (!context) return
    const oscillator = context.createOscillator(), gain = context.createGain()
    oscillator.type = 'sine'; oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.0001, context.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(.055, context.currentTime + delay + .01)
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + delay + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + duration + .02)
  }
  function playPattern(signal: 'start' | 'work' | 'rest' | 'next' | 'complete') {
    if (!audioContext.current) return
    if (signal === 'rest') playTone(300, .16)
    if (signal === 'work') { playTone(620, .1); playTone(780, .12, .14) }
    if (signal === 'next') { playTone(520, .1); playTone(700, .12, .14) }
    if (signal === 'start') { playTone(620, .1); playTone(780, .1, .14); playTone(940, .14, .28) }
    if (signal === 'complete') { playTone(520, .1); playTone(660, .1, .14); playTone(880, .18, .28) }
  }
  function skipCurrent() {
    if (index === queue.length - 1) { setFinished(true); setPaused(true); return }
    setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: true } : item))
    setIndex((value) => value + 1); setRound(1); setPhase('work'); setSeconds(pace.work)
  }
  function applyPace(next: Pace, save = false) {
    setPace(next)
    setSessionRounds(next.rounds)
    if (screen === 'active') setSeconds(phase === 'work' ? next.work : next.rest)
    if (save) localStorage.setItem('formwise-pace', JSON.stringify(next))
    setShowPace(false)
  }
  function replace(exercise: ExerciseId) {
    if (swapIndex === null) return
    const chosen = findExercise(exercise)
    setQueue((items) => items.map((item, itemIndex) => itemIndex === swapIndex ? {
      ...item, id: exercise,
      reason: swapReason === 'Wrist discomfort' ? `${chosen.name} avoids loading through your hands. Trade-off: it shifts the training focus.` : `A compatible alternative for today’s plan.`,
    } : item))
    setSwapIndex(null); setSwapReason('')
  }
  async function startCamera() {
    try {
      setLoading(true); setCameraStatus('Requesting camera access…')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      video.current!.srcObject = stream; await video.current!.play()
      if (!landmarker.current) {
        setCameraStatus('Loading the on-device pose model…')
        const vision = await FilesetResolver.forVisionTasks(WASM)
        landmarker.current = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL }, runningMode: 'VIDEO', numPoses: 1 })
      }
      setCameraOpen(true); setCameraStatus('Live coaching is running on this device.'); tick()
    } catch (error) { setCameraStatus(`Could not start the camera: ${error instanceof Error ? error.message : 'unknown error'}`) }
    finally { setLoading(false) }
  }
  function stopCamera() {
    if (frame.current) cancelAnimationFrame(frame.current)
    if (video.current?.srcObject) (video.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
    setCameraOpen(false); setCues([])
  }
  function tick() {
    const camera = video.current, overlay = canvas.current, detector = landmarker.current
    if (!camera || !overlay || !detector || camera.readyState < 2) { frame.current = requestAnimationFrame(tick); return }
    overlay.width = camera.videoWidth; overlay.height = camera.videoHeight
    const result = detector.detectForVideo(camera, performance.now()), context = overlay.getContext('2d')!
    context.clearRect(0, 0, overlay.width, overlay.height)
    const points = result.landmarks[0]
    if (points && currentExercise) {
      const draw = new DrawingUtils(context)
      draw.drawConnectors(points, PoseLandmarker.POSE_CONNECTIONS, { color: '#63e6be', lineWidth: 4 })
      draw.drawLandmarks(points, { color: '#ffcc75', radius: 4 })
      setCues(coach(currentExercise.id, points))
    } else setCues([{ level: 'setup', text: 'Move back until your full body is visible.' }])
    frame.current = requestAnimationFrame(tick)
  }

  if (screen === 'active' && currentExercise) return <main className="app-shell active-shell">
    <header><span className="brand">FORMWISE</span><span className="privacy-badge">Private on this device</span></header>
    <section className="active-session" aria-live="polite">
      <div className="active-top"><span>Exercise {index + 1} of {queue.length}</span><button className="text-button" onClick={() => { stopCamera(); setScreen('today'); setPaused(true) }}>Exit session</button></div>
      {finished ? <div className="finish-card"><p className="eyebrow">SESSION COMPLETE</p><h1>{momentum ? 'You started. That matters.' : 'Great work today.'}</h1><p>{momentum ? 'Want to build on your five-minute start?' : 'Your completed exercises will inform your next recommendation.'}</p>{momentum && <button onClick={() => { setMomentum(false); setQueue(defaultQueue); setIndex(0); setRound(1); setSessionRounds(pace.rounds); setPhase('work'); setSeconds(pace.work); setFinished(false); setPaused(false) }}>Continue with today’s plan</button>}<button className="secondary" onClick={() => setScreen('today')}>Finish here</button></div> : <>
        <div className="round-visual" aria-label={`Round ${round} of ${sessionRounds}`}><div><span>ROUND</span><strong>{round} <i>of</i> {sessionRounds}</strong></div><ol className="round-track">{Array.from({ length: sessionRounds }, (_, roundIndex) => <li key={roundIndex} className={roundIndex + 1 < round ? 'completed' : roundIndex + 1 === round ? 'current' : ''} aria-label={`Round ${roundIndex + 1}${roundIndex + 1 === round ? ', current' : roundIndex + 1 < round ? ', complete' : ', upcoming'}`}>{roundIndex + 1}</li>)}</ol></div>
        <div className={`timer-stage ${phase}`}><p className={`phase ${phase}`}>{phase === 'work' ? 'Work interval' : 'Rest interval'}</p><div className="timer">{format(Math.max(0, seconds))}</div><p className="timer-note">{phase === 'work' ? 'A low tick marks each second. A rising tone starts your next work block.' : 'Rest. A bright double tone tells you when work resumes.'}</p></div>
        <h1>{currentExercise.name}</h1><p className="setup-copy">{currentExercise.setup}</p>
        <button onClick={() => setPaused((value) => !value)}>{paused ? 'Resume' : 'Pause'}</button>
        <div className="active-actions"><button className="secondary" onClick={() => setShowPace(true)}>Pace</button><button className="secondary" onClick={() => setSwapIndex(index)}>Swap</button><button className="secondary" onClick={skipCurrent}>Skip</button></div>
        <section className="muscle-focus"><b>Intended training emphasis</b><p>{currentExercise.focus}. Camera coaching can guide visible setup and movement cues, but cannot measure exact muscle activation.</p></section>
        {currentExercise.cameraSupported ? <section className="camera-card"><div><b>Optional camera coaching</b><p>Set up a full-body view before live cues. The coach will flag visible setup, posture, range, and tempo cues.</p></div><button className="secondary" onClick={cameraOpen ? stopCamera : startCamera} disabled={loading}>{loading ? 'Starting…' : cameraOpen ? 'Stop camera' : 'Start live coach'}</button></section> : <section className="camera-card"><div><b>Camera coaching is available for squat, push-up, and split squat.</b><p>Swap to a supported movement for confidence-aware setup and form cues.</p></div><button className="secondary" onClick={() => { setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, id: 'bodyweight-squat', reason: 'Selected for camera-supported setup and landmark-based squat cues.' } : item)); setCameraOpen(false) }}>Use camera-guided squat</button></section>}
        {cameraOpen && <section className="camera-panel"><div className="stage"><video ref={video} playsInline muted /><canvas ref={canvas} aria-label="Pose overlay" /></div><p className="status">{cameraStatus}</p>{cues.slice(0, 1).map((cue, cueIndex) => <p key={cueIndex} className={`cue ${cue.level}`}>{cue.text}</p>)}</section>}
        <p className="safety">Stop if you feel pain. This is general fitness guidance, not medical advice.</p><p className="up-next">Up next: {queue[index + 1] ? findExercise(queue[index + 1].id).name : 'Finish session'}</p>
      </>}
    </section>
    {showPace && <PacePanel pace={pace} onApply={applyPace} onClose={() => setShowPace(false)} />}
    {swapIndex !== null && <SwapPanel source={findExercise(queue[swapIndex].id).name} reason={swapReason} setReason={setSwapReason} alternatives={alternatives} onChoose={replace} onClose={() => setSwapIndex(null)} />}
  </main>

  return <main className="app-shell">
    <header><span className="brand">FORMWISE</span><span className="privacy-badge">Private on this device</span></header>
    <section className="today-hero"><div><p className="eyebrow">TODAY</p><h1>Your lower-body session is ready.</h1><p>Built around your squat, core, and dumbbell preferences—without wrist-loaded exercises.</p></div><button className="summary-pill" onClick={() => setShowPace(true)}>~{estimatedMinutes} min <i>·</i> {pace.work}s work <i>·</i> {pace.rest}s rest <i>·</i> {pace.rounds} rounds</button></section>
    <section className="today-grid"><div><div className="start-card"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Six movements, one clear plan.</h2><p>Adjust only if you want to. Your pacing is ready to go.</p></div><button onClick={() => begin()}>Start session</button><button className="text-button start-small" onClick={() => begin(true)}>Just 5 minutes</button></div><div className="why"><b>Need a camera form check?</b><span>Switch the first movement to a camera-supported squat, then launch live coaching during the interval.</span><button className="secondary" onClick={useCameraGuidedSquat}>Use camera-guided squat</button></div></div>
      <section className="queue"><div className="section-heading"><div><p className="eyebrow">TODAY’S LIST</p><h2>What’s next</h2></div><span>{queue.length} exercises</span></div>{queue.map((item, itemIndex) => { const exercise = findExercise(item.id); return <article className="queue-item" key={`${item.id}-${itemIndex}`}><ExerciseVisual exercise={exercise} number={itemIndex + 1} /><div><h3>{exercise.name}</h3><p>{exercise.category} · {pace.rounds} rounds · {pace.work}s / {pace.rest}s</p><small>{item.reason}</small></div><button className="secondary swap-button" onClick={() => setSwapIndex(itemIndex)}>Swap</button></article> })}</section>
    </section>
    {showPace && <PacePanel pace={pace} onApply={applyPace} onClose={() => setShowPace(false)} />}
    {swapIndex !== null && <SwapPanel source={findExercise(queue[swapIndex].id).name} reason={swapReason} setReason={setSwapReason} alternatives={alternatives} onChoose={replace} onClose={() => setSwapIndex(null)} />}
    <footer>Not medical advice. Video is never recorded or uploaded; camera coaching is optional and limited to supported exercises.</footer>
  </main>
}

function ExerciseVisual({ exercise, number }: { exercise: ReturnType<typeof findExercise>; number: number }) {
  const lunge = exercise.id === 'lateral-lunge' || exercise.id === 'curtsy-lunge'
  const guideSlot = exercise.id === 'lateral-lunge' ? 0 : exercise.id === 'curtsy-lunge' ? 1 : ({ 'bodyweight-squat': 0, 'sumo-squat': 0, 'romanian-deadlift': 1, 'glute-bridge': 2, 'forearm-plank': 3, 'russian-twist': 3, 'push-up': 3, 'split-squat': 0, 'shoulder-press': 4, 'tricep-extension': 5 } as Record<Exclude<ExerciseId, 'lateral-lunge' | 'curtsy-lunge'>, number>)[exercise.id as Exclude<ExerciseId, 'lateral-lunge' | 'curtsy-lunge'>]
  const x = lunge ? guideSlot * 100 : (guideSlot % 3) * 50, y = lunge ? 0 : Math.floor(guideSlot / 3) * 100
  return <div className="exercise-visual" role="img" aria-label={`${exercise.name} cartoon exercise guide`} style={{ backgroundImage: `url(${lunge ? lungeGuide : exerciseGuide})`, backgroundPosition: `${x}% ${y}%`, backgroundSize: lunge ? '200% 100%' : '300% 200%' }}><span>{number}</span></div>
}

function PacePanel({ pace, onApply, onClose }: { pace: Pace; onApply: (pace: Pace, save?: boolean) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(pace), [save, setSave] = useState(false)
  const adjust = (key: keyof Pace, amount: number) => setDraft((value) => ({ ...value, [key]: Math.max(key === 'rounds' ? 1 : 15, value[key] + amount) }))
  return <div className="modal-backdrop" role="presentation"><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="pace-title"><button className="close" onClick={onClose} aria-label="Close pacing settings">×</button><p className="eyebrow">SESSION PACING</p><h2 id="pace-title">Keep it simple</h2><div className="presets"><button className="secondary" onClick={() => setDraft({ work: 30, rest: 30, rounds: 2 })}>Quick 5 min</button><button className="secondary" onClick={() => setDraft({ work: 45, rest: 45, rounds: 3 })}>Steady 27 min</button><button className="secondary" onClick={() => setDraft(defaultPace)}>Full 36 min</button></div><div className="steppers">{(['work', 'rest', 'rounds'] as const).map((key) => <div key={key}><span>{key === 'work' ? 'Work' : key === 'rest' ? 'Rest' : 'Rounds'}</span><button onClick={() => adjust(key, key === 'rounds' ? -1 : -15)} aria-label={`Decrease ${key}`}>−</button><b>{draft[key]}{key === 'rounds' ? '' : 's'}</b><button onClick={() => adjust(key, key === 'rounds' ? 1 : 15)} aria-label={`Increase ${key}`}>+</button></div>)}</div><label className="save-default"><input type="checkbox" checked={save} onChange={(event) => setSave(event.target.checked)} /> Save as my default</label><button onClick={() => onApply(draft, save)}>Apply pacing</button></section></div>
}

function SwapPanel({ source, reason, setReason, alternatives, onChoose, onClose }: { source: string; reason: string; setReason: (reason: string) => void; alternatives: ReturnType<typeof exercises.filter>; onChoose: (id: ExerciseId) => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="swap-title"><button className="close" onClick={onClose} aria-label="Close exercise alternatives">×</button><p className="eyebrow">EXERCISE SWAP</p><h2 id="swap-title">Replace {source}</h2><div className="reason-chips">{['Wrist discomfort', 'Too difficult today', 'No equipment', 'Show alternatives'].map((option) => <button key={option} className={reason === option ? '' : 'secondary'} onClick={() => setReason(option)}>{option}</button>)}</div><p className="safety">Stop if you feel pain. These are exercise options, not injury advice.</p><div className="alternatives">{alternatives.map((exercise) => <article key={exercise.id}><div><h3>{exercise.name}</h3><p>{exercise.focus}</p><small>{reason === 'Wrist discomfort' ? 'Avoids loading through the hands. Trade-off: shifts the training focus.' : 'Compatible with your plan and current setup.'}</small></div><button onClick={() => onChoose(exercise.id)}>Use this</button></article>)}</div></section></div>
}
