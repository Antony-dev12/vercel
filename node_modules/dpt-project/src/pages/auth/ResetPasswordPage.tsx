import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirm) { setError(t('common.required')); return }
    if (password.length < 8)   { setError('Password must be at least 8 characters'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    // Role 4 will replace with: await authApi.resetPassword(token, password)
    setTimeout(() => { setLoading(false); setDone(true) }, 1000)
  }

  const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-sm'

  return (
    <AuthLayout>
      {done ? (
        <div className='text-center py-4'>
          <div className='w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-teal-600 text-2xl'>✓</span>
          </div>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>Password updated!</h2>
          <p className='text-slate-500 text-sm mb-6'>
            Your password has been reset successfully.
          </p>
          <Link
            to='/login'
            className='w-full block py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors text-center text-sm'
          >
            Sign In
          </Link>
        </div>
      ) : (
        <>
          <h2 className='text-xl font-bold text-slate-800 mb-2'>Set new password</h2>
          <p className='text-slate-500 text-sm mb-6'>
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1'>
                New password
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='At least 8 characters'
                className={inputClass}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1'>
                Confirm password
              </label>
              <input
                type='password'
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder='Repeat your password'
                className={inputClass}
              />
            </div>

            {error && <p className='text-red-500 text-xs'>{error}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50'
            >
              {loading ? t('common.loading') : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}