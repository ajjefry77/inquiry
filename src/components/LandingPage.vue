<template>
  <div class="landing min-h-screen flex flex-col overflow-x-clip">
    <!-- هدر چسبان کپسولی -->
    <header
      class="fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="scrolled ? 'px-3 sm:px-6 pt-3' : 'px-0 pt-0'"
    >
      <div
        class="header-pill relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-visible"
        :class="
          scrolled
            ? 'max-w-3xl rounded-[999px] border border-[var(--border)] bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(23,43,77,0.14),0_2px_8px_rgba(250,108,4,0.08)]'
            : 'max-w-full rounded-none border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md shadow-none'
        "
      >
        <div
          class="mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 transition-all duration-500"
          :class="scrolled ? 'max-w-3xl px-3 sm:px-4 h-[60px]' : 'max-w-7xl px-3 sm:px-5 h-16'"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 justify-self-start col-start-1">
            <span class="logo-3d relative shrink-0">
              <img
                src="/favicon.png"
                alt="لوگوی سامانه استعلام"
                class="w-10 h-10 rounded-xl object-contain shadow-lg shadow-[var(--accent-glow-strong)] transition-transform duration-500"
                :class="scrolled ? 'scale-90' : 'scale-100'"
              />
              <span class="logo-ring"></span>
            </span>
            <div
              class="min-w-0 transition-all duration-500 overflow-hidden"
              :class="scrolled ? 'hidden xs:block sm:block' : 'block'"
            >
              <div class="font-extrabold text-base sm:text-lg leading-tight whitespace-nowrap">
                سامانه استعلام
              </div>
              <div
                class="text-[11px] text-[var(--text-muted)] whitespace-nowrap transition-all duration-500"
                :class="scrolled ? 'opacity-0 h-0' : 'opacity-100'"
              >
               سیستم اطلاعات جغرافیایی(ساج)
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 justify-self-end col-start-3">
            <button
              class="btn btn-primary h-9 !rounded-full transition-all duration-500 !px-3 sm:!px-5 text-[13px] sm:text-sm whitespace-nowrap"
              @click="$emit('start')"
            >
              <i class="fas fa-play ml-1"></i>
              <span class="hidden sm:inline">شروع استعلام</span><span class="sm:hidden">شروع</span>
            </button>
          </div>
        </div>
        <div
          class="absolute overflow-hidden pointer-events-none"
          :class="
            scrolled
              ? 'bottom-[6px] left-6 right-6 h-[3px] rounded-full bg-black/[0.06]'
              : 'bottom-0 right-0 left-0 h-[2.5px] bg-transparent'
          "
        >
          <div
            class="h-full rounded-full bg-gradient-to-l from-[var(--accent-soft)] to-[var(--accent)] transition-[width] duration-150 ease-out"
            :style="{ width: scrollProgress + '%' }"
          ></div>
        </div>
      </div>
    </header>
    <div class="shrink-0 transition-all duration-500" :class="scrolled ? 'h-[72px]' : 'h-16'"></div>

    <!-- هیرو سه‌بعدی -->
    <section
      class="relative flex-1 flex items-center justify-center py-16 md:py-24 overflow-hidden"
      @mousemove="onHeroMove"
      @mouseleave="resetHero"
    >
      <div class="hero-bg absolute inset-0 pointer-events-none"></div>
      <div class="absolute inset-0 hero-grid pointer-events-none"></div>
      <div ref="orbs" class="absolute inset-0 pointer-events-none">
        <div data-depth="30" class="orb orb-1"></div>
        <div data-depth="55" class="orb orb-2"></div>
        <div data-depth="20" class="orb orb-3"></div>
        <div data-depth="70" class="float-chip chip-1">
          <i class="fas fa-location-dot"></i>
        </div>
        <div data-depth="90" class="float-chip chip-2">
          <i class="fas fa-ruler-combined"></i>
        </div>
        <div data-depth="45" class="float-chip chip-3">
          <i class="fas fa-compass-drafting"></i>
        </div>
        <div data-depth="60" class="float-ring ring-1"></div>
        <div data-depth="40" class="float-ring ring-2"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-5 text-center w-full">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-glow)] text-[var(--accent-soft)] text-xs font-medium mb-6 reveal badge-3d">
          <i class="fas fa-certificate"></i>
          استعلام در لحظه
        </div>

        <h1 class="text-4xl md:text-6xl font-black leading-tight mb-5 reveal hero-title">
          کاربری ملک خود را
          <span class="title-3d text-transparent bg-clip-text bg-gradient-to-l from-[var(--accent-soft)] to-[var(--accent)]">استعلام</span>
          کنید
        </h1>

        <p class="max-w-2xl mx-auto text-base md:text-lg text-[var(--text-muted)] leading-8 mb-8 reveal">
          نقطه بگذارید یا محدوده ملک را با پلیگان مشخص کنید تا کاربری آن نمایش داده شود.
          بعد می‌توانید برگه استعلام را با تصویر ماهواره‌ای و نقشه خیابان دانلود کنید.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 reveal">
          <button class="btn btn-primary !px-8 !py-3 !text-base !rounded-xl" @click="$emit('start')">
            <i class="fas fa-map-location-dot ml-2"></i>
            شروع استعلام
          </button>
          <a href="#how" class="btn btn-ghost !px-8 !py-3 !text-base !rounded-xl !bg-white/60 !backdrop-blur">
            مشاهده مراحل
            <i class="fas fa-chevron-down mr-1"></i>
          </a>
        </div>

        <!-- موکاپ سه‌بعدی واکنش‌گرا -->
        <div class="scene relative mx-auto max-w-3xl reveal" @mousemove="onMockupMove" @mouseleave="resetMockup">
          <div class="absolute -inset-6 bg-[var(--accent-glow)] blur-3xl rounded-full pointer-events-none"></div>
          <div ref="mockupInner" class="tilt-card relative bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden will-change-transform">
            <div class="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface2)] border-b border-[var(--border)]">
              <span class="w-3 h-3 rounded-full bg-[var(--danger)]/70"></span>
              <span class="w-3 h-3 rounded-full bg-[var(--warning)]/70"></span>
              <span class="w-3 h-3 rounded-full bg-[var(--success)]/70"></span>
              <span class="mx-auto text-[11px] text-[var(--text-muted)]">پیش‌نمایش برگه استعلام —
                <span class="text-[var(--accent)] font-bold">نمای سه‌بعدی تعاملی</span></span>
            </div>
            <div class="p-3 sm:p-5 bg-white relative text-right">
              <SheetView :geometry="demoGeometry" :form="demoForm" :shots="demoShots" />
              <div ref="glare" class="glare"></div>
            </div>
          </div>
          <div class="float-badge badge-top">
            <span class="dot dot-green"></span>
            کاربری خودکار از روی نقشه
            <i class="fas fa-crosshairs text-[var(--success)]"></i>
          </div>
          <div class="float-badge badge-right">
            <span class="dot dot-orange"></span>
            نقطه و پلیگان
            <bdi class="font-extrabold text-[var(--accent)]">ترسیم روی نقشه</bdi>
          </div>
          <div class="float-badge badge-left">
            <i class="fas fa-file-arrow-down text-[var(--info)]"></i>
            خروجی تصویر / چاپ
          </div>
        </div>
        <p class="mt-4 text-[11px] text-[var(--text-faint)] reveal">
          نشانگر موس را روی پیش‌نمایش حرکت دهید — کارت به‌صورت سه‌بعدی می‌چرخد
        </p>

        <div id="note" class="max-w-2xl mx-auto mt-8 reveal">
          <div class="rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs font-bold leading-7 px-4 py-3">
            <i class="fas fa-triangle-exclamation ml-1"></i>
            این استعلام رسمی نیست و برای اخذ استعلام رسمی به شهرداری مراجعه کنید.
          </div>
        </div>
      </div>
    </section>

    <!-- مراحل -->
    <section id="how" class="py-16 md:py-20 border-t border-[var(--border)] bg-[var(--bg-elevated)]/50 relative overflow-hidden">
      <div class="relative max-w-7xl mx-auto px-5">
        <div class="text-center mb-12 reveal">
          <div class="text-xs text-[var(--accent-soft)] font-semibold mb-2">مراحل کار</div>
          <h2 class="text-2xl md:text-4xl font-extrabold">در ۳ گام ساده</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" style="perspective: 1000px">
          <div v-for="(s, i) in steps" :key="s.title" class="relative reveal step-3d" @mousemove="onCardTilt" @mouseleave="resetCardTilt">
            <div class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 h-full relative overflow-hidden">
              <div class="step-glow"></div>
              <div class="num-3d w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] text-[#241a05] font-extrabold flex items-center justify-center mb-3 shadow-md shadow-[var(--accent-glow)]">
                {{ i + 1 }}
              </div>
              <div class="font-bold text-sm mb-1.5">{{ s.title }}</div>
              <p class="text-xs text-[var(--text-muted)] leading-5">{{ s.desc }}</p>
            </div>
            <i v-if="i < steps.length - 1" class="fas fa-arrow-left absolute -left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] text-sm hidden lg:block"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA پایانی -->
    <section class="py-16 md:py-24 border-t border-[var(--border)] relative overflow-hidden">
      <div class="absolute inset-0 hero-bg pointer-events-none"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="cta-ring"></div>
        <div class="cta-ring cta-ring-2"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-5 text-center reveal">
        <h2 class="text-2xl md:text-4xl font-extrabold mb-4">برگه استعلام‌تان را بگیرید</h2>
        <p class="text-[var(--text-muted)] mb-8">محدوده را روی نقشه مشخص کنید و برگه را دانلود کنید.</p>
        <button class="btn btn-primary !px-10 !py-3.5 !text-lg !rounded-xl" @click="$emit('start')">
          <i class="fas fa-play ml-2"></i>
          شروع استعلام
        </button>
      </div>
    </section>

    <footer class="border-t border-[var(--border)] py-6 bg-[var(--bg-elevated)]/70">
      <div class="max-w-7xl mx-auto px-5 text-center text-sm md:text-base font-semibold text-[var(--text-muted)]">
        کلیه حقوق مادی و معنوی متعلق به شرکت ساج گستر کاسپین می‌باشد
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import SheetView from "./SheetView.vue";

