<template>
  <div class="weather-card">
    <div class="weather-top">
      <el-select
        v-model="cityIndex"
        class="city-select"
        size="small"
        @change="onCityChange"
      >
        <el-option
          :value="-1"
          :label="isLocated ? (locatedName || '当前位置') : '📍 定位'"
        />
        <el-option
          v-for="(c, i) in CITIES"
          :key="i"
          :value="i"
          :label="c.name"
        />
      </el-select>
      <el-icon class="refresh" title="刷新" @click="reload"><Refresh /></el-icon>
    </div>

    <template v-if="weather">
      <div class="weather-main">
        <span class="icon">{{ icon }}</span>
        <div class="info">
          <div class="temp">{{ Math.round(weather.now.temp) }}°</div>
          <div class="text">{{ weather.now.text }}</div>
        </div>
      </div>
      <div class="weather-detail">
        <span>体感 {{ weather.now.feelsLike }}°</span>
        <span>湿度 {{ weather.now.humidity }}%</span>
        <span v-if="Number(weather.now.precip) > 0">降水 {{ weather.now.precip }}mm</span>
      </div>
    </template>
    <div v-else-if="loading || locating" class="weather-hint">
      {{ locating ? '定位中…' : '加载天气…' }}
    </div>
    <div v-else class="weather-hint">天气加载失败，点右上角重试</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { fetchWeather, fetchCityByGeo } from '../api/weather'
import { CITIES, weatherIcon } from '../utils/weather'

const cityIndex = ref(Number(localStorage.getItem('weatherCity') || 0))
const weather = ref(null)
const loading = ref(false)
const locating = ref(false)
const isLocated = ref(false)
const locatedName = ref('')

const icon = computed(() => weatherIcon(weather.value?.now?.text))

async function loadByLocation(location) {
  loading.value = true
  try {
    weather.value = await fetchWeather(location)
  } catch (e) {
    weather.value = null
  } finally {
    loading.value = false
  }
}

async function loadCity(index) {
  const c = CITIES[index]
  if (!c) return
  isLocated.value = false
  locatedName.value = ''
  localStorage.setItem('weatherCity', String(index))
  await loadByLocation(`${c.lon},${c.lat}`)
}

function onCityChange(val) {
  if (val === -1) {
    locate()
  } else {
    loadCity(val)
  }
}

function locate() {
  if (!navigator.geolocation) {
    ElMessage.warning('当前浏览器不支持定位')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { longitude, latitude } = pos.coords
      try {
        // 反查城市名，并直接按经纬度查天气
        const cityData = await fetchCityByGeo(longitude, latitude)
        const loc = cityData.location?.[0]
        locatedName.value = loc?.name || '当前位置'
        isLocated.value = true
        cityIndex.value = -1
        await loadByLocation(`${longitude},${latitude}`)
      } catch (e) {
        ElMessage.error('定位天气获取失败')
      } finally {
        locating.value = false
      }
    },
    () => {
      locating.value = false
      ElMessage.warning('定位失败，请检查浏览器定位权限')
    },
    { timeout: 10000, maximumAge: 300000 }
  )
}

function reload() {
  if (isLocated.value) {
    locate()
  } else {
    loadCity(cityIndex.value)
  }
}

onMounted(() => {
  loadCity(cityIndex.value)
})
</script>

<style scoped>
.weather-card {
  margin: 0 4px 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
}

.weather-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.city-select {
  width: 110px;
}

.city-select :deep(.el-select__wrapper) {
  box-shadow: none;
  background: transparent;
  padding-left: 2px;
}

.city-select :deep(.el-select__selected-item) {
  font-weight: 500;
}

.refresh {
  color: var(--text-3);
  cursor: pointer;
  font-size: 14px;
  transition: color 0.15s;
}

.refresh:hover {
  color: var(--primary);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 30px;
  line-height: 1;
}

.temp {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
}

.text {
  font-size: 12px;
  color: var(--text-2);
}

.weather-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-3);
}

.weather-hint {
  font-size: 12px;
  color: var(--text-3);
  padding: 6px 0;
}
</style>
