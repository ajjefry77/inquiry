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

        <SheetView :geometry="geometry" :form="form" :shots="shots" />
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button class="btn btn-ghost px-6 sm:min-w-[170px]" @click="$emit('back')">
          <i class="fas fa-arrow-right ml-1"></i>
          بازگشت
        </button>
        <button class="btn btn-primary px-6 sm:min-w-[210px]" @click="$emit('next')">
          <i class="fas fa-download ml-1"></i>
          ادامه به دانلود
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import SheetView from '../SheetView.vue'
import { todayJalali } from '../../utils/geo.js'

defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
  shots: { type: Object, default: null },
})
defineEmits(['back', 'next'])

const date = todayJalali()
</script>
