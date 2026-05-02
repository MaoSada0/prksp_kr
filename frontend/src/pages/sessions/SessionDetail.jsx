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
  SCHEDULED:   { label: 'Запланирована', cls: 'badge-blue' },
  IN_PROGRESS: { label: 'Идёт',          cls: 'badge-amber' },
  COMPLETED:   { label: 'Завершена',     cls: 'badge-green' },
  CANCELLED:   { label: 'Отменена',      cls: 'badge-red' },
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
      .then(([s, c]) => { setSession(s); setComments(c) })
      .catch(() => toast.error('Ошибка загрузки сессии'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async (status) => {
    try { setSession(await updateSessionStatus(id, { status })); toast.success('Статус обновлён') }
    catch { toast.error('Ошибка обновления статуса') }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const c = await addComment(id, { content: commentText.trim() })
      setComments(prev => [...prev, c])
      setCommentText('')
    } catch { toast.error('Ошибка добавления комментария') }
    finally { setSubmitting(false) }
  }

  if (loading) return <Spinner className="py-20" />
  if (!session) return null

  const st = statusConfig[session.status]
  const canStart    = session.status === 'SCHEDULED'
  const canComplete = session.status === 'IN_PROGRESS'
  const canCancel   = session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sessions')}
          className="text-sm px-3 py-1.5 rounded-lg transition-colors duration-100"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ← Назад
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Сессия</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold mb-1.5" style={{ color: 'var(--text)' }}>{session.serviceName}</h2>
            <span className={st.cls}>{st.label}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {canStart    && <button className="btn-primary text-xs px-4 py-1.5" onClick={() => handleStatusUpdate('IN_PROGRESS')}>Начать</button>}
            {canComplete && <button className="btn-primary text-xs px-4 py-1.5" onClick={() => handleStatusUpdate('COMPLETED')}>Завершить</button>}
            {canCancel   && <button className="btn-danger  text-xs px-4 py-1.5" onClick={() => handleStatusUpdate('CANCELLED')}>Отменить</button>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
          <Row label="Клиент"      value={session.clientName} />
          <Row label="Психолог"    value={session.psychologistName} />
          <Row label="Длительность" value={`${session.serviceDurationMinutes} мин`} />
          <Row label="Дата" value={format(new Date(session.scheduledAt), 'd MMMM yyyy, HH:mm', { locale: ru })} />
          {session.startedAt && <Row label="Начата"    value={format(new Date(session.startedAt), 'HH:mm')} />}
          {session.endedAt   && <Row label="Завершена" value={format(new Date(session.endedAt),   'HH:mm')} />}
        </div>

        {session.meetingLink && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--blue-dark)' }}>Ссылка на созвон</div>
            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
              className="break-all" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>
              {session.meetingLink}
            </a>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>Комментарии ({comments.length})</h2>

        <div className="space-y-2 mb-3">
          {comments.length === 0 ? (
            <div className="card text-center py-8 text-sm" style={{ color: 'var(--text-faint)' }}>Нет комментариев</div>
          ) : (
            comments.map(c => {
              const isMine = c.authorId === user?.userId
              return (
                <div key={c.id} className="card !py-3" style={{ backgroundColor: isMine ? 'var(--blue-light)' : 'var(--surface)' }}>
                  <div className="flex items-start gap-3">
                    <Avatar name={c.authorName} size="sm" src={c.authorPhotoUrl} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.authorName}{isMine && ' (вы)'}</span>
                        <span className="badge" style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
                          {c.authorRole === 'PSYCHOLOGIST' ? 'Психолог' : 'Клиент'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                          {format(new Date(c.createdAt), 'd MMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{c.content}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleAddComment} className="card !py-3 flex gap-2">
          <input type="text" className="input flex-1" placeholder="Добавить комментарий..."
            value={commentText} onChange={e => setCommentText(e.target.value)} />
          <button type="submit" className="btn-primary px-4" disabled={!commentText.trim() || submitting}>
            {submitting ? '...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      <span className="font-semibold" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
