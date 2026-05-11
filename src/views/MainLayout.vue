<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex overflow-x-hidden">
    
    <!-- DESKTOP SIDEBAR (>= 768px) -->
    <aside class="hidden md:flex flex-col fixed inset-y-0 left-0 w-16 hover:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-40 group overflow-hidden shadow-xl">
      <div class="flex-1 py-6 flex flex-col items-center group-hover:items-start group-hover:px-4 space-y-6">
        <div class="text-primary-500 mb-4 px-2 flex items-center">
          <MapPin :size="32" stroke-width="1.5" class="shrink-0" />
          <span class="ml-3 font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">LokaLens</span>
        </div>
        
        <nav class="flex flex-col space-y-4 w-full">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="flex items-center p-3 rounded-xl transition-colors group/item"
            :class="isActive(item.path) ? (item.path === '/admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500') : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'">
            <component :is="item.icon" :size="24" class="shrink-0" />
            <span class="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{ item.label }}</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- MAIN CONTENT — sidebar stays mounted, only this div re-renders -->
    <main class="flex-1 min-w-0 pb-28 md:pb-0 md:ml-16 transition-all duration-300">
      <div :key="$route.fullPath">
        <router-view />
      </div>
    </main>

    <!-- BOTTOM NAVIGATION BAR (< 768px) -->
    <nav class="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] z-40 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)]">
      <div class="flex justify-around items-center h-[72px]">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex flex-col items-center justify-center w-full h-full transition-colors relative"
          :class="isActive(item.path) ? (item.path === '/admin' ? 'text-purple-600' : 'text-primary-500') : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'">
          <component :is="item.icon" :size="24" :stroke-width="isActive(item.path) ? 2.5 : 2" class="mb-1 transition-all" :class="isActive(item.path) ? '-translate-y-1' : ''" />
          <span class="text-[10px] font-bold transition-all" :class="isActive(item.path) ? 'opacity-100' : 'opacity-70'">{{ item.label }}</span>
          <!-- Active Indicator -->
          <span v-if="isActive(item.path)" class="absolute -top-[1px] w-10 h-[3px] rounded-b-full transition-all" :class="item.path === '/admin' ? 'bg-purple-600' : 'bg-primary-500'"></span>
        </router-link>
      </div>
    </nav>

    <!-- SURPRISE ME FAB -->
    <button @click="triggerSurprise" 
      class="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 transition-transform hover:scale-110 active:scale-95 z-50 group">
      <Dices :size="28" stroke-width="1.5" class="group-hover:animate-spin" />
    </button>

    <!-- TOAST NOTIFICATION -->
    <transition name="slide-up">
      <div v-if="showToast" class="fixed top-12 left-1/2 -translate-x-1/2 md:top-auto md:bottom-28 md:right-24 md:left-auto md:translate-x-0 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl z-[60] flex items-center max-w-[90vw]">
        <span class="mr-3 text-2xl">🎲</span>
        <div>
          <p class="font-bold text-sm">Coming Soon!</p>
          <p class="text-xs text-slate-300">Fitur ini akan memberikan rekomendasi random untuk kamu!</p>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Search, Heart, User, MapPin, Dices, Shield } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = computed(() => {
  const items = [
    { path: '/app/home', label: 'Home', icon: Home },
    { path: '/app/search', label: 'Search', icon: Search },
    { path: '/app/saved', label: 'Saved', icon: Heart },
    { path: '/app/profile', label: 'Profile', icon: User }
  ]
  if (authStore.isAdmin) {
    items.push({ path: '/admin', label: 'Admin', icon: Shield })
  }
  return items
})

const isActive = (path) => {
  return route.path.startsWith(path)
}

const showToast = ref(false)

const triggerSurprise = () => {
  if (showToast.value) return
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<style scoped>
/* Toast */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
@media (max-width: 767px) {
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translate(-50%, -20px) scale(0.9);
  }
}

/* Page transition — fast, no blank frame */
.page-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-leave-active {
  transition: opacity 0.12s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
}
</style>
