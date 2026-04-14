import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { authApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const SECTORS = [
  'Retail', 'Food & Beverage', 'Fashion', 'Beauty & Wellness',
  'Technology', 'Education', 'Transport', 'Other'
]

const LOCATIONS = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Nyeri', 'Malindi', 'Other'
]

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', businessName: '',
    sector: '', location: '', password: '', agreedToTerms: false
  })

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'google_failed') setError('Google login failed. Please try again.')
    if (err === 'facebook_failed') setError('Facebook login failed. Please try again.')
    if (err === 'facebook_no_email') setError('Facebook login failed: email permission is required.')
  }, [searchParams])

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, businessName, sector, location, password, agreedToTerms } = form
    if (!name || !email || !businessName || !sector || !location || !password) {
      setError(t('common.required')); return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.'); return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters'); return
    }
    setLoading(true)
    setError('')

    try {
      const res = await authApi.register({
        name,
        email,
        businessName,
        sector,
        location,
        password
      })
      login(res.data.user)
      navigate('/onboarding')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <AuthLayout>
      <h2 className='text-xl font-bold text-slate-800 mb-6'>{t('auth.register')}</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>

        {/* Full Name */}
        <div>
          <label className={labelClass}>{t('auth.name')}</label>
          <input
            type='text'
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder='e.g. Wanjiku Kamau'
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>{t('auth.email')}</label>
          <input
            type='email'
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder='you@business.com'
            className={inputClass}
          />
        </div>

        {/* Business Name */}
        <div>
          <label className={labelClass}>{t('auth.businessName')}</label>
          <input
            type='text'
            value={form.businessName}
            onChange={e => update('businessName', e.target.value)}
            placeholder='e.g. Mama Pima Boutique'
            className={inputClass}
          />
        </div>

        {/* Sector + Location side by side */}
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={labelClass}>{t('auth.sector')}</label>
            <select
              value={form.sector}
              onChange={e => update('sector', e.target.value)}
              className={inputClass + ' bg-white'}
            >
              <option value=''>Select...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('auth.location')}</label>
            <select
              value={form.location}
              onChange={e => update('location', e.target.value)}
              className={inputClass + ' bg-white'}
            >
              <option value=''>Select...</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={labelClass}>{t('auth.password')}</label>
          <input
            type='password'
            value={form.password}
            onChange={e => update('password', e.target.value)}
            placeholder='At least 8 characters'
            className={inputClass}
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={form.agreedToTerms}
            onChange={e => update('agreedToTerms', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600">
            I agree to the{' '}
            <Link to="/terms" className="text-teal-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
          </label>
        </div>

        {error && <p className='text-red-500 text-xs'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50'
        >
          {loading ? t('common.loading') : t('auth.register')}
        </button>

      </form>

      {/* Social Logins */}
      <div className='mt-6'>
        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-slate-200'></div>
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-white px-2 text-slate-500'>Or register with</span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`}
            className='flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700'
          >
            <svg className='w-4 h-4' viewBox='0 0 24 24'>
              <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z' />
              <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            Google
          </button>
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook/login`}
            className='flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700'
          >
            <svg className='w-4 h-4 text-[#1877F2]' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <p className='text-center text-sm text-slate-500 mt-4'>
        {t('auth.hasAccount')}{' '}
        <Link to='/login' className='text-teal-600 hover:underline font-medium'>
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}