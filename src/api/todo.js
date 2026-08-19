import request from './request'

export function getTodos(params) {
  return request.get('/todos', { params })
}

export function getStats() {
  return request.get('/todos/stats')
}

export function getTodoDates() {
  return request.get('/todos/dates')
}

export function createTodo(data) {
  return request.post('/todos', data)
}

export function updateTodo(id, data) {
  return request.put(`/todos/${id}`, data)
}

export function toggleTodo(id) {
  return request.patch(`/todos/${id}/toggle`)
}

export function deleteTodo(id) {
  return request.delete(`/todos/${id}`)
}
