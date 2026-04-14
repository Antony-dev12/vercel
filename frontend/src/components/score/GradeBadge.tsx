import { useTranslation } from 'react-i18next'

const GRADE_STYLES = {
  A: 'bg-teal-100   text-teal-700   border-teal-300',
  B: 'bg-green-100  text-green-700  border-green-300',
  C: 'bg-amber-100  text-amber-700  border-amber-300',
  D: 'bg-orange-100 text-orange-700 border-orange-300',
  F: 'bg-red-100    text-red-700    border-red-300',
}

export function GradeBadge({ grade }: { grade: 'A'|'B'|'C'|'D'|'F' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5
      text-sm font-bold rounded-full border ${GRADE_STYLES[grade]}`}>
      Grade {grade} — {t(`grades.${grade}`)}
    </span>
  )
}