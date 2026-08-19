// 优先级映射：0=低，1=中，2=高
export const PRIORITY_MAP = {
  0: { label: '低', type: 'info' },
  1: { label: '中', type: 'warning' },
  2: { label: '高', type: 'danger' }
}

export const PRIORITY_OPTIONS = [
  { value: 0, label: '低', color: '#64748b', bg: '#f1f5f9' },
  { value: 1, label: '中', color: '#d97706', bg: '#fef3c7' },
  { value: 2, label: '高', color: '#dc2626', bg: '#fee2e2' }
]

export function priorityLabel(p) {
  return PRIORITY_MAP[p]?.label ?? '中'
}

export function priorityType(p) {
  return PRIORITY_MAP[p]?.type ?? 'warning'
}
