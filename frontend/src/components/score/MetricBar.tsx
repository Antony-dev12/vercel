interface Props {
  label:  string
  value:  number
  weight: number
  color?: string
}

export function MetricBar({ label, value, weight, color = 'bg-teal-500' }: Props) {
  return (
    <div className='mb-4'>
      <div className='flex justify-between items-center mb-1.5'>
        <span className='text-sm font-medium text-slate-700'>{label}</span>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-slate-400'>
            {(weight * 100).toFixed(0)}% weight
          </span>
          <span className='text-sm font-bold text-slate-800'>{value}</span>
        </div>
      </div>
      <div className='h-2.5 bg-slate-100 rounded-full overflow-hidden'>
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}