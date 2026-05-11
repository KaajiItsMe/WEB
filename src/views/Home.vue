<template>
  <div class="flex flex-col h-screen w-full max-w-full overflow-hidden bg-background-light dark:bg-background-dark">
    
    <!-- HEADER / LOCATION -->
    <div class="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 shrink-0 w-full">
      <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">📍 Lokasi Saat Ini</p>
      <div class="flex items-center gap-2 cursor-pointer group w-fit" @click="fetchLocationAndPlaces">
        <p class="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
          {{ locationStatus === 'loading' ? 'Mencari lokasi...' : locationName }}
        </p>
        <RefreshCw v-if="locationStatus === 'loading'" :size="16" class="animate-spin text-primary-500" />
      </div>
    </div>
    
    <!-- TAB KATEGORI -->
    <div class="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 w-full">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="activeTab === tab.key 
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
        class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-95 flex items-center gap-1.5"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- KONTEN TAB (Scrollable Area) -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-28 w-full relative">
      
      <!-- LOADING SKELETON (All Tab) -->
      <div v-if="isLoading && activeTab === 'all'" class="space-y-8">
        <div v-for="i in 3" :key="i">
          <div class="w-32 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mb-3"></div>
          <div class="flex gap-3 overflow-hidden">
            <div class="shrink-0 w-72 md:w-80 h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
            <div class="shrink-0 w-72 md:w-80 h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>

      <!-- TAB: ALL -->
      <div v-else-if="activeTab === 'all'" class="px-4 space-y-10">
        
        <!-- 🔥 Trending -->
        <section v-if="trendingPlaces.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">🔥 Trending</h2>
            <button @click="activeTab = 'trending'" class="text-sm font-bold text-primary-500 hover:text-primary-600">Lihat Semua</button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
            <PlaceCard 
              v-for="place in trendingPlaces.slice(0, 5)" 
              :key="place.id || place.place_id"
              :place="place"
              :parkingInfo="parkingData[place.id] || parkingData[place.place_id]"
              @save="handleSave"
              class="snap-start shrink-0 w-72 md:w-80"
            />
          </div>
        </section>
        
        <!-- 💎 Hidden Gems -->
        <section v-if="hiddenGems.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">💎 Hidden Gems</h2>
            <button @click="activeTab = 'hidden'" class="text-sm font-bold text-primary-500 hover:text-primary-600">Lihat Semua</button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
            <PlaceCard 
              v-for="place in hiddenGems.slice(0, 5)" 
              :key="place.id || place.place_id"
              :place="place"
              :parkingInfo="parkingData[place.id] || parkingData[place.place_id]"
              @save="handleSave"
              class="snap-start shrink-0 w-72 md:w-80"
            />
          </div>
        </section>
        
        <!-- 🛒 Mart Terdekat -->
        <section v-if="nearbyMarts.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">🛒 Mart Terdekat</h2>
            <button @click="activeTab = 'mart'" class="text-sm font-bold text-primary-500 hover:text-primary-600">Lihat Semua</button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
            <PlaceCard 
              v-for="mart in nearbyMarts.slice(0, 5)" 
              :key="mart.id || mart.place_id"
              :place="mart"
              :parkingInfo="parkingData[mart.id] || parkingData[mart.place_id]"
              @save="handleSave"
              class="snap-start shrink-0 w-72 md:w-80"
            />
          </div>
        </section>

      </div>
      
      <!-- TAB: TRENDING ONLY -->
      <div v-else-if="activeTab === 'trending'" class="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 animate-fade-in">
        <div v-for="place in trendingPlaces" :key="place.id || place.place_id" class="w-full">
          <PlaceCard :place="place" :parkingInfo="parkingData[place.id] || parkingData[place.place_id]" @save="handleSave" />
        </div>
      </div>
      
      <!-- TAB: HIDDEN GEMS ONLY -->
      <div v-else-if="activeTab === 'hidden'" class="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 animate-fade-in">
        <div v-for="place in hiddenGems" :key="place.id || place.place_id" class="w-full">
          <PlaceCard :place="place" :parkingInfo="parkingData[place.id] || parkingData[place.place_id]" @save="handleSave" />
        </div>
      </div>
      
      <!-- TAB: MART ONLY -->
      <div v-else-if="activeTab === 'mart'" class="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 animate-fade-in">
        <div v-for="mart in nearbyMarts" :key="mart.id || mart.place_id" class="w-full">
          <PlaceCard :place="mart" :parkingInfo="parkingData[mart.id] || parkingData[mart.place_id]" @save="handleSave" />
        </div>
      </div>

      <!-- TAB: FOOD ONLY -->
      <div v-else-if="activeTab === 'food'" class="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 animate-fade-in">
        <div v-if="foodPlaces.length === 0 && !isLoading" class="col-span-full py-12 text-center text-slate-400">
          Belum ada rekomendasi makanan di sekitar sini.
        </div>
        <div v-for="place in foodPlaces" :key="place.id || place.place_id" class="w-full">
          <PlaceCard :place="place" :parkingInfo="parkingData[place.id] || parkingData[place.place_id]" @save="handleSave" />
        </div>
      </div>

    </div>

    <!-- GLOBAL TOAST -->
    <transition name="toast">
      <div v-if="toast.show" 
           class="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm whitespace-nowrap border animate-bounce-subtle"
           :class="toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-900 text-white border-slate-700'">
        <span>{{ toast.message }}</span>
        <button v-if="!authStore.isAuthenticated" @click="authStore.loginWithGoogle()" class="ml-2 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs hover:bg-slate-200 transition-colors">Login</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MapPin, RefreshCw } from 'lucide-vue-next'
