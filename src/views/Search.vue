<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark pb-20 md:pb-8 pt-4 md:pt-8"
       @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    
    <!-- PULL TO REFRESH INDICATOR -->
    <div class="flex justify-center transition-all duration-300 overflow-hidden" 
         :style="{ height: `${pullDistance}px`, opacity: pullDistance / 60 }">
      <div class="flex items-center gap-2 text-primary-500 pt-2">
        <RefreshCw :class="{ 'animate-spin': isRefreshing }" :size="20" />
        <span class="text-sm font-semibold">{{ isRefreshing ? 'Menyegarkan...' : 'Tarik untuk refresh' }}</span>
      </div>
    </div>

    <div class="px-4 md:px-8">
      <!-- HEADER -->
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">Cari Tempat</h1>

      <!-- SEARCH BAR -->
      <div class="relative mb-6">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon :size="20" class="text-slate-400" />
        </div>
        <input v-model="searchQuery" @input="handleSearch" type="text" 
               class="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-shadow"
               placeholder="🔍 Cari tempat... (ketik lokasi manual jika tolak izin)" />
        <button v-if="searchQuery" @click="clearSearch" class="absolute inset-y-0 right-0 pr-4 flex items-center">
          <X :size="16" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
        </button>
      </div>

      <!-- FILTER CHIPS -->
      <div class="flex overflow-x-auto gap-2 pb-4 mb-2 hide-scrollbar">
        <button v-for="filter in filters" :key="filter.id" 
                @click="toggleFilter(filter.id)"
                class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors border"
                :class="activeFilter === filter.id 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'">
          {{ filter.label }}
        </button>
      </div>

      <!-- ERROR STATE -->
      <div v-if="hasError" class="py-16 flex flex-col items-center justify-center text-center animate-fade-in">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle :size="40" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Oops, terjadi kesalahan!</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Kami tidak bisa mengambil data saat ini. Silakan coba beberapa saat lagi.</p>
        <button @click="performSearch" class="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
          Coba Lagi
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="!isLoading && searchResults.length === 0" class="py-16 flex flex-col items-center justify-center text-center animate-fade-in">
        <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4">
          <SearchX :size="48" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Tempat tidak ditemukan</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-xs">Coba gunakan kata kunci lain atau ubah filter pencarian Anda.</p>
      </div>

      <!-- RESULTS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-6">
        <!-- Skeleton State -->
        <template v-if="isLoading">
          <div v-for="i in 6" :key="i">
            <PlaceCard loading />
          </div>
        </template>
        <!-- Data State -->
        <template v-else>
          <div v-for="place in searchResults" :key="place.id || place.place_id">
            <PlaceCard :place="place" :parkingInfo="parkingData[place.id] || parkingData[place.place_id]" @save="handleSave" />
          </div>
        </template>
      </div>

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
import { ref, onMounted, computed } from 'vue'
import { Search as SearchIcon, X, SearchX, AlertTriangle, RefreshCw } from 'lucide-vue-next'
import PlaceCard from '../components/PlaceCard.vue'
import { useAuthStore } from '../stores/auth'
import { useSavedStore } from '../stores/saved'
import { searchPlaces, fetchParkingBatch, API_BASE_URL } from '../utils/api'

const authStore = useAuthStore()
const savedStore = useSavedStore()
const searchQuery = ref('')
const isLoading = ref(true)
const hasError = ref(false)
const searchResults = ref([])
const parkingData = ref({})
const activeFilter = ref('semua')

// Toast logic
const toast = ref({ show: false, message: '', type: 'info' })
const showToast = (msg, type = 'info') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const filters = [
  { id: 'semua', label: 'Semua' },
  { id: 'mart', label: '🛒 Mart' },
  { id: 'mood', label: '🌟 Mood' },
  { id: 'budget', label: '💰 Budget' },
  { id: 'parkir', label: '🚗 Parkir Luas' },
  { id: 'jarak', label: '📍 Terdekat' }
]

// Pull to refresh logic
const startY = ref(0)
const pullDistance = ref(0)
const isRefreshing = ref(false)

const handleTouchStart = (e) => {
  if (window.scrollY === 0) {
    startY.value = e.touches[0].clientY
  }
}

const handleTouchMove = (e) => {
  if (startY.value > 0) {
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.value
    if (diff > 0 && window.scrollY === 0) {
      if (e.cancelable) e.preventDefault()
      pullDistance.value = Math.min(diff * 0.5, 80)
    }
  }
}

const handleTouchEnd = () => {
  if (pullDistance.value > 60 && !isRefreshing.value) {
    refreshData()
  } else {
    pullDistance.value = 0
  }
  startY.value = 0
}

const refreshData = () => {
  isRefreshing.value = true
  performSearch()
  setTimeout(() => {
    isRefreshing.value = false
    pullDistance.value = 0
  }, 1000)
}

