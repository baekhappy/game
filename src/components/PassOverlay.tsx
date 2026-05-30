import { useEffect, useRef } from 'react'

interface Props {
  message: string
  onDone: () => void
  playSound?: () => void
  duration?: number
}

export default function PassOverlay({ message, onDone, playSound, duration = 2400 }: Props) {
  const doneRef = useRef(onDone)

  useEffect(() => {
    playSound?.()
    const id = setTimeout(() => doneRef.current(), duration)
    return () => clearTimeout(id)
  }, [duration, playSound])

  return (
    <div className="pass-overlay">
      <div className="pass-card">
        <div className="pass-stars">⭐ ⭐ ⭐</div>
        <div className="pass-badge">통과!</div>
        <div className="pass-divider" />
        <div className="pass-message">{message}</div>
      </div>
    </div>
  )
}
