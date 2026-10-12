<template>
  <div class="relative w-full h-full min-h-[inherit] overflow-hidden bg-slate-200">
    <div ref="mapEl" class="absolute inset-0"></div>

    <!-- تولبار ابزار ترسیم -->
    <div class="absolute top-12 sm:top-3 left-3 z-20">
      <div class="flex flex-col rounded-xl shadow-lg p-1.5 sm:p-2 gap-1.5 bg-white/90 sm:bg-white/10 backdrop-blur-md border border-white/20">
        <button
          class="tool-btn"
          :class="tool === 'point' ? 'text-white bg-accent' : 'text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--surface3)]'"
          title="نقطه"
          @click="setTool('point')"
        >
          <i class="fas fa-map-pin"></i>
        </button>
        <button
          class="tool-btn"
          :class="tool === 'polygon' ? 'text-white bg-accent' : 'text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--surface3)]'"
          title="پلی‌گان"
          @click="setTool('polygon')"
        >
          <i class="fas fa-draw-polygon"></i>
        </button>
        <div class="w-full border-t border-[var(--border)] my-1"></div>
        <button
          class="tool-btn text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--surface3)]"
          title="تغییر زمینه: ماهواره / نقشه خیابان"
          @click="toggleBasemap"
        >
          <i class="fas fa-layer-group text-sm"></i>
        </button>
        <button
          v-if="canUndo"
          class="tool-btn text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--danger)] hover:text-white"
          title="حذف آخرین نقطه"
          @click="undoPoint"
        >
          <i class="fas fa-delete-left"></i>
        </button>
        <button
          class="tool-btn text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--surface3)] font-bold"
          title="بزرگنمایی"
          @click="map?.zoomIn({ duration: 200 })"
        >
          <i class="fas fa-plus text-sm"></i>
        </button>
        <button
          class="tool-btn text-[var(--text)] bg-[var(--surface2)] hover:bg-[var(--surface3)] font-bold"
          title="کوچکنمایی"
          @click="map?.zoomOut({ duration: 200 })"
        >
          <i class="fas fa-minus text-sm"></i>
        </button>
      </div>
    </div>

    <!-- راهنما + پایان ترسیم -->
    <div v-if="tool === 'polygon' && draft.length" class="absolute bottom-3 right-3 left-3 sm:left-auto z-20 flex gap-2">
      <button class="btn btn-primary flex-1 sm:flex-none !py-2.5 shadow-xl" @click="finishPolygon">
        <i class="fas fa-check ml-1"></i>
        پایان پلیگان ({{ draft.length }} نقطه)
      </button>
      <button class="btn btn-ghost !py-2.5 shadow-xl" title="لغو" @click="cancelDraft">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="hint" class="absolute top-3 right-1/2 translate-x-1/2 max-w-[calc(100%-6rem)] bg-red-100 border border-red-400 text-red-700 px-3 py-1.5 rounded shadow-lg z-[600] flex items-center gap-2 pointer-events-none text-center">
      <i class="fas fa-pen animate-pulse shrink-0"></i>
      <span class="text-[11px] sm:text-sm font-medium leading-5">{{ hint }}</span>
    </div>

    <div v-if="zoningLoading" class="absolute bottom-3 left-3 z-20 bg-black/60 text-white text-[11px] px-2.5 py-1.5 rounded-lg">
      در حال بارگذاری لایه کاربری...
    </div>
    <div v-else class="absolute bottom-3 left-3 z-20 bg-black/55 text-white text-[10px] px-2.5 py-1.5 rounded-lg hidden sm:block">
      لایه کاربری: فعال (نامرئی) — {{ zoneCount }} زون
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import { loadMapbox } from '../utils/loadMapbox.js'
import { loadZoning, queryPoint, queryPolygon } from '../utils/zoning.js'
import { polygonAreaM2 } from '../utils/geo.js'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ type: null, points: [], karbari: '', zones: [], areaM2: 0 }) },
})
const emit = defineEmits(['update:modelValue', 'mapReady', 'snapshots'])

const mapEl = ref(null)
let map = null
let mapboxgl = null

const tool = ref('') // '' | 'point' | 'polygon'
const draft = ref([]) // نقاط پیش‌نویس پلیگان
const point = ref(props.modelValue?.type === 'point' ? { ...props.modelValue.points[0] } : null)
const polygon = ref(props.modelValue?.type === 'polygon' ? [...props.modelValue.points] : [])
const basemap = ref('satellite')
const zoningLoading = ref(true)
const zoneCount = ref(0)

const SRC = 'inquiry-draw'
const DRAFT_SRC = 'inquiry-draft'

