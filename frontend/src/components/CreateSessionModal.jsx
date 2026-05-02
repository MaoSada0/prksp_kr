import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createSession } from '../api/sessions'
import { getAvailableSlots } from '../api/slots'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Spinner from './Spinner'

export default function CreateSessionModal({ psychologistId, services, onClose, onCreated }) {
  const [form, setForm] = useState({ serviceId: services[0]?.id || '', date: '', slotId: '', meetingLink: '' })
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(false)

  const selected = services.find(s => s.id === form.serviceId)

  useEffect(() => {
    if (!form.date) { setSlots([]); return }
    setLoadingSlots(true)
    setForm(prev => ({ ...prev, slotId: '' }))
    getAvailableSlots(psychologistId, form.date)
      .then(setSlots)
      .catch(() => toast.error('Ошибка загрузки слотов'))
      .finally(() => setLoadingSlots(false))
  }, [form.date, psychologistId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.slotId) { toast.error('Выберите время'); return }
    setLoading(true)
    try {
      const s = await createSession({ psychologistId, serviceId: form.serviceId, slotId: form.slotId, meetingLink: form.meetingLink || null })
      toast.success('Сессия создана')
      onCreated(s)
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка создания сессии') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15,32,53,0.4)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto !p-0">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Записаться на сессию</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-lg transition-colors duration-100"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border-light)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Услуга</label>
            <select className="input" value={form.serviceId}
              onChange={e => setForm({ ...form, serviceId: e.target.value, slotId: '' })} required>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.price} ₽ / {s.durationMinutes} мин</option>
              ))}
            </select>
            {selected?.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{selected.description}</p>
            )}
          </div>

          <div>
            <label className="label">Дата</label>
            <input type="date" className="input" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required min={new Date().toISOString().split('T')[0]} />
          </div>

          {form.date && (
            <div>
              <label className="label">Время</label>
              {loadingSlots ? (
                <Spinner className="py-4" />
              ) : slots.length === 0 ? (
                <div className="text-sm text-center py-4 rounded-lg" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border-light)', color: 'var(--text-faint)' }}>
                  Нет доступных слотов
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map(slot => {
                    const active = form.slotId === slot.id
                    return (
                      <button key={slot.id} type="button"
                        onClick={() => setForm({ ...form, slotId: slot.id })}
                        className="py-2 text-xs font-semibold rounded-lg transition-colors duration-100"
                        style={{
                          border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                          backgroundColor: active ? 'var(--blue)' : 'var(--surface)',
                          color: active ? '#fff' : 'var(--text)',
                        }}>
                        {format(new Date(slot.startTime), 'HH:mm')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">Ссылка на созвон (необязательно)</label>
            <input type="url" className="input" value={form.meetingLink}
              onChange={e => setForm({ ...form, meetingLink: e.target.value })}
              placeholder="https://zoom.us/..." />
          </div>

          <div className="flex gap-3 pt-1" style={{ borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Отмена</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !form.slotId}>
              {loading ? 'Создаём...' : 'Записаться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
