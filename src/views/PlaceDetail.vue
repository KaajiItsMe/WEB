<template>
  <!-- INITIAL LOADING STATE (Before basic details are fetched) -->
  <div v-if="isLoadingBasic" class="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900">
    <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    <p class="mt-4 text-slate-900 dark:text-white font-bold text-lg">{{ displayName }}</p>
    <p class="text-slate-500 font-medium animate-pulse">Menghubungkan ke satelit...</p>
  </div>

  <div class="min-h-screen bg-white dark:bg-slate-900 pb-24 relative" v-else-if="basePlace">
    <!-- HERO SECTION / PHOTO GALLERY -->
    <div class="relative h-64 md:h-96 w-full overflow-hidden group">
      <!-- Gallery Container -->
      <div v-if="basePlace.photos?.length > 0"
        ref="galleryRef"
        class="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
        @touchstart="pauseAutoScroll"
        @touchend="resumeAutoScroll"
        @mouseenter="pauseAutoScroll"
        @mouseleave="resumeAutoScroll"
      >
        <div v-for="(photo, index) in basePlace.photos" :key="index"
          class="snap-center shrink-0 w-full h-full relative"
        >
          <img 
            :src="`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=AIzaSyDeg3CmsLCkHX_ADMMtpogfnh78VyU5fU4`"
            :alt="`${basePlace.name} - Foto ${index + 1}`"
            class="w-full h-full object-cover cursor-zoom-in"
            @click="openLightbox(index)"
          />
        </div>
      </div>
      
      <!-- Placeholder if no photos -->
      <div v-else class="w-full h-full bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
        <Camera :size="48" class="mb-2 opacity-20" />
        <span class="text-sm font-medium">📷 Tidak ada foto tersedia</span>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      
      <!-- Dot Indicators -->
      <div v-if="basePlace.photos?.length > 1" class="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        <span v-for="(_, index) in basePlace.photos" :key="index"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="index === currentPhotoIndex ? 'bg-white w-5' : 'bg-white/40 w-1.5'"
        />
      </div>

      <!-- Arrow Navigation -->
      <button v-if="basePlace.photos?.length > 1"
        @click="prevPhoto"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft :size="24" />
      </button>
      <button v-if="basePlace.photos?.length > 1"
        @click="nextPhoto"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight :size="24" />
      </button>

      <!-- Back Button -->
      <button @click="router.back()" class="absolute top-[env(safe-area-inset-top,1rem)] left-4 w-10 h-10 bg-black hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-20 mt-4">
        <ArrowLeft :size="24" />
      </button>

      <!-- Save Button -->
      <button @click="handleSave(basePlace)" 
        class="absolute top-[env(safe-area-inset-top,1rem)] right-4 w-10 h-10 bg-black hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-20 active:scale-90 mt-4"
        :class="{ 'animate-heart-beat': isAnimating }">
        <Heart :size="20" :class="isSaved ? 'text-red-500 fill-red-500' : 'text-white'" />
      </button>

      <!-- Hero Content -->
      <div class="absolute bottom-0 left-0 p-4 pb-10 md:p-8 md:pb-10 w-full z-10">
        <div class="flex flex-wrap gap-2 mb-2" v-if="displayTags.length > 0">
          <span v-for="(tagObj, index) in displayTags" :key="index" 
                class="text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm"
                :class="getColorClass(tagObj.color)">
            {{ tagObj.text }}
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-1">{{ basePlace?.name || displayName }}</h1>
        <p class="text-white/80 font-medium flex items-center gap-2">
          <template v-if="!isMart">
            <span v-if="aiData">Rp {{ aiData.budget_per_person?.toLocaleString('id-ID') }} / org</span>
            <span v-else>Rp --</span>
            <span>•</span>
          </template>
          <span class="flex items-center gap-1"><Star :size="14" class="text-amber-400 fill-amber-400" /> {{ basePlace.rating || 'Baru' }}</span>
        </p>
      </div>
    </div>

    <!-- GLOBAL TOAST -->
    <transition name="fade">
      <div v-if="toastMessage" 
           :class="toastType === 'error' ? 'bg-red-500' : 'bg-green-500'"
           class="fixed top-4 right-4 z-[100] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <Sparkles v-if="toastType === 'success'" :size="16" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="px-4 md:px-8 max-w-4xl mx-auto relative z-10 py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm mt-12">
      <div class="w-16 h-16 relative flex items-center justify-center mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
        <div class="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        <Sparkles :size="24" class="text-primary-500 animate-pulse" />
      </div>
      <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">🧠 {{ loadingMessage }}</h3>
      <p class="text-slate-500 text-sm text-center max-w-xs">Membaca ribuan review, mengecek parkiran, dan menyusun laporan untukmu.</p>
    </div>

    <!-- CONTENT STATE -->
    <div v-else-if="aiData" class="px-4 md:px-8 max-w-4xl mx-auto -mt-4 relative z-10 space-y-6">
      
      <!-- AI SUMMARY CARD -->
      <div class="bg-primary-50 dark:bg-primary-900/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-900/30 shadow-sm mt-12">
        <div class="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
          <Sparkles :size="20" />
          <span class="font-bold text-lg">AI Summary</span>
        </div>
        <p class="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {{ aiData.ai_summary }}
        </p>
        <!-- SPECIAL NOTE FOR ALFA -->
        <p v-if="isAlfa" class="mt-3 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-start gap-1.5 bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <span class="shrink-0">📢</span>
          <span>*Sekarang Alfa sedang membenahi masalah parkir, kemungkinan hasil analisis AI belum sinkron dengan kondisi lapangan saat ini.</span>
        </p>
        <div class="mt-3 pt-3 border-t border-primary-100 dark:border-primary-900/30 space-y-2">
          <div class="flex justify-between text-xs font-semibold text-primary-700/60 dark:text-primary-300/60">
            <span>Vibes: {{ aiData.vibes }}</span>
            <span>Waktu Terbaik: {{ aiData.best_time }}</span>
          </div>
          
          <!-- REVIEW SOURCE STATS -->
          <div v-if="aiData.review_stats" class="flex items-center gap-4 text-[10px] text-slate-400 font-medium pt-1">
            <div class="flex items-center gap-1">
              <FileText :size="12" />
              <span>{{ aiData.review_stats.google_count }} Google Reviews Analyzed</span>
            </div>
            <div class="flex items-center gap-1 bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 rounded-full text-primary-600 dark:text-primary-400">
              <Lock :size="10" />
              <span>{{ aiData.review_stats.lokalens_count }} LokaLens Community Updates</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SCORE BREAKDOWN -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart2 :size="20" class="text-slate-500" /> Score Breakdown
        </h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <span class="w-16 text-sm font-semibold text-slate-600 dark:text-slate-400">Overall</span>
            <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500 rounded-full transition-all duration-1000" :style="`width: ${(aiData.score_overall / 5) * 100}%`"></div>
            </div>
            <span class="w-8 text-right text-sm font-bold text-slate-900 dark:text-white">{{ aiData.score_overall }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-sm font-semibold text-slate-600 dark:text-slate-400">Taste</span>
            <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" :style="`width: ${(aiData.score_taste / 5) * 100}%`"></div>
            </div>
            <span class="w-8 text-right text-sm font-bold text-slate-900 dark:text-white">{{ aiData.score_taste }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-sm font-semibold text-slate-600 dark:text-slate-400">Service</span>
            <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full transition-all duration-1000" :style="`width: ${(aiData.score_service / 5) * 100}%`"></div>
            </div>
            <span class="w-8 text-right text-sm font-bold text-slate-900 dark:text-white">{{ aiData.score_service }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-sm font-semibold text-slate-600 dark:text-slate-400">Value</span>
            <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all duration-1000" :style="`width: ${(aiData.score_value / 5) * 100}%`"></div>
            </div>
            <span class="w-8 text-right text-sm font-bold text-slate-900 dark:text-white">{{ aiData.score_value }}</span>
          </div>
        </div>
      </div>

      <!-- TWO COLUMNS (DESKTOP) / STACKED (MOBILE) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- PARKING INFO -->
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               :class="aiData.parking_info.parking_sentiment === 'negatif' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'">
            <ParkingCircle :size="24" />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white mb-1">Informasi Parkir</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ aiData.parking_info.parking_notes }}
            </p>
            <!-- SPECIAL NOTE FOR ALFA -->
            <p v-if="isAlfa" class="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-start gap-1.5 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
              <span class="shrink-0 text-lg">📢</span>
              <span>Sekarang Alfa sedang membenahi masalah parkir, kemungkinan hasil analisis AI belum sinkron dengan kondisi lapangan saat ini.</span>
            </p>
          </div>
        </div>

        <!-- RED FLAG WARNING -->
        <div v-if="aiData.red_flag" class="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm flex items-start gap-4">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle :size="24" />
          </div>
          <div>
            <h4 class="font-bold text-red-900 dark:text-red-400 mb-1">Red Flag</h4>
            <p class="text-sm text-red-700 dark:text-red-300">
              "{{ aiData.red_flag }}"
            </p>
          </div>
        </div>
      </div>

      <!-- COMMUNITY UPDATES -->
      <div v-if="aiData.community_updates && aiData.community_updates.length > 0">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg text-slate-900 dark:text-white">Update Komunitas Terbaru</h3>
          <span class="text-[10px] text-slate-400 flex items-center gap-1 italic">
            <Lock :size="10" /> Nama disamarkan untuk privasi
          </span>
        </div>
        <div class="space-y-4">
          <div v-for="(update, index) in visibleUpdates" :key="index" class="flex gap-3 animate-fade-in">
            <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
              <span class="text-slate-500 text-sm font-bold">{{ sanitizeReporterName(update.reported_by).charAt(0).toUpperCase() }}</span>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 w-full">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-900 dark:text-white capitalize">{{ sanitizeReporterName(update.reported_by) }}</span>
                  <span class="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">Samaran</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded-sm" :class="update.verified ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'">
                  {{ update.verified ? 'Terverifikasi' : 'Baru' }}
                </span>
              </div>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ update.update }}</p>
            </div>
          </div>
        </div>

        <!-- LOAD MORE UPDATES -->
        <button 
          v-if="aiData.community_updates.length > visibleCount"
          @click="loadMoreUpdates"
          class="mt-4 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-500 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-2"
        >
          Lihat update lainnya ({{ Math.min(4, aiData.community_updates.length - visibleCount) }} dari {{ aiData.community_updates.length - visibleCount }}) ↓
        </button>
      </div>

      <!-- NAVIGATION ACTIONS -->
      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 pb-8">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-4">Petunjuk Arah</h3>
        <div class="flex gap-3">
          <a :href="getMapsUrl(aiData.location_data)" target="_blank" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm">
            <Map :size="24" />
            <span class="text-sm font-semibold">Google Maps</span>
          </a>
          <a :href="getDirectionsUrl(aiData.location_data)" target="_blank" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:text-green-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm">
            <Navigation :size="24" />
            <span class="text-sm font-semibold">Rute</span>
          </a>
          <a :href="getWazeUrl(aiData.location_data)" target="_blank" class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-500 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm">
            <Car :size="24" />
            <span class="text-sm font-semibold">Waze</span>
          </a>
        </div>
      </div>

    </div>

    <!-- ERROR STATE -->
    <div v-else-if="hasError" class="py-12 flex flex-col items-center justify-center text-center">
      <AlertTriangle :size="48" class="text-red-500 mb-4" />
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Gagal Menganalisis</h3>
      <p class="text-slate-500 mb-4">Maaf, AI kami sedang sibuk. Coba lagi sebentar ya.</p>
      <button @click="fetchAIData" class="px-6 py-2 bg-primary-500 text-white rounded-lg font-bold shadow-md">Coba Lagi</button>
    </div>

    <!-- STICKY CTA BUTTON -->
    <div v-if="aiData" class="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 pb-[env(safe-area-inset-bottom,1rem)]">
      <div class="max-w-4xl mx-auto flex gap-3">
        <button @click="showReviewModal = true" class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-lg active:scale-[0.98]">
          <MessageSquareWarning :size="18" /> Beri Review Private 🔒
        </button>
      </div>
    </div>

    <!-- REVIEW MODAL -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center animate-fade-in p-4 md:p-0">
      <div class="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl md:rounded-2xl p-6 relative animate-slide-up shadow-2xl">
        <button @click="showReviewModal = false" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
          <X :size="16" />
        </button>
        <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-1">Review Private 🔒</h3>
        
        <!-- User Info -->
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 mb-4 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
          <img v-if="authStore.user.photoURL" :src="authStore.user.photoURL" class="w-6 h-6 rounded-full" />
          <div class="text-xs text-green-800 dark:text-green-300">
            Anda login sebagai <strong>{{ authStore.user.displayName }}</strong>
            <span class="inline-flex items-center gap-0.5 bg-green-100 text-green-700 px-1 py-0.5 rounded text-[10px] font-bold ml-1">
              <ShieldCheck :size="10" /> Verified
            </span>
          </div>
        </div>
        <div v-else class="mb-4 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <p class="text-xs text-amber-800 dark:text-amber-300">Anda mereview secara <strong>Anonim</strong>. Login untuk menyimpan riwayat review.</p>
        </div>

        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Review kamu 100% rahasia dan hanya akan dibaca oleh AI LokaLens untuk meningkatkan kualitas rekomendasi.</p>
        
        <div class="mb-4">
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rating Keseluruhan</label>
          <div class="flex gap-2">
            <button v-for="i in 5" :key="i" @click="reviewForm.rating = i" class="transition-transform active:scale-90">
              <Star :size="32" :class="i <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'" />
            </button>
          </div>
        </div>

        <!-- INFO PARKIR (NEW CATEGORIES) -->
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <label class="block text-sm font-bold text-blue-900 dark:text-blue-300 mb-2.5">
            🅿️ Info Parkir (Pilih salah satu)
          </label>
          
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button type="button" @click="parkingType = 'kang_parkir'" :class="parkingType === 'kang_parkir' ? 'bg-red-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              🔴 Ada Kang Parkir ⚠️
            </button>
            <button type="button" @click="parkingType = 'resmi'" :class="parkingType === 'resmi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              🟣 Parkir Resmi ✅
            </button>
            <button type="button" @click="parkingType = 'bayar'" :class="parkingType === 'bayar' ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              🟠 Parkir Berbayar
            </button>
            <button type="button" @click="parkingType = 'gratis'" :class="parkingType === 'gratis' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              🟢 Parkir Gratis
            </button>
            <button type="button" @click="parkingType = 'ada_parkir'" :class="parkingType === 'ada_parkir' ? 'bg-blue-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              🔵 Ada Parkir
            </button>
            <button type="button" @click="parkingType = 'belum_ada_info'" :class="parkingType === 'belum_ada_info' ? 'bg-slate-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'" class="p-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
              ⚪ Belum Ada Info
            </button>
          </div>
          
          <textarea v-model="parkingNotes" placeholder="Tambahkan info parkir (tarif, lokasi, dll)..." class="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" rows="1"></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Review Jujur Kamu</label>
          <textarea v-model="reviewForm.text" rows="4" 
                    placeholder="Contoh: Parkir mahal, porsinya dikit, tapi rasanya lumayan..."
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
          <p class="text-xs text-red-500 mt-1" v-if="reviewError">{{ reviewError }}</p>
        </div>

        <button @click="submitReview" :disabled="isSubmitting" 
                class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
          <RefreshCw v-if="isSubmitting" :size="18" class="animate-spin" />
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Review Secara Anonim' }}
        </button>
      </div>
    </div>

    <!-- LIGHTBOX -->
    <Teleport to="body">
      <div v-if="lightboxOpen" 
           class="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-fade-in"
           @click="closeLightbox">
        <div class="relative w-full h-full flex items-center justify-center p-4">
          <img 
            :src="`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${basePlace.photos[lightboxIndex].photo_reference}&key=AIzaSyDeg3CmsLCkHX_ADMMtpogfnh78VyU5fU4`"
            class="max-w-full max-h-full object-contain shadow-2xl"
            @click.stop
          />
          <button @click="closeLightbox" class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
            <X :size="32" />
          </button>
          
          <!-- Lightbox Nav -->
          <button @click.stop="prevPhoto" v-if="basePlace.photos.length > 1"
                  class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
            <ChevronLeft :size="32" />
          </button>
          <button @click.stop="nextPhoto" v-if="basePlace.photos.length > 1"
                  class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
            <ChevronRight :size="32" />
          </button>
        </div>
      </div>
    </Teleport>

  </div>
  
  <!-- 404 STATE -->
  <div v-else class="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900">
    <AlertTriangle :size="64" class="text-slate-400 mb-4" />
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tempat tidak ditemukan</h2>
    <button @click="router.back()" class="px-6 py-2 bg-primary-500 text-white rounded-lg font-bold">Kembali</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSavedStore } from '../stores/saved'
