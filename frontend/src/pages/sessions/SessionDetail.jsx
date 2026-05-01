import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSession, updateSessionStatus, getComments, addComment } from '../../api/sessions'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const statusConfig = {
  SCHEDULED: { label: 'Запланирована', cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Идёт', cls: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Завершена', cls: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Отменена', cls: 'bg-red-100 text-red-700' },
}

export default function SessionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getSession(id), getComments(id)])
      .then(([s, c]) => {
        setSession(s)
        setComments(c)
      })
      .catch(() => toast.error('Ошибка загрузки сессии'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async (status) => {
    try {
      const updated = await updateSessionStatus(id, { status })
      setSession(updated)
      toast.success('Статус обновлён')
    } catch {
      toast.error('Ошибка обновления статуса')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const comment = await addComment(id, { content: commentText.trim() })
      setComments((prev) => [...prev, comment])
      setCommentText('')
    } catch {
      toast.error('Ошибка добавления комментария')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner className="py-20" />
  if (!session) return null

  const status = statusConfig[session.status]
  const canStart = session.status === 'SCHEDULED'
  const canComplete = session.status === 'IN_PROGRESS'
  const canCancel = session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/sessions')} className="text-gray-400 hover:text-gray-600">
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Сессия</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{session.serviceName}</h2>
            <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {canStart && (
              <button
                className="btn-primary text-sm"
                onClick={() => handleStatusUpdate('IN_PROGRESS')}
              >
                Начать
              </button>
            )}
            {canComplete && (
              <button
                className="btn-primary text-sm"
                onClick={() => handleStatusUpdate('COMPLETED')}
              >
                Завершить
              </button>
            )}
            {canCancel && (
              <button
                className="btn-danger text-sm"
                onClick={() => handleStatusUpdate('CANCELLED')}
              >
                Отменить
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Клиент:</span>{' '}
              <span className="font-medium text-gray-900">{session.clientName}</span>
            </div>
            <div>
              <span className="text-gray-500">Психолог:</span>{' '}
              <span className="font-medium text-gray-900">{session.psychologistName}</span>
            </div>
            <div>
              <span className="text-gray-500">Длительность:</span>{' '}
              <span className="font-medium text-gray-900">{session.serviceDurationMinutes} мин</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Дата:</span>{' '}
              <span className="font-medium text-gray-900">
                {format(new Date(session.scheduledAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </span>
            </div>
            {session.startedAt && (
              <div>
                <span className="text-gray-500">Начата:</span>{' '}
                <span className="font-medium text-gray-900">
                  {format(new Date(session.startedAt), 'HH:mm', { locale: ru })}
                </span>
              </div>
            )}
            {session.endedAt && (
              <div>
                <span className="text-gray-500">Завершена:</span>{' '}
                <span className="font-medium text-gray-900">
                  {format(new Date(session.endedAt), 'HH:mm', { locale: ru })}
                </span>
              </div>
            )}
          </div>
        </div>

        {session.meetingLink && (
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-xs text-indigo-500 font-medium mb-1">Ссылка на созвон</p>
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline text-sm break-all"
            >
              {session.meetingLink}
            </a>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Комментарии ({comments.length})
        </h2>

        <div className="space-y-3 mb-4">
          {comments.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">Нет комментариев</div>
          ) : (
            comments.map((comment) => {
              const isMine = comment.authorId === user?.userId
              return (
                <div key={comment.id} className="card">
                  <div className="flex items-start gap-3">
                    <Avatar name={comment.authorName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.authorName}
                          {isMine && ' (вы)'}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {comment.authorRole === 'PSYCHOLOGIST' ? 'Психолог' : 'Клиент'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(comment.createdAt), 'd MMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleAddComment} className="card flex gap-3 py-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="Добавить комментарий..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary px-4"
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? '...' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  )
}
