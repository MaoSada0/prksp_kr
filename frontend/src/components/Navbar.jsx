import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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
  const adminLinks = [
    { to: '/admin', label: 'Пользователи' },
  ]
  const links = user?.role === 'ADMIN'
    ? adminLinks
    : user?.role === 'PSYCHOLOGIST'
      ? psychologistLinks
      : clientLinks

  const handleNav = (to) => { setMenuOpen(false); navigate(to) }

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border-light)' }}>
      {/* Desktop / top bar */}
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <NavLink to="/" className="text-sm font-bold tracking-tight shrink-0" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
          PsychConnect
        </NavLink>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1 flex-1">
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

        {/* Spacer on mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleNav('/profile')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors duration-100"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" src={user?.photoUrl} />
            <span className="text-sm font-semibold hidden sm:block">{user?.firstName}</span>
          </button>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="hidden sm:block text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-100"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = '#F5C0C0'; e.currentTarget.style.backgroundColor = 'var(--red-light)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Выйти
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md transition-colors duration-100"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Меню"
          >
            <span className={`block w-5 h-0.5 rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ backgroundColor: 'currentColor' }} />
            <span className={`block w-5 h-0.5 rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: 'currentColor' }} />
            <span className={`block w-5 h-0.5 rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ backgroundColor: 'currentColor' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-3 space-y-1" style={{ borderTop: '1px solid var(--border-light)' }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-100"
              style={({ isActive }) => ({
                color: isActive ? 'var(--blue)' : 'var(--text)',
                backgroundColor: isActive ? 'var(--blue-light)' : 'transparent',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={() => { logout(); navigate('/login'); setMenuOpen(false) }}
            className="w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-100 mt-1"
            style={{ color: 'var(--red)', border: '1px solid var(--border)' }}
          >
            Выйти
          </button>
        </div>
      )}
    </nav>
  )
}
