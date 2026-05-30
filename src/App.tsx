import { useState } from 'react'
import Stage1 from './components/Stage1'
import Stage2 from './components/Stage2'
import Stage3 from './components/Stage3'
import './App.css'

type GameStage = 1 | 2 | 3 | 'complete'

export default function App() {
  const [stage, setStage] = useState<GameStage>(1)

  if (stage === 'complete') {
    return (
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
    )
  }

  return (
    <div className="app">
      {stage === 1 && <Stage1 onComplete={() => setStage(2)} />}
      {stage === 2 && <Stage2 onComplete={() => setStage(3)} />}
      {stage === 3 && <Stage3 onComplete={() => setStage('complete')} />}
    </div>
  )
}
