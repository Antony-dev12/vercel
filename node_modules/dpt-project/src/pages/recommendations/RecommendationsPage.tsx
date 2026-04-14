import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Priority = 'high' | 'medium' | 'low'
type Category = 'profile' | 'posting' | 'engagement' | 'responsiveness' | 'platforms'

interface Rec {
  id: string
  category: Category
  priority: Priority
  titleEn: string
  titleSw: string
  descEn: string
  descSw: string
  impact: number
  done: boolean
}

const MOCK_RECS: Rec[] = [
  {
    id: '1', category: 'profile', priority: 'high',
    titleEn: 'Complete your Google Business profile',
    titleSw: 'Kamilisha wasifu wako wa Google Business',
    descEn: 'Add your business hours, photos, and description to boost visibility in local searches.',
    descSw: 'Ongeza masaa ya biashara, picha, na maelezo ili kuongeza uonekano katika utafutaji wa karibu.',
    impact: 12, done: false,
  },
  {
    id: '2', category: 'posting', priority: 'high',
    titleEn: 'Post at least 3 times per week',
    titleSw: 'Chapisha angalau mara 3 kwa wiki',
    descEn: 'Consistent posting keeps your audience engaged and improves your algorithm ranking.',
    descSw: 'Kuchapisha mara kwa mara kunaweka hadhira yako ikishiriki na kuboresha msimamo wako.',
    impact: 10, done: false,
  },
  {
    id: '3', category: 'engagement', priority: 'high',
    titleEn: 'Reply to all comments within 24 hours',
    titleSw: 'Jibu maoni yote ndani ya masaa 24',
    descEn: 'Quick responses show customers you are active and trustworthy, boosting your score.',
    descSw: 'Majibu ya haraka yanaonyesha wateja kwamba uko hai na unastahili kuaminiwa.',
    impact: 9, done: false,
  },
  {
    id: '4', category: 'platforms', priority: 'medium',
    titleEn: 'Create a TikTok account for your business',
    titleSw: 'Fungua akaunti ya TikTok kwa biashara yako',
    descEn: 'TikTok is fast-growing in Kenya. Short videos can drive new customers to your business.',
    descSw: 'TikTok inakua haraka Kenya. Video fupi zinaweza kuleta wateja wapya kwa biashara yako.',
    impact: 7, done: false,
  },
  {
    id: '5', category: 'profile', priority: 'medium',
    titleEn: 'Add a professional profile photo',
    titleSw: 'Ongeza picha ya kitaalamu ya wasifu',
    descEn: 'Businesses with clear profile photos get 3x more clicks than those without.',
    descSw: 'Biashara zenye picha wazi za wasifu hupata mara 3 zaidi ya clicks kuliko zile ambazo hazina.',
    impact: 6, done: true,
  },
  {
    id: '6', category: 'responsiveness', priority: 'low',
    titleEn: 'Enable WhatsApp Business auto-reply',
    titleSw: 'Washa jibu la kiotomatiki la WhatsApp Business',
    descEn: 'Set up an automatic greeting message so customers always get a response instantly.',
    descSw: 'Weka ujumbe wa salamu wa kiotomatiki ili wateja wapate jibu mara moja daima.',
    impact: 5, done: false,
  },
]

const PRIORITY_STYLES: Record<Priority, string> = {
  high:   'bg-red-100   text-red-600   border-red-200',
  medium: 'bg-amber-100 text-amber-600 border-amber-200',
  low:    'bg-slate-100 text-slate-500 border-slate-200',
}

const CATEGORY_ICONS: Record<Category, string> = {
  profile:        '👤',
  posting:        '📝',
  engagement:     '💬',
  responsiveness: '⚡',
  platforms:      '🌐',
}

const FILTERS: { key: 'all' | Priority; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'high',   label: 'High'   },
  { key: 'medium', label: 'Medium' },
  { key: 'low',    label: 'Low'    },
]

export default function RecommendationsPage() {
  const { t, i18n } = useTranslation()
  const isSw = i18n.language === 'sw'
  const [filter, setFilter] = useState<'all' | Priority>('all')
  const [recs, setRecs] = useState<Rec[]>(MOCK_RECS)

  const toggle = (id: string) =>
    setRecs(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r))

  const visible = filter === 'all' ? recs : recs.filter(r => r.priority === filter)
  const doneCount = recs.filter(r => r.done).length

  return (
    <div className='p-6 max-w-2xl mx-auto'>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-black text-slate-800'>{t('nav.recommendations')}</h1>
        <p className='text-slate-500 text-sm mt-1'>
          Actionable steps to grow your digital presence
        </p>
      </div>

      {/* Progress bar */}
      <div className='bg-white rounded-2xl border border-slate-200 p-5 mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-semibold text-slate-700'>
            {doneCount} of {recs.length} completed
          </span>
          <span className='text-sm font-bold text-teal-600'>
            {Math.round((doneCount / recs.length) * 100)}%
          </span>
        </div>
        <div className='h-2.5 bg-slate-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-teal-500 rounded-full transition-all duration-500'
            style={{ width: `${(doneCount / recs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className='flex gap-2 mb-5'>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
              ${filter === f.key
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className='space-y-4'>
        {visible.map(rec => (
          <div
            key={rec.id}
            className={`bg-white rounded-2xl border p-5 transition-all duration-300
              ${rec.done ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:border-teal-200'}`}
          >
            <div className='flex gap-4'>

              {/* Checkbox */}
              <button
                onClick={() => toggle(rec.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center
                  justify-center transition-all mt-0.5
                  ${rec.done
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-slate-300 hover:border-teal-400'}`}
              >
                {rec.done && <span className='text-white text-xs font-bold'>✓</span>}
              </button>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2 mb-1'>
                  <h3 className={`font-bold text-sm leading-snug
                    ${rec.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {CATEGORY_ICONS[rec.category]}{' '}
                    {isSw ? rec.titleSw : rec.titleEn}
                  </h3>
                </div>

                <p className='text-xs text-slate-500 leading-relaxed mb-3'>
                  {isSw ? rec.descSw : rec.descEn}
                </p>

                <div className='flex items-center gap-2 flex-wrap'>
                  {/* Priority badge */}
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
                    ${PRIORITY_STYLES[rec.priority]}`}>
                    {rec.priority}
                  </span>

                  {/* Impact */}
                  <span className='text-xs text-teal-600 bg-teal-50 border border-teal-100
                                   px-2.5 py-0.5 rounded-full font-semibold'>
                    +{rec.impact} pts
                  </span>

                  {/* Category */}
                  <span className='text-xs text-slate-400 capitalize'>{rec.category}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className='text-center py-16 text-slate-400'>
          <p className='text-4xl mb-3'>🎉</p>
          <p className='font-semibold'>All done for this filter!</p>
        </div>
      )}

    </div>
  )
}