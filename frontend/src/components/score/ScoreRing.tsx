import { useEffect, useState } from 'react'

interface Props {
  score: number
  grade: 'A'|'B'|'C'|'D'|'F'
  size?: number
}

const GRADE_COLORS = {
  A: '#0D9488',
  B: '#16A34A',
  C: '#D97706',
  D: '#EA580C',
  F: '#DC2626',
}

export function ScoreRing({ score, grade, size = 200 }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const radius       = 80
  const circumference = 2 * Math.PI * radius
  const strokeDash   = circumference - (displayed / 100) * circumference
  const color        = GRADE_COLORS[grade]

  useEffect(() => {
    let frame: number
    let start: number
    const duration = 1200
    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setDisplayed(Math.round(progress * score))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill='none' stroke='#F1F5F9' strokeWidth='16'
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill='none' stroke={color} strokeWidth='16'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 0.05s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-4xl font-black' style={{ color }}>{displayed}</span>
        <span className='text-sm text-slate-400 font-medium'>/ 100</span>
      </div>
    </div>
  )
}