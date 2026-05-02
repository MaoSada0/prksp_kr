import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPsychologists } from '../../api/psychologists'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'

function Stars({ rating }) {
  if (!rating) return <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Нет оценок</span>
  return (
    <span className="text-xs font-semibold" style={{ color: '#D97706' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      {' '}
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{rating.toFixed(1)}</span>
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
    try { setPsychologists(await getPsychologists(q)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchData(search), 300)
    return () => clearTimeout(t)
  }, [search, fetchData])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Психологи</h1>
        <div className="relative sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" className="input pl-9" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : psychologists.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-faint)' }}>Психологи не найдены</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {psychologists.map(p => (
            <div
              key={p.id}
              className="card cursor-pointer transition-shadow duration-150"
              onClick={() => navigate(`/psychologists/${p.id}`)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={`${p.firstName} ${p.lastName}`} size="md" src={p.photoUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {p.firstName} {p.lastName}
                    </span>
                    {p.isVerified && <span className="badge-blue">✓ Верифицирован</span>}
                  </div>
                  <div className="mt-1"><Stars rating={p.averageRating} /></div>
                </div>
              </div>

              {p.bio && (
                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{p.bio}</p>
              )}

              <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-faint)' }}>
                <span>{p.experienceYears ? `${p.experienceYears} лет опыта` : 'Опыт не указан'}</span>
                <span>{p.reviewCount} отзыв(ов)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
