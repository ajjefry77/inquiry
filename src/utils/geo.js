// ابزارهای هندسی سبک — بدون وابستگی خارجی
// مختصات: { lng, lat }

export function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function pointInPolygonFeature(lng, lat, geometry) {
  if (!geometry) return false
  if (geometry.type === 'Polygon') {
    const [outer, ...holes] = geometry.coordinates
    if (!pointInRing(lng, lat, outer)) return false
    return !holes.some((h) => pointInRing(lng, lat, h))
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((poly) => {
      const [outer, ...holes] = poly
      if (!pointInRing(lng, lat, outer)) return false
      return !holes.some((h) => pointInRing(lng, lat, h))
    })
  }
  return false
}

export function centroidOf(points) {
  if (!points.length) return null
  let sx = 0, sy = 0
  for (const p of points) { sx += p.lng; sy += p.lat }
  return { lng: sx / points.length, lat: sy / points.length }
}

// مساحت تقریبی (مترمربع) با تصویر اکویی‌رکتنگولر حول مرکز شکل
export function polygonAreaM2(points) {
  if (points.length < 3) return 0
  const c = centroidOf(points)
  const kx = 111320 * Math.cos((c.lat * Math.PI) / 180)
  const ky = 110540
  const xy = points.map((p) => [(p.lng - c.lng) * kx, (p.lat - c.lat) * ky])
  let a = 0
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length
    a += xy[i][0] * xy[j][1] - xy[j][0] * xy[i][1]
  }
  return Math.abs(a / 2)
}

export function formatArea(m2) {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(4)} هکتار (${Math.round(m2).toLocaleString('fa-IR')} م²)`
  if (m2 >= 1000) return `${Math.round(m2).toLocaleString('fa-IR')} متر مربع`
  return `${m2.toFixed(1)} متر مربع`
}

export function todayJalali() {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())
  } catch { return new Date().toLocaleDateString('fa-IR') }
}
