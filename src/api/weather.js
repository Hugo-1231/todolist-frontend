/**
 * 和风天气 API 封装。
 * 认证方式：X-QW-Api-Key 请求头。
 */
const API_HOST = 'ky2k5qqp32.re.qweatherapi.com'
const API_KEY = '5933b954623f40a6affcc4c3a4bf1b4a'

async function qweather(path, params = {}) {
  const url = new URL(`https://${API_HOST}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url, {
    headers: { 'X-QW-Api-Key': API_KEY }
  })
  if (!res.ok) {
    throw new Error(`和风天气请求失败: ${res.status}`)
  }
  const data = await res.json()
  if (data.code !== '200') {
    throw new Error(`和风天气错误: ${data.code}`)
  }
  return data
}

/**
 * 实时天气。
 * @param {string} location 支持城市名 / 城市 ID / "经度,纬度"
 */
export function fetchWeather(location) {
  return qweather('/v7/weather/now', { location })
}

/**
 * 经纬度反查城市（GeoAPI）。
 * @param {number} lon 经度
 * @param {number} lat 纬度
 */
export function fetchCityByGeo(lon, lat) {
  return qweather('/geo/v2/city/lookup', { location: `${lon},${lat}` })
}
