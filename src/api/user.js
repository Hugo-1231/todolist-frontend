import request from './request'

export function getProfile() {
  return request.get('/user/profile')
}

export function updateProfile(data) {
  return request.put('/user/profile', data)
}

export function bindPhone(phone) {
  return request.put('/user/phone', { phone })
}

export function bindEmail(email) {
  return request.put('/user/email', { email })
}

export function changePassword(phone, newPassword) {
  return request.put('/user/password', { phone, newPassword })
}
