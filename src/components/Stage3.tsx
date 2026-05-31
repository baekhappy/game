import { useState, useEffect, useRef } from 'react'
import { stage3Questions } from '../gameData'
import { transcribeAudio, checkAnswer } from '../api'
import { playCorrect, playWrong, playRecordStart, playFanfare } from '../sounds'
import PassOverlay from './PassOverlay'
import StarProgress from './StarProgress'

interface Props {
  onComplete: () => void
}

type Feedback = 'correct' | 'wrong' | null

export default function Stage3({ onComplete }: Props) {
  const [idx, setIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [imgError, setImgError] = useState(false)
  const [done, setDone] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const q = stage3Questions[idx]

  useEffect(() => {
    setFeedback(null)
    setImgError(false)
    setRecording(false)
    setProcessing(false)
  }, [idx])

  if (done) {
    return (
      <PassOverlay
        message="규칙 배울 준비 완료"
        onDone={onComplete}
        playSound={playFanfare}
        duration={3200}
      />
    )
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(blob)
      }

      mr.start()
      playRecordStart()
      setRecording(true)
      setFeedback(null)
    } catch {
      alert('마이크 접근 권한이 필요합니다.\n브라우저 설정에서 마이크를 허용해주세요.')
    }
  }

  function stopRecording() {
    if (mediaRecRef.current?.state === 'recording') {
      mediaRecRef.current.stop()
    }
    setRecording(false)
    setProcessing(true)
  }

  async function processAudio(blob: Blob) {
    try {
      const text = await transcribeAudio(blob)
      console.log('[음성인식] 인식결과:', JSON.stringify(text), '| 정답:', q.word, '| 판정:', checkAnswer(text, q.word))
      if (checkAnswer(text, q.word)) {
        playCorrect()
        setCorrectCount(c => c + 1)
        setFeedback('correct')
        setTimeout(() => {
          if (idx + 1 >= stage3Questions.length) {
            setDone(true)
          } else {
            setIdx(i => i + 1)
          }
        }, 1600)
      } else {
        playWrong()
        setFeedback('wrong')
      }
    } catch (err) {
      console.error('[음성인식] API 오류:', err)
      playWrong()
      setFeedback('wrong')
    } finally {
      setProcessing(false)
    }
  }

  function handleMicClick() {
    if (processing) return
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  function handleRetry() {
    setFeedback(null)
  }

  return (
    <div className="stage-wrap">
      <header className="game-header">
        <div className="stage-label">3단계</div>
        <div>
          <div className="stage-title">그림을 보고 말해보세요!</div>
          <div className="stage-subtitle">마이크를 누르고 말해요.</div>
        </div>
        <div className="progress-pill">{idx + 1} / {stage3Questions.length}</div>
      </header>

      <StarProgress total={stage3Questions.length} filled={correctCount} />

      <div className={`image-card ${feedback === 'correct' ? 'pop' : ''}`}>
        {imgError ? (
          <div className="img-fallback">
            <div className="fallback-emoji">{q.emoji}</div>
            <div className="fallback-label">{q.word}</div>
          </div>
        ) : (
          <img
            key={q.imagePath}
            src={q.imagePath}
            alt={q.word}
            className="main-image"
            onError={() => setImgError(true)}
          />
        )}
        {feedback && (
          <div className={`result-badge ${feedback}`}>
            {feedback === 'correct' ? '⭕' : '❌'}
          </div>
        )}
      </div>

      <div className="mic-area">
        {processing && (
          <div className="processing-row">
            <span>🔍 인식 중...</span>
          </div>
        )}

        {!processing && feedback === 'correct' && (
          <p className="correct-msg">⭕ 정답이에요! 정말 잘했어요! 🎊</p>
        )}

        {!processing && feedback === 'wrong' && (
          <div className="wrong-row">
            <p className="wrong-msg">❌ 다시 도전해볼까요?</p>
            <button className="retry-btn" onClick={handleRetry}>
              🎤 다시 말하기
            </button>
          </div>
        )}

        {!processing && feedback === null && (
          <>
            <button
              className={`mic-btn ${recording ? 'recording' : ''}`}
              onClick={handleMicClick}
              aria-label={recording ? '녹음 중지' : '녹음 시작'}
            >
              {recording ? '⏹' : '🎤'}
            </button>
            <p className="mic-label">
              {recording
                ? '🔴 녹음 중… 다시 클릭하면 멈춰요'
                : '마이크를 눌러 말해보세요'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
