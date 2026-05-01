import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '../../api/sessions'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const statusConfig = {
  SCHEDULED: { label: 'Запланирована', cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Идёт', cls: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Завершена', cls: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Отменена', cls: 'bg-red-100 text-red-700' },
}

export default function SessionList() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Сессии</h1>

      {sessions.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Нет сессий</p>
          {user?.role === 'CLIENT' && (
            <p className="text-sm">
              Запишитесь к психологу через{' '}
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => navigate('/psychologists')}
              >
                каталог
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const status = statusConfig[session.status]
            const person =
              user?.role === 'CLIENT' ? session.psychologistName : session.clientName
            return (
              <div
                key={session.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{session.serviceName}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'CLIENT' ? 'Психолог:' : 'Клиент:'} {person}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(session.scheduledAt), 'd MMM yyyy', { locale: ru })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(session.scheduledAt), 'HH:mm', { locale: ru })}
                    </p>
                    <p className="text-xs text-gray-400">{session.serviceDurationMinutes} мин</p>
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