import { useAuthStore } from '../stores/auth'
import { analyzePlace, submitPrivateReview, fetchPlaceDetails, API_BASE_URL } from '../utils/api'
import { ArrowLeft, Heart, Star, Sparkles, BarChart2, CircleParking as ParkingCircle, AlertTriangle, User, Map, Navigation, Car, MessageSquareWarning, X, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight, Camera, Lock, FileText } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const savedStore = useSavedStore()
const authStore = useAuthStore()

const placeId = route.params.id
const displayName = ref(route.query.n || 'Memuat tempat...')
const basePlace = ref(null)
const userLocation = ref({ lat: -5.147, lng: 119.432 })

const isMart = computed(() => {
  if (!basePlace.value) return false;
  const name = (basePlace.value.name || '').toLowerCase();
  return name.includes('indomaret') || name.includes('alfamart') || name.includes('alfamidi');
});

const isAlfa = computed(() => {
  if (!basePlace.value) return false;
  const name = (basePlace.value.name || '').toLowerCase();
  return name.includes('alfamart') || name.includes('alfamidi');
});

// 🛡️ UI-layer safety net: strip generic/real-sounding reporter labels
const BLOCKED_REPORTER_TERMS = ['google', 'pengguna', 'driver', 'ojek', 'pengunjung', 'pelanggan', 'customer', 'anonim', 'user', 'pembeli', 'konsumen', 'visitor', 'member', 'review']
function sanitizeReporterName(name) {
  if (!name || name.trim().length === 0) return 'Pengguna'
  const lower = name.toLowerCase()
  const isGeneric = BLOCKED_REPORTER_TERMS.some(term => lower.includes(term))
  return isGeneric ? 'Pengguna' : name
}

