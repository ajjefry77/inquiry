// آدرس‌یابی معکوس برای پر کردن خودکار فیلد آدرس:
// اول map.ir، اگر جواب نداد mapbox. مقدار پیشنهادی فقط وقتی
// نوشته می‌شود که کاربر خودش چیزی وارد نکرده باشد و بعد هم قابل ویرایش است.

const MAP_IR_KEY = import.meta.env.VITE_MAP_IR_KEY || ''
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

// کلید map.ir از نوع JWT است و تاریخ انقضا دارد؛ اگر منقضی شده باشد هر
// درخواست 401 می‌دهد و کنسول را پر از «Failed to load resource: 401»
// می‌کند. قبل از صدا زدن، انقضا را چک کن و اگر گذشته بود اصلاً صدا نزن
// (مستقیم می‌رویم سراغ mapbox).
function isJwtExpired(token) {
  try {
    const parts = String(token).split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    // کمی حاشیه (۶۰ ثانیه) برای اختلاف ساعت
    return payload.exp * 1000 < Date.now() + 60000
  } catch {
    return false
  }
}
const MAP_IR_EXPIRED = MAP_IR_KEY ? isJwtExpired(MAP_IR_KEY) : false

function withTimeout(ms) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return { signal: c.signal, done: () => clearTimeout(t) }
}

async function reverseMapIr(lat, lon) {
  const { signal, done } = withTimeout(10000)
  try {
    const res = await fetch(
      `https://map.ir/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      { headers: { Accept: 'application/json', 'x-api-key': MAP_IR_KEY }, signal },
    )
    if (!res.ok) throw new Error('map.ir: ' + res.status)
    const data = await res.json()
    const a = data.address || data || {}
    return (
      data.address_compact ||
      data.address ||
      data.postal_address ||
      data.last ||
      [a.province, a.city, a.neighbourhood, a.primary].filter(Boolean).join('، ') ||
      data.display_name ||
      ''
    )
  } finally {
    done()
  }
}

async function reverseMapbox(lat, lon) {
  const { signal, done } = withTimeout(10000)
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(lon + ',' + lat)}.json?access_token=${encodeURIComponent(MAPBOX_TOKEN)}&language=fa&limit=1`,
      { signal },
    )
    if (!res.ok) throw new Error('mapbox: ' + res.status)
    const data = await res.json()
    return data?.features?.[0]?.place_name || ''
  } finally {
    done()
  }
}

export async function suggestAddressForPoints(points) {
  try {
    const pts = (points || []).filter(
      (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
    )
    if (!pts.length) return ''
    const lat = pts.reduce((s, p) => s + Number(p.lat), 0) / pts.length
    const lon = pts.reduce((s, p) => s + Number(p.lng), 0) / pts.length
    if (MAP_IR_KEY && !MAP_IR_EXPIRED) {
      try {
        const d = String(await reverseMapIr(lat, lon) || '').trim()
        if (d) return d
      } catch {}
    }
    if (MAPBOX_TOKEN) {
      try {
        return String(await reverseMapbox(lat, lon) || '').trim()
      } catch {}
    }
    return ''
  } catch {
    return ''
  }
}
