import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { updateMe, uploadAvatar } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import PhotoLightbox from '../../components/PhotoLightbox'

export default function ClientProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const fileRef = useRef(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateMe(form)
      updateUser({ firstName: updated.firstName, lastName: updated.lastName })
      toast.success('Профиль сохранён')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

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
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
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
          <span className="badge-blue mt-1.5 inline-flex">Клиент</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Редактировать профиль</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Имя</label>
              <input type="text" className="input" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} required placeholder="Иван" />
            </div>
            <div>
              <label className="label">Фамилия</label>
              <input type="text" className="input" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} required placeholder="Иванов" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={user?.email || ''} disabled
              style={{ opacity: 0.55, cursor: 'not-allowed' }} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Email изменить нельзя</p>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
