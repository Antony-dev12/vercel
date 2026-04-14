import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const isSwahili = i18n.language === 'sw'

  const toggle = () => {
    const next = isSwahili ? 'en' : 'sw'
    i18n.changeLanguage(next)
    localStorage.setItem('dpt_lang', next)
  }

  return (
    <button
      onClick={toggle}
      className='flex items-center gap-2 px-3 py-1.5 rounded-full border
                 border-slate-200 hover:border-teal-400 transition-colors
                 text-sm font-medium text-slate-600 hover:text-teal-600'
    >
      <span className={!isSwahili ? 'font-bold text-teal-600' : ''}>EN</span>
      <span className='text-slate-300'>|</span>
      <span className={isSwahili ? 'font-bold text-teal-600' : ''}>SW</span>
    </button>
  )
}