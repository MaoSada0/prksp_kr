import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPsychologist, getPsychologistServices } from '../../api/psychologists'
import { getReviews, createReview } from '../../api/reviews'
import { getOrCreateChat } from '../../api/chats'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import CreateSessionModal from '../../components/CreateSessionModal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'
          } ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
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

  const [selectedService, setSelectedService] = useState(null)
  const [showSessionModal, setShowSessionModal] = useState(false)

  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  const isClient = user?.role === 'CLIENT'
  const isOwn = user?.userId === id

  useEffect(() => {
    Promise.all([
      getPsychologist(id),
      getPsychologistServices(id),
      getReviews(id),
    ])
      .then(([p, s, r]) => {
        setPsychologist(p)
        setServices(s)
        setReviews(r)
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStartChat = async () => {
    try {
      const chat = await getOrCreateChat(id)
      navigate(`/chats/${chat.id}`)
    } catch {
      toast.error('Ошибка открытия чата')
    }
  }

  const handleBookService = (service) => {
    setSelectedService(service)
    setShowSessionModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      const review = await createReview(id, reviewForm)
      setReviews((prev) => [review, ...prev])
      toast.success('Отзыв добавлен')
      setReviewForm({ rating: 5, content: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления отзыва')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <Spinner className="py-20" />
  if (!psychologist) return null

  const hasReviewed = reviews.some((r) => r.clientId === user?.userId)

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar
            name={`${psychologist.firstName} ${psychologist.lastName}`}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {psychologist.firstName} {psychologist.lastName}
              </h1>
              {psychologist.isVerified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Верифицирован
                </span>
              )}
            </div>

            {psychologist.averageRating && (
              <div className="flex items-center gap-2 mb-2">
                <Stars value={Math.round(psychologist.averageRating)} />
                <span className="text-sm text-gray-500">
                  {psychologist.averageRating.toFixed(1)} ({psychologist.reviewCount})
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              {psychologist.experienceYears && (
                <span>Опыт: {psychologist.experienceYears} лет</span>
              )}
              {psychologist.education && (
                <span>Образование: {psychologist.education}</span>
              )}
            </div>

            {psychologist.bio && (
              <p className="text-gray-700 text-sm leading-relaxed">{psychologist.bio}</p>
            )}
          </div>

          {isClient && !isOwn && (
            <button onClick={handleStartChat} className="btn-secondary whitespace-nowrap">
              Написать
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Услуги</h2>
        {services.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">Услуги не добавлены</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="card flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-indigo-600 font-semibold text-sm whitespace-nowrap">
                    {service.price} ₽
                  </span>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-500">{service.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs text-gray-400">{service.durationMinutes} мин</span>
                  {isClient && !isOwn && (
                    <button
                      className="btn-primary text-xs px-3 py-1.5"
                      onClick={() => handleBookService(service)}
                    >
                      Записаться
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Отзывы ({reviews.length})
        </h2>

        {isClient && !isOwn && !hasReviewed && (
          <form onSubmit={handleSubmitReview} className="card mb-4 space-y-3">
            <h3 className="font-medium text-gray-900">Оставить отзыв</h3>
            <div>
              <label className="label">Оценка</label>
              <Stars
                value={reviewForm.rating}
                onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
              />
            </div>
            <div>
              <label className="label">Комментарий</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                placeholder="Поделитесь своим опытом..."
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Отправляем...' : 'Отправить отзыв'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">Отзывов пока нет</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={review.clientName} size="sm" />
                    <span className="font-medium text-sm text-gray-900">{review.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} />
                    <span className="text-xs text-gray-400">
                      {format(new Date(review.createdAt), 'd MMM yyyy', { locale: ru })}
                    </span>
                  </div>
                </div>
                {review.content && <p className="text-sm text-gray-700">{review.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSessionModal && selectedService && (
        <CreateSessionModal
          psychologistId={id}
          services={services}
          onClose={() => setShowSessionModal(false)}
          onCreated={(session) => {
            setShowSessionModal(false)
            navigate(`/sessions/${session.id}`)
          }}
        />
      )}
    </div>
  )
}
