const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export default function Avatar({ name = '', size = 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div
      className={`${sizes[size]} bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  )
}