const aiData = ref(null)
const visibleCount = ref(4)

const visibleUpdates = computed(() => {
  if (!aiData.value?.community_updates) return []
  return aiData.value.community_updates.slice(0, visibleCount.value)
})

const loadMoreUpdates = () => {
  visibleCount.value += 4
}

const displayTags = computed(() => {
  if (!aiData.value || !aiData.value.tags) return []
  const result = []
  const seenTexts = new Set()
  
  aiData.value.tags.forEach((tag, idx) => {
    let text = tag.trim()
    const color = (aiData.value.tag_colors && aiData.value.tag_colors[idx]) ? aiData.value.tag_colors[idx] : 'blue'
    
    // Override redundant names for Marts
    if (isMart.value && (text.toLowerCase().includes('indomaret') || text.toLowerCase().includes('alfamart') || text.toLowerCase().includes('alfamidi'))) {
      text = 'Minimarket'
    }
    
    const lowerText = text.toLowerCase()
    if (!seenTexts.has(lowerText)) {
      seenTexts.add(lowerText)
      result.push({ text, color })
    }
  })
  
  // Return max 3 tags
  return result.slice(0, 3)
})

const isLoadingBasic = ref(true)
const isLoading = ref(true)
const hasError = ref(false)
const isAnimating = ref(false)
const retryCount = ref(0)
const loadingMessage = ref('AI sedang menganalisis...')

