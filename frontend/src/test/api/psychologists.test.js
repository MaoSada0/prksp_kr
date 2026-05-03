import MockAdapter from 'axios-mock-adapter'
import api from '../../api/axios'
import {
  getPsychologists,
  getPsychologist,
  getPsychologistServices,
  updateProfile,
  createService,
  deleteService,
} from '../../api/psychologists'

const mock = new MockAdapter(api)

beforeEach(() => mock.reset())

const ID = 'psych-uuid-1'

describe('getPsychologists', () => {
  it('returns list without search', async () => {
    const data = [{ id: ID, firstName: 'Anna', lastName: 'Smith' }]
    mock.onGet('/psychologists').reply(200, data)
    const result = await getPsychologists()
    expect(result).toEqual(data)
  })

  it('passes search param', async () => {
    mock.onGet('/psychologists', { params: { search: 'anna' } }).reply(200, [])
    const result = await getPsychologists('anna')
    expect(result).toEqual([])
    expect(mock.history.get[0].params).toEqual({ search: 'anna' })
  })

  it('throws on server error', async () => {
    mock.onGet('/psychologists').reply(500)
    await expect(getPsychologists()).rejects.toThrow()
  })
})

describe('getPsychologist', () => {
  it('returns single psychologist', async () => {
    const data = { id: ID, firstName: 'Anna', lastName: 'Smith', bio: 'Expert' }
    mock.onGet(`/psychologists/${ID}`).reply(200, data)
    const result = await getPsychologist(ID)
    expect(result).toEqual(data)
  })

  it('throws on 404', async () => {
    mock.onGet(`/psychologists/${ID}`).reply(404)
    await expect(getPsychologist(ID)).rejects.toThrow()
  })
})

describe('getPsychologistServices', () => {
  it('returns services list', async () => {
    const data = [{ id: 's1', name: 'Консультация', price: 1500 }]
    mock.onGet(`/psychologists/${ID}/services`).reply(200, data)
    const result = await getPsychologistServices(ID)
    expect(result).toEqual(data)
  })
})

describe('updateProfile', () => {
  it('puts profile data and returns updated', async () => {
    const payload = { bio: 'New bio', education: 'MSU', experienceYears: 7 }
    const response = { id: ID, ...payload }
    mock.onPut('/psychologists/me/profile').reply(200, response)
    const result = await updateProfile(payload)
    expect(result).toEqual(response)
    expect(JSON.parse(mock.history.put[0].data)).toMatchObject(payload)
  })
})

describe('createService', () => {
  it('posts service and returns created', async () => {
    const payload = { name: 'Сессия', price: 2000, durationMinutes: 60 }
    const response = { id: 'svc-1', ...payload }
    mock.onPost('/psychologists/me/services').reply(201, response)
    const result = await createService(payload)
    expect(result).toEqual(response)
  })
})

describe('deleteService', () => {
  it('sends DELETE request', async () => {
    mock.onDelete('/psychologists/me/services/svc-1').reply(204)
    await deleteService('svc-1')
    expect(mock.history.delete).toHaveLength(1)
  })
})
