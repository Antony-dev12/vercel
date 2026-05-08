import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

/* ── Rotating knowledge facts ───────────────────────────────────── */
const FACTS = [
  {
    stat: '3×',
    highlight: '3× more customer enquiries',
    text: 'Businesses with an active digital presence receive 3× more customer enquiries than those relying on word-of-mouth alone.',
    label: 'Industry Research',
  },
  {
    stat: '73%',
    highlight: '73% of Kenyan consumers',
    text: '73% of Kenyan consumers research a business online before deciding to visit in person or make a purchase.',
    label: 'Consumer Behaviour',
  },
  {
    stat: '2×',
    highlight: '2× more monthly leads',
    text: 'Businesses that score above 70 on the LDVS scale consistently generate twice as many monthly leads as low-scoring peers.',
    label: 'Platform Insight',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [factIdx, setFactIdx] = useState(0)

  /* rotate fact every 6 s */
  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'google_failed') setError('Google login failed. Please try again.')
    if (err === 'facebook_failed') setError('Facebook login failed. Please try again.')
    if (err === 'facebook_no_email') setError('Facebook login failed: email permission is required.')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Email and password are required.'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.login({ email, password })
      login(res.data.user)
      navigate(res.data.user.hasOnboarded ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fact = FACTS[factIdx]

  return (
    <div className='min-h-screen flex flex-col bg-white'>

      {/* ── Main split ───────────────────────────────────────────────── */}
      <div className='flex flex-1'>

        {/* ── LEFT — dark brand panel ─────────────────────────────────── */}
        <div className='hidden lg:flex lg:w-[52%] relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex-col justify-between p-12 overflow-hidden select-none'>

          {/* subtle grid pattern */}
          <div className='absolute inset-0 opacity-[0.04]'
            style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }}
          />

          {/* decorative blobs */}
          <div className='absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-24 -right-24 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl' />

          {/* brand */}
          <div className='relative z-10 flex items-center gap-2'>
            <div className='w-7 h-7 bg-teal-400 rounded-md flex items-center justify-center'>
              <svg className='w-4 h-4 text-slate-900' fill='none' stroke='currentColor' strokeWidth={2.5} viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.5-.875m3.5.875l-.875 3.5' />
              </svg>
            </div>
            <span className='text-white font-bold text-base tracking-tight'>RadaBiz</span>
          </div>

          {/* headline */}
          <div className='relative z-10'>
            <h1 className='text-4xl font-extrabold text-white leading-snug mb-5'>
              Track Your Business's<br />
              <span className='text-teal-400'>Digital Visibility</span>
            </h1>
            <p className='text-slate-400 text-base mb-10 leading-relaxed max-w-sm'>
              Join us and know exactly where your business stands online — and what to do to improve.
            </p>

            {/* rotating knowledge card */}
            <div className='bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm transition-all duration-500'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0'>
                  <svg className='w-5 h-5 text-teal-400' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' />
                  </svg>
                </div>
                <div>
                  <p className='text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1.5'>{fact.label}</p>
                  <p className='text-slate-200 text-sm leading-relaxed'>
                    {(() => {
                      const [before, after] = fact.text.split(fact.highlight)
                      return <>{before}<strong className='text-teal-300'>{fact.highlight}</strong>{after}</>
                    })()}
                  </p>
                </div>
              </div>
              {/* progress dots */}
              <div className='flex gap-1.5 mt-4 justify-end'>
                {FACTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFactIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === factIdx ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* secure badge */}
          <div className='relative z-10 flex items-center gap-2 text-slate-400 text-xs'>
            <svg className='w-4 h-4 text-teal-500' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' />
            </svg>
            Secure, encrypted data storage
          </div>
        </div>

        {/* ── RIGHT — form ────────────────────────────────────────────── */}
        <div className='flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white'>
          <div className='w-full max-w-md'>

            {/* mobile brand */}
            <div className='lg:hidden flex items-center gap-2 mb-8'>
              <div className='w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center'>
                <svg className='w-3.5 h-3.5 text-white' fill='none' stroke='currentColor' strokeWidth={2.5} viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.5-.875m3.5.875l-.875 3.5' />
                </svg>
              </div>
              <span className='font-bold text-slate-800 text-sm'>RadaBiz</span>
            </div>

            <h2 className='text-2xl font-bold text-slate-900 mb-1'>Welcome Back</h2>
            <p className='text-slate-500 text-sm mb-8'>Access your digital presence dashboard</p>

            <form onSubmit={handleSubmit} className='space-y-5'>

              {/* email */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1.5'>Business Email</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' />
                    </svg>
                  </span>
                  <input
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='name@company.co.ke'
                    className='w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all'
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <div className='flex justify-between mb-1.5'>
                  <label className='text-sm font-medium text-slate-700'>Password</label>
                  <Link to='/forgot-password' className='text-xs text-teal-600 hover:underline'>Forgot Password?</Link>
                </div>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' />
                    </svg>
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='••••••••'
                    className='w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPw(v => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                    tabIndex={-1}
                  >
                    {showPw
                      ? <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88' /></svg>
                      : <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' /><path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className='flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs'>
                  <svg className='w-4 h-4 flex-shrink-0' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm'
              >
                {loading ? 'Signing in…' : 'Log In'}
              </button>
            </form>

            {/* divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-200' />
              </div>
              <div className='relative flex justify-center'>
                <span className='bg-white px-3 text-xs text-slate-400 uppercase tracking-widest'>or continue with</span>
              </div>
            </div>

            {/* social */}
            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`}
                className='flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors'
              >
                <svg className='w-4 h-4' viewBox='0 0 24 24'>
                  <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                  <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                  <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' />
                  <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                </svg>
                Google
              </button>
              <button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook/login`}
                className='flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors'
              >
                <svg className='w-4 h-4 text-[#1877F2]' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
                Facebook
              </button>
            </div>

            <p className='text-center text-sm text-slate-500 mt-8'>
              Don't have an account?{' '}
              <Link to='/register' className='text-teal-600 hover:underline font-medium'>Register your business</Link>
            </p>

          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className='border-t border-slate-100 px-8 py-4 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400'>
        <div className='flex gap-5'>
          <Link to='/terms' className='hover:text-slate-600'>Terms of Service</Link>
          <Link to='/privacy' className='hover:text-slate-600'>Privacy Policy</Link>
          <Link to='/support' className='hover:text-slate-600'>Contact Support</Link>
        </div>
        <span>© {new Date().getFullYear()} RadaBiz. All rights reserved.</span>
      </footer>

    </div>
  )
}
