<template>
  <article class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group hover:shadow-md transition-shadow relative isolate h-full">
    
    <!-- SKELETON STATE -->
    <template v-if="loading">
      <div class="aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse rounded-t-2xl"></div>
      <div class="p-4 flex flex-col gap-3">
        <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
        <div class="flex gap-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
        </div>
        <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse mt-2"></div>
      </div>
    </template>

    <!-- LOADED STATE -->
    <template v-else>
      <!-- Clickable Overlay for Navigation -->
      <div @click="goToDetail" class="absolute inset-0 z-0 cursor-pointer"></div>

      <!-- IMAGE -->
      <div class="aspect-video sm:aspect-[4/3] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-t-2xl pointer-events-none">
        <img :src="photoUrl" :alt="place.name" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star :size="14" class="text-amber-500 fill-amber-500" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ place.rating }}</span>
        </div>
        <!-- PARKING BADGE -->
        <div v-if="place.hasParking" class="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-white">
          <CircleParking :size="14" />
          <span class="text-xs font-semibold">Parkir</span>
        </div>
      </div>

      <!-- SAVE BUTTON -->
      <button @click.stop="handleToggleSave"
        class="absolute top-[calc(75%-20px)] right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-[20] transition-all active:scale-90 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 pointer-events-auto"
        :class="[
          { 'animate-heart-beat': isAnimating },
          { 'opacity-50 pointer-events-none': !savedStore.isLoaded }
        ]">
        <Heart :size="20" :class="isSaved ? 'text-red-500 fill-red-500' : 'text-slate-400 dark:text-slate-500'" class="transition-colors" />
      </button>

      <!-- CONTENT -->
      <div class="p-4 flex flex-col flex-1 pointer-events-none">
        <div class="flex justify-between items-start mb-1 pr-12">
          <h3 class="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{{ place.name }}</h3>
        </div>
        
        <div class="flex items-center justify-between mb-3">
          <p v-if="!isMart" class="text-sm text-primary-600 dark:text-primary-400 font-bold">{{ displayBudget }}</p>
          <div v-if="place.distance" class="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full ml-auto">
            <MapPin :size="10" />
            <span>{{ place.distance }} (Garis Lurus)</span>
          </div>
        </div>
        
        <!-- TAGS -->
        <div class="flex flex-wrap gap-2 mb-3 h-6 overflow-hidden">
          <span v-for="(tag, index) in displayTags" :key="index" 
                class="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap"
                :class="tag.colorClass">
            {{ tag.text }}
          </span>
          <!-- Smart Parking Badge (Community Verified) -->
          <span v-if="parkingLabel"
                class="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shadow-sm border border-black/5"
                :class="parkingLabel.color">
            <span v-if="parkingLabel.icon">{{ parkingLabel.icon }}</span>
            <CircleParking v-else :size="10" /> 
            {{ parkingLabel.text }}
            <span v-if="parkingLabel.count > 0" class="opacity-60 ml-0.5 text-[8px]">({{ parkingLabel.count }})</span>
          </span>
        </div>

        <!-- AI SUMMARY -->
        <div class="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl mb-4 border border-primary-100 dark:border-primary-900/30 h-[70px] sm:h-[90px] overflow-hidden flex flex-col relative">
          <div class="flex items-center gap-1.5 mb-1 text-primary-600 dark:text-primary-400 shrink-0">
            <Sparkles :size="14" />
            <span class="text-xs font-bold">Insight</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {{ truncatedAiSummary }}
          </p>
          
          <!-- SPECIAL NOTE FOR ALFA -->
          <div v-if="isAlfa" class="absolute inset-0 bg-blue-600 text-white p-3 flex flex-col justify-center animate-fade-in z-10">
            <div class="flex items-center gap-1.5 mb-1 font-bold">
              <span>📢</span>
              <span class="text-[10px] uppercase tracking-wider">Update</span>
            </div>
            <p class="text-[10px] font-bold leading-tight">
              *Sekarang Alfa sedang membenahi masalah parkir, kemungkinan hasil analisis AI belum sinkron dengan kondisi lapangan saat ini.
            </p>
          </div>
        </div>

        <!-- STATS -->
        <div class="mt-auto mb-4">
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users :size="14" />
            <span>{{ totalReviews.toLocaleString('id-ID') }} Review</span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex gap-2 mb-3 z-10 pointer-events-auto">
          <a :href="getMapsUrl(place)" target="_blank" @click.stop class="flex-1 flex justify-center items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-semibold transition-colors">
            <Map :size="14" /> Maps
          </a>
          <a :href="getDirectionsUrl(place)" target="_blank" @click.stop class="flex-1 flex justify-center items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-semibold transition-colors">
            <Navigation :size="14" /> Rute
          </a>
        </div>
        
        <button @click.stop="goToReview" class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors z-10 pointer-events-auto">
          <MessageSquareWarning :size="16" /> Beri Review Private
        </button>

      </div>
    </template>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSavedStore } from '../stores/saved'
