<template>
  <div class="flex-1 min-h-0 overflow-y-auto bg-[var(--bg)]">
    <div class="max-w-4xl mx-auto px-4 md:px-6 py-10">
      <!-- سربرگ موفق -->
      <div class="card !rounded-3xl py-12 text-center mb-6">
        <div class="w-20 h-20 mx-auto rounded-full bg-[var(--success-glow)] border-2 border-[var(--success)] flex items-center justify-center mb-6 animate-pop">
          <i class="fas fa-circle-check text-3xl text-[var(--success)]"></i>
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold mb-3">برگه استعلام شما آماده دانلود است</h2>
        <p class="text-sm text-[var(--text-muted)] mb-1">استعلام با موفقیت ثبت شد.</p>
        <div class="flex items-center justify-center gap-3 text-xs text-[var(--text-muted)] mt-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border)]">
            <i class="fas fa-stamp text-[var(--accent)]"></i>
            کاربری:
            <span class="font-bold text-[var(--accent-soft)]">{{ geometry.karbari || '—' }}</span>
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border)]">
            <i class="fas fa-user text-[var(--accent)]"></i>
            {{ form.name || '—' }}
          </span>
        </div>
      </div>

      <!-- خلاصه استعلام -->
      <div class="card !rounded-2xl mb-6">
        <div class="font-bold text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-receipt text-[var(--accent)]"></i>
          مشخصات استعلام
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2.5">
            <span class="text-[var(--text-muted)]">نام</span>
            <span class="font-medium">{{ form.name || '—' }}</span>
          </div>
          <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2.5">
            <span class="text-[var(--text-muted)]">کاربری</span>
            <span class="font-medium">{{ geometry.karbari || '—' }}</span>
          </div>
          <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2.5 sm:col-span-2">
            <span class="text-[var(--text-muted)]">آدرس</span>
            <span class="font-medium text-left">{{ form.address || '—' }}</span>
          </div>
          <div v-if="geometry.areaM2" class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2.5">
            <span class="text-[var(--text-muted)]">مساحت تقریبی</span>
            <span class="font-medium">{{ formatArea(geometry.areaM2) }}</span>
          </div>
          <div v-if="geometry.center" class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2.5">
            <span class="text-[var(--text-muted)]">مختصات</span>
            <span class="font-medium" dir="ltr">{{ geometry.center.lng.toFixed(6) }}, {{ geometry.center.lat.toFixed(6) }}</span>
          </div>
        </div>
        <div class="mt-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold text-center leading-6 px-4 py-2">
          این استعلام رسمی نیست و برای اخذ استعلام رسمی به شهرداری مراجعه کنید.
        </div>
      </div>

      <!-- دانلود -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <button class="download-card" :disabled="busy" @click="downloadPng">
          <div class="w-12 h-12 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent)]/30 flex items-center justify-center mb-3">
            <i v-if="busy" class="fas fa-sync-alt fa-spin text-lg text-[var(--accent)]"></i>
            <i v-else class="fas fa-image text-lg text-[var(--accent)]"></i>
          </div>
          <div class="font-bold text-sm mb-1">برگه استعلام</div>
          <div class="text-[11px] text-[var(--text-muted)] mb-3">تصویر PNG</div>
          <span class="text-xs font-semibold text-[var(--accent-soft)] flex items-center gap-1">
            <i class="fas fa-download"></i> دانلود تصویر
          </span>
        </button>
        <button class="download-card" @click="print">
          <div class="w-12 h-12 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent)]/30 flex items-center justify-center mb-3">
            <i class="fas fa-print text-lg text-[var(--accent)]"></i>
          </div>
          <div class="font-bold text-sm mb-1">چاپ / PDF</div>
          <div class="text-[11px] text-[var(--text-muted)] mb-3">از طریق چاپ مرورگر</div>
          <span class="text-xs font-semibold text-[var(--accent-soft)] flex items-center gap-1">
            <i class="fas fa-print"></i> چاپ برگه
          </span>
        </button>
      </div>

      <div class="flex gap-2 justify-center">
        <button class="btn btn-ghost btn-sm" @click="$emit('back')">
          <i class="fas fa-arrow-right ml-1"></i> بازگشت به پیش‌نمایش
        </button>
        <button class="btn btn-ghost btn-sm" @click="$emit('restart')">
          <i class="fas fa-plus ml-1"></i> استعلام جدید
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'
import { formatArea } from '../../utils/geo.js'

const props = defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
})
defineEmits(['back', 'restart'])

const busy = ref(false)

async function downloadPng() {
  busy.value = true
  try {
    const sheet = document.querySelector('[data-sheet]')
    if (sheet) {
      const canvas = await html2canvas(sheet, { scale: 2, useCORS: true })
      const a = document.createElement('a')
      a.download = `estelam-${Date.now()}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } else {
      window.print()
    }
  } finally {
    busy.value = false
  }
}

function print() { window.print() }
</script>

<style scoped>
.download-card {
  background: linear-gradient(175deg, var(--surface), var(--bg-elevated));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out), transform 0.2s var(--ease-out);
}
.download-card:hover:not(:disabled) {
  box-shadow: var(--shadow-md);
  border-color: rgb(var(--accent-rgb) / 0.45);
  transform: translateY(-2px);
}
.download-card:disabled { opacity: 0.5; cursor: not-allowed; }
.animate-pop { animation: popIn 0.35s var(--ease-spring); }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
@media print {
  .download-card, .btn { display: none !important; }
}
</style>
