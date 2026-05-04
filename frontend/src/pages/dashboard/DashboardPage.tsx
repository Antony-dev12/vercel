/**
 * Dashboard — shows the most recent LDVS score fetched from the API.
 * "Recalculate" opens a bottom-sheet modal with the manual metrics quiz.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ScoreRing } from '../../components/score/ScoreRing'
import { GradeBadge } from '../../components/score/GradeBadge'
import { MetricBar } from '../../components/score/MetricBar'
import { Step2Metrics, type MetricsData } from '../onboarding/steps/Step2Metrics'
import { scoreApi, type ScoreResult } from '../../lib/api'

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation()
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecalc, setShowRecalc] = useState(false)
  const [recalcLoading, setRecalcLoading] = useState(false)
  const [recalcError, setRecalcError] = useState('')

  // ── Fetch most recent score on mount ───────────────────────────────────────
  useEffect(() => {
    scoreApi.history()
      .then(res => {
        const scores = res.data
        if (scores.length > 0) {
          setScore(scores[scores.length - 1]) // history is ASC, so last = newest
        }
      })
      .catch(() => {/* silent — no scores yet is fine */ })
      .finally(() => setLoading(false))
  }, [])

  // ── Handle recalculate quiz completion ────────────────────────────────────
  const handleRecalculate = async (metrics: MetricsData) => {
    setRecalcLoading(true)
    setRecalcError('')
    try {
      const res = await scoreApi.calculate({
        ...metrics,
        sector: score?.sector ?? undefined,
        location: score?.location ?? undefined,
        source: 'manual',
      })
      setScore(res.data)
      setShowRecalc(false)
    } catch (err: any) {
      setRecalcError(err?.response?.data?.error ?? 'Could not recalculate. Please try again.')
    } finally {
      setRecalcLoading(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='relative w-12 h-12'>
          <div className='absolute inset-0 rounded-full border-4 border-slate-100' />
          <div className='absolute inset-0 rounded-full border-4 border-teal-500
                          border-t-transparent animate-spin' />
        </div>
      </div>
    )
  }

  // ── Empty state — no scores yet ───────────────────────────────────────────
  if (!score) {
    return (
      <div className='p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]'>
        <div className='text-6xl mb-4'>📊</div>
        <h2 className='text-xl font-bold text-slate-800 mb-2'>No score yet</h2>
        <p className='text-slate-500 text-sm mb-6 text-center max-w-xs'>
          Answer 5 quick questions to calculate your digital presence score.
          Takes about 2 minutes!
        </p>
        <button
          onClick={() => setShowRecalc(true)}
          className='px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold
                     rounded-xl transition-colors shadow-sm'
        >
          🚀 Calculate My Score
        </button>

        {showRecalc && (
          <RecalcModal
            loading={recalcLoading}
            error={recalcError}
            onClose={() => setShowRecalc(false)}
            onComplete={handleRecalculate}
          />
        )}
      </div>
    )
  }

  // ── Score display ─────────────────────────────────────────────────────────
  const platformScore = Math.round(((score.platforms?.length ?? 0) / 7) * 100)

  return (
    <div className='p-6 max-w-2xl mx-auto'>

      {/* Hero score card */}
      <div className='bg-white rounded-2xl border border-slate-200 p-8 mb-6
                      flex flex-col items-center text-center'>
        <p className='text-sm text-slate-500 mb-4'>{t('dashboard.yourScore')}</p>
        <ScoreRing score={score.score} grade={score.grade} />
        <div className='mt-4'>
          <GradeBadge grade={score.grade} />
        </div>
        <p className='text-xs text-slate-400 mt-3'>
          {t('dashboard.lastUpdated')}: {score.date}
        </p>
        <span className='mt-2 text-xs bg-slate-50 text-slate-500
                         border border-slate-200 px-3 py-1 rounded-full'>
          ✏️ Manually entered
        </span>
      </div>

      {/* Platforms */}
      {score.platforms?.length > 0 && (
        <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
          <p className='text-sm font-semibold text-slate-600 mb-3'>📱 Your Platforms</p>
          <div className='flex gap-2 flex-wrap'>
            {score.platforms.map(pl => (
              <span key={pl}
                className='text-xs bg-indigo-50 text-indigo-600 border border-indigo-200
                           px-3 py-1 rounded-full font-medium'>
                {pl}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <h3 className='font-bold text-slate-800 mb-5'>{t('dashboard.scoreBreakdown')}</h3>
        <MetricBar
          label={t('dashboard.profileComplete')}
          value={score.profileComplete}
          weight={0.20}
          color='bg-teal-500'
        />
        <MetricBar
          label={t('dashboard.postFreq')}
          value={score.postFreq}
          weight={0.20}
          color='bg-indigo-500'
        />
        <MetricBar
          label={t('dashboard.engagement')}
          value={score.engagement}
          weight={0.25}
          color='bg-purple-500'
        />
        <MetricBar
          label={t('dashboard.responsiveness')}
          value={score.responsiveness}
          weight={0.20}
          color='bg-blue-500'
        />
        <MetricBar
          label={t('dashboard.platformPresence')}
          value={platformScore}
          weight={0.15}
          color='bg-rose-400'
        />
      </div>

      {/* Top recommendation preview */}
      {score.recs?.length > 0 && (
        <div className='bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs font-semibold text-amber-700 uppercase tracking-wide'>
              🎯 Top recommendation
            </p>
            <Link to='/recommendations'
              className='text-xs text-teal-600 font-medium hover:underline'>
              See all →
            </Link>
          </div>
          <p className='text-sm font-semibold text-slate-700'>
            {score.recs[0].icon} {score.recs[0].title}
          </p>
          <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
            {score.recs[0].desc}
          </p>
        </div>
      )}

      {/* Recalculate button */}
      <button
        onClick={() => setShowRecalc(true)}
        className='w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold
                   rounded-xl transition-colors shadow-sm'
      >
        {t('dashboard.recalculate')} 🔄
      </button>

      {/* Recalculate modal */}
      {showRecalc && (
        <RecalcModal
          loading={recalcLoading}
          error={recalcError}
          onClose={() => setShowRecalc(false)}
          onComplete={handleRecalculate}
        />
      )}
    </div>
  )
}

// ── Recalculate bottom-sheet modal ────────────────────────────────────────────

function RecalcModal({
  loading,
  error,
  onClose,
  onComplete,
}: {
  loading: boolean
  error: string
  onClose: () => void
  onComplete: (data: MetricsData) => void
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm'
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className='w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-6 pb-10
                      max-h-[90vh] overflow-y-auto animate-slide-up'>

        {/* Header */}
        <div className='flex items-center justify-between mb-5'>
          <div>
            <h3 className='font-bold text-slate-800'>Update Your Score</h3>
            <p className='text-xs text-slate-400 mt-0.5'>Answer a few quick questions</p>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full
                       bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors
                       text-sm font-medium'
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
                          text-red-600 text-sm text-center'>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className='flex flex-col items-center py-12'>
            <div className='relative w-12 h-12 mb-4'>
              <div className='absolute inset-0 rounded-full border-4 border-slate-100' />
              <div className='absolute inset-0 rounded-full border-4 border-teal-500
                              border-t-transparent animate-spin' />
            </div>
            <p className='text-slate-600 font-semibold mb-1'>Recalculating…</p>
            <p className='text-slate-400 text-sm'>Crunching your numbers</p>
          </div>
        ) : (
          <Step2Metrics
            onBack={onClose}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  )
}
