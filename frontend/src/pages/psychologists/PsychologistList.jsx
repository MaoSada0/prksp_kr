import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPsychologists } from '../../api/psychologists'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'

function Stars({ rating }) {
  if (!rating) return <span className="text-xs text-gray-400">Нет оценок</span>
  return (
    <span className="text-sm text-amber-500 font-medium">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
    </span>
  )
}

export default function PsychologistList() {
  const [psychologists, setPsychologists] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = useCallback(async (q) => {
    setLoading(true)
    try {
      const data = await getPsychologists(q)
      setPsychologists(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchData])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Психологи</h1>
          <p className="text-gray-500 text-sm mt-1">Найдите специалиста для вас</p>
        </div>
        <input
          type="search"
          className="input sm:w-72"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : psychologists.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">Психологи не найдены</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {psychologists.map((p) => (
            <div
              key={p.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/psychologists/${p.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={`${p.firstName} ${p.lastName}`} size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {p.firstName} {p.lastName}
                    </h3>
                    {p.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Верифицирован
                      </span>
                    )}
                  </div>
                  <Stars rating={p.averageRating} />
                </div>
              </div>

              {p.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.bio}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {p.experienceYears
                    ? `Опыт: ${p.experienceYears} лет`
                    : 'Опыт не указан'}
                </span>
                <span>{p.reviewCount} отзыв(ов)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
