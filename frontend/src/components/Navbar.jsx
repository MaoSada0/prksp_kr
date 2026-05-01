import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const clientLinks = [
    { to: '/psychologists', label: 'Психологи' },
    { to: '/chats', label: 'Чаты' },
    { to: '/sessions', label: 'Сессии' },
  ]

  const psychologistLinks = [
    { to: '/sessions', label: 'Сессии' },
    { to: '/chats', label: 'Чаты' },
    { to: '/profile', label: 'Мой профиль' },
  ]

  const links = user?.role === 'PSYCHOLOGIST' ? psychologistLinks : clientLinks

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          PsychConnect
        </NavLink>

        <div className="flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.firstName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}
