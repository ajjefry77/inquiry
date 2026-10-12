<template>
  <!-- همین برگه هم در پیش‌نمایش دیده می‌شود هم خروجی دانلود/چاپ است -->
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
        <img
          v-if="shots?.street"
          :src="shots.street"
          alt="نقشه خیابان"
          class="w-full h-64 object-cover bg-slate-50"
        />
        <div v-else class="w-full h-64 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
          تصویری ثبت نشده است
        </div>
      </figure>
      <figure class="sm:col-span-2 rounded-lg overflow-hidden border border-slate-200">
        <div class="text-center text-[11px] text-slate-500 py-1.5 border-b border-slate-100">تصویر ماهواره‌ای</div>
        <img
          v-if="shots?.satellite"
          :src="shots.satellite"
          alt="تصویر ماهواره‌ای"
          class="w-full h-64 object-cover bg-slate-50"
        />
        <div v-else class="w-full h-64 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
          تصویری ثبت نشده است
        </div>
      </figure>
    </div>

    <div class="px-5 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
      این استعلام رسمی نیست و برای اخذ استعلام رسمی به شهرداری مراجعه کنید.
    </div>
  </div>
</template>

<script setup>
import { formatArea, todayJalali } from '../utils/geo.js'

defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
  shots: { type: Object, default: null },
})

const date = todayJalali()
</script>
