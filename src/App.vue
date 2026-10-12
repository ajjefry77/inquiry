<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden bg-[var(--bg)]">
    <Transition name="page" mode="out-in">
      <LandingPage v-if="step === 'landing'" key="landing" @start="go('draw')" />

      <div v-else key="wizard" class="flex-1 flex flex-col min-h-0">
        <WizardHeader :steps="steps" :current="step" :reached-index="reachedIndex" @navigate="go" @home="goHome" />

        <div class="flex-1 min-h-0 flex flex-col">
          <Transition name="step" mode="out-in">
            <DrawStep
              v-if="step === 'draw'"
              key="draw"
              :geometry="geometry"
              :form="form"
              @update:geometry="geometry = $event"
              @submit="onDrawSubmit"
              @back="go('landing')"
            />
            <PreviewStep
              v-else-if="step === 'preview'"
              key="preview"
              :geometry="geometry"
              :form="form"
              :shots="shots"
              @back="go('draw')"
              @next="go('done')"
            />
            <DownloadStep
              v-else-if="step === 'done'"
              key="done"
              :geometry="geometry"
              :form="form"
              @back="go('preview')"
              @restart="restart"
            />
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import LandingPage from './components/LandingPage.vue'
import WizardHeader from './components/WizardHeader.vue'
import DrawStep from './components/steps/DrawStep.vue'
import PreviewStep from './components/steps/PreviewStep.vue'
import DownloadStep from './components/steps/DownloadStep.vue'

const steps = [
  { id: 'draw', label: 'ترسیم و اطلاعات' },
  { id: 'preview', label: 'پیش‌نمایش' },
  { id: 'done', label: 'دانلود' },
]

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('inquiry-session') || 'null') } catch { return null }
})()

const step = ref(saved?.step && saved.step !== 'landing' ? saved.step : 'landing')
const reachedIndex = ref(Number(saved?.reachedIndex) || 0)
const geometry = ref(saved?.geometry || { type: null, points: [], karbari: '', zones: [], areaM2: 0, center: null })
const form = reactive({ name: saved?.form?.name || '', address: saved?.form?.address || '' })
const shots = ref(saved?.shots || null)

const ids = steps.map((s) => s.id)
function go(id) {
  if (id === 'landing') { step.value = 'landing'; persist(); return }
  if (!ids.includes(id)) return
  const idx = ids.indexOf(id)
  if ((id === 'preview' || id === 'done') && !geometry.value?.type) return
  if (id === 'done' && !shots.value) { go('preview'); return }
  reachedIndex.value = Math.max(reachedIndex.value, idx)
  step.value = id
  persist()
}
function goHome() { step.value = 'landing'; persist() }

function onDrawSubmit(s) {
  if (s) shots.value = s
  go('preview')
}

function restart() {
  geometry.value = { type: null, points: [], karbari: '', zones: [], areaM2: 0, center: null }
  form.name = ''; form.address = ''
  shots.value = null
  reachedIndex.value = 0
  step.value = 'landing'
  persist()
}

let t = null
function persist() {
  clearTimeout(t)
  t = setTimeout(() => {
    try {
      localStorage.setItem('inquiry-session', JSON.stringify({
        step: step.value, reachedIndex: reachedIndex.value,
        geometry: geometry.value, form: { ...form }, shots: shots.value,
      }))
    } catch {}
  }, 250)
}
watch([geometry, shots], persist, { deep: true })
watch(form, persist, { deep: true })
</script>

<style>
/* انیمیشن صفحات اصلی */
.page-enter-active {
  transition: all 0.35s var(--ease-out);
}
.page-leave-active {
  transition: all 0.25s ease-in;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  filter: blur(4px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
  filter: blur(4px);
}

/* انیمیشن مراحل ویزارد */
.step-enter-active {
  transition: all 0.3s var(--ease-out);
}
.step-leave-active {
  transition: all 0.2s ease-in;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* انیمیشن مودال‌ها */
.modal-enter-active {
  transition: all 0.3s var(--ease-out);
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* انیمیشن عمومی fade */
.fade-enter-active {
  transition: opacity 0.3s var(--ease-out);
}
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* انیمیشن slide up */
.slide-up-enter-active {
  transition: all 0.35s var(--ease-out);
}
.slide-up-leave-active {
  transition: all 0.25s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
