import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getPsychologist,
  getPsychologistServices,
  updateProfile,
  createService,
  deleteService,
} from '../../api/psychologists'
import { getPsychologistSchedule, batchCreateSlots, deleteSlot } from '../../api/slots'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import { format, addDays, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'

function formatTime(dt) {
  return format(new Date(dt), 'HH:mm')
}

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    const day = slot.startTime.split('T')[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {})
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [profileForm, setProfileForm] = useState({ bio: '', education: '', experienceYears: '', photoUrl: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', durationMinutes: '' })
  const [addingService, setAddingService] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)

  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [showSlotForm, setShowSlotForm] = useState(false)
  const [slotForm, setSlotForm] = useState({ fromTime: '09:00', toTime: '17:00', duration: '60' })
  const [creatingSlots, setCreatingSlots] = useState(false)

  useEffect(() => {
    if (!user?.userId) return
    Promise.all([getPsychologist(user.userId), getPsychologistServices(user.userId)])
      .then(([p, s]) => {
        setProfile(p)
        setServices(s)
        setProfileForm({
          bio: p.bio || '',
          education: p.education || '',
          experienceYears: p.experienceYears || '',
          photoUrl: p.photoUrl || '',
        })
      })
      .catch(() => toast.error('Ошибка загрузки профиля'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const fetchSlots = (date) => {
    setLoadingSlots(true)
    const from = date
    const to = date
    getPsychologistSchedule(from, to)
      .then(setSlots)
      .catch(() => toast.error('Ошибка загрузки расписания'))
      .finally(() => setLoadingSlots(false))
  }

  useEffect(() => {
    if (user?.role === 'PSYCHOLOGIST') fetchSlots(scheduleDate)
  }, [scheduleDate, user?.role])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await updateProfile({
        ...profileForm,
        experienceYears: profileForm.experienceYears ? Number(profileForm.experienceYears) : null,
      })
      setProfile(updated)
      toast.success('Профиль сохранён')
    } catch {
      toast.error('Ошибка сохранения')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    setAddingService(true)
    try {
      const service = await createService({
        name: serviceForm.name,
        description: serviceForm.description || null,
        price: Number(serviceForm.price),
        durationMinutes: Number(serviceForm.durationMinutes),
      })
      setServices((prev) => [...prev, service])
      setServiceForm({ name: '', description: '', price: '', durationMinutes: '' })
      setShowServiceForm(false)
      toast.success('Услуга добавлена')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления услуги')
    } finally {
      setAddingService(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(serviceId)
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
      toast.success('Услуга удалена')
    } catch {
      toast.error('Ошибка удаления услуги')
    }
  }

  const handleBatchCreateSlots = async (e) => {
    e.preventDefault()
    setCreatingSlots(true)
    try {
      const created = await batchCreateSlots({
        date: scheduleDate,
        fromTime: slotForm.fromTime + ':00',
        toTime: slotForm.toTime + ':00',
        slotDurationMinutes: Number(slotForm.duration),
      })
      setSlots((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const newSlots = created.filter((s) => !existingIds.has(s.id))
        return [...prev, ...newSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })
      setShowSlotForm(false)
      toast.success(`Создано ${created.length} слот(ов)`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка создания слотов')
    } finally {
      setCreatingSlots(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlot(slotId)
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      toast.success('Слот удалён')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка удаления')
    }
  }

  if (loading) return <Spinner className="py-20" />

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о профиле</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="label">О себе</label>
            <textarea
              className="input resize-none"
              rows={4}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Расскажите о своём подходе и специализации..."
            />
          </div>
          <div>
            <label className="label">Образование</label>
            <input
              type="text"
              className="input"
              value={profileForm.education}
              onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
              placeholder="МГУ, кафедра психологии..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Опыт (лет)</label>
              <input
                type="number"
                className="input"
                value={profileForm.experienceYears}
                onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                min={0}
                placeholder="5"
              />
            </div>
            <div>
              <label className="label">Фото URL</label>
              <input
                type="url"
                className="input"
                value={profileForm.photoUrl}
                onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Сохраняем...' : 'Сохранить профиль'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Мои услуги</h2>
          <button
            className="btn-primary text-sm"
            onClick={() => setShowServiceForm(!showServiceForm)}
          >
            {showServiceForm ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {showServiceForm && (
          <form onSubmit={handleAddService} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Название</label>
                <input
                  type="text"
                  className="input"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                  placeholder="Индивидуальная консультация"
                />
              </div>
              <div>
                <label className="label">Цена (₽)</label>
                <input
                  type="number"
                  className="input"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                  min={1}
                  placeholder="3000"
                />
              </div>
              <div>
                <label className="label">Длительность (мин)</label>
                <input
                  type="number"
                  className="input"
                  value={serviceForm.durationMinutes}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, durationMinutes: e.target.value })
                  }
                  required
                  min={15}
                  placeholder="60"
                />
              </div>
              <div className="col-span-2">
                <label className="label">Описание</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  placeholder="Краткое описание услуги..."
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={addingService}>
              {addingService ? 'Добавляем...' : 'Добавить услугу'}
            </button>
          </form>
        )}

        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Добавьте первую услугу</div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                  )}
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>{service.price} ₽</span>
                    <span>{service.durationMinutes} мин</span>
                  </div>
                </div>
                <button
                  className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 transition-colors"
                  onClick={() => handleDeleteService(service.id)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Расписание</h2>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary px-2 py-1 text-sm"
              onClick={() => {
                const d = new Date(scheduleDate)
                d.setDate(d.getDate() - 1)
                setScheduleDate(d.toISOString().split('T')[0])
              }}
            >
              ‹
            </button>
            <input
              type="date"
              className="input w-auto"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <button
              className="btn-secondary px-2 py-1 text-sm"
              onClick={() => {
                const d = new Date(scheduleDate)
                d.setDate(d.getDate() + 1)
                setScheduleDate(d.toISOString().split('T')[0])
              }}
            >
              ›
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(scheduleDate + 'T12:00'), 'EEEE, d MMMM', { locale: ru })}
          </span>
          <button
            className="btn-primary text-sm ml-auto"
            onClick={() => setShowSlotForm(!showSlotForm)}
          >
            {showSlotForm ? 'Отмена' : '+ Создать слоты'}
          </button>
        </div>

        {showSlotForm && (
          <form
            onSubmit={handleBatchCreateSlots}
            className="bg-indigo-50 rounded-xl p-4 mb-4 space-y-3"
          >
            <p className="text-sm font-medium text-indigo-800">
              Создать слоты на{' '}
              {format(new Date(scheduleDate + 'T12:00'), 'd MMMM', { locale: ru })}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">С</label>
                <input
                  type="time"
                  className="input"
                  value={slotForm.fromTime}
                  onChange={(e) => setSlotForm({ ...slotForm, fromTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">По</label>
                <input
                  type="time"
                  className="input"
                  value={slotForm.toTime}
                  onChange={(e) => setSlotForm({ ...slotForm, toTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Интервал</label>
                <select
                  className="input"
                  value={slotForm.duration}
                  onChange={(e) => setSlotForm({ ...slotForm, duration: e.target.value })}
                >
                  <option value="30">30 мин</option>
                  <option value="45">45 мин</option>
                  <option value="60">60 мин</option>
                  <option value="90">90 мин</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={creatingSlots}>
              {creatingSlots ? 'Создаём...' : 'Создать слоты'}
            </button>
          </form>
        )}

        {loadingSlots ? (
          <Spinner className="py-8" />
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Нет слотов на этот день
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl ${
                  slot.isBooked ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-gray-800">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                  {slot.isBooked ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Занято
                      </span>
                      {slot.clientName && (
                        <span className="text-sm text-gray-700">{slot.clientName}</span>
                      )}
                      {slot.sessionId && (
                        <button
                          className="text-xs text-indigo-600 hover:underline"
                          onClick={() => navigate(`/sessions/${slot.sessionId}`)}
                        >
                          → сессия
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Свободно
                    </span>
                  )}
                </div>
                {!slot.isBooked && (
                  <button
                    className="text-red-400 hover:text-red-600 text-xs transition-colors flex-shrink-0"
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
