/**
 * Step 3 — Score Reveal
 * Receives the real ScoreResult from the API and displays an animated reveal.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScoreResult } from '../../../lib/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRADE_META: Record<string, { color: string; ring: string; bg: string; label: string }> = {
  A: { color: 'text-teal-600', ring: '#10B981', bg: 'bg-teal-100', label: 'Excellent 🏆' },
  B: { color: 'text-blue-600', ring: '#3B82F6', bg: 'bg-blue-100', label: 'Good 👍' },
  C: { color: 'text-amber-600', ring: '#D97706', bg: 'bg-amber-100', label: 'Average 😐' },
  D: { color: 'text-orange-600', ring: '#F97316', bg: 'bg-orange-100', label: 'Needs Work 🔧' },
  F: { color: 'text-red-600', ring: '#EF4444', bg: 'bg-red-100', label: 'Critical 🚨' },
}

const METRIC_BARS = [
  { key: 'profileComplete' as const, label: 'Profile Completeness', color: 'bg-teal-500' },
  { key: 'postFreq' as const, label: 'Posting Frequency', color: 'bg-indigo-500' },
  { key: 'engagement' as const, label: 'Engagement Level', color: 'bg-purple-500' },
  { key: 'responsiveness' as const, label: 'Responsiveness', color: 'bg-blue-500' },
]

const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 402

// ── Component ─────────────────────────────────────────────────────────────────

export function Step3Score({ scoreData }: { scoreData: ScoreResult }) {
  const meta = GRADE_META[scoreData.grade] ?? GRADE_META['C']

  // Animate the ring from 0 → real score
  const [animScore, setAnimScore] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setAnimScore(scoreData.score), 120)
    return () => clearTimeout(id)
  }, [scoreData.score])

  const dashOffset = CIRCUMFERENCE - (animScore / 100) * CIRCUMFERENCE
  const platformScore = Math.round(((scoreData.platforms?.length ?? 0) / 7) * 100)

  return (
    <div className='text-center'>

      {/* ── Animated ring ── */}
      <div className='relative inline-flex items-center justify-center mb-5'>
        <svg width='160' height='160' style={{ transform: 'rotate(-90deg)' }}>
          <circle cx='80' cy='80' r={RADIUS} fill='none' stroke='#F1F5F9' strokeWidth='12' />
          <circle
            cx='80' cy='80' r={RADIUS}
            fill='none'
            stroke={meta.ring}
            strokeWidth='12'
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap='round'
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className={`text-4xl font-black ${meta.color}`}>{animScore}</span>
          <span className='text-xs text-slate-400'>/ 100</span>
        </div>
      </div>

      {/* ── Grade badge ── */}
      <h2 className='text-xl font-bold text-slate-800 mb-2'>Your first score is ready!</h2>
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${meta.bg}
                       ${meta.color} rounded-full text-sm font-bold mb-3`}>
        Grade {scoreData.grade} — {meta.label}
      </div>

      <p className='text-slate-500 text-sm mb-5 max-w-xs mx-auto'>
        Your baseline score is <strong className={meta.color}>{scoreData.score}/100</strong>.
        Follow the recommendations below to improve it!
      </p>

      {/* ── Platforms ── */}
      {scoreData.platforms?.length > 0 && (
        <div className='flex flex-wrap gap-1.5 justify-center mb-5'>
          {scoreData.platforms.map(pl => (
            <span key={pl}
              className='text-xs bg-indigo-50 text-indigo-600 border border-indigo-200
                         px-2.5 py-1 rounded-full font-medium'>
              {pl}
            </span>
          ))}
        </div>
      )}

      {/* ── Score breakdown ── */}
      <div className='text-left space-y-3 mb-5'>
        {METRIC_BARS.map(m => (
          <div key={m.key}>
            <div className='flex justify-between mb-1'>
              <span className='text-xs text-slate-600'>{m.label}</span>
              <span className='text-xs font-bold text-slate-700'>{scoreData[m.key]}</span>
            </div>
            <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-700`}
                style={{ width: `${scoreData[m.key]}%` }}
              />
            </div>
          </div>
        ))}
        {/* Platform presence bar */}
        <div>
          <div className='flex justify-between mb-1'>
            <span className='text-xs text-slate-600'>Platform Presence</span>
            <span className='text-xs font-bold text-slate-700'>{platformScore}</span>
          </div>
          <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
            <div className='h-full bg-rose-400 rounded-full transition-all duration-700'
              style={{ width: `${platformScore}%` }} />
          </div>
        </div>
      </div>

      {/* ── Top recommendation preview ── */}
      {scoreData.recs?.length > 0 && (
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left'>
          <p className='text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5'>
            🎯 Top tip for you
          </p>
          <p className='text-sm font-semibold text-slate-700'>{scoreData.recs[0].icon} {scoreData.recs[0].title}</p>
          <p className='text-xs text-slate-500 mt-1 leading-relaxed'>{scoreData.recs[0].desc}</p>
        </div>
      )}

      <Link to='/dashboard'
        className='block w-full py-3 bg-teal-500 hover:bg-teal-600 text-white
                   font-semibold rounded-xl transition-colors shadow-sm'>
        Go to Dashboard →
      </Link>
      <Link to='/recommendations'
        className='block w-full py-2.5 mt-2 text-teal-600 hover:text-teal-700
                   text-sm font-medium transition-colors'>
        See all recommendations →
      </Link>
    </div>
  )
}
