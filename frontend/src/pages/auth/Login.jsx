import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginSuccess, user } = useAuth()
  const navigate = useNavigate()

  const roleRedirect = (role) =>
    role === 'ADMIN' ? '/admin' : role === 'PSYCHOLOGIST' ? '/sessions' : '/psychologists'

  if (user) {
    navigate(roleRedirect(user.role), { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form)
      loginSuccess(data)
      navigate(roleRedirect(data.role), { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--blue)' }}>PsychConnect</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Войдите в свой аккаунт</div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required placeholder="example@mail.ru" />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input type="password" className="input" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="mt-4 pt-4 text-center text-sm" style={{ borderTop: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Нет аккаунта? </span>
            <Link to="/register" className="font-semibold" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
