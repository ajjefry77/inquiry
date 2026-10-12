import { pointInPolygonFeature, centroidOf } from './geo.js'

// لایه کاربری — عمداً نامرئی.
// دیتا از سرور (فعلاً لوکال: /zoning.geojson) لود می‌شود، روی نقشه هیچ تغییری
// ایجاد نمی‌کند و فقط برای استعلام کاربری نقطه/پلیگان کوئری می‌شود.
// بعداً کافی است URL این فایل با اندپوینت واقعی سرور جایگزین شود.
let cache = null

export async function loadZoning(url = '/zoning.geojson') {
  if (cache) return cache
  const res = await fetch(url)
  if (!res.ok) throw new Error('خطا در بارگذاری لایه کاربری: ' + res.status)
  const gj = await res.json()
  cache = gj
  return gj
}

export function clearZoningCache() { cache = null }

function zoneLabel(f) {
  const p = f.properties || {}
  return p.karbari || p.usage || p.name || 'نامشخص'
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
