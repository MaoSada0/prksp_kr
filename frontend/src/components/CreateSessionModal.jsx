import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createSession } from '../api/sessions'
import { getAvailableSlots } from '../api/slots'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Spinner from './Spinner'

export default function CreateSessionModal({ psychologistId, services, onClose, onCreated }) {
  const [form, setForm] = useState({
    serviceId: services[0]?.id || '',
    date: '',
    slotId: '',
    meetingLink: '',
  })
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedService = services.find((s) => s.id === form.serviceId)

  useEffect(() => {
    if (!form.date) {
      setSlots([])
      return
    }
    setLoadingSlots(true)
    setForm((prev) => ({ ...prev, slotId: '' }))
    getAvailableSlots(psychologistId, form.date)
      .then(setSlots)
      .catch(() => toast.error('Ошибка загрузки слотов'))
      .finally(() => setLoadingSlots(false))
  }, [form.date, psychologistId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.slotId) {
      toast.error('Выберите время')
      return
    }
    setLoading(true)
    try {
      const session = await createSession({
        psychologistId,
        serviceId: form.serviceId,
        slotId: form.slotId,
        meetingLink: form.meetingLink || null,
      })
      toast.success('Сессия создана')
      onCreated(session)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка создания сессии')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Записаться на сессию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Услуга</label>
            <select
              className="input"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value, slotId: '' })}
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.price} ₽ / {s.durationMinutes} мин
                </option>
              ))}
            </select>
            {selectedService?.description && (
              <p className="text-xs text-gray-500 mt-1">{selectedService.description}</p>
            )}
          </div>

          <div>
            <label className="label">Дата</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={today}
            />
          </div>

          {form.date && (
            <div>
              <label className="label">Доступное время</label>
              {loadingSlots ? (
                <Spinner className="py-4" />
              ) : slots.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-xl">
                  Нет доступных слотов на эту дату
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setForm({ ...form, slotId: slot.id })}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.slotId === slot.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                      }`}
                    >
                      {format(new Date(slot.startTime), 'HH:mm')}
                      <span className="block text-xs opacity-60">
                        {format(new Date(slot.endTime), 'HH:mm')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">Ссылка на созвон (необязательно)</label>
            <input
              type="url"
              className="input"
              value={form.meetingLink}
              onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              placeholder="https://zoom.us/..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || !form.slotId}
            >
              {loading ? 'Создаём...' : 'Записаться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
