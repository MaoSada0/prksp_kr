import fc from 'fast-check'
import { renderHook, act, cleanup } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

const userArb = fc.record({
  token: fc.string({ minLength: 1, maxLength: 200 }),
  userId: fc.uuid(),
  email: fc.emailAddress(),
  firstName: fc.unicodeString({ minLength: 1, maxLength: 50 }),
  lastName: fc.unicodeString({ minLength: 1, maxLength: 50 }),
  role: fc.constantFrom('CLIENT', 'PSYCHOLOGIST', 'ADMIN'),
  photoUrl: fc.option(fc.webUrl(), { nil: null }),
})

describe('AuthContext — property-based фаззинг', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    cleanup()
  })

  /**
   * loginSuccess с любым JSON-сериализуемым объектом пользователя:
   * - user в контексте точно равен переданному объекту
   * - isAuthenticated === true
   * - token в localStorage совпадает с data.token
   * - user в localStorage совпадает с data (round-trip)
   */
  it('[F-AUTH-01] loginSuccess корректно сохраняет произвольные данные пользователя', () => {
    fc.assert(
      fc.property(userArb, (userData) => {
        localStorage.clear()
        const { result, unmount } = renderHook(() => useAuth(), { wrapper })

        act(() => result.current.loginSuccess(userData))

        expect(result.current.user).toEqual(userData)
        expect(result.current.isAuthenticated).toBe(true)
        expect(localStorage.getItem('token')).toBe(userData.token)
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(userData)

        unmount()
      }),
      { numRuns: 150 }
    )
  })

  /**
   * updateUser(partial) правильно мерджит данные:
   * - поля из partial перезаписывают старые значения
   * - поля, которых нет в partial, сохраняются из исходного объекта
   */
  it('[F-AUTH-02] updateUser корректно мерджит произвольные поля', () => {
    const partialArb = fc.record({
      firstName: fc.unicodeString({ minLength: 1, maxLength: 50 }),
      photoUrl: fc.webUrl(),
    })

    fc.assert(
      fc.property(userArb, partialArb, (initial, partial) => {
        localStorage.clear()
        const { result, unmount } = renderHook(() => useAuth(), { wrapper })

        act(() => result.current.loginSuccess(initial))
        act(() => result.current.updateUser(partial))

        // Поля из partial присутствуют с новыми значениями
        Object.entries(partial).forEach(([k, v]) => {
          expect(result.current.user[k]).toStrictEqual(v)
        })
        // Поля не тронутые partial сохраняют исходные значения
        Object.entries(initial).forEach(([k, v]) => {
          if (!(k in partial)) {
            expect(result.current.user[k]).toStrictEqual(v)
          }
        })

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * logout всегда обнуляет состояние — независимо от того,
   * какие данные были сохранены через loginSuccess.
   */
  it('[F-AUTH-03] logout всегда очищает user и localStorage', () => {
    fc.assert(
      fc.property(userArb, (userData) => {
        localStorage.clear()
        const { result, unmount } = renderHook(() => useAuth(), { wrapper })

        act(() => result.current.loginSuccess(userData))
        act(() => result.current.logout())

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()

        unmount()
      }),
      { numRuns: 150 }
    )
  })

  /**
   * Если localStorage содержит повреждённый JSON (ручная правка, XSS-атака и т.д.),
   * try/catch в useState инициализирует user как null — контекст не падает.
   */
  it('[F-AUTH-04] повреждённый JSON в localStorage не ломает инициализацию контекста', () => {
    const badJsonSamples = [
      'not json at all',
      '{broken: true',
      'undefined',
      '',
      '{ "key": }',
      '<script>alert(1)</script>',
      "'; DROP TABLE users; --",
    ]

    badJsonSamples.forEach((bad) => {
      localStorage.setItem('user', bad)
      const { result, unmount } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      unmount()
      localStorage.clear()
    })
  })
})