import PlaceCard from '../components/PlaceCard.vue'
import { getUserLocation, calculateDistance } from '../utils/location'
import { useAuthStore } from '../stores/auth'
import { useSavedStore } from '../stores/saved'
import { fetchNearbyPlaces, reverseGeocode, fetchParkingBatch, API_BASE_URL } from '../utils/api'

const authStore = useAuthStore()
const savedStore = useSavedStore()
const locationName = ref('Mencari lokasi...')
const locationStatus = ref('idle')
const isLoading = ref(true)
const userLocation = ref(null)

const trendingPlaces = ref([])
const hiddenGems = ref([])
const nearbyMarts = ref([])
const parkingData = ref({})

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'Semua', icon: '🏠' },
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'hidden', label: 'Hidden Gems', icon: '💎' },
  { key: 'mart', label: 'Mart', icon: '🛒' },
  { key: 'food', label: 'Makanan', icon: '🍽️' }
]

const foodPlaces = computed(() => {
  return [...trendingPlaces.value, ...hiddenGems.value]
    .filter(p => {
      const isFood = p.tags?.some(t => ['restaurant', 'cafe', 'food', 'makanan', 'bakery'].includes((t.text || '').toLowerCase()))
      return isFood || (p.name || '').toLowerCase().match(/warung|resto|cafe|kopi|ayam|nasi|mie|soto|bakso/i)
    })
    .filter((value, index, self) => index === self.findIndex((t) => t.id === value.id)) // remove duplicates
})

// Toast logic
const toast = ref({ show: false, message: '', type: 'info' })
const showToast = (msg, type = 'info') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// MART HELPERS
function getMartType(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('alfamidi super')) return 'Alfamidi Super'
  if (n.includes('alfamidi')) return 'Alfamidi'
  if (n.includes('alfamart')) return 'Alfamart'
  if (n.includes('indomaret fresh')) return 'Indomaret Fresh'
  if (n.includes('indomaret point')) return 'Indomaret Point'
  if (n.includes('indomaret')) return 'Indomaret'
  return 'Mart'
}

function getMartIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('alfamidi')) return '🟡'
  if (n.includes('alfamart')) return '🔴'
  if (n.includes('indomaret')) return '🔵'
  return '🏪'
}

function getMartDisplayName(name) {
  const type = getMartType(name)
  if (type === 'Mart') return name
  const clean = name.replace(/indomaret|alfamart|alfamidi/gi, '').trim()
  return clean || type
}

