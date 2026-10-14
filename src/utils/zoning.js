import { pointInPolygonFeature, centroidOf } from './geo.js'

// لایه کاربری از ژئوسرور خوانده می‌شود (نامرئی روی نقشه).
// پیش‌فرض: http://mapiq.ir:8080/geoserver — لایه myworkspace:roads — فیلد karbari
// تنظیمات از env می‌آیند (VITE_GEOSERVER_URL / VITE_ZONING_LAYER / VITE_ZONING_FIELD).
// در dev برای دور زدن CORS از پراکسی نسبی /geoserver استفاده می‌شود (vite.config.js).
// اگر ژئوسرور در دسترس نباشد، به فایل لوکال /zoning.geojson برمی‌گردیم تا اپ از کار نیفتد.

const GEOSERVER_URL = import.meta.env.VITE_GEOSERVER_URL || '/geoserver'
const ABSOLUTE_GEOSERVER = 'http://mapiq.ir:8080/geoserver'
export const ZONING_LAYER = import.meta.env.VITE_ZONING_LAYER || 'myworkspace:roads'
export const ZONING_FIELD = import.meta.env.VITE_ZONING_FIELD || 'karbari'

let cache = null
let sourceInfo = { source: 'none', layer: ZONING_LAYER, count: 0 }

export function getZoningInfo() {
  return { ...sourceInfo }
}

function wfsUrl(base) {
  const b = String(base || '').replace(/\/$/, '')
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: ZONING_LAYER,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
  })
  return `${b}/wfs?${params.toString()}`
}

function candidateBases(explicit) {
  const list = []
  if (explicit && !explicit.includes('zoning.geojson')) list.push(null) // handled by caller
  if (GEOSERVER_URL) list.push(GEOSERVER_URL)
  // پراکسی نسبی همیشه کاندید دوم است (وقتی base مطلق http است و صفحه https/CORS خطا می‌دهد)
  if (GEOSERVER_URL !== '/geoserver') list.push('/geoserver')
  if (!list.includes(ABSOLUTE_GEOSERVER)) list.push(ABSOLUTE_GEOSERVER)
  return list
}

export async function loadZoning(url) {
  if (cache) return cache
  // سازگاری با صدای قدیمی loadZoning('/zoning.geojson')
  if (url && url !== '/zoning.geojson') {
    const res = await fetch(url)
    if (!res.ok) throw new Error('خطا در بارگذاری لایه کاربری: ' + res.status)
    cache = await res.json()
    sourceInfo = { source: url, layer: ZONING_LAYER, count: cache.features?.length || 0 }
    return cache
  }

  const bases = url === '/zoning.geojson' ? [] : candidateBases()
  let lastErr = null
  for (const base of bases) {
    const wfs = wfsUrl(base)
    try {
      const res = await fetch(wfs)
      if (!res.ok) throw new Error('WFS ' + res.status)
      const gj = await res.json()
      if (!gj?.features) throw new Error('پاسخ نامعتبر ژئوسرور')
      cache = gj
      sourceInfo = { source: wfs, layer: ZONING_LAYER, count: gj.features?.length || 0 }
      return cache
    } catch (e) {
      lastErr = e
    }
  }

  // فالبک لوکال (mock) — اپ از کار نمی‌افتد
  try {
    const res = await fetch('/zoning.geojson')
    if (!res.ok) throw lastErr || new Error('خطا در بارگذاری لایه کاربری: ' + res.status)
    const gj = await res.json()
    cache = gj
    sourceInfo = { source: '/zoning.geojson (fallback)', layer: ZONING_LAYER, count: gj.features?.length || 0 }
    return cache
  } catch (e) {
    throw lastErr || e
  }
}

export function clearZoningCache() {
  cache = null
  sourceInfo = { source: 'none', layer: ZONING_LAYER, count: 0 }
}

function zoneLabel(f) {
  const p = f.properties || {}
  return p[ZONING_FIELD] || p.karbari || p.usage || p.name || 'نامشخص'
}

// نقطه -> کاربری
export function queryPoint(lng, lat) {
  if (!cache?.features) return { karbari: 'خارج از محدوده پوشش', zone: null }
  const hit = cache.features.find((f) => pointInPolygonFeature(lng, lat, f.geometry))
  if (!hit) return { karbari: 'خارج از محدوده پوشش', zone: null }
  return { karbari: zoneLabel(hit), zone: hit }
}

// پلیگان -> کاربری مرکز + فهرست کاربری‌های متقاطع
export function queryPolygon(points) {
  if (!cache?.features) return { karbari: 'خارج از محدوده پوشش', zones: [] }
  const c = centroidOf(points)
  if (!c) return { karbari: '—', zones: [] }
  const center = queryPoint(c.lng, c.lat)
  // برخورد: مرکز هر زون داخل پلیگان یا هر رأس پلیگان داخل زون
  const ring = points.map((p) => [p.lng, p.lat])
  const hits = (cache.features || []).filter((f) => {
    if (pointInPolygonFeature(c.lng, c.lat, f.geometry)) return true
    if (ring.some(([lng, lat]) => pointInPolygonFeature(lng, lat, f.geometry))) return true
    return sampleZoneVerticesInside(f, ring)
  })
  const zones = [...new Set(hits.map(zoneLabel))]
  return { karbari: center.karbari, zone: center.zone, zones, center: c }
}

function sampleZoneVerticesInside(feature, ring) {
  const coords = feature.geometry?.type === 'Polygon'
    ? feature.geometry.coordinates[0].filter((_, i) => i % 8 === 0)
    : feature.geometry?.type === 'MultiPolygon'
      ? feature.geometry.coordinates.flatMap((p) => p[0]).filter((_, i) => i % 12 === 0)
      : []
  // نقطه نمونه زون داخل پلیگان کاربر؟
  const inPoly = (lng, lat) => {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]
      const xj = ring[j][0], yj = ring[j][1]
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  return coords.some(([lng, lat]) => inPoly(lng, lat))
}
