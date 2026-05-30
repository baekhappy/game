import { useState, useEffect, useRef } from 'react'
import Stage1 from './components/Stage1'
import Stage2 from './components/Stage2'
import Stage3 from './components/Stage3'
import { startMusic, stopMusic } from './bgMusic'
import './App.css'

type GameStage = 1 | 2 | 3 | 'complete'

export default function App() {
  const [stage, setStage] = useState<GameStage>(1)
  const [musicOn, setMusicOn] = useState(true)
  const musicOnRef = useRef(true)

  // 첫 번째 클릭(어디든) 이후 자동으로 배경음악 시작
  useEffect(() => {
    const handler = () => {
      if (musicOnRef.current) startMusic().catch(() => {})
      document.removeEventListener('click', handler)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function toggleMusic() {
    const next = !musicOnRef.current
    musicOnRef.current = next
    setMusicOn(next)
    if (next) startMusic().catch(() => {})
    else stopMusic()
  }

  return (
    <>
      {/* 배경음악 토글 버튼 – 항상 표시 */}
      <button
        className={`music-btn${musicOn ? '' : ' muted'}`}
        onClick={toggleMusic}
        aria-label={musicOn ? '음악 끄기' : '음악 켜기'}
      >
        {musicOn ? '🎵' : '🔇'}
      </button>

      {stage === 'complete' ? (
        <div className="complete-screen">
          <div className="complete-card">
            <div className="stars">
              <span className="star">⭐</span>
              <span className="star">⭐</span>
              <span className="star">⭐</span>
            </div>
            <span className="complete-emoji">🎉</span>
            <h1 className="complete-title">게임 완료!</h1>
            <p className="complete-msg">정말 잘했어요! 최고예요! 👏</p>
            <button className="btn-restart" onClick={() => setStage(1)}>
              처음부터 다시하기
            </button>
          </div>
        </div>
      ) : (
        <div className="app">
          {stage === 1 && <Stage1 onComplete={() => setStage(2)} />}
          {stage === 2 && <Stage2 onComplete={() => setStage(3)} />}
          {stage === 3 && <Stage3 onComplete={() => setStage('complete')} />}
        </div>
      )}
    </>
  )
}