const hint = computed(() => {
  if (tool.value === 'point') return 'ابزار نقطه فعال — روی نقشه کلیک کنید'
  if (tool.value === 'polygon') return draft.value.length
    ? `در حال ترسیم پلیگان (${draft.value.length} نقطه) — Enter: پایان | کلیک راست: حذف آخرین نقطه`
    : 'ابزار پلیگان فعال — روی نقشه کلیک کنید'
  return ''
})
const canUndo = computed(() => tool.value === 'polygon' && draft.value.length > 0)

// ---------- لایه‌ها ----------
function ensureSources() {
  if (!map.getSource(SRC)) {
    map.addSource(SRC, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({ id: SRC + '-fill', type: 'fill', source: SRC, paint: { 'fill-color': '#ff0000', 'fill-opacity': 0.3 }, filter: ['==', '$type', 'Polygon'] })
    map.addLayer({ id: SRC + '-line', type: 'line', source: SRC, paint: { 'line-color': '#ff0000', 'line-width': 3 }, filter: ['in', '$type', 'LineString', 'Polygon'] })
    map.addLayer({ id: SRC + '-point', type: 'circle', source: SRC, paint: { 'circle-radius': 8, 'circle-color': '#ff0000', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 }, filter: ['==', '$type', 'Point'] })
  }
  if (!map.getSource(DRAFT_SRC)) {
    map.addSource(DRAFT_SRC, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({ id: DRAFT_SRC + '-line', type: 'line', source: DRAFT_SRC, paint: { 'line-color': '#ff0000', 'line-width': 2, 'line-dasharray': [6, 4] } })
    map.addLayer({ id: DRAFT_SRC + '-point', type: 'circle', source: DRAFT_SRC, paint: { 'circle-radius': 5, 'circle-color': '#ff0000', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }, filter: ['==', '$type', 'Point'] })
  }
}

function renderFinal() {
  ensureSources()
  const feats = []
  if (point.value) {
    feats.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [point.value.lng, point.value.lat] }, properties: {} })
  } else if (polygon.value.length >= 3) {
    const ring = [...polygon.value.map((p) => [p.lng, p.lat]), [polygon.value[0].lng, polygon.value[0].lat]]
    feats.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} })
  }
  map.getSource(SRC).setData({ type: 'FeatureCollection', features: feats })
}

function renderDraft() {
  if (!map?.getSource(DRAFT_SRC)) return
  const pts = draft.value
  const feats = pts.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: {} }))
  if (pts.length >= 2) {
    const line = [...pts.map((p) => [p.lng, p.lat])]
    feats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: line }, properties: {} })
  }
  map.getSource(DRAFT_SRC).setData({ type: 'FeatureCollection', features: feats })
}

function pushResult() {
  if (point.value) {
    const q = queryPoint(point.value.lng, point.value.lat)
    emit('update:modelValue', { type: 'point', points: [{ ...point.value }], karbari: q.karbari, zones: q.zone ? [q.karbari] : [], areaM2: 0, center: { ...point.value } })
  } else if (polygon.value.length >= 3) {
    const q = queryPolygon(polygon.value)
    emit('update:modelValue', { type: 'polygon', points: [...polygon.value], karbari: q.karbari, zones: q.zones || [], areaM2: polygonAreaM2(polygon.value), center: q.center })
  } else {
    emit('update:modelValue', { type: null, points: [], karbari: '', zones: [], areaM2: 0, center: null })
  }
}

// ---------- ابزار ----------
function setTool(id) {
  tool.value = tool.value === id ? '' : id
  draft.value = []
  renderDraft()
  if (map) map.getCanvas().style.cursor = tool.value ? 'crosshair' : ''
}

function undoPoint() {
  draft.value.pop()
  renderDraft()
}

function cancelDraft() {
  draft.value = []
  renderDraft()
  tool.value = ''
  if (map) map.getCanvas().style.cursor = ''
}

function finishPolygon() {
  if (draft.value.length < 3) return
  polygon.value = [...draft.value]
  point.value = null
  draft.value = []
  renderDraft(); renderFinal(); pushResult()
  tool.value = ''
  if (map) map.getCanvas().style.cursor = ''
  try { fitToGeometry() } catch {}
}

function clearAll() {
  point.value = null
  polygon.value = []
  draft.value = []
  renderDraft(); renderFinal(); pushResult()
}

function fitToGeometry() {
  const pts = point.value ? [point.value] : polygon.value
  if (!pts.length) return
  const lngs = pts.map((p) => p.lng), lats = pts.map((p) => p.lat)
  map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 90, maxZoom: 18, duration: 600 })
}

function onMapClick(e) {
  if (e.originalEvent?.button !== undefined && e.originalEvent.button !== 0) return
  const lngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }
  if (tool.value === 'point') {
    point.value = lngLat
    polygon.value = []
    renderFinal(); pushResult()
    tool.value = ''
    map.getCanvas().style.cursor = ''
  } else if (tool.value === 'polygon') {
    draft.value.push(lngLat)
    renderDraft()
  }
}

