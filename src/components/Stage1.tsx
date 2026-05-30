import { useState, useEffect } from 'react'
import { stage1Questions } from '../gameData'

interface Props {
  onComplete: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getChoices(correct: string, pool: string[]): string[] {
  const others = shuffle(pool.filter(w => w !== correct)).slice(0, 2)
  return shuffle([correct, ...others])
}

export default function Stage1({ onComplete }: Props) {
  const [idx, setIdx] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [wrongWord, setWrongWord] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const pool = stage1Questions.map(q => q.word)
  const q = stage1Questions[idx]

  useEffect(() => {
    setChoices(getChoices(q.word, pool))
    setFeedback(null)
    setWrongWord(null)
    setImgError(false)
  }, [idx])

  function handleSelect(word: string) {
    if (feedback === 'correct') return

    if (word === q.word) {
      setFeedback('correct')
      setTimeout(() => {
        if (idx + 1 >= stage1Questions.length) {
          onComplete()
        } else {
          setIdx(i => i + 1)
        }
      }, 1200)
    } else {
      setWrongWord(word)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setWrongWord(null)
      }, 600)
    }
  }

  return (
    <div className="stage-wrap">
      <header className="game-header">
        <div className="stage-label">1단계</div>
        <div>
          <div className="stage-title">무슨 시간인가요?</div>
          <div className="stage-subtitle">알맞은 낱말을 고르세요.</div>
        </div>
        <div className="progress-pill">{idx + 1} / {stage1Questions.length}</div>
      </header>

      <div className={`image-card ${feedback === 'correct' ? 'pop' : ''}`}>
        {imgError ? (
          <div className="img-fallback">
            <div className="fallback-emoji">{q.emoji}</div>
            <div className="fallback-label">{q.word}</div>
          </div>
        ) : (
          <img
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

      <div className="choices-grid">
        {choices.map(word => (
          <button
            key={word}
            onClick={() => handleSelect(word)}
            disabled={feedback === 'correct'}
            className={[
              'choice-btn',
              feedback === 'correct' && word === q.word ? 'choice-correct' : '',
              feedback === 'wrong' && word === wrongWord ? 'choice-wrong' : '',
            ].join(' ')}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}
