import { useTranslation } from 'react-i18next'

const PLATFORMS = [
  { id:'facebook',  emoji:'📘', label:'Facebook',        canConnect:true  },
  { id:'instagram', emoji:'📸', label:'Instagram',       canConnect:true  },
  { id:'google',    emoji:'🔍', label:'Google Business', canConnect:true  },
  { id:'whatsapp',  emoji:'💬', label:'WhatsApp',        canConnect:false, note:'Manual only' },
  { id:'tiktok',    emoji:'🎵', label:'TikTok',          canConnect:false, note:'Manual only' },
]

export function Step2Connect({ onNext, onBack }: { onNext:()=>void, onBack:()=>void }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className='text-xl font-bold text-slate-800 mb-1'>{t('onboarding.step2Title')}</h2>
      <p className='text-slate-500 text-sm mb-6'>Connect platforms to auto-fill your score. You can skip and do this later.</p>
      <div className='space-y-3 mb-6'>
        {PLATFORMS.map(pl => (
          <div key={pl.id} className='flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-teal-300 transition-colors'>
            <div className='flex items-center gap-3'>
              <span className='text-xl'>{pl.emoji}</span>
              <div>
                <p className='font-medium text-slate-700 text-sm'>{pl.label}</p>
                {pl.note && <p className='text-xs text-amber-600'>{pl.note}</p>}
              </div>
            </div>
            {pl.canConnect
              ? <button className='text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors'>{t('common.connect')}</button>
              : <span className='text-xs text-slate-300'>—</span>
            }
          </div>
        ))}
      </div>
      <div className='flex gap-3'>
        <button onClick={onBack}
          className='flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors'>
          ← {t('common.back')}
        </button>
        <button onClick={onNext}
          className='flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition-colors'>
          {t('onboarding.calculateScore')}
        </button>
      </div>
      <button onClick={onNext} className='w-full text-center text-sm text-slate-400 mt-3 hover:text-slate-600'>
        {t('onboarding.skipForNow')}
      </button>
    </div>
  )
}