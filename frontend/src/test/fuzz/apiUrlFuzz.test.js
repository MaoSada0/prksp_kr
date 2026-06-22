import fc from 'fast-check'
import MockAdapter from 'axios-mock-adapter'
import api from '../../api/axios'
import { getReviews, createReview, updateReview } from '../../api/reviews'
import { getPsychologists, getPsychologist } from '../../api/psychologists'

const mock = new MockAdapter(api)

// UUID-подобные ID — реалистичные значения из бэкенда
const uuidArb = fc.uuid()

// Произвольный search-запрос без спецсимволов HTTP
const searchArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => !s.includes('\n') && !s.includes('\r'))

describe('API — фаззинг URL-конструкции и сериализации payload', () => {
  afterEach(() => mock.reset())

  /**
   * getReviews(id) строит URL /psychologists/{id}/reviews.
   * Для любого UUID GET-запрос уходит на корректный endpoint.
   */
  it('[F-API-01] getReviews отправляет GET на /psychologists/{id}/reviews для любого UUID', async () => {
    await fc.assert(
      fc.asyncProperty(uuidArb, async (id) => {
        mock.onGet(`/psychologists/${id}/reviews`).reply(200, [])
        await getReviews(id)
        const url = mock.history.get.at(-1).url
        expect(url).toBe(`/psychologists/${id}/reviews`)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * createReview(id, { rating, content }) — payload сериализуется без потерь:
   * сервер получает ровно те значения, что были переданы клиентом.
   * Проверяем весь диапазон допустимых рейтингов [1, 5]
   * и произвольный текст контента (Unicode, спецсимволы).
   */
  it('[F-API-02] createReview передаёт payload без искажений', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.integer({ min: 1, max: 5 }),
        fc.unicodeString({ maxLength: 2000 }),
        async (id, rating, content) => {
          mock.onPost(`/psychologists/${id}/reviews`).reply(201, {})
          await createReview(id, { rating, content })
          const sent = JSON.parse(mock.history.post.at(-1).data)
          expect(sent.rating).toBe(rating)
          expect(sent.content).toBe(content)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * updateReview(id, { rating, content }) — аналогично createReview,
   * PUT-запрос не должен искажать данные.
   */
  it('[F-API-03] updateReview передаёт payload без искажений', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.integer({ min: 1, max: 5 }),
        fc.unicodeString({ maxLength: 2000 }),
        async (id, rating, content) => {
          mock.onPut(`/psychologists/${id}/reviews`).reply(200, {})
          await updateReview(id, { rating, content })
          const sent = JSON.parse(mock.history.put.at(-1).data)
          expect(sent.rating).toBe(rating)
          expect(sent.content).toBe(content)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * getPsychologists(search) добавляет search в query params.
   * Строка поиска передаётся без изменений — важно, чтобы спецсимволы
   * (пробелы, кириллица) не обрезались и не заменялись.
   */
  it('[F-API-04] getPsychologists передаёт search-строку без изменений в params', async () => {
    await fc.assert(
      fc.asyncProperty(searchArb, async (search) => {
        mock.onGet('/psychologists').reply(200, [])
        await getPsychologists(search)
        const params = mock.history.get.at(-1).params
        expect(params.search).toBe(search)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Axios interceptor добавляет Authorization header при наличии токена в localStorage.
   * Для любого токена без leading/trailing whitespace заголовок = `Bearer {token}`.
   *
   * Примечание (RFC 7230): axios обрезает trailing whitespace из значения заголовка.
   * `token = "! "` → `Authorization: "Bearer !"` (пробел в конце обрезан).
   * Тест фильтрует токены без trailing whitespace и без управляющих символов (\r\n),
   * т.к. реальные JWT-токены их не содержат (base64url: A-Z a-z 0-9 - _ .).
   */
  it('[F-API-05] axios interceptor добавляет Bearer-токен из localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 })
          .filter(s => s.trim().length > 0 && s === s.trimEnd() && !/[\r\n]/.test(s)),
        uuidArb,
        async (token, id) => {
          localStorage.setItem('token', token)
          mock.onGet(`/psychologists/${id}/reviews`).reply(200, [])
          await getReviews(id)
          const authHeader = mock.history.get.at(-1).headers?.Authorization
          expect(authHeader).toBe(`Bearer ${token}`)
          localStorage.removeItem('token')
        }
      ),
      { numRuns: 100 }
    )
  })
})
