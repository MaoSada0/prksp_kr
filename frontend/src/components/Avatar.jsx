const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-13 h-13 text-base',
  xl: 'w-16 h-16 text-xl',
}

const colors = [
  ['#DBEAFE', '#1D4ED8'],
  ['#D1FAE5', '#065F46'],
  ['#E0E7FF', '#3730A3'],
  ['#FEF3C7', '#92400E'],
  ['#FCE7F3', '#9D174D'],
  ['#CCFBF1', '#115E59'],
]

function pickColor(name) {
  let n = 0
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i)
  return colors[n % colors.length]
}

export default function Avatar({ name = '', size = 'md', src = null }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
        style={{ border: '2px solid var(--border-light)' }}
      />
    )
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  const [bg, fg] = pickColor(name || '?')
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials}
    </div>
  )
}
