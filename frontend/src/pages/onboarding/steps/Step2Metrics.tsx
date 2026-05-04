/**
 * Step 2 — Manual Metrics Quiz
 *
 * Replaces the OAuth "Connect platforms" step with an engaging
 * self-assessment quiz. 5 sub-steps:
 *   0. Platform picker (tap cards)
 *   1. Profile completeness (4 options)
 *   2. Posting frequency (5 options)
 *   3. Engagement level (4 options)
 *   4. Responsiveness (4 options)
 */

import { useState } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const PLATFORMS = [
    { id: 'WhatsApp', emoji: '💬', label: 'WhatsApp' },
    { id: 'Facebook', emoji: '📘', label: 'Facebook' },
    { id: 'Instagram', emoji: '📸', label: 'Instagram' },
    { id: 'TikTok', emoji: '🎵', label: 'TikTok' },
    { id: 'Twitter/X', emoji: '🐦', label: 'Twitter / X' },
    { id: 'Website', emoji: '🌐', label: 'Website' },
    { id: 'Google Maps', emoji: '📍', label: 'Google Maps' },
]

interface Option {
    label: string
    sublabel: string
    value: number
    emoji: string
}

interface Question {
    key: string
    emoji: string
    title: string
    subtitle: string
    options: Option[]
}

