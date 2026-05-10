import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getPsychologistServices, createService, deleteService } from '../../api/psychologists'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'

export default function Services() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: '', durationMinutes: '' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!user?.userId) return
    getPsychologistServices(user.userId)
      .then(setServices)
      .catch(() => toast.error('Ошибка загрузки услуг'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const s = await createService({
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
      })
      setServices(prev => [...prev, s])
      setForm({ name: '', description: '', price: '', durationMinutes: '' })
      setShowForm(false)
      toast.success('Услуга добавлена')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления')
    } finally { setAdding(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteService(id)
      setServices(prev => prev.filter(s => s.id !== id))
      toast.success('Услуга удалена')
    } catch { toast.error('Ошибка удаления') }
  }

  if (loading) return <Spinner className="py-20" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Мои услуги</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Новая услуга</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Название</label>
              <input type="text" className="input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required placeholder="Индивидуальная консультация" />
            </div>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
              <div>
                <label className="label">Цена (₽)</label>
                <input type="number" className="input" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required min={1} placeholder="3000" />
              </div>
              <div>
                <label className="label">Длительность (мин)</label>
                <input type="number" className="input" value={form.durationMinutes}
                  onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                  required min={15} placeholder="60" />
              </div>
            </div>
            <div>
              <label className="label">Описание</label>
              <textarea className="input resize-none" rows={2} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Краткое описание..." />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={adding}>
              {adding ? 'Добавляем...' : 'Добавить'}
            </button>
          </form>
        </div>
      )}

      {services.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-faint)' }}>
          <p className="font-semibold mb-1">Нет услуг</p>
          <p className="text-sm">Добавьте первую услугу, чтобы клиенты могли к вам записаться</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map(s => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.name}</span>
                <span className="font-bold text-base shrink-0" style={{ color: 'var(--blue)' }}>{s.price} ₽</span>
              </div>
              {s.description && (
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
              )}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="badge-blue">{s.durationMinutes} мин</span>
                <button
                  className="text-xs font-semibold transition-colors duration-100"
                  style={{ color: 'var(--text-faint)' }}
                  onClick={() => handleDelete(s.id)}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