function onRightClick(e) {
  if (tool.value === 'polygon' && draft.value.length) {
    e.preventDefault()
    draft.value.pop()
    renderDraft()
  }
}

function onKey(e) {
  if (e.key === 'Enter' && tool.value === 'polygon' && draft.value.length >= 3) {
    e.preventDefault(); finishPolygon()
  } else if (e.key === 'Escape') {
    cancelDraft()
  }
}

// ---------- بیس‌مپ ----------
function styleFor(kind) {
  if (kind === 'street') {
    return {
      version: 8,
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      sources: {
        streets: {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=m&hl=fa&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=m&hl=fa&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=m&hl=fa&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=m&hl=fa&x={x}&y={y}&z={z}',
          ],
          tileSize: 256,
          maxzoom: 20,
        },
      },
      layers: [{ id: 'streets', type: 'raster', source: 'streets' }],
    }
  }
  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: { sat: { type: 'raster', tiles: ['https://mt0.google.com/vt/lyrs=s&hl=fa&x={x}&y={y}&z={z}'], tileSize: 256, maxzoom: 20 } },
    layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
  }
}

async function toggleBasemap() {
  basemap.value = basemap.value === 'satellite' ? 'street' : 'satellite'
  await switchBasemap(basemap.value)
}

// تعویض استایل بدون از دست رفتن ترسیم (دوباره رندر می‌شود)
function switchBasemap(kind) {
  return new Promise((resolve) => {
    const onLoad = () => {
      try { ensureSources(); renderFinal(); renderDraft() } catch {}
      map.off('idle', onLoad)
      resolve()
    }
    map.on('idle', onLoad)
    map.setStyle(styleFor(kind === 'street' ? 'street' : 'satellite'))
    setTimeout(() => { try { map.off('idle', onLoad) } catch {}; resolve() }, 6000)
  })
}

// کپچر هر دو زمینه برای پیش‌نمایش/دانلود
async function captureBoth() {
  const shots = {}
  if (basemap.value !== 'satellite') await switchBasemap('satellite')
  await waitIdle()
  shots.satellite = map.getCanvas().toDataURL('image/png')
  shots.satCenter = map.getCenter().toArray()
  shots.satZoom = map.getZoom()
  await switchBasemap('street')
  await waitIdle()
  // ترسیم روی استایل خیابان هم هست چون دوباره رندر شد
  shots.street = map.getCanvas().toDataURL('image/png')
  await switchBasemap('satellite')
  emit('snapshots', shots)
  return shots
}

function waitIdle() {
  return new Promise((resolve) => {
    let done = false
    const finish = () => { if (!done) { done = true; try { map.off('idle', finish) } catch {}; resolve() } }
    try { map.on('idle', finish) } catch { resolve(); return }
    setTimeout(finish, 2500)
  })
}

// ---------- init ----------
onMounted(async () => {
  try {
    mapboxgl = await loadMapbox()
  } catch (e) {
    console.error('load mapbox failed', e)
    return
  }
  // توکن برای فونت لیبل‌های نقشه لازم است
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''
  map = new mapboxgl.Map({
    container: mapEl.value,
    style: styleFor('satellite'),
    center: [51.42, 35.71],
    zoom: 13,
    attributionControl: false,
    preserveDrawingBuffer: true,
  })
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
  map.on('load', async () => {
    ensureSources(); renderFinal()
    emit('mapReady', { map })
    // لایه کاربری: فقط دیتا — هیچ لایه مرئی اضافه نمی‌شود
    try {
      const gj = await loadZoning('/zoning.geojson')
      zoneCount.value = gj.features?.length || 0
    } catch (e) {
      console.error(e)
    } finally {
      zoningLoading.value = false
    }
  })
  map.on('click', onMapClick)
  map.on('contextmenu', onRightClick)
  window.addEventListener('keydown', onKey)
  watch(() => props.modelValue, (v) => {
    // همگام‌سازی بیرونی (مثلاً پاک‌سازی)
    if (!v || !v.type) {
      if (!polygon.value.length && !point.value) return
      point.value = null; polygon.value = []
      try { renderFinal() } catch {}
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  try { map?.remove() } catch {}
})

defineExpose({ captureBoth, clearAll, setTool, basemap: () => basemap.value })
</script>

<style scoped>
canvas { outline: none; }
.tool-btn {
  width: 2.75rem;
  height: 2.75rem;
  min-width: 44px;
  min-height: 44px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
  transition: background .15s, transform .1s;
  touch-action: manipulation;
  font-size: 1rem;
}
.tool-btn:active { transform: scale(.94); }
@media (min-width: 640px) {
  .tool-btn {
    width: 2rem;
    height: 2rem;
    min-width: 0;
    min-height: 0;
    font-size: .875rem;
  }
}
</style>