const QUESTIONS: Question[] = [
    {
        key: 'profileComplete',
        emoji: '🪪',
        title: 'How complete are your business profiles?',
        subtitle: 'Think about profile photo, bio, phone number, opening hours and location across your pages.',
        options: [
            { label: 'Fully filled in', sublabel: 'Photo, bio, phone, hours & location — all done', value: 90, emoji: '✅' },
            { label: 'Mostly complete', sublabel: 'A few details still missing here and there', value: 65, emoji: '🟡' },
            { label: 'Partially done', sublabel: 'Only the basics — just a name and maybe a photo', value: 40, emoji: '🟠' },
            { label: 'Barely started', sublabel: 'Account created but nothing else filled in yet', value: 15, emoji: '🔴' },
        ],
    },
    {
        key: 'postFreq',
        emoji: '📅',
        title: 'How often do you post content?',
        subtitle: 'Count posts across all platforms — photos, stories, videos, status updates.',
        options: [
            { label: 'Every single day', sublabel: 'Daily posting — very active presence', value: 100, emoji: '🔥' },
            { label: '4–5 times a week', sublabel: 'Almost daily — great consistency', value: 85, emoji: '💪' },
            { label: '2–3 times a week', sublabel: 'Regular schedule, room to grow', value: 60, emoji: '👍' },
            { label: 'Once a week', sublabel: 'Occasional posting', value: 35, emoji: '😐' },
            { label: 'Rarely or never', sublabel: 'I post only when I remember', value: 10, emoji: '😬' },
        ],
    },
    {
        key: 'engagement',
        emoji: '💬',
        title: 'When you post, how do people react?',
        subtitle: 'Think about likes, comments, shares and saves on your recent posts.',
        options: [
            { label: 'Lots of activity', sublabel: 'Many likes, comments & shares every post', value: 90, emoji: '🚀' },
            { label: 'Good response', sublabel: 'Some likes, occasional comments', value: 65, emoji: '😊' },
            { label: 'A little quiet', sublabel: 'A few likes, rarely any comments', value: 35, emoji: '🤫' },
            { label: 'Almost nothing', sublabel: 'Posts go mostly unnoticed', value: 10, emoji: '😶' },
        ],
    },
    {
        key: 'responsiveness',
        emoji: '⚡',
        title: 'How quickly do you reply to customers?',
        subtitle: 'Think about WhatsApp messages, DMs, comments and any enquiries you receive.',
        options: [
            { label: 'Within an hour', sublabel: 'Very fast — customers love this', value: 100, emoji: '⚡' },
            { label: 'Same day', sublabel: 'Back before end of business day', value: 75, emoji: '🕐' },
            { label: 'Next day', sublabel: 'I reply the following day', value: 50, emoji: '🕑' },
            { label: 'When I remember', sublabel: 'It can sometimes take a few days', value: 20, emoji: '😅' },
        ],
    },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MetricsData {
    platforms: string[]
    profileComplete: number
    postFreq: number
    engagement: number
    responsiveness: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step2Metrics({
    onBack,
    onComplete,
}: {
    onBack: () => void
    onComplete: (data: MetricsData) => void
}) {
    const TOTAL = 1 + QUESTIONS.length // platform picker + 4 questions

    const [subStep, setSubStep] = useState(0)
    const [platforms, setPlatforms] = useState<string[]>([])
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [selected, setSelected] = useState<number | null>(null)

    const progress = Math.round((subStep / TOTAL) * 100)
    const q = subStep > 0 ? QUESTIONS[subStep - 1] : null

    // ── Handlers ───────────────────────────────────────────────────────────────

    const togglePlatform = (id: string) =>
        setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

    const goNext = () => {
        if (subStep === 0) {
            setSubStep(1)
            setSelected(null)
            return
        }

        if (selected === null) return

        const key = QUESTIONS[subStep - 1].key
        const newAnswers = { ...answers, [key]: selected }
        setAnswers(newAnswers)
        setSelected(null)

        if (subStep < QUESTIONS.length) {
            setSubStep(s => s + 1)
        } else {
            // All questions answered — fire callback
            onComplete({
                platforms,
                profileComplete: newAnswers.profileComplete ?? 50,
                postFreq: newAnswers.postFreq ?? 50,
                engagement: newAnswers.engagement ?? 50,
                responsiveness: newAnswers.responsiveness ?? 50,
            })
        }
    }

    const goBack = () => {
        if (subStep === 0) {
            onBack()
            return
        }
        const prevKey = subStep > 1 ? QUESTIONS[subStep - 2].key : null
        setSelected(prevKey ? (answers[prevKey] ?? null) : null)
        setSubStep(s => s - 1)
    }

    const canProceed = subStep === 0 ? platforms.length > 0 : selected !== null
    const isLast = subStep === TOTAL - 1

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div>
            {/* ── Progress bar ── */}
            <div className='mb-5'>
                <div className='flex justify-between text-xs text-slate-400 mb-1.5'>
                    <span>Question {subStep + 1} of {TOTAL}</span>
                    <span className='font-medium text-teal-600'>{progress}% done</span>
                </div>
                <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                    <div
                        className='h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-500'
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ── Platform Picker ── */}
            {subStep === 0 && (
                <div>
                    <div className='text-4xl text-center mb-2'>📱</div>
                    <h2 className='text-xl font-bold text-slate-800 mb-1 text-center'>
                        Which platforms are you on?
                    </h2>
                    <p className='text-slate-500 text-sm mb-5 text-center'>
                        Tap all that apply — even if you haven't posted recently.
                    </p>

                    <div className='grid grid-cols-2 gap-2.5 mb-3'>
                        {PLATFORMS.map(pl => {
                            const active = platforms.includes(pl.id)
                            return (
                                <button
                                    key={pl.id}
                                    type='button'
                                    onClick={() => togglePlatform(pl.id)}
                                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2
                    text-left transition-all duration-200 select-none
                    ${active
                                            ? 'border-teal-400 bg-teal-50 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className='text-xl'>{pl.emoji}</span>
                                    <span className={`text-sm font-medium flex-1 ${active ? 'text-teal-700' : 'text-slate-600'}`}>
                                        {pl.label}
                                    </span>
                                    {active && (
                                        <span className='w-5 h-5 rounded-full bg-teal-500 flex items-center
                                     justify-center text-white text-xs shrink-0'>
                                            ✓
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <p className='text-center text-xs mb-1 font-medium
                        ${platforms.length > 0 ? "text-teal-600" : "text-slate-400"}'>
                        {platforms.length === 0
                            ? 'Select at least one to continue'
                            : `🎉 ${platforms.length} platform${platforms.length > 1 ? 's' : ''} selected!`}
                    </p>
                </div>
            )}

            {/* ── Metric Question Cards ── */}
            {q && (
                <div>
                    <div className='text-4xl text-center mb-2'>{q.emoji}</div>
                    <h2 className='text-xl font-bold text-slate-800 mb-1 text-center'>{q.title}</h2>
                    <p className='text-slate-500 text-sm mb-5 text-center'>{q.subtitle}</p>

                    <div className='space-y-2.5 mb-2'>
                        {q.options.map(opt => {
                            const isSelected = selected === opt.value
                            return (
                                <button
                                    key={opt.value}
                                    type='button'
                                    onClick={() => setSelected(opt.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2
                    text-left transition-all duration-200 select-none
                    ${isSelected
                                            ? 'border-teal-400 bg-teal-50 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className='text-xl shrink-0'>{opt.emoji}</span>
                                    <div className='flex-1 min-w-0'>
                                        <p className={`text-sm font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </p>
                                        <p className='text-xs text-slate-400 mt-0.5 leading-relaxed'>
                                            {opt.sublabel}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <span className='w-5 h-5 rounded-full bg-teal-500 flex items-center
                                     justify-center text-white text-xs shrink-0'>
                                            ✓
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Navigation ── */}
            <div className='flex gap-3 mt-5'>
                <button
                    type='button'
                    onClick={goBack}
                    className='flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg
                     text-sm font-medium hover:bg-slate-50 transition-colors'
                >
                    ← Back
                </button>
                <button
                    type='button'
                    onClick={goNext}
                    disabled={!canProceed}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
            ${canProceed
                            ? 'bg-teal-500 hover:bg-teal-600 shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isLast ? '🚀 Calculate My Score' : 'Next →'}
                </button>
            </div>
        </div>
    )
}
