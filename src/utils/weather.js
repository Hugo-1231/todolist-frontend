/**
 * 预设城市（和风天气用「经度,纬度」格式）。
 */
export const CITIES = [
  { name: '深圳', lon: 114.0579, lat: 22.5431 },
  { name: '北京', lon: 116.4074, lat: 39.9042 },
  { name: '上海', lon: 121.4737, lat: 31.2304 },
  { name: '广州', lon: 113.2644, lat: 23.1291 },
  { name: '杭州', lon: 120.1551, lat: 30.2741 },
  { name: '成都', lon: 104.0668, lat: 30.5728 },
  { name: '武汉', lon: 114.3055, lat: 30.5928 },
  { name: '西安', lon: 108.9398, lat: 34.3416 },
  { name: '重庆', lon: 106.5516, lat: 29.563 },
  { name: '南京', lon: 118.7969, lat: 32.0603 },
  { name: '苏州', lon: 120.5853, lat: 31.2989 },
  { name: '长沙', lon: 112.9388, lat: 28.2282 }
]

/**
 * 根据和风天气的中文描述返回 emoji 图标。
 */
export function weatherIcon(text) {
  if (!text) return '🌡️'
  if (text.includes('晴')) return '☀️'
  if (text.includes('云')) return '⛅'
  if (text.includes('阴')) return '☁️'
  if (text.includes('雷')) return '⛈️'
  if (text.includes('雨')) return '🌧️'
  if (text.includes('雪')) return '❄️'
  if (text.includes('雾') || text.includes('霾')) return '🌫️'
  if (text.includes('风') || text.includes('沙')) return '💨'
  return '🌡️'
}