import { Star, CircleParking, Sparkles, Users, Lock, Map, Navigation, MessageSquareWarning, Heart, MapPin } from 'lucide-vue-next'

const props = defineProps({
  place: { type: Object, default: () => ({}) },
  parkingInfo: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['save'])

const router = useRouter()
const savedStore = useSavedStore()
const isAnimating = ref(false)

const isSaved = computed(() => {
  if (!savedStore.isLoaded || !props.place?.id) return false
  return savedStore.isSaved(props.place.id)
})

const isMart = computed(() => {
  const name = (props.place?.name || '').toLowerCase();
  return name.includes('indomaret') || name.includes('alfamart') || name.includes('alfamidi');
});

const isAlfa = computed(() => {
  const name = (props.place?.name || '').toLowerCase();
  return name.includes('alfamart') || name.includes('alfamidi');
});

// Smart Parking Label based on real AI-analyzed data
const parkingLabel = computed(() => {
  const info = props.parkingInfo
  
  // DEBUG: Lihat data yang masuk ke card
  if (props.place?.name?.includes('Indomaret')) {
    console.log(`[ParkingDebug] ${props.place.name}:`, info)
  }

  if (!info || !info.analyzed) {
    if (props.place?.hasParking) {
      return { text: 'Area Parkir', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: '⚪' }
    }
    return null
  }

  // 🔥 PRIORITAS UTAMA: Admin Verified
  if (info.admin_parking?.source === 'admin') {
    const colorMap = {
      kang_parkir: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' },
      resmi: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '🟣' },
      bayar: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '🟠' },
      gratis: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🟢' },
      ada_parkir: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔵' },
      belum_ada_info: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: '⚪' },
      tidak_ada_parkir: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: '❌' }
    }
    const style = colorMap[info.admin_parking.parking_type] || colorMap['belum_ada_info']
    return {
      text: `${info.admin_parking.label_text} (✓ Admin Verified)`,
      color: `${style.color} border-2 font-black`,
      icon: style.icon
    }
  }

  // 👥 PRIORITAS KEDUA: Konsensus Komunitas (Jika sudah ada laporannya)
  if (info.source_count > 0 && info.dominant_type) {
    const colorMap = {
      kang_parkir: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' },
      resmi: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '🟣' },
      bayar: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '🟠' },
      gratis: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🟢' },
      ada_parkir: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔵' },
      belum_ada_info: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: '⚪' }
    }
    const style = colorMap[info.dominant_type] || colorMap['belum_ada_info']
    return {
      text: info.label_text || 'Parkir',
      color: style.color,
      icon: style.icon,
      count: info.source_count
    }
  }

  // 2. PRIORITAS KEDUA: Hasil Analisis AI Gemini (Jika belum ada laporan komunitas)
  // Ini menggunakan field boolean (has_informal_attendant, is_paid, dsb)
  if (info.has_informal_attendant) {
    return { text: 'Ada Kang Parkir ⚠️', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' }
  }
  if (info.is_official) {
    return { text: 'Parkir Resmi ✅', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '🟣' }
  }
  if (info.is_paid || info.paid_parking) {
    return { text: 'Parkir Berbayar', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '🟠' }
  }
  if (info.is_free) {
    return { text: 'Parkir Gratis', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🟢' }
  }
  if (info.notes || info.label_text) {
    return { text: info.label_text || 'Ada Parkir', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔵' }
  }

  return { text: 'Area Parkir', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: '⚪' }
})

const displayTags = computed(() => {
  if (!props.place || !props.place.tags) return []
  const result = []
  const seenTexts = new Set()
  
  props.place.tags.forEach(tag => {
    let text = tag.text.trim()
    let colorClass = tag.colorClass
    
    // Style mart tags with a black badge
    if (isMart.value && (text.toLowerCase().includes('indomaret') || text.toLowerCase().includes('alfamart') || text.toLowerCase().includes('alfamidi'))) {
      colorClass = 'bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap'
    }
    
    const lowerText = text.toLowerCase()
    if (!seenTexts.has(lowerText)) {
      seenTexts.add(lowerText)
      result.push({ text, colorClass })
    }
  })
  
  return result.slice(0, 3)
})

const photoUrl = computed(() => {
  if (!props.place) return '/placeholder-image.jpg'
  if (props.place.image && String(props.place.image).startsWith('http')) return props.place.image
  if (props.place.photos?.[0]?.photo_reference) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${props.place.photos[0].photo_reference}&key=AIzaSyDeg3CmsLCkHX_ADMMtpogfnh78VyU5fU4`
  }
  return '/placeholder-image.jpg'
})

const truncatedAiSummary = computed(() => {
  // If we have real AI summary, use it
  if (props.place.aiSummary && !props.place.aiSummary.includes('detail untuk analisis AI')) {
    if (props.place.aiSummary.length <= 80) return props.place.aiSummary
    return props.place.aiSummary.substring(0, 80) + '...'
  }

  // Generate an objective fallback based on public data
  const name = props.place.name
  const rating = props.place.rating || 0
  const reviews = props.place.user_ratings_total || 0
  const type = props.place.tags?.[0]?.text || 'tempat'

  if (reviews <= 10) {
    return `🔍 Ulasan masih sangat sedikit untuk ${name}. Yuk, jadi yang pertama kasih laporan jujur buat bantu AI LokaLens!`
  }

  if (rating >= 4.5 && reviews > 100) {
    return `📈 ${name} punya rating tinggi (${rating}) dari ${reviews.toLocaleString('id-ID')} ulasan di Maps. Cek laporan jujur AI di sini!`
  }
  
  if (rating >= 4.0) {
    return `📍 ${name} adalah ${type} yang sering diulas warga. Lihat detail untuk cek detailnya`
  }

  if (reviews > 500) {
    return `👥 Telah dikunjungi ribuan orang. Masuk radar LokaLens untuk dianalisis lebih dalam.`
  }

  return `🔍 Sedang mencari info ${type} di area ini? Klik untuk lihat analisis AI LokaLens berdasarkan review terbaru.`
})

const displayBudget = computed(() => {
  // 1. Priority: Price Level from Google
  if (props.place.price_level !== undefined && props.place.price_level !== null) {
    const estimates = [
      'Gratis', 
      'Rp10rb - Rp35rb', 
      'Rp35rb - Rp100rb', 
      'Rp100rb - Rp250rb', 
      'Rp250rb++'
    ]
    return estimates[props.place.price_level] || 'Rp10rb - Rp35rb'
  }
  
  // 2. Secondary: Pre-formatted budget string
  if (props.place.budget && props.place.budget !== 'Rp' && props.place.budget !== 'Murah') {
    let b = String(props.place.budget)
    // Clean up duplicate prefixes
    if (b.startsWith('RpRp')) b = b.substring(2)
    if (!b.startsWith('Rp')) b = 'Rp' + b
    return b
  }
  
  // 3. Fallback
  return 'Rp10rb - Rp35rb'
})

const totalReviews = computed(() => {
  const gmaps = props.place.user_ratings_total || 0
  const lokatens = props.place.privateReviews || 0
  return gmaps + lokatens
})

const handleToggleSave = () => {
  isAnimating.value = true
  emit('save', props.place)
  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

const goToDetail = () => {
  if (props.place?.id) {
    router.push({
      path: `/place/${props.place.id}`,
      query: { n: props.place.name }
    })
  }
}

const goToReview = () => {
  if (props.place?.id) router.push(`/place/${props.place.id}?review=true`)
}

const getMapsUrl = (place) => {
  if (!place) return '#'
  const lat = place.lat || place.latitude
  const lng = place.lng || place.longitude
  return (lat && lng) ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : '#'
}

const getDirectionsUrl = (place) => {
  if (!place) return '#'
  const lat = place.lat || place.latitude
  const lng = place.lng || place.longitude
  return (lat && lng) ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : '#'
}

const getWazeUrl = (place) => {
  if (!place) return '#'
  const lat = place.lat || place.latitude
  const lng = place.lng || place.longitude
  return (lat && lng) ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` : '#'
}
</script>

<style scoped>
.animate-heart-beat {
  animation: heart-beat 0.4s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes heart-beat {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
