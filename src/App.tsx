import { DrawingUtils, FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useEffect, useMemo, useRef, useState } from 'react'
import { coach, type Cue } from './formEngine'
import { exercises, findExercise, type ExerciseId } from './exercises'
import exerciseGuide from './assets/exercise-guide.png'
import lungeGuide from './assets/lunge-guide.png'

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
type Pace = { work: number; rest: number; rounds: number }
type SessionItem = { id: ExerciseId; reason: string; completed?: boolean; skipped?: boolean }
const defaultPace: Pace = { work: 45, rest: 45, rounds: 4 }
const coreExerciseIds = new Set(['forearm-plank', 'russian-twist', 'dead-bug', 'side-plank', 'reverse-crunch', 'hollow-hold', 'bird-dog', 'seated-knee-tuck'])
const hamstringExerciseIds = new Set(['romanian-deadlift', 'good-morning', 'single-leg-rdl', 'hamstring-walkout', 'glute-bridge', 'hip-thrust', 'sliding-leg-curl'])
const lowerBodyExerciseIds = new Set(['bodyweight-squat', 'sumo-squat', 'lateral-lunge', 'curtsy-lunge', 'split-squat', 'reverse-lunge', 'step-up', 'wall-sit', 'goblet-squat'])
const upperBodyExerciseIds = new Set(['push-up', 'shoulder-press', 'tricep-extension', 'floor-press', 'lateral-raise', 'bent-over-row', 'hammer-curl'])
const defaultQueue: SessionItem[] = [
  { id: 'sumo-squat', reason: 'Matches your squat preference and no-equipment setup.' },
  { id: 'romanian-deadlift', reason: 'Builds your preferred hip-hinge work with a clear progression.' },
  { id: 'glute-bridge', reason: 'Adds lower-body work without loading through your wrists.' },
  { id: 'forearm-plank', reason: 'Builds core stability while staying wrist-friendly.' },
  { id: 'shoulder-press', reason: 'Uses your preferred overhead dumbbell movement.' },
  { id: 'tricep-extension', reason: 'Adds a floor or standing triceps option with simple setup.' },
]
const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const swapPool = (id: ExerciseId) => {
  const group = coreExerciseIds.has(id) ? coreExerciseIds : hamstringExerciseIds.has(id) ? hamstringExerciseIds : lowerBodyExerciseIds.has(id) ? lowerBodyExerciseIds : upperBodyExerciseIds
  return exercises.filter((exercise) => exercise.id !== id && group.has(exercise.id)).slice(0, 8)
}

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [reorderNotice, setReorderNotice] = useState('')
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
    return swapPool(queue[swapIndex].id)
  }, [queue, swapIndex])

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
    if (signal === 'rest') { playTone(300, .1); playTone(190, .16, .12) }
    if (signal === 'work') { playTone(620, .08); playTone(780, .08, .11); playTone(940, .14, .22) }
    if (signal === 'next') { playTone(520, .1); playTone(700, .12, .14) }
    if (signal === 'start') { playTone(620, .1); playTone(780, .1, .14); playTone(940, .14, .28) }
    if (signal === 'complete') { playTone(520, .1); playTone(660, .1, .14); playTone(880, .18, .28) }
  }
  function skipCurrent() {
    if (index === queue.length - 1) { setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, skipped: true } : item)); setFinished(true); setPaused(true); return }
    setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, skipped: true } : item))
    setIndex((value) => value + 1); setRound(1); setPhase('work'); setSeconds(pace.work)
  }
  function skipInterval() {
    if (phase === 'work') { playPattern('rest'); setPhase('rest'); setSeconds(pace.rest); return }
    if (round >= sessionRounds) {
      const nextIndex = index + 1
      setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: true } : item))
      if (nextIndex < queue.length && !momentum) { setIndex(nextIndex); setRound(1); setPhase('work'); setSeconds(pace.work) } else { setFinished(true); setPaused(true) }
      return
    }
    setRound((value) => value + 1); setPhase('work'); setSeconds(pace.work); playPattern('work')
  }
  function openPace() { setPaused(true); setShowPace(true) }
  function moveExercise(from: number, to: number) {
    if (from === to || to < 0 || to >= queue.length) return
    setQueue((items) => { const next = [...items], [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next })
    setReorderNotice(`${findExercise(queue[from].id).name} moved to position ${to + 1} of ${queue.length}.`)
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
      reason: `${chosen.name} is a new ${chosen.category.toLowerCase()} option for today’s plan.`,
    } : item))
    setSwapIndex(null)
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

  if (screen === 'active' && currentExercise) return <main className="app-shell session-shell">
    <header><span className="brand">FORMWISE</span><button className="text-button" onClick={() => { stopCamera(); setScreen('today'); setPaused(true) }}>Exit session</button></header>
    <section className="queue session-queue" aria-live="polite"><div className="section-heading session-heading"><div><p className="eyebrow">TODAY’S SESSION</p><h2>{finished ? 'Session complete' : momentum ? 'Five-minute start' : 'In progress'}</h2><span>~{estimatedMinutes} min · {pace.work}s on / {pace.rest}s off</span></div>{!finished && <button onClick={() => setPaused((value) => !value)}>{paused ? 'Resume session' : 'Pause session'}</button>}</div>{queue.map((item, itemIndex) => { const exercise = findExercise(item.id), active = itemIndex === index && !finished, done = Boolean(item.completed), skipped = Boolean(item.skipped); return <article className={`queue-item session-row ${active ? 'is-active' : ''} ${done ? 'is-complete' : ''} ${skipped ? 'is-skipped' : ''}`} key={`${item.id}-${itemIndex}`}><ExerciseVisual exercise={exercise} number={itemIndex + 1} status={skipped ? 'skipped' : done ? 'complete' : active ? 'active' : 'queued'} /><div className="session-identity"><h3>{exercise.name}</h3><p>{exercise.category} · {sessionRounds} rounds · {pace.work}s / {pace.rest}s</p>{active && <small>{exercise.setup}</small>}</div><div className="session-progress">{skipped ? <><b>Skipped</b><strong>—</strong><small>Exercise skipped</small></> : done ? <><b>Complete</b><strong>✓</strong><small>{sessionRounds} of {sessionRounds} rounds</small></> : active ? <div className={`interval-display ${phase}`}><span aria-hidden="true">{phase === 'work' ? '▶' : 'Ⅱ'}</span><div><b>{phase}</b><strong>{format(Math.max(0, seconds))}</strong><small>Round {round} of {sessionRounds}</small></div></div> : <><b>Queued</b><strong>{pace.work}s</strong><small>{sessionRounds} rounds planned</small></>}</div>{active ? <><div className="row-actions"><button className="secondary" onClick={openPace}>Pace</button><button className="secondary" onClick={() => setSwapIndex(index)}>Swap</button><button className="secondary" onClick={skipInterval}>Skip</button><button className="text-button" onClick={skipCurrent}>Skip exercise</button></div><RoundTimeline rounds={sessionRounds} currentRound={round} phase={phase} seconds={Math.max(0, seconds)} /></> : !done && !skipped && <button className="secondary swap-button" onClick={() => setSwapIndex(itemIndex)}>Swap</button>}</article> })}{finished && <div className="session-finish"><b>{momentum ? 'Five minutes complete.' : 'All done.'}</b><span>Completion is saved as a positive preference signal.</span><button className="secondary" onClick={() => setScreen('today')}>Back to Today</button></div>}</section>
    {showPace && <PacePanel pace={pace} onApply={applyPace} onClose={() => setShowPace(false)} />}{swapIndex !== null && <SwapPanel source={findExercise(queue[swapIndex].id).name} alternatives={alternatives} onChoose={replace} onClose={() => setSwapIndex(null)} />}
  </main>

  return <main className="app-shell">
    <header><span className="brand">FORMWISE</span><span className="privacy-badge">Private on this device</span></header>
    <section className="today-hero"><div><p className="eyebrow">TODAY</p><h1>Your workout is ready.</h1><p>Built around your squat, core, and dumbbell preferences—without wrist-loaded exercises.</p></div><button className="summary-pill" onClick={() => setShowPace(true)}>~{estimatedMinutes} min <i>·</i> {pace.work}s work <i>·</i> {pace.rest}s rest <i>·</i> {pace.rounds} rounds</button></section>
    <section className="queue session-queue"><div className="section-heading session-heading"><div><p className="eyebrow">TODAY’S LIST</p><h2>What’s next</h2><span>{queue.length} exercises · ~{estimatedMinutes} min planned</span></div><div className="header-actions"><button className="secondary" onClick={() => setShowPace(true)}>{pace.work}s / {pace.rest}s · {pace.rounds} rounds</button><button onClick={() => begin()}>Start session</button><button className="text-button" onClick={() => begin(true)}>Just 5 min</button></div></div><p className="reorder-notice" aria-live="polite">{reorderNotice || 'Use the arrows beside an exercise to reorder your session.'}</p>{queue.map((item, itemIndex) => { const exercise = findExercise(item.id); return <article className="queue-item session-row reorderable" key={`${item.id}-${itemIndex}`}><ExerciseVisual exercise={exercise} number={itemIndex + 1} status="queued" /><div className="session-identity"><div className="identity-title"><h3>{exercise.name}</h3><div className="identity-actions"><button className="reorder-arrow" aria-label={`Move ${exercise.name} up`} disabled={itemIndex === 0} onClick={() => moveExercise(itemIndex, itemIndex - 1)}>↑</button><button className="reorder-arrow" aria-label={`Move ${exercise.name} down`} disabled={itemIndex === queue.length - 1} onClick={() => moveExercise(itemIndex, itemIndex + 1)}>↓</button></div></div><p>{exercise.category} · {pace.rounds} rounds · {pace.work}s / {pace.rest}s</p><small>{item.reason}</small></div><div className="session-progress"><b>Queued</b><strong>{pace.work}s</strong><small>{pace.rounds} rounds planned</small><div className="mini-rounds">{Array.from({ length: pace.rounds }, (_, roundIndex) => <i key={roundIndex} />)}</div></div><button className="secondary swap-button" onClick={() => setSwapIndex(itemIndex)}>Swap</button></article> })}</section>
    {showPace && <PacePanel pace={pace} onApply={applyPace} onClose={() => setShowPace(false)} />}
    {swapIndex !== null && <SwapPanel source={findExercise(queue[swapIndex].id).name} alternatives={alternatives} onChoose={replace} onClose={() => setSwapIndex(null)} />}
    <footer>Not medical advice. Video is never recorded or uploaded; camera coaching is optional and limited to supported exercises.</footer>
  </main>
}

