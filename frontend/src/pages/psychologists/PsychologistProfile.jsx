import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPsychologist, getPsychologistServices } from '../../api/psychologists'
import { getReviews, createReview, updateReview } from '../../api/reviews'
import { getOrCreateChat } from '../../api/chats'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import PhotoLightbox from '../../components/PhotoLightbox'
import CreateSessionModal from '../../components/CreateSessionModal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function Stars({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="text-xl transition-colors duration-100"
          style={{ color: star <= (hovered || value) ? '#D97706' : 'var(--border)', cursor: onChange ? 'pointer' : 'default' }}
        >★</button>
      ))}
    </div>
  )
}

export default function PsychologistProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [psychologist, setPsychologist] = useState(null)
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const isClient = user?.role === 'CLIENT'
  const isOwn = user?.userId === id

  useEffect(() => {
    Promise.all([getPsychologist(id), getPsychologistServices(id), getReviews(id)])
      .then(([p, s, r]) => { setPsychologist(p); setServices(s); setReviews(r) })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id])

  const myReview = reviews.find(r => r.clientId === user?.userId)

  const startEdit = () => {
    setReviewForm({ rating: myReview.rating, content: myReview.content || '' })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setReviewForm({ rating: 5, content: '' })
  }

  const handleStartChat = async () => {
    try { const c = await getOrCreateChat(id); navigate(`/chats/${c.id}`) }
    catch { toast.error('Ошибка открытия чата') }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEditing) {
        const r = await updateReview(id, reviewForm)
        setReviews(prev => prev.map(rev => rev.id === r.id ? r : rev))
        toast.success('Отзыв обновлён')
        setIsEditing(false)
        setReviewForm({ rating: 5, content: '' })
      } else {
        const r = await createReview(id, reviewForm)
        setReviews(prev => [r, ...prev])
        toast.success('Отзыв добавлен')
        setReviewForm({ rating: 5, content: '' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка')
    } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner className="py-20" />
  if (!psychologist) return null

  return (
    <div className="space-y-5">
      {lightbox && psychologist.photoUrl && (
        <PhotoLightbox
          src={psychologist.photoUrl}
          name={`${psychologist.firstName} ${psychologist.lastName}`}
          onClose={() => setLightbox(false)}
        />
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div
            className={psychologist.photoUrl ? 'cursor-zoom-in flex-shrink-0' : 'flex-shrink-0'}
            onClick={() => psychologist.photoUrl && setLightbox(true)}
          >
            <Avatar name={`${psychologist.firstName} ${psychologist.lastName}`} size="xl" src={psychologist.photoUrl} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {psychologist.firstName} {psychologist.lastName}
                  </h1>
                  {psychologist.isVerified && <span className="badge-blue">✓ Верифицирован</span>}
                </div>
                {psychologist.averageRating ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Stars value={Math.round(psychologist.averageRating)} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {psychologist.averageRating.toFixed(1)} ({psychologist.reviewCount})
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {psychologist.experienceYears && (
                    <span className="text-xs px-2.5 py-1 rounded" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--blue-dark)' }}>
                      {psychologist.experienceYears} лет опыта
                    </span>
                  )}
                  {psychologist.education && (
                    <span className="text-xs px-2.5 py-1 rounded" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--blue-dark)' }}>
                      {psychologist.education}
                    </span>
                  )}
                </div>
              </div>
              {isClient && !isOwn && (
                <button onClick={handleStartChat} className="btn-secondary">Написать</button>
              )}
            </div>
            {psychologist.bio && (
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{psychologist.bio}</p>
            )}
          </div>
        </div>
      </div>

      <Section title={`Услуги (${services.length})`}>
        {services.length === 0 ? (
          <EmptyState text="Услуги не добавлены" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map(s => (
              <div key={s.id} className="p-4 rounded-lg flex flex-col gap-2" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg)' }}>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.name}</span>
                  <span className="font-bold text-sm shrink-0" style={{ color: 'var(--blue)' }}>{s.price} ₽</span>
                </div>
                {s.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.description}</p>}
                <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{s.durationMinutes} мин</span>
                  {isClient && !isOwn && (
                    <button className="btn-primary text-xs px-3 py-1" onClick={() => setShowModal(true)}>
                      Записаться
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Отзывы (${reviews.length})`}>
        {isClient && !isOwn && (!myReview || isEditing) && (
          <form onSubmit={handleSubmitReview} className="p-4 rounded-lg mb-4 space-y-3"
            style={{
              border: `1px solid ${isEditing ? 'var(--blue-mid)' : 'var(--border)'}`,
              backgroundColor: isEditing ? 'var(--blue-light)' : 'var(--bg)',
            }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {isEditing ? 'Редактировать отзыв' : 'Оставить отзыв'}
              </span>
              {isEditing && (
                <button type="button" onClick={cancelEdit}
                  className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Отмена
                </button>
              )}
            </div>
            <div>
              <label className="label">Оценка</label>
              <Stars value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} />
            </div>
            <div>
              <label className="label">Комментарий</label>
              <textarea className="input resize-none" rows={3} value={reviewForm.content}
                onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })}
                placeholder="Поделитесь своим опытом..." />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Сохраняем...' : isEditing ? 'Сохранить' : 'Отправить'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <EmptyState text="Отзывов пока нет" />
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-lg" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg)' }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.clientName} size="sm" src={r.clientPhotoUrl} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#D97706' }}>{'★'.repeat(r.rating)}</span>
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {format(new Date(r.createdAt), 'd MMM yyyy', { locale: ru })}
                    </span>
                    {r.clientId === user?.userId && !isEditing && (
                      <button
                        onClick={startEdit}
                        className="text-xs font-semibold transition-colors duration-100"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                        Изменить
                      </button>
                    )}
                  </div>
                </div>
                {r.content && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.content}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {showModal && (
        <CreateSessionModal psychologistId={id} services={services}
          onClose={() => setShowModal(false)}
          onCreated={s => { setShowModal(false); navigate(`/sessions/${s.id}`) }} />
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>{title}</h2>
      {children}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="card text-center py-10" style={{ color: 'var(--text-faint)' }}>{text}</div>
  )
}
