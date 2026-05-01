import api from './axios'

export const getPsychologists = (search) =>
  api.get('/psychologists', { params: search ? { search } : {} }).then((r) => r.data)

export const getPsychologist = (id) =>
  api.get(`/psychologists/${id}`).then((r) => r.data)

export const getPsychologistServices = (id) =>
  api.get(`/psychologists/${id}/services`).then((r) => r.data)

export const updateProfile = (data) =>
  api.put('/psychologists/me/profile', data).then((r) => r.data)

export const createService = (data) =>
  api.post('/psychologists/me/services', data).then((r) => r.data)

export const deleteService = (serviceId) =>
  api.delete(`/psychologists/me/services/${serviceId}`)
