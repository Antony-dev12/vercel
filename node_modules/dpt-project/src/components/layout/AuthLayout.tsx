import { LanguageToggle } from './LanguageToggle'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>

        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 mb-4'>
            <span className='text-white text-2xl font-bold'>D</span>
          </div>
          <h1 className='text-2xl font-bold text-slate-800'>Digital Presence Tracker</h1>
          <p className='text-slate-500 text-sm mt-1'>For Kenyan SMEs</p>
        </div>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
          {children}
        </div>

        {/* Language toggle */}
        <div className='flex justify-center mt-4'>
          <LanguageToggle />
        </div>

      </div>
    </div>
  )
}