import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getPsychologist, updateProfile } from '../../api/psychologists'
import { getReviews } from '../../api/reviews'
import { uploadAvatar } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import PhotoLightbox from '../../components/PhotoLightbox'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pForm, setPForm] = useState({ bio: '', education: '', experienceYears: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [lightbox, setLightbox] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!user?.userId) return
    Promise.all([getPsychologist(user.userId), getReviews(user.userId)])
      .then(([p, r]) => {
        setProfile(p)
        setPForm({ bio: p.bio||'', education: p.education||'', experienceYears: p.experienceYears||'' })
        setReviews(r)
      })
      .catch(() => toast.error('Ошибка загрузки профиля'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const updated = await uploadAvatar(file)
      updateUser({ photoUrl: updated.photoUrl })
      toast.success('Фото обновлено')
    } catch {
      toast.error('Ошибка загрузки фото')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const updated = await updateProfile({ ...pForm, experienceYears: pForm.experienceYears ? Number(pForm.experienceYears) : null })
      setProfile(updated); toast.success('Профиль сохранён')
    } catch { toast.error('Ошибка сохранения') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner className="py-20" />

  return (
    <div className="space-y-5">
      {lightbox && user?.photoUrl && (
        <PhotoLightbox src={user.photoUrl} name={`${user?.firstName} ${user?.lastName}`} onClose={() => setLightbox(false)} />
      )}

      <div className="card flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className={user?.photoUrl ? 'cursor-zoom-in' : 'cursor-pointer'}
            onClick={() => user?.photoUrl ? setLightbox(true) : fileRef.current?.click()}
          >
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" src={user?.photoUrl} />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-opacity"
            style={{ backgroundColor: 'var(--blue)', color: 'white', opacity: uploading ? 0.7 : 1 }}
            title="Изменить фото"
          >
            {uploading
              ? <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            }
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        <div>
          <p className="font-bold" style={{ color: 'var(--text)' }}>{user?.firstName} {user?.lastName}</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <span className="badge-blue mt-1.5 inline-flex">Психолог</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Информация о профиле</h2>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">О себе</label>
            <textarea className="input resize-none" rows={4} value={pForm.bio}
              onChange={e => setPForm({ ...pForm, bio: e.target.value })}
              placeholder="Расскажите о своём подходе и специализации..." />
          </div>
          <div>
            <label className="label">Образование</label>
            <input type="text" className="input" value={pForm.education}
              onChange={e => setPForm({ ...pForm, education: e.target.value })}
              placeholder="МГУ, кафедра психологии..." />
          </div>
          <div>
            <label className="label">Опыт (лет)</label>
            <input type="number" className="input" value={pForm.experienceYears}
              onChange={e => setPForm({ ...pForm, experienceYears: e.target.value })}
              min={0} placeholder="5" />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>
          Отзывы ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="card text-center py-10" style={{ color: 'var(--text-faint)' }}>Отзывов пока нет</div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.clientName} size="sm" src={r.clientPhotoUrl} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#D97706' }}>{'★'.repeat(r.rating)}</span>
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {format(new Date(r.createdAt), 'd MMM yyyy', { locale: ru })}
                    </span>
                  </div>
                </div>
                {r.content && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
