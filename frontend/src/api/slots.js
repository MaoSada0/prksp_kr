import api from './axios'

export const getAvailableSlots = (psychologistId, date) =>
  api.get(`/psychologists/${psychologistId}/slots`, { params: { date } }).then((r) => r.data)

export const getPsychologistSchedule = (from, to) =>
  api.get('/psychologists/me/schedule', { params: { from, to } }).then((r) => r.data)

export const createSlot = (data) =>
  api.post('/psychologists/me/slots', data).then((r) => r.data)

export const batchCreateSlots = (data) =>
  api.post('/psychologists/me/slots/batch', data).then((r) => r.data)

export const deleteSlot = (slotId) =>
  api.delete(`/psychologists/me/slots/${slotId}`)