function ExerciseVisual({ exercise, number, status = 'queued' }: { exercise: ReturnType<typeof findExercise>; number: number; status?: 'queued' | 'active' | 'complete' | 'skipped' }) {
  const lunge = exercise.id === 'lateral-lunge' || exercise.id === 'curtsy-lunge'
  const guideSlot = exercise.id === 'lateral-lunge' ? 0 : exercise.id === 'curtsy-lunge' ? 1 : (({ 'bodyweight-squat': 0, 'sumo-squat': 0, 'romanian-deadlift': 1, 'glute-bridge': 2, 'forearm-plank': 3, 'russian-twist': 3, 'push-up': 3, 'split-squat': 0, 'shoulder-press': 4, 'tricep-extension': 5 } as Record<string, number>)[exercise.id] ?? 0)
  const x = lunge ? guideSlot * 100 : (guideSlot % 3) * 50, y = lunge ? 0 : Math.floor(guideSlot / 3) * 100
  return <div className={`exercise-visual ${status}`} role="img" aria-label={`${exercise.name} cartoon exercise guide`} style={{ backgroundImage: `url(${lunge ? lungeGuide : exerciseGuide})`, backgroundPosition: `${x}% ${y}%`, backgroundSize: lunge ? '200% 100%' : '300% 200%' }}><span>{status === 'complete' ? '✓' : status === 'skipped' ? '—' : number}</span></div>
}

