import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPsychologistSchedule, batchCreateSlots, deleteSlot } from '../../api/slots'
import Spinner from '../../components/Spinner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function fmt(dt) { return format(new Date(dt), 'HH:mm') }

export default function Schedule() {
  const navigate = useNavigate()
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [slotForm, setSlotForm] = useState({ fromTime: '09:00', toTime: '17:00', duration: '60' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setLoadingSlots(true)
    getPsychologistSchedule(date, date)
      .then(setSlots)
      .catch(() => toast.error('Ошибка загрузки расписания'))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const handleCreateSlots = async (e) => {
    e.preventDefault(); setCreating(true)
    try {
      const created = await batchCreateSlots({ date, fromTime: slotForm.fromTime + ':00', toTime: slotForm.toTime + ':00', slotDurationMinutes: Number(slotForm.duration) })
      setSlots(prev => {
        const ids = new Set(prev.map(s => s.id))
        return [...prev, ...created.filter(s => !ids.has(s.id))].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })
      setShowSlotForm(false)
      toast.success(`Создано ${created.length} слот(ов)`)
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка создания') }
    finally { setCreating(false) }
  }

  const handleDeleteSlot = async (id) => {
    try { await deleteSlot(id); setSlots(prev => prev.filter(s => s.id !== id)); toast.success('Слот удалён') }
    catch (err) { toast.error(err.response?.data?.message || 'Ошибка удаления') }
  }

  const shiftDate = (days) => {
    const d = new Date(date); d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Расписание</h2>
        <button className="btn-secondary text-xs" onClick={() => setShowSlotForm(!showSlotForm)}>
          {showSlotForm ? 'Отмена' : '+ Слоты'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className="btn-secondary !px-2.5 !py-1.5 text-sm" onClick={() => shiftDate(-1)}>‹</button>
        <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn-secondary !px-2.5 !py-1.5 text-sm" onClick={() => shiftDate(1)}>›</button>
        <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(date + 'T12:00'), 'EEEE, d MMM', { locale: ru })}
        </span>
      </div>

      {showSlotForm && (
        <form onSubmit={handleCreateSlots} className="p-4 rounded-lg mb-4 space-y-3"
          style={{ backgroundColor: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--blue-dark)' }}>
            Слоты на {format(new Date(date + 'T12:00'), 'd MMMM', { locale: ru })}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">С</label>
              <input type="time" className="input" value={slotForm.fromTime}
                onChange={e => setSlotForm({ ...slotForm, fromTime: e.target.value })} required />
            </div>
            <div>
              <label className="label">По</label>
              <input type="time" className="input" value={slotForm.toTime}
                onChange={e => setSlotForm({ ...slotForm, toTime: e.target.value })} required />
            </div>
            <div>
              <label className="label">Интервал</label>
              <select className="input" value={slotForm.duration}
                onChange={e => setSlotForm({ ...slotForm, duration: e.target.value })}>
                <option value="30">30 мин</option>
                <option value="45">45 мин</option>
                <option value="60">60 мин</option>
                <option value="90">90 мин</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={creating}>
            {creating ? 'Создаём...' : 'Создать'}
          </button>
        </form>
      )}

      {loadingSlots ? (
        <Spinner className="py-8" />
      ) : slots.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-faint)' }}>Нет слотов на этот день</p>
      ) : (
        <div className="space-y-1.5">
          {slots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: slot.isBooked ? 'var(--green-light)' : 'var(--bg)',
                border: `1px solid ${slot.isBooked ? 'var(--green-mid)' : 'var(--border-light)'}`,
              }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {fmt(slot.startTime)} – {fmt(slot.endTime)}
                </span>
                {slot.isBooked ? (
                  <div className="flex items-center gap-2">
                    <span className="badge-green">Занято</span>
                    {slot.clientName && <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>{slot.clientName}</span>}
                    {slot.sessionId && (
                      <button className="text-xs underline" style={{ color: 'var(--blue)' }}
                        onClick={() => navigate(`/sessions/${slot.sessionId}`)}>
                        Сессия →
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="badge-blue">Свободно</span>
                )}
              </div>
              {!slot.isBooked && (
                <button className="text-xs font-semibold transition-colors duration-100"
                  style={{ color: 'var(--text-faint)' }}
                  onClick={() => handleDeleteSlot(slot.id)}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
