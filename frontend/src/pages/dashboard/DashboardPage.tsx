import { useTranslation } from 'react-i18next'
import { ScoreRing }  from '../../components/score/ScoreRing'
import { GradeBadge } from '../../components/score/GradeBadge'
import { MetricBar }  from '../../components/score/MetricBar'
import type { Score } from '../../types/index'

const MOCK_SCORE: Score = {
  id: '1',
  score: 67,
  grade: 'C',
  profileComplete: 80,
  postFreq: 55,
  engagement: 62,
  responsiveness: 70,
  platformCount: 3,
  platforms: ['Facebook', 'Instagram', 'WhatsApp'],
  dataSource: 'hybrid',
  calculatedAt: new Date().toISOString(),
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const s = MOCK_SCORE

  return (
    <div className='p-6 max-w-2xl mx-auto'>

      {/* Score hero card */}
      <div className='bg-white rounded-2xl border border-slate-200 p-8 mb-6
                      flex flex-col items-center text-center'>
        <p className='text-sm text-slate-500 mb-4'>{t('dashboard.yourScore')}</p>

        <ScoreRing score={s.score} grade={s.grade} />

        <div className='mt-4'>
          <GradeBadge grade={s.grade} />
        </div>

        <p className='text-xs text-slate-400 mt-3'>
          {t('dashboard.lastUpdated')}: {new Date(s.calculatedAt).toLocaleDateString()}
        </p>

        {/* Auto-fill badge */}
        {s.dataSource !== 'manual' && (
          <span className='mt-2 text-xs bg-teal-50 text-teal-600
                           border border-teal-200 px-3 py-1 rounded-full'>
            ✓ {t('dashboard.autoFill')}
          </span>
        )}
      </div>

      {/* Platforms used */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <p className='text-sm text-slate-500 mb-3'>Connected platforms</p>
        <div className='flex gap-2 flex-wrap'>
          {s.platforms.map(pl => (
            <span key={pl}
              className='text-xs bg-indigo-50 text-indigo-600
                         border border-indigo-200 px-3 py-1 rounded-full font-medium'>
              {pl}
            </span>
          ))}
        </div>
      </div>

      {/* Score breakdown */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-6'>
        <h3 className='font-bold text-slate-800 mb-5'>
          {t('dashboard.scoreBreakdown')}
        </h3>
        <MetricBar
          label={t('dashboard.profileComplete')}
          value={s.profileComplete}
          weight={0.20}
          color='bg-teal-500'
        />
        <MetricBar
          label={t('dashboard.postFreq')}
          value={s.postFreq}
          weight={0.20}
          color='bg-indigo-500'
        />
        <MetricBar
          label={t('dashboard.engagement')}
          value={s.engagement}
          weight={0.25}
          color='bg-purple-500'
        />
        <MetricBar
          label={t('dashboard.responsiveness')}
          value={s.responsiveness}
          weight={0.20}
          color='bg-blue-500'
        />
        <MetricBar
          label={t('dashboard.platformPresence')}
          value={Math.round((s.platformCount / 7) * 100)}
          weight={0.15}
          color='bg-rose-400'
        />
      </div>

      {/* Recalculate button */}
      <button className='w-full py-3 bg-teal-500 hover:bg-teal-600 text-white
                         font-semibold rounded-xl transition-colors'>
        {t('dashboard.recalculate')}
      </button>

    </div>
  )
}