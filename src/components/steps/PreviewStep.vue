<template>
  <div class="flex-1 min-h-0 overflow-y-auto bg-[var(--bg)]">
    <div class="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-5">
      <!-- سربرگ -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-lg flex items-center gap-2">
            <i class="fas fa-eye text-[var(--accent)]"></i>
            پیش‌نمایش برگه استعلام
          </h2>
          <p class="text-xs text-[var(--text-muted)] mt-1">همین برگه دانلود می‌شود؛ یک بار بررسی کنید</p>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
          <i class="fas fa-file-lines text-[var(--accent)]"></i>
          کاربری: <b class="text-[var(--accent-soft)]">{{ geometry.karbari || '—' }}</b>
        </span>
      </div>

      <!-- برگه استعلام -->
      <div data-sheet class="card !rounded-2xl !p-3">
        <div class="flex items-center justify-between px-1 mb-2">
          <span class="text-xs font-semibold flex items-center gap-1.5">
            <i class="fas fa-stamp text-[var(--accent)]"></i>
            برگه استعلام کاربری — {{ date }}
          </span>
        </div>

        <div class="rounded-xl border border-[var(--border)] overflow-hidden bg-white">
          <div class="px-5 py-3 border-b-2 border-[#1d3a6e] flex items-center justify-between bg-[var(--surface2)]">
            <div class="flex items-center gap-2.5">
              <img src="/favicon.png" alt="" class="w-9 h-9 rounded-lg object-contain" />
              <div>
                <div class="font-extrabold text-sm">برگه استعلام کاربری</div>
                <div class="text-[10px] text-[var(--text-muted)]">سامانه استعلام</div>
              </div>
            </div>
            <div class="text-left">
              <div class="text-[10px] text-[var(--text-muted)]">کاربری</div>
              <div class="font-black text-[var(--success)]">{{ geometry.karbari || '—' }}</div>
            </div>
          </div>

          <div class="px-5 py-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2">
              <span class="text-[var(--text-muted)]">نام</span>
              <span class="font-medium">{{ form.name || '—' }}</span>
            </div>
            <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2">
              <span class="text-[var(--text-muted)]">نوع ترسیم</span>
              <span class="font-medium">{{ geometry.type === 'point' ? 'نقطه' : geometry.type === 'polygon' ? `پلیگان (${geometry.points?.length || 0} نقطه)` : '—' }}</span>
            </div>
            <div class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2 sm:col-span-2">
              <span class="text-[var(--text-muted)]">آدرس</span>
              <span class="font-medium text-left">{{ form.address || '—' }}</span>
            </div>
            <div v-if="geometry.areaM2" class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2">
              <span class="text-[var(--text-muted)]">مساحت تقریبی</span>
              <span class="font-medium">{{ formatArea(geometry.areaM2) }}</span>
            </div>
            <div v-if="geometry.center" class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2">
              <span class="text-[var(--text-muted)]">مختصات</span>
              <span class="font-medium" dir="ltr">{{ geometry.center.lng.toFixed(6) }}, {{ geometry.center.lat.toFixed(6) }}</span>
            </div>
            <div v-if="geometry.zones?.length > 1" class="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-3 py-2 sm:col-span-2">
              <span class="text-[var(--text-muted)]">کاربری‌های متقاطع</span>
              <span class="font-medium">{{ geometry.zones.join('، ') }}</span>
            </div>
          </div>

          <div class="px-5 pb-3 grid sm:grid-cols-2 gap-3">
            <figure class="rounded-xl overflow-hidden border border-[var(--border)]">
              <img :src="shots?.satellite" alt="تصویر ماهواره‌ای" class="w-full h-56 object-cover bg-[var(--surface2)]" />
              <figcaption class="text-[11px] font-semibold text-center py-1.5 bg-[var(--surface2)] border-t border-[var(--border)]">تصویر ماهواره‌ای</figcaption>
            </figure>
            <figure class="rounded-xl overflow-hidden border border-[var(--border)]">
              <img :src="shots?.street" alt="نقشه خیابان" class="w-full h-56 object-cover bg-[var(--surface2)]" />
              <figcaption class="text-[11px] font-semibold text-center py-1.5 bg-[var(--surface2)] border-t border-[var(--border)]">نقشه خیابان</figcaption>
            </figure>
          </div>

          <div class="mx-5 mb-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold text-center leading-6 px-4 py-2">
            این استعلام رسمی نیست و برای اخذ استعلام رسمی به شهرداری مراجعه کنید.
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost flex-1" @click="$emit('back')">
          <i class="fas fa-arrow-right ml-1"></i>
          بازگشت
        </button>
        <button class="btn btn-primary flex-1" @click="$emit('next')">
          <i class="fas fa-download ml-1"></i>
          ادامه به دانلود
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatArea, todayJalali } from '../../utils/geo.js'
defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
  shots: { type: Object, default: null },
})
defineEmits(['back', 'next'])
const date = todayJalali()
</script>
