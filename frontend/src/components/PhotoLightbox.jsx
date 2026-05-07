import { useEffect } from 'react'

export default function PhotoLightbox({ src, name, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-white text-4xl leading-none opacity-70 hover:opacity-100 transition-opacity"
      >×</button>

      <img
        src={src}
        alt={name}
        onClick={e => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      />

      {name && (
        <p className="mt-4 text-white text-sm opacity-60 select-none">{name}</p>
      )}
    </div>
  )
}