async function fetchNearbyMarts(lat, lng) {
  try {
    const [indoRes, alfaRes] = await Promise.all([
      fetch(`${API_BASE_URL}/places/search?query=Indomaret&lat=${lat}&lng=${lng}&radius=3000&type=store`),
      fetch(`${API_BASE_URL}/places/search?query=Alfamart&lat=${lat}&lng=${lng}&radius=3000&type=store`)
    ])
    
    const indoData = await indoRes.json()
    const alfaData = await alfaRes.json()
    
    const keywords = ['indomaret', 'indomaret fresh', 'indomaret point', 'alfamart', 'alfamidi', 'alfamidi super']
    
    nearbyMarts.value = [
      ...(indoData.results || []),
      ...(alfaData.results || [])
    ]
    .filter(mart => {
      const name = (mart.name || '').toLowerCase()
      return keywords.some(kw => name.includes(kw))
    })
    .map(p => {
      const dist = calculateDistance(lat, lng, p.geometry?.location?.lat, p.geometry?.location?.lng)
      // Use the same mapping logic as fetchLocationAndPlaces
      return {
        id: p.place_id,
        name: p.name,
        rating: p.rating || 0,
        user_ratings_total: p.user_ratings_total || 0,
        budget: 'Rp10rb - Rp35rb', // Mart is always cheap
        photos: p.photos || [],
        tags: [{ text: getMartType(p.name), colorClass: 'bg-primary-50 text-primary-600' }],
        aiSummary: `🛒 Toko belanja harian ${getMartType(p.name)}. Cek detail untuk info parkir & keramaian.`,
        contributors: p.user_ratings_total || 0,
        privateReviews: 0,
        price_level: 1,
        lat: p.geometry?.location?.lat,
        lng: p.geometry?.location?.lng,
        distance: dist ? (dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`) : null,
        hasParking: true // Marts typically always have parking space (often with informal attendants)
      }
    })
    .sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0))
    .slice(0, 15)
  } catch (error) {
    console.error('Failed to fetch marts:', error)
    nearbyMarts.value = []
  }
}

const fetchLocationAndPlaces = async () => {
  locationStatus.value = 'loading'
  isLoading.value = true
  
  try {
    // 1. Get Coordinates
    const coords = await getUserLocation()
    userLocation.value = coords
    
    // 2. Get Address
    const geoData = await reverseGeocode(coords.lat, coords.lng)
    locationName.value = geoData.address || 'Makassar, Indonesia'
    locationStatus.value = 'success'

    // 3. Get Nearby Places & Marts
    await Promise.all([
      (async () => {
        const data = await fetchNearbyPlaces(coords.lat, coords.lng, 3000)
        if (data.results && data.results.length > 0) {
          const formatted = data.results.map(p => {
            const dist = calculateDistance(coords.lat, coords.lng, p.geometry?.location?.lat, p.geometry?.location?.lng)
            return {
              id: p.place_id,
              name: ['mcdonald\'s', 'mcdonalds', 'kfc', 'mixue', 'starbucks', 'burger king'].includes((p.name || '').toLowerCase()) && p.vicinity ? `${p.name} ${p.vicinity.split(',')[0]}` : p.name,
              rating: p.rating || 0,
              user_ratings_total: p.user_ratings_total || 0,
              budget: p.price_level ? 'Rp'.repeat(p.price_level) : 'Rp',
              photos: p.photos || [],
              tags: (p.types || []).slice(0, 2).map(t => ({ text: t.replace(/_/g, ' '), colorClass: 'bg-slate-100 text-slate-600' })),
              aiSummary: 'Lihat detail untuk analisis AI...',
              contributors: p.user_ratings_total || 0,
              privateReviews: 0,
              price_level: p.price_level,
              lat: p.geometry?.location?.lat,
              lng: p.geometry?.location?.lng,
              distance: dist ? (dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`) : null,
              hasParking: p.types?.includes('parking') || Math.random() > 0.5
            }
          })

          trendingPlaces.value = [...formatted]
            .filter(p => p.rating >= 4.0)
            .sort((a, b) => b.user_ratings_total - a.user_ratings_total)
            .slice(0, 15)

          hiddenGems.value = [...formatted]
            .filter(p => p.rating >= 4.2 && p.user_ratings_total < 100)
            .slice(0, 15)
            
          if (trendingPlaces.value.length === 0) trendingPlaces.value = formatted.slice(0, 15)

        }
      })(),
      fetchNearbyMarts(coords.lat, coords.lng)
    ])

    // 🅿️ FINAL STEP: Fetch parking batch for EVERYTHING once ready
    const allPlaceIds = [
      ...trendingPlaces.value.map(p => p.id),
      ...hiddenGems.value.map(p => p.id),
      ...nearbyMarts.value.map(p => p.id)
    ].filter(Boolean)

    if (allPlaceIds.length > 0) {
      console.log('[HomeDebug] Fetching batch for:', allPlaceIds.length, 'places')
      const batchData = await fetchParkingBatch(allPlaceIds)
      parkingData.value = batchData
      
      // 🔥 DEBUG MISMATCH
      console.log('✅ [HomeDebug] Parking Data Keys:', Object.keys(parkingData.value))
      console.log('✅ [HomeDebug] Mart IDs:', nearbyMarts.value.map(m => m.id))
      console.log('✅ [HomeDebug] Sample Mart:', nearbyMarts.value[0]?.name, 'ID:', nearbyMarts.value[0]?.id)
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    showToast('Gagal memuat data real. Pastikan izin lokasi aktif.', 'error')
    locationName.value = 'Makassar, Indonesia'
    locationStatus.value = 'error'
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
  fetchLocationAndPlaces()
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
