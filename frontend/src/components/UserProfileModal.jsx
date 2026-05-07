import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../api/users'
import Avatar from './Avatar'
import PhotoLightbox from './PhotoLightbox'

export default function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [lightbox, setLightbox] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    getUser(userId).then(setProfile).catch(() => {})
  }, [userId])

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : ''

  const handleViewProfile = () => {
    onClose()
    navigate(`/psychologists/${userId}`)
  }

  return (
    <>
      {lightbox && profile?.photoUrl && (
        <PhotoLightbox src={profile.photoUrl} name={fullName} onClose={() => setLightbox(false)} />
      )}

      <div
        className="fixed inset-0 z-40 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      >
        <div
          className="card w-72 p-6 flex flex-col items-center gap-4"
          onClick={e => e.stopPropagation()}
        >
          {!profile ? (
            <div className="py-4">
              <div className="w-6 h-6 rounded-full animate-spin mx-auto" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--blue)' }} />
            </div>
          ) : (
            <>
              <div
                className={profile.photoUrl ? 'cursor-zoom-in' : ''}
                onClick={() => profile.photoUrl && setLightbox(true)}
              >
                <Avatar name={fullName} size="xl" src={profile.photoUrl} />
              </div>

              <div className="text-center">
                <p className="font-bold text-base" style={{ color: 'var(--text)' }}>{fullName}</p>
                <span className="badge-blue mt-1.5 inline-flex">
                  {profile.role === 'PSYCHOLOGIST' ? 'Психолог' : 'Клиент'}
                </span>
              </div>

              {profile.role === 'PSYCHOLOGIST' && (
                <button className="btn-primary w-full text-sm" onClick={handleViewProfile}>
                  Открыть профиль
                </button>
              )}

              <button
                className="text-sm w-full text-center py-1.5 rounded-lg transition-colors duration-100"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={onClose}
              >
                Закрыть
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
