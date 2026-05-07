import api from './axios'

export const getMe = () =>
  api.get('/users/me').then((r) => r.data)

export const updateMe = (data) =>
  api.put('/users/me', data).then((r) => r.data)

export const getUser = (id) =>
  api.get(`/users/${id}`).then((r) => r.data)

export const uploadAvatar = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/avatar', form).then((r) => r.data)
}
