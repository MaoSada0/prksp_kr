import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'CLIENT' })
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--blue)' }}>PsychConnect</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Создайте аккаунт</div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
              <div>
                <label className="label">Имя</label>
                <input type="text" className="input" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required placeholder="Иван" />
              </div>
              <div>
                <label className="label">Фамилия</label>
                <input type="text" className="input" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required placeholder="Иванов" />
              </div>
            </div>

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
                required minLength={6} placeholder="Минимум 6 символов" />
            </div>

            <div>
              <label className="label">Я регистрируюсь как</label>
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 mt-1">
                {[
                  { value: 'CLIENT', label: 'Клиент', desc: 'Ищу специалиста' },
                  { value: 'PSYCHOLOGIST', label: 'Психолог', desc: 'Принимаю клиентов' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="block p-3 rounded-lg cursor-pointer transition-colors duration-100"
                    style={{
                      border: form.role === opt.value ? '2px solid var(--blue)' : '2px solid var(--border)',
                      backgroundColor: form.role === opt.value ? 'var(--blue-light)' : 'var(--surface)',
                    }}
                  >
                    <input type="radio" name="role" value={opt.value} className="sr-only"
                      checked={form.role === opt.value}
                      onChange={e => setForm({ ...form, role: e.target.value })} />
                    <div className="text-sm font-semibold" style={{ color: form.role === opt.value ? 'var(--blue-dark)' : 'var(--text)' }}>
                      {opt.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-4 pt-4 text-center text-sm" style={{ borderTop: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Уже есть аккаунт? </span>
            <Link to="/login" className="font-semibold" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