// GALLERY & LIGHTBOX STATE
const currentPhotoIndex = ref(0)
const galleryRef = ref(null)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
let autoScrollInterval = null

// TOAST STATE
const toastMessage = ref('')
const toastType = ref('success') // 'success' | 'error' | 'warning'

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// AUTO SCROLL LOGIC
function startAutoScroll() {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
  autoScrollInterval = setInterval(() => {
    if (basePlace.value?.photos?.length > 1 && !lightboxOpen.value) {
      nextPhoto()
    }
  }, 4000)
}

function pauseAutoScroll() {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
}

function resumeAutoScroll() {
  if (!lightboxOpen.value) startAutoScroll()
}

function nextPhoto() {
  if (!basePlace.value?.photos?.length) return
  if (currentPhotoIndex.value < basePlace.value.photos.length - 1) {
    currentPhotoIndex.value++
  } else {
    currentPhotoIndex.value = 0
  }
  scrollToPhoto()
}

function prevPhoto() {
  if (!basePlace.value?.photos?.length) return
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  } else {
    currentPhotoIndex.value = basePlace.value.photos.length - 1
  }
  scrollToPhoto()
}

function scrollToPhoto() {
  if (!galleryRef.value) return
  const container = galleryRef.value
  const photoWidth = container.offsetWidth
  container.scrollTo({
    left: currentPhotoIndex.value * photoWidth,
    behavior: 'smooth'
  })
}

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
  pauseAutoScroll()
}

