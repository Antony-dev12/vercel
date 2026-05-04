/**
 * Onboarding flow — 2 steps:
 *   1. Business info (sector + location)
 *   2. Metrics quiz (platform picker + 4 self-assessment questions)
 *
 * After the quiz the score is saved and the user is sent straight to the dashboard.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Step1Business, type BusinessData } from './steps/Step1Business'
import { Step2Metrics, type MetricsData } from './steps/Step2Metrics'
import { scoreApi } from '../../lib/api'

type Step = 1 | 2

export default function OnboardingPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── Step 1 → 2 ────────────────────────────────────────────────────────────
  const handleStep1Done = (data: BusinessData) => {
    setBusinessData(data)
    setStep(2)
  }

  // ── Step 2 → API → Dashboard ──────────────────────────────────────────────
  const handleMetricsDone = async (metrics: MetricsData) => {
    setLoading(true)
    setApiError('')
    try {
      await scoreApi.calculate({
        ...metrics,
        sector: businessData?.sector ?? undefined,
        location: businessData?.location ?? undefined,
        source: 'manual',
      })
      // Score saved — head straight to the dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setApiError(err?.response?.data?.error ?? 'Could not calculate score. Please try again.')
      setLoading(false)
    }
  }

  const STEP_LABELS = ['Your Business', 'Quick Quiz']

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4'>
      <div className='max-w-lg mx-auto'>

        {/* Logo */}
        <div className='text-center pt-8 mb-6'>
          <div className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500 mb-3'>
            <span className='text-white font-bold text-lg'>D</span>
          </div>
          <p className='text-sm text-slate-500'>Digital Presence Tracker</p>
        </div>

        {/* Progress dots — 2 steps */}
        <div className='flex items-center justify-center gap-2 mb-2'>
          {([1, 2] as const).map((num, i) => (
            <div key={num} className='flex items-center gap-2'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-300
                ${step > num
                  ? 'bg-teal-500 text-white'
                  : step === num
                    ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                    : 'bg-slate-200 text-slate-400'}`}>
                {step > num ? '✓' : num}
              </div>
              {i < 1 && (
                <div className={`w-16 h-0.5 transition-all duration-500
                  ${step > num ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <p className='text-center text-xs text-slate-400 mb-6'>
          {STEP_LABELS[step - 1]}
        </p>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>

          {loading ? (
            /* Saving + redirecting spinner */
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='relative w-16 h-16 mb-5'>
                <div className='absolute inset-0 rounded-full border-4 border-slate-100' />
                <div className='absolute inset-0 rounded-full border-4 border-teal-500
                                border-t-transparent animate-spin' />
              </div>
              <p className='text-slate-700 font-semibold mb-1'>Calculating your score…</p>
              <p className='text-slate-400 text-sm'>Taking you to your dashboard</p>
            </div>
          ) : (
            <>
              {apiError && (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
                                text-red-600 text-sm text-center'>
                  {apiError}
                </div>
              )}

              {step === 1 && (
                <Step1Business onNext={handleStep1Done} />
              )}
              {step === 2 && (
                <Step2Metrics
                  onBack={() => setStep(1)}
                  onComplete={handleMetricsDone}
                />
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
