import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SECTORS = ['Retail','Food & Beverage','Fashion','Beauty & Wellness','Technology','Education','Transport','Other']
const LOCATIONS = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri','Malindi','Other']

export function Step1Business({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
  const [sector, setSector]     = useState('')
  const [location, setLocation] = useState('')
  const [error, setError]       = useState('')

  const handleNext = () => {
    if (!sector || !location) { setError(t('common.required')); return }
    setError('')
    onNext()
  }

  const sel = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm bg-white'

  return (
    <div>
      <h2 className='text-xl font-bold text-slate-800 mb-1'>{t('onboarding.step1Title')}</h2>
      <p className='text-slate-500 text-sm mb-6'>Help us personalise your experience.</p>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>{t('auth.sector')}</label>
          <select value={sector} onChange={e => setSector(e.target.value)} className={sel}>
            <option value=''>Select your sector...</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>{t('auth.location')}</label>
          <select value={location} onChange={e => setLocation(e.target.value)} className={sel}>
            <option value=''>Select your location...</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-2'>Preferred language</label>
          <div className='flex gap-3'>
            {[{code:'en',label:'English'},{code:'sw',label:'Kiswahili'}].map(lang => (
              <button key={lang.code} type='button'
                className='flex-1 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium
                           text-slate-600 hover:border-teal-400 hover:text-teal-600 transition-all'>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className='text-red-500 text-xs'>{error}</p>}
        <button onClick={handleNext}
          className='w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors'>
          {t('common.next')} →
        </button>
      </div>
    </div>
  )
}