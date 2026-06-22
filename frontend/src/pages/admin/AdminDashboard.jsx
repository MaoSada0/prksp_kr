import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAllUsers, changeUserRole, deleteUser, getAdminStats } from '../../api/admin'

const ROLES = ['CLIENT', 'PSYCHOLOGIST', 'ADMIN']

const ROLE_LABELS = {
  CLIENT: 'Клиент',
  PSYCHOLOGIST: 'Психолог',
  ADMIN: 'Админ',
}

const ROLE_COLORS = {
  CLIENT: { color: 'var(--blue)', background: 'var(--blue-light)' },
  PSYCHOLOGIST: { color: 'var(--green)', background: 'var(--green-light)' },
  ADMIN: { color: 'var(--red)', background: 'var(--red-light)' },
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [changingRole, setChangingRole] = useState(null)

  useEffect(() => {
    Promise.all([getAllUsers(), getAdminStats()])
      .then(([u, s]) => { setUsers(u); setStats(s) })
      .catch(() => toast.error('Не удалось загрузить данные'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId)
    try {
      const updated = await changeUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? updated : u))
      const statsData = await getAdminStats()
      setStats(statsData)
      toast.success('Роль обновлена')
    } catch {
      toast.error('Не удалось изменить роль')
    } finally {
      setChangingRole(null)
    }
  }

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Удалить пользователя ${name}?`)) return
    try {
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      const statsData = await getAdminStats()
      setStats(statsData)
      toast.success('Пользователь удалён')
    } catch {
      toast.error('Не удалось удалить пользователя')
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = search === '' ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Панель администратора</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Всего пользователей', value: stats.totalUsers },
            { label: 'Клиентов', value: stats.clients },
            { label: 'Психологов', value: stats.psychologists },
            { label: 'Администраторов', value: stats.admins },
            { label: 'Сессий', value: stats.totalSessions },
            { label: 'Отзывов', value: stats.totalReviews },
          ].map(item => (
            <div key={item.label} className="card p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>{item.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['ALL', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-100"
              style={{
                backgroundColor: roleFilter === r ? 'var(--blue)' : 'var(--surface)',
                color: roleFilter === r ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {r === 'ALL' ? 'Все' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Пользователь', 'Email', 'Роль', 'Зарегистрирован', 'Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Пользователи не найдены
                  </td>
                </tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={ROLE_COLORS[u.role] || {}}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={changingRole === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="input py-1 text-xs"
                        style={{ maxWidth: 130 }}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                        className="text-xs px-2 py-1 rounded-md transition-colors duration-100"
                        style={{ color: 'var(--red)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--red-light)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
