let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {})
  return _ctx
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.38,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

// 정답: 도→미→솔 상승 (C5→E5→G5)
export function playCorrect() {
  const ctx = getCtx()
  const t = ctx.currentTime
  tone(ctx, 523.25, t,        0.20) // C5 도
  tone(ctx, 659.25, t + 0.17, 0.20) // E5 미
  tone(ctx, 784.00, t + 0.34, 0.32) // G5 솔
}

// 오답: 낮은 부저 하강
export function playWrong() {
  const ctx = getCtx()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(260, t)
  osc.frequency.linearRampToValueAtTime(155, t + 0.36)
  gain.gain.setValueAtTime(0.28, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.36)
  osc.start(t)
  osc.stop(t + 0.38)
}

// 녹음 시작: 짧은 삑 1회
export function playRecordStart() {
  const ctx = getCtx()
  const t = ctx.currentTime
  tone(ctx, 880, t, 0.09, 'sine', 0.22)
}

// 축하 팡파레: C5-E5-G5-C6 ┃ G5-C6 (밝고 신남)
export function playFanfare() {
  const ctx = getCtx()
  const t = ctx.currentTime
  const seq: [number, number, number][] = [
    [523.25, 0.00, 0.13], // C5
    [659.25, 0.13, 0.13], // E5
    [784.00, 0.26, 0.13], // G5
    [1046.5, 0.39, 0.25], // C6
    [784.00, 0.68, 0.11], // G5 (pickup)
    [1046.5, 0.79, 0.58], // C6 (grand finale)
  ]
  for (const [freq, offset, dur] of seq) {
    tone(ctx, freq, t + offset, dur, 'sine', 0.42)
  }
}