const toggleFilter = (id) => {
  activeFilter.value = activeFilter.value === id ? 'semua' : id
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  performSearch()
}

// Debounce helper
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  isLoading.value = true
  hasError.value = false
  
  try {
    const lat = -5.147 // Default Makassar
    const lng = 119.432
    
    let resultsRaw = []

    if (activeFilter.value === 'mart' && !searchQuery.value) {
      // Fetch both major marts to ensure we get a complete list like the Home page
      const [indoRes, alfaRes] = await Promise.all([
        searchPlaces('Indomaret', lat, lng),
        searchPlaces('Alfamart', lat, lng)
      ])
      resultsRaw = [
        ...(indoRes.results || []),
        ...(alfaRes.results || [])
      ]
      
      // Filter out non-marts
      const keywords = ['indomaret', 'indomaret fresh', 'indomaret point', 'alfamart', 'alfamidi', 'alfamidi super']
      resultsRaw = resultsRaw.filter(mart => {
        const name = (mart.name || '').toLowerCase()
        return keywords.some(kw => name.includes(kw))
      })
    } else {
      let queryStr = searchQuery.value || 'restaurant'
      if (activeFilter.value === 'mood' && !searchQuery.value) queryStr = 'cafe aesthetic tempat nongkrong'
      if (activeFilter.value === 'mart' && searchQuery.value) queryStr = searchQuery.value + ' minimarket'
      
      const data = await searchPlaces(queryStr, lat, lng)
      resultsRaw = data.results || []
    }
    
    if (resultsRaw.length > 0) {
      searchResults.value = resultsRaw.map(p => {
        // Special tag mapping for marts
        let tags = (p.types || []).slice(0, 2).map(t => ({ text: t.replace(/_/g, ' '), colorClass: 'bg-slate-100 text-slate-600' }))
        
        const isMartResult = activeFilter.value === 'mart' || p.name?.toLowerCase().includes('indomaret') || p.name?.toLowerCase().includes('alfamart') || p.name?.toLowerCase().includes('alfamidi')
        if (isMartResult) {
          // Use the exact mart brand for the tag, our PlaceCard will style it black
          let brand = 'Minimarket'
          const n = (p.name || '').toLowerCase()
          if (n.includes('alfamidi super')) brand = 'Alfamidi Super'
          else if (n.includes('alfamidi')) brand = 'Alfamidi'
          else if (n.includes('alfamart')) brand = 'Alfamart'
          else if (n.includes('indomaret fresh')) brand = 'Indomaret Fresh'
          else if (n.includes('indomaret point')) brand = 'Indomaret Point'
          else if (n.includes('indomaret')) brand = 'Indomaret'
          tags = [{ text: brand, colorClass: 'bg-slate-900 text-white' }]
        }

        const addressSegment = p.vicinity ? p.vicinity.split(',')[0] : (p.formatted_address ? p.formatted_address.split(',')[0] : '');
        const formattedName = ['mcdonald\'s', 'mcdonalds', 'kfc', 'mixue', 'starbucks', 'burger king'].includes((p.name || '').toLowerCase()) && addressSegment 
          ? `${p.name} ${addressSegment}` 
          : p.name;

        return {
          id: p.place_id,
          name: formattedName,
          rating: p.rating || 0,
          user_ratings_total: p.user_ratings_total || 0,
          budget: isMartResult ? 'Rp10rb - Rp35rb' : (p.price_level ? 'Rp'.repeat(p.price_level) : 'Rp'),
          photos: p.photos || [],
          tags: tags,
          aiSummary: isMartResult ? `🛒 Toko belanja harian ${tags[0].text}. Cek detail untuk info.` : 'Cek detail untuk analisis AI...',
          contributors: p.user_ratings_total || 0,
          privateReviews: 0,
          price_level: p.price_level,
          lat: p.geometry?.location?.lat,
          lng: p.geometry?.location?.lng,
          hasParking: isMartResult ? true : (p.types?.includes('parking') || Math.random() > 0.5)
        }
      })

      if (activeFilter.value === 'parkir') {
        searchResults.value = searchResults.value.filter(p => p.hasParking)
      }

      // 🅿️ Fetch parking batch for search results
      const allPlaceIds = searchResults.value.map(p => p.id).filter(Boolean)
      if (allPlaceIds.length > 0) {
        fetchParkingBatch(allPlaceIds)
          .then(data => { parkingData.value = { ...parkingData.value, ...data } })
          .catch(e => console.warn('[Search] Parking fetch failed:', e.message))
      }
    } else {
      searchResults.value = []
    }
  } catch (e) {
    console.error('Search API failed:', e)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
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

onMounted(() => {
  performSearch()
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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