defineEmits(["start"]);

// داده نمونه برای نمایش برگه واقعی استعلام داخل موکاپ سه‌بعدی
const demoGeometry = {
  type: "polygon",
  points: [
    { lng: 51.4198, lat: 35.7142 },
    { lng: 51.4231, lat: 35.7138 },
    { lng: 51.4238, lat: 35.7111 },
    { lng: 51.4205, lat: 35.7102 },
    { lng: 51.4189, lat: 35.7121 },
  ],
  karbari: "مسکونی",
  zones: ["مسکونی"],
  areaM2: 1250,
  center: { lng: 51.4212, lat: 35.7123 },
};
const demoForm = { name: "ملک نمونه", address: "تهران، خیابان نمونه، پلاک ۱۲" };

function svgURI(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
// تصاویر نمایشی (نقشه خیابان و ماهواره‌ای) — فقط برای موکاپ لندینگ
const demoShots = {
  street: svgURI(
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='512' viewBox='0 0 900 512'>` +
      `<rect width='900' height='512' fill='#e9edea'/>` +
      `<rect x='0' y='0' width='220' height='512' fill='#dfe6dd'/>` +
      `<rect x='640' y='330' width='260' height='182' fill='#cfe3f5'/>` +
      `<rect x='620' y='60' width='180' height='140' fill='#cfe8cf'/>` +
      `<g stroke='#ffffff' stroke-linecap='round'>` +
      `<line x1='0' y1='120' x2='900' y2='100' stroke-width='26'/>` +
      `<line x1='0' y1='300' x2='900' y2='330' stroke-width='30'/>` +
      `<line x1='250' y1='0' x2='270' y2='512' stroke-width='22'/>` +
      `<line x1='520' y1='0' x2='500' y2='512' stroke-width='22'/>` +
      `<line x1='0' y1='430' x2='900' y2='420' stroke-width='18'/></g>` +
      `<g stroke='#f7c948' stroke-width='3' stroke-dasharray='12 10'>` +
      `<line x1='0' y1='120' x2='900' y2='100'/>` +
      `<line x1='0' y1='300' x2='900' y2='330'/></g>` +
      `<polygon points='330,180 470,160 500,290 380,320 310,250' fill='rgba(255,0,0,0.18)' stroke='#ff0000' stroke-width='5'/>` +
      `<circle cx='405' cy='240' r='12' fill='#ff0000' stroke='#fff' stroke-width='5'/>` +
      `</svg>`,
  ),
  satellite: svgURI(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='512' viewBox='0 0 600 512'>` +
      `<rect width='600' height='512' fill='#445232'/>` +
      `<rect x='40' y='30' width='180' height='140' fill='#4e5e3a'/>` +
      `<rect x='380' y='300' width='200' height='180' fill='#39452a'/>` +
      `<rect x='200' y='200' width='120' height='90' fill='#5a6a42'/>` +
      `<rect x='0' y='380' width='600' height='40' fill='#6b6f66'/>` +
      `<line x1='0' y1='150' x2='600' y2='170' stroke='#7a7a72' stroke-width='10'/>` +
      `<line x1='300' y1='0' x2='290' y2='512' stroke='#7a7a72' stroke-width='10'/>` +
      `<polygon points='220,190 330,175 350,280 250,300 205,245' fill='rgba(255,0,0,0.22)' stroke='#ff0000' stroke-width='5'/>` +
      `<circle cx='277' cy='238' r='11' fill='#ff0000' stroke='#fff' stroke-width='5'/>` +
      `</svg>`,
  ),
};

const steps = [
  { title: "ترسیم و اطلاعات", desc: "نقطه بگذارید یا پلیگان بکشید؛ نام و آدرس را وارد کنید تا کاربری نمایش داده شود." },
  { title: "پیش‌نمایش", desc: "برگه استعلام را با تصویر ماهواره‌ای و نقشه خیابان ببینید." },
  { title: "دانلود", desc: "برگه استعلام را به‌صورت تصویر دانلود یا چاپ کنید." },
];

const scrolled = ref(false);
const scrollProgress = ref(0);
const mockupInner = ref(null);
const glare = ref(null);
const orbs = ref(null);
let io = null;
let rafId = 0;

function onScroll() {
  const y = window.scrollY || 0;
  scrolled.value = y > 24;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0;
}

function onHeroMove(e) {
  if (!orbs.value) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    orbs.value.querySelectorAll("[data-depth]").forEach((el) => {
      const depth = parseFloat(el.getAttribute("data-depth") || "30");
      el.style.translate = `${-dx * depth}px ${-dy * depth}px`;
    });
  });
}
function resetHero() {
  if (!orbs.value) return;
  orbs.value.querySelectorAll("[data-depth]").forEach((el) => {
    el.style.translate = "0px 0px";
  });
}

