import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '../../api/sessions'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const statusConfig = {
  SCHEDULED:   { label: 'Запланирована', cls: 'badge-blue' },
  IN_PROGRESS: { label: 'Идёт',          cls: 'badge-amber' },
  COMPLETED:   { label: 'Завершена',     cls: 'badge-green' },
  CANCELLED:   { label: 'Отменена',      cls: 'badge-red' },
}

export default function SessionList() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getSessions().then(setSessions).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="py-20" />

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Сессии</h1>

      {sessions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-base mb-2" style={{ color: 'var(--text-faint)' }}>Нет сессий</p>
          {user?.role === 'CLIENT' && (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
              Запишитесь через{' '}
              <button className="font-semibold" style={{ color: 'var(--blue)' }} onClick={() => navigate('/psychologists')}>
                каталог психологов
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => {
            const st = statusConfig[s.status]
            const person = user?.role === 'CLIENT' ? s.psychologistName : s.clientName
            return (
              <div key={s.id} className="card cursor-pointer transition-shadow duration-150 !py-4"
                onClick={() => navigate(`/sessions/${s.id}`)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.serviceName}</span>
                      <span className={st.cls}>{st.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user?.role === 'CLIENT' ? 'Психолог: ' : 'Клиент: '}{person}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {format(new Date(s.scheduledAt), 'd MMM', { locale: ru })}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(s.scheduledAt), 'HH:mm')} · {s.serviceDurationMinutes} мин
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
