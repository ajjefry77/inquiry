<template>
  <div class="flex-1 min-h-0 flex flex-col bg-[var(--bg)]">
    <main class="min-h-0 flex flex-col lg:flex-row lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
      <!-- نقشه : در موبایل ارتفاع ثابت تا WebGL دیده شود؛ در دسکتاپ flex -->
      <section class="relative w-full shrink-0 h-[58svh] min-h-[340px] max-h-[68svh] lg:h-auto lg:max-h-none lg:flex-1 lg:min-h-0 lg:shrink border-b lg:border-b-0 border-[var(--border)]">
        <MapView ref="mapRef" v-model="geometry" @snapshots="onSnapshots" />
      </section>

      <!-- پنل کناری -->
      <aside class="lg:w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col min-h-0 lg:overflow-hidden overflow-visible border-t lg:border-t-0 lg:border-r border-[var(--border)] bg-[var(--surface)]">
        <div class="px-4 pt-3 pb-2 border-b border-[var(--border)]">
          <h2 class="font-bold text-sm flex items-center gap-2">
            <i class="fas fa-pen-to-square text-[var(--accent)]"></i>
            اطلاعات استعلام
          </h2>
          <p class="text-[11px] text-[var(--text-muted)] mt-1 leading-5">
            از ابزارهای سمت چپ نقشه نقطه بگذارید یا پلیگان بکشید تا کاربری نمایش داده شود.
          </p>
        </div>

        <!-- مساحت شکل ترسیم‌شده -->
        <div
          v-if="geometry.type === 'polygon' && geometry.areaM2"
          class="mx-3 mt-3 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2"
        >
          <span class="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
            <i class="fas fa-vector-square text-[var(--accent)]"></i>
            مساحت تقریبی
          </span>
          <span class="text-sm font-bold text-[var(--accent)]">{{ formatArea(geometry.areaM2) }}</span>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-3" style="-webkit-overflow-scrolling:touch">
          <div v-if="!geometry.type" class="text-center py-8 text-[var(--text-faint)] text-xs space-y-3">
            <i class="fas fa-draw-polygon text-3xl block opacity-40"></i>
            <p>
              هنوز ترسیمی روی نقشه وجود ندارد.<br />
              از ابزارهای سمت چپ نقشه استفاده کنید:<br />
              نقطه یا پلیگان.
            </p>
          </div>

          <div>
            <label class="block mb-1 text-xs text-[var(--text-muted)]">نام *</label>
            <input v-model="form.name" type="text" class="input !py-1.5 text-xs" placeholder="مثلاً ملک آقای رضایی" />
          </div>
          <div>
            <label class="block mb-1 text-xs text-[var(--text-muted)]">آدرس *</label>
            <textarea v-model="form.address" rows="2" class="input !py-1.5 text-xs resize-none" placeholder="نشانی ملک را بنویسید"></textarea>
          </div>

          <!-- کاربری استعلام‌شده -->
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5 text-center">
            <div class="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <i class="fas fa-stamp text-[var(--accent)]"></i>
              کاربری استعلام‌شده
            </div>
            <div class="text-base font-extrabold mt-1" :class="geometry.karbari ? 'text-[var(--accent-soft)]' : 'text-[var(--text-faint)]'">
              {{ geometry.karbari || '—' }}
            </div>
            <div v-if="geometry.zones?.length > 1" class="text-[10px] text-[var(--text-muted)] mt-1 leading-5">
              محدوده چند کاربری را قطع می‌کند: {{ geometry.zones.join('، ') }}
            </div>
            <div v-if="geometry.type === 'point' && geometry.center" class="text-[10px] text-[var(--text-faint)] mt-1" dir="ltr">
              {{ geometry.center.lng.toFixed(6) }}, {{ geometry.center.lat.toFixed(6) }}
            </div>
            <button v-if="geometry.type" class="text-[11px] text-[var(--danger)] mt-1.5 hover:underline" @click="clear">
              <i class="fas fa-trash-alt ml-1"></i>حذف ترسیم
            </button>
          </div>
        </div>

        <!-- پایین: دکمه‌ها -->
        <div class="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg)]">
          <div v-if="!canContinue" class="flex items-start gap-2 text-[11px] text-[var(--warning)] leading-5 mb-2">
            <i class="fas fa-triangle-exclamation mt-0.5"></i>
            <span>برای ادامه باید یک نقطه یا پلیگان روی نقشه داشته باشید و نام و آدرس را وارد کنید.</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost flex-1" @click="$emit('back')">
              <i class="fas fa-arrow-right ml-1"></i>
              بازگشت
            </button>
            <button class="btn btn-primary flex-1" :disabled="!canContinue || capturing" @click="submit">
              <i v-if="capturing" class="fas fa-sync-alt fa-spin ml-1"></i>
              <i v-else class="fas fa-clipboard-check ml-1"></i>
              {{ capturing ? 'در حال آماده‌سازی...' : 'ثبت و ادامه' }}
            </button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MapView from '../MapView.vue'
import { formatArea } from '../../utils/geo.js'

const props = defineProps({
  geometry: { type: Object, required: true },
  form: { type: Object, required: true },
})
const emit = defineEmits(['update:geometry', 'submit', 'back'])

const mapRef = ref(null)
const capturing = ref(false)
const shots = ref(null)

const geometry = computed({
  get: () => props.geometry,
  set: (v) => emit('update:geometry', v),
})

const canContinue = computed(() =>
  !!props.geometry?.type &&
  !!props.form?.name?.trim() &&
  !!props.form?.address?.trim(),
)

function clear() {
  mapRef.value?.clearAll()
}

function onSnapshots(s) { shots.value = s }

async function submit() {
  if (!canContinue.value || capturing.value) return
  capturing.value = true
  try {
    const s = await mapRef.value?.captureBoth()
    emit('submit', s || shots.value)
  } finally {
    capturing.value = false
  }
}
</script>
