interface Props {
  total: number
  filled: number
}

export default function StarProgress({ total, filled }: Props) {
  return (
    <div className="star-progress" aria-label={`${filled}/${total} 완료`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i < filled ? `f-${i}` : `e-${i}`}
          className={`star-icon ${i < filled ? 'star-filled' : 'star-empty'}`}
        >
          {i < filled ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}
