import api from './axios'

export const getSessions = () => api.get('/sessions').then((r) => r.data)

export const getSession = (id) => api.get(`/sessions/${id}`).then((r) => r.data)

export const createSession = (data) => api.post('/sessions', data).then((r) => r.data)

export const updateSessionStatus = (id, data) =>
  api.patch(`/sessions/${id}/status`, data).then((r) => r.data)

export const getComments = (sessionId) =>
  api.get(`/sessions/${sessionId}/comments`).then((r) => r.data)

export const addComment = (sessionId, data) =>
  api.post(`/sessions/${sessionId}/comments`, data).then((r) => r.data)