function onMockupMove(e) {
  const el = mockupInner.value;
  if (!el) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  const ry = px * -14;
  const rx = py * 12;
  el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  el.style.boxShadow = `${-px * 30}px ${24 + Math.abs(py) * 20}px 70px rgba(23,43,77,0.18), 0 8px 28px rgba(250,108,4,0.12)`;
  if (glare.value) {
    glare.value.style.opacity = "1";
    glare.value.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.35), transparent 55%)`;
  }
}
function resetMockup() {
  const el = mockupInner.value;
  if (!el) return;
  el.style.transform = "rotateX(0deg) rotateY(0deg)";
  el.style.boxShadow = "";
  if (glare.value) glare.value.style.opacity = "0";
}

function onCardTilt(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(900px) rotateX(${py * -8}deg) rotateY(${px * 10}deg) translateY(-5px)`;
}
function resetCardTilt(e) {
  e.currentTarget.style.transform = "";
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (io) io.disconnect();
  cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.hero-bg {
  background:
    radial-gradient(circle at 20% 20%, rgba(250, 108, 4, 0.1), transparent 45%),
    radial-gradient(circle at 80% 30%, rgba(29, 58, 110, 0.07), transparent 50%),
    radial-gradient(circle at 50% 90%, rgba(250, 108, 4, 0.07), transparent 45%);
}
.hero-grid {
  background-image:
    linear-gradient(rgba(29, 58, 110, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 58, 110, 0.06) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%);
}
.header-pill {
  will-change: max-width, border-radius, background-color, box-shadow, padding;
  overflow: visible;
  isolation: isolate;
}
section[id] { scroll-margin-top: 88px; }
.nav-link { position: relative; transition: color 0.2s ease; }
.nav-link::after {
  content: ""; position: absolute; bottom: -4px; right: 0; width: 0; height: 2px;
  border-radius: 999px; background: linear-gradient(-90deg, var(--accent), var(--accent-soft));
  transition: width 0.3s var(--ease-out);
}
.nav-link:hover { color: var(--text); }
.nav-link:hover::after { width: 100%; }
.logo-3d { transform-style: preserve-3d; }
.logo-ring {
  position: absolute; inset: -4px; border-radius: 16px;
  border: 1.5px solid rgba(250, 108, 4, 0.35);
  opacity: 0; transform: scale(0.9); transition: all 0.3s ease; pointer-events: none;
}
.logo-3d:hover .logo-ring { opacity: 1; transform: scale(1.05) rotate(-2deg); }
.scene { perspective: 1400px; }
.tilt-card { transform-style: preserve-3d; transition: transform 0.18s ease-out, box-shadow 0.3s ease; }
.glare { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 20; }
.hero-title { text-wrap: balance; }
.title-3d { display: inline-block; filter: drop-shadow(0 6px 18px rgba(250, 108, 4, 0.35)); transform: translateZ(0); }
.badge-3d { box-shadow: 0 6px 20px rgba(250, 108, 4, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6); transform: translateZ(30px); }
.orb { position: absolute; border-radius: 999px; filter: blur(60px); opacity: 0.55; transition: translate 0.35s ease-out; will-change: translate; }
.orb-1 { width: 340px; height: 340px; top: -60px; right: 6%; background: radial-gradient(circle, rgba(250, 108, 4, 0.28), transparent 70%); animation: drift 9s ease-in-out infinite; }
.orb-2 { width: 300px; height: 300px; bottom: 8%; left: 4%; background: radial-gradient(circle, rgba(47, 111, 208, 0.22), transparent 70%); animation: drift 11s ease-in-out infinite reverse; }
.orb-3 { width: 180px; height: 180px; top: 32%; left: 44%; background: radial-gradient(circle, rgba(250, 108, 4, 0.16), transparent 70%); animation: drift 7s ease-in-out infinite; }
.float-chip {
  position: absolute; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
  border-radius: 16px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
  border: 1px solid var(--border); box-shadow: 0 12px 32px rgba(23, 43, 77, 0.14);
  color: var(--accent); font-size: 20px; transition: translate 0.35s ease-out; will-change: translate;
}
.chip-1 { top: 14%; right: 12%; animation: floatY 5s ease-in-out infinite; }
.chip-2 { top: 46%; left: 7%; animation: floatY 6s ease-in-out infinite 0.6s; color: var(--info); }
.chip-3 { bottom: 18%; right: 8%; animation: floatY 5.5s ease-in-out infinite 1.1s; color: #1d3a6e; }
.float-ring { position: absolute; border-radius: 999px; border: 1.5px dashed rgba(250, 108, 4, 0.35); transition: translate 0.35s ease-out; }
.ring-1 { width: 120px; height: 120px; top: 20%; left: 14%; animation: spinSlow 22s linear infinite; }
.ring-2 { width: 70px; height: 70px; bottom: 26%; left: 20%; animation: spinSlow 16s linear infinite reverse; border-color: rgba(47, 111, 208, 0.3); }
.float-badge {
  position: absolute; z-index: 30; display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px); border: 1px solid var(--border);
  box-shadow: 0 14px 36px rgba(23, 43, 77, 0.16);
  font-size: 12px; font-weight: 700; white-space: nowrap; transform: translateZ(50px);
}
.badge-top { top: -18px; right: 8%; animation: floatY 4.5s ease-in-out infinite; }
.badge-right { bottom: 32%; right: -24px; animation: floatY 5.2s ease-in-out infinite 0.5s; }
.badge-left { bottom: 12%; left: -14px; animation: floatY 4.8s ease-in-out infinite 1s; }
.dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.dot-green { background: #1fa15c; box-shadow: 0 0 0 4px rgba(31, 161, 92, 0.15); animation: pulse 2s infinite; }
.dot-orange { background: var(--accent); box-shadow: 0 0 0 4px rgba(250, 108, 4, 0.15); animation: pulse 2s infinite; }
@media (max-width: 640px) {
  .badge-right { right: 4px; }
  .badge-left { left: 4px; }
  .float-chip { display: none; }
}
.step-3d { transform-style: preserve-3d; }
.step-3d > div { transition: transform 0.18s ease-out, box-shadow 0.25s, border-color 0.25s; will-change: transform; }
.step-glow {
  position: absolute; inset: auto -20% -40% -20%; height: 120px;
  background: radial-gradient(ellipse at center, rgba(250, 108, 4, 0.12), transparent 70%);
  pointer-events: none;
}
.num-3d { transform: translateZ(28px); }
.cta-ring { position: absolute; width: 480px; height: 480px; border-radius: 999px; border: 1px solid rgba(250, 108, 4, 0.18); animation: ringPulse 4s ease-out infinite; }
.cta-ring-2 { animation-delay: 2s; width: 620px; height: 620px; }
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out); }
.reveal.visible { opacity: 1; transform: none; }
.landing { animation: pageIn 0.4s var(--ease-out); }
@keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes floatY { 0%, 100% { margin-top: 0; } 50% { margin-top: -12px; } }
@keyframes drift { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-18px, 16px) scale(1.06); } }
@keyframes spinSlow { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
@keyframes ringPulse { 0% { transform: scale(0.7); opacity: 0.8; } 100% { transform: scale(1.15); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .orb, .float-chip, .float-badge, .cta-ring, .float-ring { animation: none !important; }
  .tilt-card { transition: none !important; }
}
</style>
