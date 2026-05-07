<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark pb-20 md:pb-8 pt-4 md:pt-8">
    <div class="px-4 md:px-8">

      <!-- HEADER -->
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Tersimpan</h1>
      <p class="text-slate-600 dark:text-slate-400 mb-6">Daftar tempat yang ingin kamu kunjungi nanti.</p>

      <!-- NOT LOGGED IN -->
      <div v-if="!authStore.isAuthenticated" class="py-20 flex flex-col items-center justify-center text-center">
        <div class="text-6xl mb-4">🔒</div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Login untuk melihat favoritmu!</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-xs mb-6">Simpan tempat favoritmu dan akses dari mana saja dengan akun Google.</p>
        <button @click="authStore.loginWithGoogle()" :disabled="authStore.loading"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {{ authStore.loading ? 'Menghubungkan...' : 'Login dengan Google' }}
        </button>
      </div>

      <!-- LOGGED IN -->
      <template v-else>

        <!-- MIGRATION BANNER -->
        <transition name="fade">
          <div v-if="savedStore.hasMigrationPending"
               class="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span class="text-2xl">📂</span>
            <div class="flex-1">
              <p class="font-bold text-amber-800 dark:text-amber-300 text-sm">Pindahkan favorit lama ke cloud?</p>
              <p class="text-xs text-amber-700 dark:text-amber-400">Kami menemukan data favorit lama di perangkat ini. Pindahkan ke akun Anda agar bisa diakses di mana saja.</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button @click="handleMigrate" :disabled="isMigrating"
                class="text-xs font-bold px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
                <RefreshCw v-if="isMigrating" :size="12" class="animate-spin" />
                {{ isMigrating ? 'Memindahkan...' : 'Ya, Pindahkan' }}
              </button>
              <button @click="savedStore.dismissMigration()" class="text-xs font-bold px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">Nanti</button>
            </div>
          </div>
        </transition>

        <!-- LOADING -->
        <div v-if="!savedStore.isLoaded" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlaceCard v-for="i in 3" :key="i" :loading="true" />
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="savedStore.savedPlaces.length === 0" class="py-20 flex flex-col items-center justify-center text-center animate-fade-in">
          <div class="text-6xl mb-4 opacity-50">💔</div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada tempat tersimpan</h3>
          <p class="text-slate-500 dark:text-slate-400 max-w-xs mb-6">Temukan hidden gem favoritmu dan klik icon hati untuk menyimpannya di sini.</p>
          <router-link to="/app/search" class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 inline-block">
            Cari Tempat Sekarang
          </router-link>
        </div>

        <!-- RESULTS GRID -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6 animate-fade-in">
          <div v-for="place in savedStore.savedPlaces" :key="place.id">
            <PlaceCard :place="place" :parkingInfo="parkingData[place.id] || parkingData[place.place_id]" :loading="false" @save="handleSave" />
          </div>
        </div>

      </template>

    </div>

    <!-- GLOBAL TOAST -->
    <transition name="toast">
      <div v-if="toast.show" 
           class="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm whitespace-nowrap border animate-bounce-subtle"
           :class="toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-900 text-white border-slate-700'">
        <span>{{ toast.message }}</span>
        <button v-if="!authStore.isAuthenticated" @click="authStore.loginWithGoogle()" class="ml-2 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs">Login</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSavedStore } from '../stores/saved'
import { useAuthStore } from '../stores/auth'
import { RefreshCw } from 'lucide-vue-next'
import PlaceCard from '../components/PlaceCard.vue'
import { fetchParkingBatch } from '../utils/api'

const savedStore = useSavedStore()
const authStore = useAuthStore()
const isMigrating = ref(false)
const parkingData = ref({})

// Toast logic
const toast = ref({ show: false, message: '', type: 'info' })
const showToast = (msg, type = 'info') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Load saved places when auth state is known
const loadSaved = async () => {
  await savedStore.load(authStore.user?.uid || null)
  
  // 🅿️ Fetch parking batch for saved places
  const allIds = savedStore.savedPlaces.map(p => p.id || p.place_id).filter(Boolean)
  if (allIds.length > 0) {
    fetchParkingBatch(allIds)
      .then(data => { parkingData.value = data })
      .catch(e => console.warn('[Saved] Parking fetch failed:', e.message))
  }
}

onMounted(() => {
  if (!authStore.loading) loadSaved()
})

// Re-load when user logs in
watch(() => authStore.isAuthenticated, () => loadSaved())

const handleMigrate = async () => {
  if (!authStore.user?.uid) return
  isMigrating.value = true
  await savedStore.migrateFromLocalStorage(authStore.user.uid)
  isMigrating.value = false
}

const handleSave = async (place) => {
  if (!authStore.isAuthenticated) {
    showToast('🔒 Login dulu untuk menyimpan favorit!', 'error')
    return
  }

  try {
    const result = await savedStore.toggleSave(place, authStore.user.uid)
    if (result.success) {
      const isNowSaved = savedStore.isSaved(place.id)
      showToast(isNowSaved ? '❤️ Tersimpan ke favorit!' : '💔 Dihapus dari favorit')
    }
  } catch (error) {
    showToast('❌ Gagal menyimpan', 'error')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.8);
}

@keyframes bounce-subtle {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -5px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
</style>
