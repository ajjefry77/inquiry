<template>
  <header class="wizard-header relative overflow-visible h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 md:px-6 bg-[var(--surface)] border-b border-[var(--border)] flex-shrink-0 z-50">
    <div class="flex items-center gap-2 justify-self-start min-w-0 col-start-1">
      <img src="/favicon.png" alt="لوگوی سامانه استعلام" class="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain shadow-md shadow-[var(--accent-glow-strong)]" />
      <div class="hidden sm:block">
        <div class="font-extrabold text-sm leading-tight whitespace-nowrap">سامانه استعلام</div>
        <div class="text-[10px] text-[var(--text-muted)] whitespace-nowrap">سیستم اطلاعات جغرافیایی(ساج)</div>
      </div>
    </div>

    <!-- استپر: ستون وسط گرید همیشه دقیقاً وسط صفحه است -->
    <nav class="flex items-center justify-center overflow-x-auto min-w-0 max-w-full col-start-2" aria-label="مراحل">
      <div class="flex items-center min-w-max h-12 px-1">
        <template v-for="(s, i) in steps" :key="s.id">
          <button
            class="flex items-center gap-2 group shrink-0"
            :class="canClick(i) ? 'cursor-pointer' : 'cursor-default'"
            @click="canClick(i) && $emit('navigate', s.id)"
            :title="canClick(i) ? 'رفتن به مرحله ' + s.label : ''"
          >
            <span
              class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold border-2 transition-all duration-300 shrink-0"
              :class="dotClass(i, s.id)"
            >
              <i v-if="s.id === current" class="fas fa-chevron-left text-[10px]"></i>
              <i v-else-if="isDone(i)" class="fas fa-check"></i>
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span
              class="text-xs font-medium whitespace-nowrap hidden lg:block transition-colors"
              :class="
                s.id === current
                  ? 'text-[var(--text)]'
                  : isDone(i)
                    ? 'text-[var(--accent-soft)]'
                    : 'text-[var(--text-faint)]'
              "
            >
              {{ s.label }}
            </span>
          </button>
          <div
            v-if="i < steps.length - 1"
            class="h-0.5 rounded transition-all duration-300 shrink-0 w-4 sm:w-6 lg:w-9"
            :class="isDone(i) ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'"
          ></div>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: String, required: true },
  reachedIndex: { type: Number, default: 0 },
});

defineEmits(["navigate", "home"]);

const currentIndex = computed(() =>
  Math.max(0, props.steps.findIndex((s) => s.id === props.current)),
);

function canClick(i) {
  return i <= props.reachedIndex;
}

function isDone(i) {
  return i < currentIndex.value;
}

function dotClass(i, id) {
  if (id === props.current) return "step-active";
  if (isDone(i)) return "step-done";
  return "step-pending";
}
</script>

<style scoped>
.wizard-header {
  overflow: visible;
  isolation: isolate;
}
.step-active {
  background: linear-gradient(135deg, var(--accent), var(--accent-soft));
  border-color: transparent;
  color: #241a05;
  box-shadow: 0 0 0 4px var(--accent-glow), 0 3px 10px rgba(250, 108, 4, 0.18);
  transform: scale(1.05);
}
.step-done {
  background: var(--accent-glow);
  border-color: rgb(var(--accent-rgb) / 0.45);
  color: var(--accent);
}
.step-pending {
  background: var(--surface2);
  border-color: var(--border);
  color: var(--text-faint);
}
</style>
