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

// 박수: white noise burst 4회 반복
function noiseBurst(ctx: AudioContext, startTime: number, vol: number) {
  const samples = Math.floor(ctx.sampleRate * 0.08)
  const buf = ctx.createBuffer(1, samples, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1

  const src = ctx.createBufferSource()
  src.buffer = buf

  const flt = ctx.createBiquadFilter()
  flt.type = 'bandpass'
  flt.frequency.value = 1300
  flt.Q.value = 0.9

  const gain = ctx.createGain()
  src.connect(flt)
  flt.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)

  src.start(startTime)
  src.stop(startTime + 0.09)
}

export function playClap() {
  const ctx = getCtx()
  const t = ctx.currentTime
  const vols = [0.62, 0.58, 0.65, 0.55] // 약간 다른 볼륨으로 자연스럽게
  for (let i = 0; i < 4; i++) {
    noiseBurst(ctx, t + i * 0.2, vols[i])
  }
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
