import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Step1Business } from './steps/Step1Business'
import { Step2Connect }  from './steps/Step2Connect'
import { Step3Score }    from './steps/Step3Score'

export default function OnboardingPage() {
  useTranslation()
  const [step, setStep] = useState(1)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4'>
      <div className='max-w-lg mx-auto'>

        {/* Logo */}
        <div className='text-center pt-8 mb-6'>
          <div className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500 mb-3'>
            <span className='text-white font-bold'>D</span>
          </div>
          <p className='text-sm text-slate-500'>Digital Presence Tracker</p>
        </div>

        {/* Progress dots */}
        <div className='flex items-center justify-center gap-2 mb-4'>
          {[1, 2, 3].map((num, i) => (
            <div key={num} className='flex items-center gap-2'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-bold transition-all duration-300
                ${step > num
                  ? 'bg-teal-500 text-white'
                  : step === num
                  ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                  : 'bg-slate-200 text-slate-400'}`}>
                {step > num ? '✓' : num}
              </div>
              {i < 2 && (
                <div className={`w-16 h-0.5 transition-all duration-300
                  ${step > num ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <p className='text-center text-xs text-slate-400 mb-6'>
          Step {step} of 3
        </p>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
          {step === 1 && <Step1Business onNext={() => setStep(2)} />}
          {step === 2 && <Step2Connect  onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3Score />}
        </div>

      </div>
    </div>
  )
}