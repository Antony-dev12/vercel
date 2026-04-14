import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function Step3Score() {
  const { t } = useTranslation()
  return (
    <div className='text-center'>
      <div className='relative inline-flex items-center justify-center mb-6'>
        <svg width='160' height='160' style={{ transform:'rotate(-90deg)' }}>
          <circle cx='80' cy='80' r='64' fill='none' stroke='#F1F5F9' strokeWidth='12' />
          <circle cx='80' cy='80' r='64' fill='none' stroke='#D97706' strokeWidth='12'
            strokeDasharray='402' strokeDashoffset='161' strokeLinecap='round' />
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-4xl font-black text-amber-600'>60</span>
          <span className='text-xs text-slate-400'>/ 100</span>
        </div>
      </div>
      <h2 className='text-xl font-bold text-slate-800 mb-3'>{t('onboarding.step3Title')}</h2>
      <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-4'>
        Grade C — {t('grades.C')}
      </div>
      <p className='text-slate-500 text-sm mb-6 max-w-xs mx-auto'>
        Your baseline score is <strong>60/100</strong>. Connect more platforms and follow recommendations to improve.
      </p>
      <div className='text-left space-y-3 mb-6'>
        {[
          { label: t('dashboard.profileComplete'), value:70, color:'bg-teal-500'   },
          { label: t('dashboard.postFreq'),        value:45, color:'bg-indigo-500' },
          { label: t('dashboard.engagement'),      value:60, color:'bg-purple-500' },
          { label: t('dashboard.responsiveness'),  value:65, color:'bg-blue-500'   },
          { label: t('dashboard.platformPresence'),value:43, color:'bg-rose-400'   },
        ].map(m => (
          <div key={m.label}>
            <div className='flex justify-between mb-1'>
              <span className='text-xs text-slate-600'>{m.label}</span>
              <span className='text-xs font-bold text-slate-700'>{m.value}</span>
            </div>
            <div className='h-1.5 bg-slate-100 rounded-full'>
              <div className={`h-full ${m.color} rounded-full`} style={{ width:`${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Link to='/dashboard'
        className='block w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors'>
        Go to Dashboard →
      </Link>
    </div>
  )
}
