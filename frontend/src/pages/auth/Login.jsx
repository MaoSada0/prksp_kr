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

  if (user) {
    navigate(user.role === 'PSYCHOLOGIST' ? '/sessions' : '/psychologists', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form)
      loginSuccess(data)
      navigate(data.role === 'PSYCHOLOGIST' ? '/sessions' : '/psychologists', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">PsychConnect</h1>
          <p className="text-gray-500 mt-2">Онлайн-консультации с психологом</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Вход</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="example@mail.ru"
              />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