function closeLightbox() {
  lightboxOpen.value = false
  resumeAutoScroll()
}

// COLOR CLASS HELPER
const tailwindColors = {
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  amber: 'bg-amber-500 text-white',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  teal: 'bg-teal-500 text-white',
  indigo: 'bg-indigo-500 text-white'
}

function getColorClass(color) {
  return tailwindColors[color] || 'bg-gray-500 text-white'
}

const isSaved = computed(() => basePlace.value ? savedStore.isSaved(basePlace.value.id) : false)

const fetchBaseDetails = async () => {
  isLoadingBasic.value = true
  try {
    const data = await fetchPlaceDetails(placeId)
    if (data) {
      displayName.value = data.name
      basePlace.value = {
        id: data.place_id,
        name: data.name,
        rating: data.rating,
        photos: data.photos || [],
        lat: data.geometry?.location?.lat,
        lng: data.geometry?.location?.lng
      }
      if (basePlace.value.photos.length > 1) startAutoScroll()
    }
  } catch (error) {
    console.error("Failed to fetch base details:", error)
    showToast('Gagal memuat detail tempat')
  } finally {
    isLoadingBasic.value = false
  }
}

const fetchAIData = async (isRetry = false) => {
  isLoading.value = true
  hasError.value = false
  if (!isRetry) {
    retryCount.value = 0
    loadingMessage.value = 'AI sedang menganalisis...'
  }
  
  try {
    try {
      const { getUserLocation } = await import('../utils/location')
      const coords = await getUserLocation()
      userLocation.value = coords
    } catch (e) {
      console.warn("Using default location for AI")
    }

    const result = await analyzePlace({
      place_id: placeId,
      user_lat: userLocation.value.lat,
      user_lng: userLocation.value.lng
    })
    
    aiData.value = result
    isLoading.value = false
  } catch (error) {
    console.error("Failed to load AI data:", error.message)
    showToast('Gagal menganalisis tempat')
    hasError.value = true
    isLoading.value = false
  }
}

