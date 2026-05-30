const TARGET_VOL = 0.15
const BPM = 96
const Q = 60 / BPM // 0.625s per quarter note

// C major pentatonic, 4 phrases × 8 beats = 32 beats = 20.0s loop
const MELODY: [number, number][] = [
  // Phrase A – 상승 후 C로 귀환
  [659.25, 1], [784.00, 1], [880.00, 1], [784.00, 1],
  [659.25, 2], [587.33, 1], [523.25, 1],
  // Phrase B – G-E-D 통통 튀는 패턴
  [784.00, 1], [659.25, 1], [587.33, 1], [659.25, 1],
  [784.00, 2], [659.25, 1], [587.33, 1],
  // Phrase C – C에서 A까지 올라갔다 내려오기
  [523.25, 1], [659.25, 1], [784.00, 1], [880.00, 1],
  [784.00, 1], [659.25, 1], [523.25, 2],
  // Phrase D – C로 해결(resolution)
  [659.25, 1], [784.00, 1], [880.00, 1],
  [784.00, 1], [659.25, 1], [587.33, 1], [523.25, 2],
]

const LOOP_BEATS = MELODY.reduce((s, [, d]) => s + d, 0) // 32 beats
const LOOP_DURATION = LOOP_BEATS * Q                       // 20.0s

let _ctx: AudioContext | null = null
let _master: GainNode | null = null
let _timer: ReturnType<typeof setTimeout> | null = null
let _playing = false

function getMCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new AudioContext()
    _master = _ctx.createGain()
    _master.gain.value = 0 // fade in on start
    _master.connect(_ctx.destination)
  }
  return _ctx
}

function bgNote(ctx: AudioContext, freq: number, start: number, beats: number) {
  if (!_master) return
  const dur = beats * Q * 0.86 // 14% 갭으로 음표 분리
  const atk = 0.02
  const rel = Math.min(0.06, dur * 0.18)
  const hold = Math.max(dur - atk - rel, 0.01)

  // Sine – 주 멜로디 목소리
  const s = ctx.createOscillator()
  const sg = ctx.createGain()
  s.type = 'sine'
  s.frequency.value = freq
  s.connect(sg)
  sg.connect(_master)
  sg.gain.setValueAtTime(0, start)
  sg.gain.linearRampToValueAtTime(0.72, start + atk)
  sg.gain.setValueAtTime(0.72, start + atk + hold)
  sg.gain.linearRampToValueAtTime(0, start + dur)
  s.start(start)
  s.stop(start + dur + 0.01)

  // Triangle – 한 옥타브 아래로 따뜻함 추가
  const t = ctx.createOscillator()
  const tg = ctx.createGain()
  t.type = 'triangle'
  t.frequency.value = freq / 2
  t.connect(tg)
  tg.connect(_master)
  tg.gain.setValueAtTime(0, start)
  tg.gain.linearRampToValueAtTime(0.28, start + atk)
  tg.gain.setValueAtTime(0.28, start + atk + hold)
  tg.gain.linearRampToValueAtTime(0, start + dur)
  t.start(start)
  t.stop(start + dur + 0.01)
}

function scheduleLoop(ctx: AudioContext, startAt: number) {
  if (!_playing) return
  let t = startAt
  for (const [freq, beats] of MELODY) {
    bgNote(ctx, freq, t, beats)
    t += beats * Q
  }
  // 루프 종료 300ms 전에 다음 루프 예약 → 끊김 없는 반복
  const msLeft = (startAt + LOOP_DURATION - ctx.currentTime) * 1000 - 300
  _timer = setTimeout(() => {
    if (_playing && _ctx) scheduleLoop(_ctx, startAt + LOOP_DURATION)
  }, Math.max(10, msLeft))
}

export async function startMusic() {
  if (_playing) return
  _playing = true
  const ctx = getMCtx()
  if (ctx.state === 'suspended') await ctx.resume()
  if (_master) {
    const now = ctx.currentTime
    _master.gain.cancelScheduledValues(now)
    _master.gain.setValueAtTime(_master.gain.value, now)
    _master.gain.linearRampToValueAtTime(TARGET_VOL, now + 0.6)
  }
  scheduleLoop(ctx, ctx.currentTime + 0.1)
}

export function stopMusic() {
  _playing = false
  if (_timer !== null) {
    clearTimeout(_timer)
    _timer = null
  }
  if (_master && _ctx) {
    const now = _ctx.currentTime
    _master.gain.cancelScheduledValues(now)
    _master.gain.setValueAtTime(_master.gain.value, now)
    _master.gain.linearRampToValueAtTime(0, now + 0.5)
  }
}
