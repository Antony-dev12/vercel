import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const MOCK_HISTORY = [
  { date: 'Jan 1',  score: 42, grade: 'D' },
  { date: 'Jan 15', score: 48, grade: 'D' },
  { date: 'Feb 1',  score: 51, grade: 'C' },
  { date: 'Feb 15', score: 55, grade: 'C' },
  { date: 'Mar 1',  score: 58, grade: 'C' },
  { date: 'Mar 15', score: 60, grade: 'C' },
  { date: 'Apr 1',  score: 63, grade: 'C' },
  { date: 'Apr 15', score: 67, grade: 'C' },
]

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
  const { t } = useTranslation()
  const latest  = MOCK_HISTORY[MOCK_HISTORY.length - 1]
  const earliest = MOCK_HISTORY[0]
  const change  = latest.score - earliest.score
  const isUp    = change >= 0

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
          <span className='text-xs text-slate-400'>{MOCK_HISTORY.length} data points</span>
        </div>

        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={MOCK_HISTORY} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
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