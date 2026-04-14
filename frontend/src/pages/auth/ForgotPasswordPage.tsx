import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError(t('common.required')); return }
    setLoading(true)
    setError('')
    // Role 4 will replace with: await authApi.forgotPassword(email)
    setTimeout(() => { setLoading(false); setSent(true) }, 1000)
  }

  return (
    <AuthLayout>
      {sent ? (
        /* Success state */
        <div className='text-center py-4'>
          <div className='w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-teal-600 text-2xl'>✓</span>
          </div>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>Check your email</h2>
          <p className='text-slate-500 text-sm mb-6'>
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            to='/login'
            className='text-teal-600 hover:underline text-sm font-medium'
          >
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        /* Form state */
        <>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>
            Forgot password?
          </h2>
          <p className='text-slate-500 text-sm mb-6'>
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1'>
                {t('auth.email')}
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@business.com'
                className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-sm'
              />
            </div>

            {error && <p className='text-red-500 text-xs'>{error}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50'
            >
              {loading ? t('common.loading') : 'Send Reset Link'}
            </button>
          </form>

          <p className='text-center text-sm text-slate-500 mt-4'>
            <Link to='/login' className='text-teal-600 hover:underline font-medium'>
              ← {t('common.back')} to Sign In
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}