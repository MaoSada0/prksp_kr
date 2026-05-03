import MockAdapter from 'axios-mock-adapter'
import api from '../../api/axios'
import { getReviews, createReview, updateReview } from '../../api/reviews'

const mock = new MockAdapter(api)

beforeEach(() => mock.reset())

const PSYCH_ID = 'abc-123'

describe('getReviews', () => {
  it('returns reviews array', async () => {
    const data = [{ id: '1', rating: 5, content: 'Great', clientName: 'Ivan P.' }]
    mock.onGet(`/psychologists/${PSYCH_ID}/reviews`).reply(200, data)
    const result = await getReviews(PSYCH_ID)
    expect(result).toEqual(data)
  })

  it('throws on server error', async () => {
    mock.onGet(`/psychologists/${PSYCH_ID}/reviews`).reply(500)
    await expect(getReviews(PSYCH_ID)).rejects.toThrow()
  })
})

describe('createReview', () => {
  it('posts payload and returns created review', async () => {
    const payload = { rating: 4, content: 'Very helpful' }
    const response = { id: '2', psychologistId: PSYCH_ID, ...payload }
    mock.onPost(`/psychologists/${PSYCH_ID}/reviews`).reply(201, response)
    const result = await createReview(PSYCH_ID, payload)
    expect(result).toEqual(response)
    expect(mock.history.post[0].data).toBe(JSON.stringify(payload))
  })

  it('throws on 400', async () => {
    mock.onPost(`/psychologists/${PSYCH_ID}/reviews`).reply(400, { message: 'Review already exists' })
    await expect(createReview(PSYCH_ID, { rating: 5 })).rejects.toThrow()
  })
})

describe('updateReview', () => {
  it('puts payload and returns updated review', async () => {
    const payload = { rating: 3, content: 'Changed my mind' }
    const response = { id: '1', psychologistId: PSYCH_ID, ...payload }
    mock.onPut(`/psychologists/${PSYCH_ID}/reviews`).reply(200, response)
    const result = await updateReview(PSYCH_ID, payload)
    expect(result).toEqual(response)
    expect(mock.history.put[0].data).toBe(JSON.stringify(payload))
  })

  it('throws on 404', async () => {
    mock.onPut(`/psychologists/${PSYCH_ID}/reviews`).reply(404)
    await expect(updateReview(PSYCH_ID, { rating: 5 })).rejects.toThrow()
  })
})
