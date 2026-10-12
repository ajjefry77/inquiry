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
      <div class="card !rounded-2xl !p-3">
        <div class="flex items-center justify-between px-1 mb-2">
          <span class="text-xs font-semibold flex items-center gap-1.5">
            <i class="fas fa-stamp text-[var(--accent)]"></i>
            برگه استعلام کاربری — {{ date }}
          </span>
        </div>

        <div data-sheet class="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <!-- سربرگ ساده -->
          <div class="px-5 py-3 flex items-center justify-between border-b border-slate-200">
            <div class="flex items-center gap-2">
              <img src="/favicon.png" alt="" class="w-8 h-8 rounded-md object-contain" />
              <div class="font-extrabold text-sm">برگه استعلام کاربری</div>
            </div>
            <div class="text-[11px] text-slate-500">{{ date }}</div>
          </div>

          <!-- اطلاعات -->
          <div class="px-5 py-2 text-[13px] leading-7 divide-y divide-slate-100">
            <div class="flex gap-2 py-1.5">
              <span class="text-slate-500 w-16 shrink-0">نام</span>
              <span class="font-bold">{{ form.name || '—' }}</span>
            </div>
            <div class="flex gap-2 py-1.5">
              <span class="text-slate-500 w-16 shrink-0">آدرس</span>
              <span>{{ form.address || '—' }}</span>
            </div>
            <div class="flex gap-2 py-1.5">
              <span class="text-slate-500 w-16 shrink-0">کاربری</span>
              <span class="font-black text-base">{{ geometry.karbari || '—' }}</span>
            </div>
            <div class="flex gap-2 py-1.5">
              <span class="text-slate-500 w-16 shrink-0">مشخصات</span>
              <span class="text-slate-600">{{ geometry.type === 'point' ? 'نقطه' : `پلیگان (${geometry.points?.length || 0} نقطه)` }}{{ geometry.areaM2 ? ' · ' + formatArea(geometry.areaM2) : '' }}</span>
            </div>
            <div v-if="geometry.zones?.length > 1" class="flex gap-2 py-1.5">
              <span class="text-slate-500 w-16 shrink-0">سایر کاربری‌ها</span>
              <span class="text-slate-600">{{ geometry.zones.join('، ') }}</span>
            </div>
          </div>

          <!-- تصاویر: نقشه خیابان بزرگ‌تر از ماهواره‌ای -->
          <div class="px-5 pb-3 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <figure class="sm:col-span-3 rounded-lg overflow-hidden border border-slate-200">
              <div class="text-center text-[11px] text-slate-500 py-1.5 border-b border-slate-100">نقشه خیابان (گوگل‌مپ)</div>
              <img :src="shots?.street" alt="نقشه خیابان" class="w-full h-64 object-cover bg-slate-50" />
            </figure>
            <figure class="sm:col-span-2 rounded-lg overflow-hidden border border-slate-200">
              <div class="text-center text-[11px] text-slate-500 py-1.5 border-b border-slate-100">تصویر ماهواره‌ای</div>
              <img :src="shots?.satellite" alt="تصویر ماهواره‌ای" class="w-full h-64 object-cover bg-slate-50" />
            </figure>
          </div>

          <div class="px-5 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
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