function RoundTimeline({ rounds, currentRound, phase, seconds }: { rounds: number; currentRound: number; phase: 'work' | 'rest'; seconds: number }) {
  return <div className="round-timeline" role="list" aria-label={`${rounds} rounds, currently round ${currentRound} in ${phase}`}>
    {Array.from({ length: rounds }, (_, roundIndex) => {
      const number = roundIndex + 1, completed = number < currentRound, current = number === currentRound
      const workState = completed || (current && phase === 'rest') ? 'done' : current && phase === 'work' ? 'active' : 'upcoming'
      const restState = completed ? 'done' : current && phase === 'rest' ? 'active' : 'upcoming'
      return <div className={`round-unit ${completed ? 'complete' : current ? 'current' : ''}`} role="listitem" key={number} aria-label={`Round ${number}: work ${workState}, rest ${restState}`}><span className="round-number">{number}</span><span className={`phase-half work ${workState}`}>{workState === 'done' ? '✓' : workState === 'active' ? <><i>▶</i><b>{format(seconds)}</b><small>WORK</small></> : '—'}</span><span className={`phase-half rest ${restState}`}>{restState === 'done' ? '✓' : restState === 'active' ? <><i>Ⅱ</i><b>{format(seconds)}</b><small>REST</small></> : '—'}</span></div>
    })}
  </div>
}

