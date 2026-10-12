<template>
  <div class="flex-1 min-h-0 overflow-y-auto bg-[var(--bg)]">
    <div class="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
      <!-- سربرگ موفق -->
      <div class="card !rounded-2xl py-6 text-center no-print">
        <div class="w-14 h-14 mx-auto rounded-full bg-[var(--success-glow)] border-2 border-[var(--success)] flex items-center justify-center mb-3 animate-pop">
          <i class="fas fa-circle-check text-2xl text-[var(--success)]"></i>
        </div>
        <h2 class="text-lg font-extrabold mb-1">برگه استعلام آماده است</h2>
        <p class="text-xs text-[var(--text-muted)]">
          {{ form.name }} — کاربری: <b>{{ geometry.karbari }}</b>
        </p>
      </div>

      <!-- همان برگه پیش‌نمایش — خروجی دقیقاً همین است -->
      <SheetView :geometry="geometry" :form="form" :shots="shots" />

      <!-- اقدام‌ها -->
      <div class="card !rounded-2xl no-print">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button class="btn btn-primary !py-3" :disabled="busy" @click="downloadPng">
            <i v-if="busy" class="fas fa-sync-alt fa-spin ml-1"></i>
            <i v-else class="fas fa-image ml-1"></i>
            {{ busy ? 'در حال ساخت تصویر...' : 'دانلود تصویر (PNG)' }}
          </button>
          <button class="btn btn-ghost !py-3" @click="print">
            <i class="fas fa-print ml-1"></i>
            چاپ / ذخیره PDF
          </button>
        </div>
        <div class="flex gap-2 justify-center mt-3">
          <button class="btn btn-ghost btn-sm" @click="$emit('back')">
            <i class="fas fa-arrow-right ml-1"></i> بازگشت به پیش‌نمایش
          </button>
          <button class="btn btn-ghost btn-sm" @click="$emit('restart')">
            <i class="fas fa-plus ml-1"></i> استعلام جدید
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toPng } from 'html-to-image'
import SheetView from '../SheetView.vue'

const props = defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
  shots: { type: Object, default: null },
})
defineEmits(['back', 'restart'])

const busy = ref(false)

// فونت وزیرمتن روی گوگل‌فونت است و html-to-image با خواندن مستقیم
// document.styleSheets (cssRules) به خطای CORS می‌خورد:
// «Cannot access rules». چون fonts.googleapis.com هدر CORS برای fetch
// دارد (*), خودمان CSS را با fetch می‌گیریم، فایل‌های woff2 را به dataURL
// تبدیل می‌کنیم و از طریق fontEmbedCSS تزریق می‌کنیم تا:
// ۱) اصلاً سراغ cssRules نرود و خطای SecurityError ندهد
// ۲) فونت فارسی داخل PNG هم درست بیفتد (نه فونت جایگزین سیستم)
let fontCssCache = null
async function buildFontEmbedCSS() {
  if (fontCssCache !== null) return fontCssCache
  try {
    const url = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap'
    const res = await fetch(url)
    if (!res.ok) throw new Error('font css: ' + res.status)
    let css = await res.text()
    const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))]
    const table = {}
    await Promise.all(urls.map(async (u) => {
      try {
        const r = await fetch(u)
        if (!r.ok) return
        const b = await r.blob()
        const d = await new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.onerror = reject
          fr.readAsDataURL(b)
        })
        table[u] = d
      } catch { /* یک وزن خراب کل خروجی را خراب نکند */ }
    }))
    for (const [u, d] of Object.entries(table)) css = css.split(u).join(d)
    fontCssCache = css
    return css
  } catch {
    fontCssCache = null
    return null
  }
}

function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'))
  return Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    // اگر src خالی/خراب است، html-to-image را نندازیم؛ همان‌جا رها کن
    if (!img.getAttribute('src')) return Promise.resolve()
    return new Promise((resolve) => {
      const done = () => resolve()
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
      setTimeout(done, 4000)
    })
  }))
}

// خروجی PNG دقیقاً از روی همان برگه رندرشده (رندر واقعی مرورگر)
async function downloadPng() {
  if (busy.value) return
  busy.value = true
  try {
    const sheet = document.querySelector('[data-sheet]')
    if (!sheet) { window.print(); return }
    if (!props.shots?.street && !props.shots?.satellite) {
      alert('تصویری برای دانلود نیست. به مرحله ترسیم برگردید و دوباره «ثبت و ادامه» را بزنید.')
      return
    }
    try { await document.fonts?.ready } catch {}
    await waitForImages(sheet)
    // فونت را از قبل آماده کن تا در لحظه toPng معطل fetch نشویم
    const fontEmbedCSS = await buildFontEmbedCSS()
    const baseOpts = {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      // اگر فونت آماده شد آن را تزریق کن (دیگر سراغ cssRules نمی‌رود)؛
      // وگرنه فونت‌ها را رد کن تا SecurityError ندهد (خروجی با فونت سیستم).
      ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
    }
    let dataUrl
    try {
      dataUrl = await toPng(sheet, baseOpts)
    } catch (e) {
      // تلاش دوم بدون فونت؛ اگر تصویر مشکل‌دار بود، آن را نادیده بگیر
      console.warn('toPng retry without fonts', e)
      dataUrl = await toPng(sheet, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
      })
    }
    const a = document.createElement('a')
    a.download = `estelam-${Date.now()}.png`
    a.href = dataUrl
    a.click()
  } catch (e) {
    console.error(e)
    alert('خطا در ساخت تصویر. از گزینه چاپ استفاده کنید.')
  } finally {
    busy.value = false
  }
}

function print() { window.print() }
</script>

<style scoped>
.animate-pop { animation: popIn 0.35s var(--ease-spring); }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
</style>
