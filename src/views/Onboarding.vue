<template>
  <div class="fixed inset-0 bg-background-light dark:bg-background-dark flex flex-col justify-between items-center p-6 text-center animate-fade-in z-50">
    
    <!-- SKIP BUTTON -->
    <button v-if="currentStep < 4" @click="finishOnboarding" class="absolute top-6 right-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-medium">
      Skip All
    </button>

    <!-- CONTENT CONTAINER -->
    <div class="flex-1 flex flex-col justify-center items-center w-full max-w-md w-full mx-auto relative overflow-hidden">
      <transition name="slide-up" mode="out-in">
        
        <!-- STEP 1: WELCOME -->
        <div v-if="currentStep === 1" key="step1" class="flex flex-col items-center w-full">
          <div class="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-primary-500/20">
            <MapPin :size="48" stroke-width="1.5" />
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">LokaLens</h1>
          <p class="text-lg text-slate-600 dark:text-slate-300 mb-10 px-4">Temukan hidden gem di kotamu ✨</p>
          <button @click="nextStep" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 text-lg">
            Mulai Jelajah
          </button>
        </div>

        <!-- STEP 2: LOCATION PERMISSION -->
        <div v-else-if="currentStep === 2" key="step2" class="flex flex-col items-center w-full">
          <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Map :size="40" stroke-width="1.5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Izinkan Lokasi</h2>
          <p class="text-slate-600 dark:text-slate-300 mb-8 px-2">Bantu kami menemukan tempat kuliner dan wisata terbaik di sekitarmu. Janji, privasi kamu aman! 🤫</p>
          <div class="w-full space-y-3">
            <button @click="requestLocation" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 text-lg">
              Izinkan Akses
            </button>
            <button @click="nextStep" class="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>

        <!-- STEP 3: NOTIFICATION PERMISSION -->
        <div v-else-if="currentStep === 3" key="step3" class="flex flex-col items-center w-full">
          <div class="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <Bell :size="40" stroke-width="1.5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Jangan Ketinggalan</h2>
          <p class="text-slate-600 dark:text-slate-300 mb-8 px-2">Dapatkan info tempat trending dan rekomendasi spesial langsung ke HP kamu. 🔔</p>
          <div class="w-full space-y-3">
            <button @click="requestNotification" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 text-lg">
              Aktifkan Notifikasi
            </button>
            <button @click="nextStep" class="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>

        <!-- STEP 4: FINISH -->
        <div v-else-if="currentStep === 4" key="step4" class="flex flex-col items-center w-full">
          <div class="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mb-8">
            <Sparkles :size="48" stroke-width="1.5" />
          </div>
          <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Siap Berpetualang!</h2>
          <p class="text-lg text-slate-600 dark:text-slate-300 mb-10 px-4">Mari kita temukan hidden gem dan tempat asik buat kamu.</p>
          <button @click="finishOnboarding" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 text-lg flex items-center justify-center gap-2">
            Mulai Cari Tempat <ArrowRight :size="20" />
          </button>
        </div>
      </transition>
    </div>

    <!-- PROGRESS DOTS -->
    <div class="flex space-x-3 mb-4 mt-6">
      <div v-for="step in 4" :key="step" 
           class="h-2 rounded-full transition-all duration-300"
           :class="[currentStep === step ? 'w-8 bg-primary-500' : 'w-2 bg-slate-200 dark:bg-slate-700']">
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Map, Bell, Sparkles, ArrowRight } from 'lucide-vue-next'
import confetti from 'canvas-confetti'

const router = useRouter()
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    if (currentStep.value === 4) {
      triggerConfetti()
    }
  } else {
    finishOnboarding()
  }
}

const triggerConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

const requestLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location granted', position.coords)
        nextStep()
      },
      (error) => {
        console.log('Location denied or error', error)
        nextStep()
      }
    )
  } else {
    nextStep()
  }
}

const requestNotification = () => {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission)
      nextStep()
    })
  } else {
    nextStep()
  }
}

const finishOnboarding = () => {
  localStorage.setItem('lokalens_onboarding_completed', 'true')
  router.push('/app')
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
