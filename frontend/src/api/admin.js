import api from './axios'

export const getAllUsers = () =>
  api.get('/admin/users').then(r => r.data)

export const changeUserRole = (userId, role) =>
  api.put(`/admin/users/${userId}/role`, { role }).then(r => r.data)

export const deleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`)

export const getAdminStats = () =>
  api.get('/admin/stats').then(r => r.data)