function PacePanel({ pace, onApply, onClose }: { pace: Pace; onApply: (pace: Pace, save?: boolean) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(pace), [save, setSave] = useState(false)
  const adjust = (key: keyof Pace, amount: number) => setDraft((value) => ({ ...value, [key]: Math.max(key === 'rounds' ? 1 : 15, value[key] + amount) }))
  return <div className="modal-backdrop" role="presentation"><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="pace-title"><button className="close" onClick={onClose} aria-label="Close pacing settings">×</button><p className="eyebrow">SESSION PACING</p><h2 id="pace-title">Keep it simple</h2><div className="presets"><button className="secondary" onClick={() => setDraft({ work: 30, rest: 30, rounds: 2 })}>Quick 5 min</button><button className="secondary" onClick={() => setDraft({ work: 45, rest: 45, rounds: 3 })}>Steady 27 min</button><button className="secondary" onClick={() => setDraft(defaultPace)}>Full 36 min</button></div><div className="steppers">{(['work', 'rest', 'rounds'] as const).map((key) => <div key={key}><span>{key === 'work' ? 'Work' : key === 'rest' ? 'Rest' : 'Rounds'}</span><button onClick={() => adjust(key, key === 'rounds' ? -1 : -15)} aria-label={`Decrease ${key}`}>−</button><b>{draft[key]}{key === 'rounds' ? '' : 's'}</b><button onClick={() => adjust(key, key === 'rounds' ? 1 : 15)} aria-label={`Increase ${key}`}>+</button></div>)}</div><label className="save-default"><input type="checkbox" checked={save} onChange={(event) => setSave(event.target.checked)} /> Save as my default</label><button onClick={() => onApply(draft, save)}>Apply pacing</button></section></div>
}

function SwapPanel({ source, alternatives, onChoose, onClose }: { source: string; alternatives: ReturnType<typeof exercises.filter>; onChoose: (id: ExerciseId) => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="swap-title"><button className="close" onClick={onClose} aria-label="Close exercise alternatives">×</button><p className="eyebrow">EXERCISE SWAP</p><h2 id="swap-title">Replace {source}</h2><p>Choose another movement from the same training area. You can swap again at any time.</p><div className="alternatives">{alternatives.map((exercise) => <article key={exercise.id}><div><h3>{exercise.name}</h3><p>{exercise.focus}</p><small>{exercise.category}</small></div><button onClick={() => onChoose(exercise.id)}>Use this</button></article>)}</div></section></div>
}