const showReviewModal = ref(false)
const isSubmitting = ref(false)
const reviewError = ref('')
const reviewForm = ref({ rating: 5, text: '' })
const parkingType = ref('belum_ada_info')
const parkingNotes = ref('')

const handleSave = async (place) => {
  if (!authStore.isAuthenticated) {
    showToast('Login dulu untuk menyimpan favorit!')
    return
  }

  isAnimating.value = true
  try {
    const result = await savedStore.toggleSave(place, authStore.user.uid)
    if (result.success) {
      const isNowSaved = savedStore.isSaved(place.id)
      showToast(isNowSaved ? 'Tersimpan ke favorit!' : 'Dihapus dari favorit')
    }
  } catch (error) {
    showToast('Gagal menyimpan')
  } finally {
    setTimeout(() => { isAnimating.value = false }, 400)
  }
}

const submitReview = async () => {
  reviewError.value = ''
  if (reviewForm.value.text && reviewForm.value.text.length < 10) {
    reviewError.value = 'Tulis review minimal 10 karakter ya biar AI ngerti konteksnya.'
    return
  }

  isSubmitting.value = true
  try {
    const userId = authStore.isAuthenticated ? authStore.user.uid : 'anon_user'
    const res = await submitPrivateReview(
      placeId.toString(), 
      reviewForm.value.rating, 
      reviewForm.value.text, 
      parkingType.value,
      parkingNotes.value,
      null, // photo
      userId
    )
    showReviewModal.value = false
    showToast(res.message || "Review berhasil dikirim!")
    reviewForm.value.text = ''
    parkingType.value = 'belum_ada_info'
    parkingNotes.value = ''
  } catch (error) {
    reviewError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

const getMapsUrl = (loc) => {
  const lat = loc?.latitude || basePlace.value?.lat
  const lng = loc?.longitude || basePlace.value?.lng
  if (!lat || !lng) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

const getDirectionsUrl = (loc) => {
  const lat = loc?.latitude || basePlace.value?.lat
  const lng = loc?.longitude || basePlace.value?.lng
  if (!lat || !lng) return '#'
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

const getWazeUrl = (loc) => {
  const lat = loc?.latitude || basePlace.value?.lat
  const lng = loc?.longitude || basePlace.value?.lng
  if (!lat || !lng) return '#'
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

onMounted(async () => {
  window.scrollTo(0, 0)
  await fetchBaseDetails()
  fetchAIData()
})

onUnmounted(() => {
  pauseAutoScroll()
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -5px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}

.animate-heart-beat {
  animation: heart-beat 0.4s ease-out;
}
@keyframes heart-beat {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
