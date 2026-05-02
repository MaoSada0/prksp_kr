import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const clientLinks = [
    { to: '/psychologists', label: 'Психологи' },
    { to: '/chats', label: 'Чаты' },
    { to: '/sessions', label: 'Сессии' },
  ]
  const psychologistLinks = [
    { to: '/sessions', label: 'Сессии' },
    { to: '/chats', label: 'Чаты' },
    { to: '/schedule', label: 'Расписание' },
    { to: '/services', label: 'Услуги' },
  ]
  const links = user?.role === 'PSYCHOLOGIST' ? psychologistLinks : clientLinks

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <NavLink to="/" className="text-sm font-bold tracking-tight shrink-0" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
          PsychConnect
        </NavLink>

        <div className="flex items-center gap-1 flex-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-100"
              style={({ isActive }) => ({
                color: isActive ? 'var(--blue)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--blue-light)' : 'transparent',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors duration-100"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" src={user?.photoUrl} />
            <span className="text-sm font-semibold hidden sm:block">{user?.firstName}</span>
          </button>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-100"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = '#F5C0C0'; e.currentTarget.style.backgroundColor = 'var(--red-light)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}
