import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CLIENT',
  })
  const [loading, setLoading] = useState(false)
  const { loginSuccess } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await register(form)
      loginSuccess(data)
      navigate(data.role === 'PSYCHOLOGIST' ? '/sessions' : '/psychologists', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">PsychConnect</h1>
          <p className="text-gray-500 mt-2">Создайте аккаунт</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Регистрация</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Имя</label>
                <input
                  type="text"
                  className="input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  placeholder="Иван"
                />
              </div>
              <div>
                <label className="label">Фамилия</label>
                <input
                  type="text"
                  className="input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  placeholder="Иванов"
                />
              </div>
            </div>

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
                minLength={6}
                placeholder="Минимум 6 символов"
              />
            </div>

            <div>
              <label className="label">Я регистрируюсь как</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {[
                  { value: 'CLIENT', label: 'Клиент', desc: 'Ищу психолога' },
                  { value: 'PSYCHOLOGIST', label: 'Психолог', desc: 'Предоставляю услуги' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      form.role === opt.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      className="sr-only"
                      checked={form.role === opt.value}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                    <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
