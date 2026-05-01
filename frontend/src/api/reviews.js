import api from './axios'

export const getReviews = (psychologistId) =>
  api.get(`/psychologists/${psychologistId}/reviews`).then((r) => r.data)

export const createReview = (psychologistId, data) =>
  api.post(`/psychologists/${psychologistId}/reviews`, data).then((r) => r.data)

export const updateReview = (psychologistId, data) =>
  api.put(`/psychologists/${psychologistId}/reviews`, data).then((r) => r.data)
