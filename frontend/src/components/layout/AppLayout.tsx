import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from './LanguageToggle'
import { LogOut } from 'lucide-react'
import { authApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', labelKey: 'nav.dashboard' },
  { to: '/history', icon: '📈', labelKey: 'nav.history' },
  { to: '/recommendations', icon: '💡', labelKey: 'nav.recommendations' },
  { to: '/settings', icon: '⚙️', labelKey: 'nav.settings' },
]

export default function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
      // Clear any local storage tokens if they exist
      localStorage.removeItem('access_token')
      // Redirect to login
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
      logout()
      // Still redirect even if API fails
      navigate('/login')
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 flex'>

      {/* ── Sidebar (desktop) ── */}
      <aside className='hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10'>

        {/* Logo */}
        <div className='flex items-center gap-3 px-6 py-5 border-b border-slate-100'>
          <div className='w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-200'>
            <span className='text-white font-black text-sm tracking-tighter'>D</span>
          </div>
          <span className='font-black text-slate-800 tracking-tight'>Vercel</span>
        </div>

        {/* Nav links */}
        <nav className='flex-1 px-4 py-6 space-y-1.5 overflow-y-auto'>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                 transition-all duration-150
                 ${isActive
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`
              }
            >
              <span className='p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform'>
                {item.icon}
              </span>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + language + logout */}
        <div className='px-4 py-4 border-t border-slate-100 space-y-3'>
          <div className='flex items-center justify-between'>
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110'
              title={t('nav.logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
          <div className='flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50
                          cursor-pointer transition-colors'
            onClick={() => navigate('/settings')}>
            <div className='w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0'>
              <span className='text-teal-600 font-bold text-sm'>
                {user?.businessName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-slate-700 truncate'>
                {user?.businessName || 'User'}
              </p>
              <p className='text-xs text-slate-400 truncate'>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className='flex-1 md:ml-64 flex flex-col min-h-screen'>

        {/* Mobile top bar */}
        <header className='md:hidden bg-white border-b border-slate-200 px-4 py-3
                           flex items-center justify-between sticky top-0 z-10'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center'>
              <span className='text-white font-black text-xs'>D</span>
            </div>
            <span className='font-black text-slate-800 text-sm'>DPT</span>
          </div>
          <div className='flex items-center gap-3'>
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className='p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors'
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Outlet for routes */}
        <div className='flex-1'>
          <Outlet />
        </div>

        {/* ── Bottom nav (mobile) ── */}
        <nav className='md:hidden bg-white border-t border-slate-200 flex sticky bottom-0 z-10'>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5
                 text-xs font-semibold transition-colors
                 ${isActive ? 'text-teal-600' : 'text-slate-400'}`
              }
            >
              {item.icon}
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

      </main>

    </div>
  )
}