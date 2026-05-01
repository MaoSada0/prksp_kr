import api from './axios'

export const getChats = () => api.get('/chats').then((r) => r.data)

export const getOrCreateChat = (psychologistId) =>
  api.post('/chats', null, { params: { psychologistId } }).then((r) => r.data)

export const getMessages = (chatId) =>
  api.get(`/chats/${chatId}/messages`).then((r) => r.data)

export const sendMessage = (chatId, data) =>
  api.post(`/chats/${chatId}/messages`, data).then((r) => r.data)
