import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const REVIEWS = [
  {
    name: 'Анна К.',
    role: 'Клиент',
    text: 'Нашла своего психолога за день. Уже после второй сессии почувствовала, что стало легче справляться с тревогой. Очень удобный формат онлайн.',
    rating: 5,
    avatar: 'АК',
  },
  {
    name: 'Михаил Р.',
    role: 'Клиент',
    text: 'Долго откладывал обращение к специалисту. Сервис помог найти психолога без лишних звонков. Всё просто и понятно.',
    rating: 5,
    avatar: 'МР',
  },
  {
    name: 'Екатерина С.',
    role: 'Клиент',
    text: 'Ходила к психологу год. Это лучшая инвестиция в себя. Сервис удобный — сессии, чат, напоминания в одном месте.',
    rating: 5,
    avatar: 'ЕС',
  },
  {
    name: 'Дарья Л.',
    role: 'Клиент',
    text: 'После развода была в очень тяжёлом состоянии. Благодаря поддержке специалиста постепенно вернулась к нормальной жизни.',
    rating: 5,
    avatar: 'ДЛ',
  },
]

const FAQS = [
  {
    q: 'Как выбрать подходящего психолога?',
    a: 'Просмотрите анкеты специалистов, их специализации и отзывы. Вы можете написать психологу перед записью, чтобы убедиться, что подход подходит именно вам.',
  },
  {
    q: 'Сколько стоит сессия?',
    a: 'Стоимость устанавливает каждый психолог самостоятельно. Цены варьируются в зависимости от опыта и специализации специалиста.',
  },
  {
    q: 'Всё ли конфиденциально?',
    a: 'Да. Все переписки и сессии защищены. Психологи соблюдают профессиональную этику и не разглашают информацию о клиентах.',
  },
  {
    q: 'Можно ли сменить психолога?',
    a: 'Конечно. Если вы чувствуете, что специалист вам не подходит, вы можете выбрать другого в любой момент.',
  },
  {
    q: 'Как проходят онлайн-сессии?',
    a: 'Сессии проходят в удобном формате через встроенный чат или видеозвонок. Вы выбираете время, и специалист подтверждает запись.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Выберите специалиста',
    text: 'Просмотрите анкеты верифицированных психологов, их специализации, опыт и отзывы.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Запишитесь на сессию',
    text: 'Выберите удобное время из расписания психолога и подтвердите запись.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Начните работу',
    text: 'Общайтесь с психологом в чате или на сессии. Всё в одном месте, в удобное время.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Только верифицированные специалисты',
    text: 'Все психологи проходят проверку документов об образовании и опыте работы.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Полная конфиденциальность',
    text: 'Ваши данные и переписка защищены. Мы никогда не передаём информацию третьим лицам.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Удобное расписание',
    text: 'Записывайтесь в любое время. Вечером, в выходные — так, как удобно вам.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Широкий выбор специалистов',
    text: 'Когнитивно-поведенческая терапия, гештальт, психоанализ и другие подходы.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Чат между сессиями',
    text: 'Пишите психологу в чате между сессиями для поддержки и ответов на вопросы.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Отслеживайте прогресс',
    text: 'История сессий и заметки помогут отследить ваш путь и изменения.',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>{q}</span>
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: open ? 'var(--blue)' : 'var(--blue-light)',
            color: open ? '#fff' : 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <p style={{ paddingBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{a}</p>
      </div>
    </div>
  )
}

function AnimSection({ children, delay = 0 }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export default function Landing() {
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 60); return () => clearTimeout(t) }, [])

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--blue)', letterSpacing: '-0.01em', flex: 1 }}>
            PsychConnect
          </span>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.375rem 1rem' }}>Войти</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.375rem 1rem' }}>Начать</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
        padding: '5rem 1.5rem 4rem',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: 'var(--blue-light)', color: 'var(--blue)',
              borderRadius: 999, padding: '0.3rem 0.875rem',
              fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.75rem',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--blue)', display: 'inline-block' }} />
            Верифицированные психологи онлайн
          </div>
          <h1
            style={{
              fontFamily: 'Mulish, system-ui, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}
          >
            Забота о психическом{' '}
            <span style={{ color: 'var(--blue)' }}>здоровье</span>{' '}
            в&nbsp;удобном формате
          </h1>
          <p
            style={{
              fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.7,
              maxWidth: 520, margin: '0 auto 2.25rem',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
            }}
          >
            Подберите психолога, запишитесь на сессию и получайте поддержку — всё онлайн, безопасно и конфиденциально.
          </p>
          <div
            style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
            }}
          >
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Найти психолога
              </button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Войти в аккаунт
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ backgroundColor: 'var(--blue)', padding: '2.5rem 1.5rem' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem', textAlign: 'center',
        }}>
          {[
            { value: '150+', label: 'психологов' },
            { value: '3 000+', label: 'сессий проведено' },
            { value: '4.9', label: 'средняя оценка' },
            { value: '24/7', label: 'поддержка в чате' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Как это работает</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Три шага до первой сессии
              </h2>
            </div>
          </AnimSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {STEPS.map((step, i) => (
              <AnimSection key={step.n} delay={i * 0.1}>
                <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: -8, right: 16,
                    fontSize: '4rem', fontWeight: 900, color: 'var(--blue-light)',
                    lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em',
                  }}>{step.n}</div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: 'var(--blue-light)', color: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.text}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Преимущества</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Почему выбирают PsychConnect
              </h2>
            </div>
          </AnimSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {FEATURES.map((f, i) => (
              <AnimSection key={f.title} delay={i * 0.07}>
                <div style={{
                  display: 'flex', gap: '1rem', padding: '1.25rem',
                  borderRadius: 12, border: '1px solid var(--border-light)',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = 'var(--blue-mid)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
                >
                  <div style={{
                    flexShrink: 0,
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: 'var(--blue-light)', color: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.text}</p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Отзывы</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Что говорят наши клиенты
              </h2>
            </div>
          </AnimSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {REVIEWS.map((r, i) => (
              <AnimSection key={r.name} delay={i * 0.08}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ color: '#F59E0B', fontSize: '0.875rem', letterSpacing: 2 }}>{'★'.repeat(r.rating)}</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, flex: 1 }}>«{r.text}»</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      backgroundColor: 'var(--blue-light)', color: 'var(--blue)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>{r.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{r.role}</div>
                    </div>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        margin: '0 1.5rem 5rem',
        borderRadius: 20,
        backgroundColor: 'var(--blue)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        maxWidth: 1080,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <AnimSection>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800,
            color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.75rem',
          }}>
            Готовы сделать первый шаг?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            Зарегистрируйтесь и найдите своего психолога за несколько минут.
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#fff', color: 'var(--blue)',
              fontWeight: 700, fontSize: '0.9375rem',
              padding: '0.75rem 2.25rem', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Начать бесплатно
            </button>
          </Link>
        </AnimSection>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 1.5rem 5rem', backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>FAQ</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Частые вопросы
              </h2>
            </div>
          </AnimSection>
          <AnimSection delay={0.1}>
            <div className="card" style={{ padding: '0.5rem 1.75rem' }}>
              {FAQS.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-light)',
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--blue)' }}>PsychConnect</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} PsychConnect. Все права защищены.
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Конфиденциальность', 'Условия', 'Контакты'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
