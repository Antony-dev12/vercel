import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { scoreApi } from '../../lib/api'
import type { ScoreResult } from '../../lib/api'

const GRADE_BANDS = [
  { min: 80, label: 'A', color: '#0D9488' },
  { min: 65, label: 'B', color: '#16A34A' },
  { min: 50, label: 'C', color: '#D97706' },
  { min: 35, label: 'D', color: '#EA580C' },
  { min: 0,  label: 'F', color: '#DC2626' },
]

function getGradeColor(score: number) {
  if (score >= 80) return '#0D9488'
  if (score >= 65) return '#16A34A'
  if (score >= 50) return '#D97706'
  if (score >= 35) return '#EA580C'
  return '#DC2626'
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const score = payload[0].value
  const color = getGradeColor(score)
  return (
    <div className='bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm'>
      <p className='text-slate-500 mb-1'>{label}</p>
      <p className='font-black text-2xl' style={{ color }}>{score}</p>
      <p className='text-xs text-slate-400'>/ 100</p>
    </div>
  )
}

export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const [history, setHistory] = useState<ScoreResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const lang = i18n.language?.startsWith('sw') ? 'sw' : 'en'
    scoreApi.history(lang)
      .then(res => setHistory(res.data))
      .catch(() => setError('Could not load score history. Please try again.'))
      .finally(() => setLoading(false))
  }, [i18n.language])

  const latest   = history[history.length - 1]
  const earliest = history[0]
  const change   = latest && earliest ? latest.score - earliest.score : 0
  const isUp     = change >= 0

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin' />
        <p className='text-slate-500 text-sm'>Loading your score history…</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className='p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='w-14 h-14 bg-red-50 rounded-full flex items-center justify-center'>
          <svg className='w-7 h-7 text-red-400' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
          </svg>
        </div>
        <p className='text-red-600 text-sm font-medium'>{error}</p>
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (history.length === 0) {
    return (
      <div className='p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center'>
        <div className='w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center'>
          <svg className='w-8 h-8 text-teal-400' fill='none' stroke='currentColor' strokeWidth={1.5} viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' />
          </svg>
        </div>
        <div>
          <h2 className='text-lg font-bold text-slate-800 mb-1'>No scores yet</h2>
          <p className='text-slate-500 text-sm max-w-xs'>
            Run your first digital presence check on the Dashboard to start tracking your score over time.
          </p>
        </div>
        <a
          href='/dashboard'
          className='mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors'
        >
          Go to Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className='p-6 max-w-2xl mx-auto'>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-black text-slate-800'>{t('nav.history')}</h1>
        <p className='text-slate-500 text-sm mt-1'>
          Track your digital presence score over time
        </p>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='bg-white rounded-2xl border border-slate-200 p-4 text-center'>
          <p className='text-xs text-slate-400 mb-1'>Current</p>
          <p className='text-2xl font-black' style={{ color: getGradeColor(latest.score) }}>
            {latest.score}
          </p>
          <p className='text-xs text-slate-500'>Grade {latest.grade}</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 p-4 text-center'>
          <p className='text-xs text-slate-400 mb-1'>Started</p>
          <p className='text-2xl font-black text-slate-600'>{earliest.score}</p>
          <p className='text-xs text-slate-500'>Grade {earliest.grade}</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 p-4 text-center'>
          <p className='text-xs text-slate-400 mb-1'>Change</p>
          <p className={`text-2xl font-black ${isUp ? 'text-teal-500' : 'text-red-500'}`}>
            {isUp ? '+' : ''}{change}
          </p>
          <p className='text-xs text-slate-500'>{isUp ? '↑ Improving' : '↓ Declining'}</p>
        </div>
      </div>

      {/* Chart card */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='font-bold text-slate-800'>Score Timeline</h2>
          <span className='text-xs text-slate-400'>{history.length} data point{history.length !== 1 ? 's' : ''}</span>
        </div>

        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={history} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#F1F5F9' />
            <XAxis
              dataKey='date'
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke='#0D9488' strokeDasharray='4 4' strokeOpacity={0.4} label={{ value: 'A', position: 'right', fontSize: 10, fill: '#0D9488' }} />
            <ReferenceLine y={65} stroke='#16A34A' strokeDasharray='4 4' strokeOpacity={0.4} label={{ value: 'B', position: 'right', fontSize: 10, fill: '#16A34A' }} />
            <ReferenceLine y={50} stroke='#D97706' strokeDasharray='4 4' strokeOpacity={0.4} label={{ value: 'C', position: 'right', fontSize: 10, fill: '#D97706' }} />
            <ReferenceLine y={35} stroke='#EA580C' strokeDasharray='4 4' strokeOpacity={0.4} label={{ value: 'D', position: 'right', fontSize: 10, fill: '#EA580C' }} />
            <Line
              type='monotone'
              dataKey='score'
              stroke='#0D9488'
              strokeWidth={3}
              dot={{ fill: '#0D9488', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score log table */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <h3 className='font-bold text-slate-800 mb-4'>Score Log</h3>
        <div className='space-y-2'>
          {[...history].reverse().map((entry, i) => (
            <div key={entry.id ?? i} className='flex items-center justify-between py-2 border-b border-slate-50 last:border-0'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white'
                  style={{ background: getGradeColor(entry.score) }}
                >
                  {entry.grade}
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-700'>{entry.date}</p>
                  {entry.businessName && (
                    <p className='text-xs text-slate-400'>{entry.businessName}</p>
                  )}
                </div>
              </div>
              <div className='text-right'>
                <p className='text-lg font-black' style={{ color: getGradeColor(entry.score) }}>{entry.score}</p>
                <p className='text-xs text-slate-400 capitalize'>{entry.source ?? 'manual'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade bands legend */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6'>
        <h3 className='font-bold text-slate-800 mb-4'>Grade Bands</h3>
        <div className='space-y-2'>
          {GRADE_BANDS.map(band => (
            <div key={band.label} className='flex items-center gap-3'>
              <div className='w-3 h-3 rounded-full flex-shrink-0' style={{ background: band.color }} />
              <span className='text-sm font-semibold w-4' style={{ color: band.color }}>
                {band.label}
              </span>
              <div className='flex-1 h-1.5 bg-slate-100 rounded-full'>
                <div className='h-full rounded-full' style={{ background: band.color, width: `${band.min === 0 ? 35 : band.min}%` }} />
              </div>
              <span className='text-xs text-slate-400'>
                {band.label === 'A' ? '80–100'
                  : band.label === 'B' ? '65–79'
                  : band.label === 'C' ? '50–64'
                  : band.label === 'D' ? '35–49'
                  : '0–34'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}