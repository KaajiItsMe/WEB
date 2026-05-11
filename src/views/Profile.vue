<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark pb-28 pt-4 md:pt-8 md:pb-8">
    <div class="max-w-2xl mx-auto px-4 md:px-8">
      
      <!-- HEADER / USER INFO -->
      <div v-if="authStore.isAuthenticated" class="flex flex-col md:flex-row items-center md:items-start gap-4 mb-8">
        <div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative">
          <img v-if="authStore.user.photoURL" :src="authStore.user.photoURL" alt="Profile" class="w-full h-full object-cover" />
          <span v-else class="text-3xl font-extrabold text-slate-500">{{ authStore.user.displayName?.charAt(0) || 'U' }}</span>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            {{ authStore.user.displayName }}
            <span v-if="authStore.isAdmin" class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield :size="12" /> Admin
            </span>
            <span v-else class="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck :size="12" /> Verified
            </span>
          </h1>
          <p v-if="!authStore.isAdmin" class="text-primary-500 font-medium text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
            <Star :size="14" class="fill-primary-500" /> Level {{ userLevel }} Contributor
          </p>
          <p v-else class="text-purple-500 font-medium text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
            <Shield :size="14" class="fill-purple-500 text-purple-500" /> System Administrator
          </p>
          <div class="flex items-center justify-center md:justify-start gap-3 mt-3">
            <button @click="authStore.logout()" class="text-xs font-bold px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors">Log out</button>
            <router-link v-if="authStore.isAdmin" to="/admin" class="text-xs font-bold px-4 py-1.5 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 rounded-lg text-white transition-all shadow-md flex items-center gap-1">
              <Settings :size="14" /> Admin Panel
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-8 mb-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <UserIcon :size="32" class="text-slate-400" />
        </div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Belum Login</h2>
        <p class="text-sm text-slate-500 text-center mb-6 px-4">Login untuk menyimpan history review private dan mulai mengumpulkan badge kontributor LokaLens.</p>
        <button @click="authStore.loginWithGoogle()" :disabled="authStore.loading" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
          {{ authStore.loading ? 'Menghubungkan...' : 'Login with Google' }}
        </button>
      </div>

      <!-- BADGE COLLECTION -->
      <section class="mb-8 relative" v-if="authStore.isAuthenticated">
        <div class="flex justify-between items-end mb-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            🏆 Koleksi Badge
          </h2>
          <span class="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">🏆 {{ unlockedBadgesCount }} / 7 Terbuka</span>
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-7 gap-3 relative">
          <div v-for="badge in calculatedBadges" :key="badge.id" 
               class="flex flex-col items-center gap-1 group relative cursor-pointer"
               @mouseenter="hoverBadge = badge.id"
               @mouseleave="hoverBadge = null"
               @click.stop="toggleMobileBadge(badge.id)">
               
            <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 relative"
                 :class="badge.unlocked ? [badge.color, badge.justUnlocked ? 'animate-pulse-once' : ''] : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 grayscale opacity-50 border border-slate-300 dark:border-slate-600'">
              <component :is="badge.icon" :size="24" :class="{'opacity-50': !badge.unlocked}" />
              <!-- Status Icon -->
              <div v-if="badge.unlocked" class="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full">
                <CheckCircle2 :size="14" class="text-green-500 fill-green-500" />
              </div>
              <div v-else class="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full">
                <Lock :size="14" class="text-slate-400" />
              </div>
            </div>
            <span class="text-[10px] text-center font-semibold leading-tight mt-1" :class="badge.unlocked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'">
              {{ badge.name }}
            </span>

            <!-- TOOLTIP (Desktop Hover) -->
            <div v-if="hoverBadge === badge.id" class="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl z-50 pointer-events-none">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-bold">{{ badge.emoji }} {{ badge.name }}</span>
              </div>
              <p class="text-xs text-slate-300 mb-2 leading-tight">{{ badge.desc }}</p>
              
              <div v-if="badge.hasProgress && !badge.unlocked" class="mb-1">
                <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Progress</span>
                  <span>{{ badge.current }} / {{ badge.target }}</span>
                </div>
                <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: Math.min(100, (badge.current / badge.target) * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="text-[10px] font-bold mt-2" :class="badge.unlocked ? 'text-green-400' : 'text-slate-400'">
                {{ badge.unlocked ? '✅ Unlocked' : '🔒 Locked' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MOBILE POPOVER -->
      <transition name="fade">
        <div v-if="activeMobileBadge" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 md:hidden" @click="activeMobileBadge = null">
          <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xs p-5 shadow-2xl relative" @click.stop>
            <button @click="activeMobileBadge = null" class="absolute top-3 right-3 text-slate-400 hover:text-slate-600"><X :size="20"/></button>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="activeMobileBadgeData.unlocked ? activeMobileBadgeData.color : 'bg-slate-100 text-slate-400 grayscale'">
                <component :is="activeMobileBadgeData.icon" :size="24" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ activeMobileBadgeData.emoji }} {{ activeMobileBadgeData.name }}</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded" :class="activeMobileBadgeData.unlocked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                  {{ activeMobileBadgeData.unlocked ? '✅ Unlocked' : '🔒 Locked' }}
                </span>
              </div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">{{ activeMobileBadgeData.desc }}</p>
            
            <div v-if="activeMobileBadgeData.hasProgress && !activeMobileBadgeData.unlocked" class="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <div class="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                <span>Progress</span>
                <span>{{ activeMobileBadgeData.current }} / {{ activeMobileBadgeData.target }}</span>
              </div>
              <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: Math.min(100, (activeMobileBadgeData.current / activeMobileBadgeData.target) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- RIWAYAT REVIEW PRIVATE -->
      <section class="mb-8" v-if="authStore.isAuthenticated">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            🔒 Riwayat Review Private
          </h2>
          <RefreshCw v-if="isLoadingReviews" :size="16" class="animate-spin text-slate-400" />
        </div>
        
        <div v-if="reviews.length === 0 && !isLoadingReviews" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center shadow-sm">
          <p class="text-slate-500">Belum ada review 📝</p>
        </div>
        
        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div v-for="(review, index) in reviews" :key="review.id" 
               class="p-4" :class="{'border-b border-slate-100 dark:border-slate-700': index !== reviews.length - 1}">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ getPlaceName(review.place_id) }}</h4>
              <span class="text-[10px] text-slate-400">{{ new Date(review.created_at).toLocaleDateString('id-ID') }}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <div class="flex gap-0.5">
                <Star v-for="i in 5" :key="i" :size="12" :class="i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'" />
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" 
                    :class="review.status === 'approved' ? 'bg-green-100 text-green-700' : (review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')">
                {{ review.status.toUpperCase() }}
              </span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{{ review.review_text }}"</p>
          </div>
        </div>
      </section>



      <!-- SETTINGS -->
      <section class="mb-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          ⚙️ {{ t('settings.title') }}
        </h2>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

          <!-- Dark Mode -->
          <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer" @click="toggleTheme">
            <div class="flex items-center gap-3">
              <Moon :size="20" class="text-slate-500" />
              <div>
                <p class="font-semibold text-sm text-slate-900 dark:text-white">{{ t('settings.dark_mode') }}</p>
                <p class="text-xs text-slate-500">{{ t('settings.dark_mode_desc') }}</p>
              </div>
            </div>
            <button class="w-12 h-6 rounded-full relative transition-all duration-300" :class="isDark ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'">
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300" :class="isDark ? 'translate-x-6' : 'translate-x-0'"></div>
            </button>
          </div>

          <!-- Language -->
          <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer" @click="toggleLanguage">
            <div class="flex items-center gap-3">
              <Globe :size="20" class="text-slate-500" />
              <div>
                <p class="font-semibold text-sm text-slate-900 dark:text-white">{{ t('settings.language') }}</p>
                <p class="text-xs text-slate-500">{{ locale === 'id' ? 'Indonesia 🇮🇩' : 'English 🇬🇧' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">{{ locale === 'id' ? 'ID' : 'EN' }}</span>
            </div>
          </div>

          <!-- Notifications -->
          <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer" @click="toggleNotification">
            <div class="flex items-center gap-3">
              <Bell :size="20" class="text-slate-500" />
              <div>
                <p class="font-semibold text-sm text-slate-900 dark:text-white">{{ t('settings.notification') }}</p>
                <p class="text-xs text-slate-500">{{ t('settings.notification_desc') }}</p>
              </div>
            </div>
            <button class="w-12 h-6 rounded-full relative transition-all duration-300" :class="notifEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'">
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300" :class="notifEnabled ? 'translate-x-6' : 'translate-x-0'"></div>
            </button>
          </div>

          <!-- Location -->
          <div class="flex items-center justify-between p-4 cursor-pointer" @click="toggleLocation">
            <div class="flex items-center gap-3">
              <MapPinIcon :size="20" class="text-slate-500" />
              <div>
                <p class="font-semibold text-sm text-slate-900 dark:text-white">{{ t('settings.location') }}</p>
                <p class="text-xs text-slate-500">{{ t('settings.location_desc') }}</p>
              </div>
            </div>
            <button class="w-12 h-6 rounded-full relative transition-all duration-300" :class="locationEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'">
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300" :class="locationEnabled ? 'translate-x-6' : 'translate-x-0'"></div>
            </button>
          </div>

        </div>
      </section>

      <!-- GDPR / DELETE DATA -->
      <section class="mt-12" v-if="authStore.isAuthenticated">
        <button @click="showDeleteModal = true" class="w-full py-4 border border-red-200 dark:border-red-900/30 text-red-500 dark:text-red-400 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
          <Trash2 :size="18" /> {{ t('delete.button') }}
        </button>
        <p class="text-center text-[10px] text-slate-400 mt-3">Sesuai dengan kebijakan privasi dan GDPR, Anda berhak menghapus semua data jejak review secara permanen kapan saja.</p>
      </section>

    </div>
  </div>

  <!-- ====== TOAST NOTIFICATION ====== -->
  <transition name="toast-slide">
    <div v-if="toast.show"
         class="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold max-w-xs w-full"
         :class="toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'">
      <span class="text-lg">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <span>{{ toast.message }}</span>
    </div>
  </transition>

  <!-- ====== DELETE MODAL STEP 1 ====== -->
  <transition name="fade">
    <div v-if="showDeleteModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70" @click.self="showDeleteModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
            <Trash2 :size="24" class="text-red-500" />
          </div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ t('delete.confirm_title') }}</h3>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ t('delete.confirm_msg') }}</p>
        <p class="text-xs font-bold text-red-500 mb-6 flex items-center gap-1"><AlertTriangle :size="14"/> {{ t('delete.warning') }}</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{{ t('delete.cancel') }}</button>
          <button @click="showDeleteModal = false; showDeleteModal2 = true" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">{{ t('delete.confirm') }}</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ====== DELETE MODAL STEP 2 (FINAL) ====== -->
  <transition name="fade">
    <div v-if="showDeleteModal2" class="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border-2 border-red-500">
        <div class="text-center mb-5">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">{{ t('delete.confirm_2_title') }}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">{{ t('delete.confirm_2_msg') }}</p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-5 text-center">
          <p class="text-red-600 dark:text-red-400 text-xs font-bold">{{ t('delete.warning') }}</p>
        </div>
        <div class="flex flex-col gap-3">
          <button @click="showDeleteModal2 = false" class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{{ t('delete.cancel') }}</button>
          <button @click="confirmDeleteData" :disabled="isDeletingData" class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <RefreshCw v-if="isDeletingData" :size="16" class="animate-spin" />
            {{ isDeletingData ? 'Menghapus...' : t('delete.final_confirm') }}
          </button>
        </div>
      </div>
    </div>
  </transition>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Star, Flame, Camera, MapPin as MapPinIcon, Compass, Shield, Award, ChevronRight, Moon, Globe, ShieldCheck, Trash2, User as UserIcon, RefreshCw, Settings, CheckCircle2, Lock, X, Bell, AlertTriangle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useSavedStore } from '../stores/saved'
import { useSettingsStore } from '../stores/settings'
import { getUserReviews, getUserStats, deleteUserData } from '../utils/api'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const savedStore = useSavedStore()
const settingsStore = useSettingsStore()

// ====== TOAST SYSTEM ======
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ====== STATE ======
// Computed from store so they stay in sync across navigations
const isDark = computed(() => settingsStore.theme === 'dark')
const notifEnabled = computed(() => settingsStore.notificationEnabled)
const locationEnabled = computed(() => settingsStore.locationEnabled)
const reviews = ref([])
const stats = ref({ total_reviews: 0, total_photos: 0, hidden_gems_found: 0, verified: false })
const isLoadingReviews = ref(false)
const showDeleteModal = ref(false)
const showDeleteModal2 = ref(false)
const isDeletingData = ref(false)
const hoverBadge = ref(null)
const activeMobileBadge = ref(null)

const activeMobileBadgeData = computed(() =>
  calculatedBadges.value.find(b => b.id === activeMobileBadge.value) || null
)
const toggleMobileBadge = (id) => { activeMobileBadge.value = id }

// ====== THEME ======
const toggleTheme = () => {
  settingsStore.toggleTheme()
  showToast(settingsStore.theme === 'dark' ? t('toast.dark_on') : t('toast.dark_off'))
}

// ====== LANGUAGE ======
const toggleLanguage = () => {
  const newLang = locale.value === 'id' ? 'en' : 'id'
  settingsStore.setLanguage(newLang)
  // locale is synced via App.vue watcher — toast after store updates
  showToast(newLang === 'id' ? 'Bahasa diubah ke Indonesia 🇮🇩' : 'Language changed to English 🇬🇧')
}

// ====== NOTIFICATIONS ======
const toggleNotification = async () => {
  if (!('Notification' in window)) {
    showToast('Browser tidak mendukung notifikasi', 'error'); return
  }
  if (settingsStore.notificationEnabled) {
    settingsStore.disableNotification()
    showToast(t('toast.notif_off'))
    return
  }
  if (Notification.permission === 'denied') {
    showToast(t('toast.notif_blocked'), 'error'); return
  }
  const result = await settingsStore.requestNotification()
  if (result.success) {
    showToast(t('toast.notif_on'))
  } else {
    showToast(t('toast.notif_blocked'), 'error')
  }
}

// ====== LOCATION ======
const toggleLocation = async () => {
  if (settingsStore.locationEnabled) {
    settingsStore.disableLocation()
    showToast(t('toast.location_off'))
    return
  }
  if (!navigator.geolocation) {
    showToast('Browser tidak mendukung geolokasi', 'error'); return
  }
  const result = await settingsStore.requestLocation()
  if (result.success) {
    showToast(t('toast.location_on'))
  } else {
    showToast(t('toast.location_blocked'), 'error')
  }
}

// ====== DELETE DATA ======
const confirmDeleteData = async () => {
  isDeletingData.value = true
  try {
    await deleteUserData(authStore.user.token)
    // Clear all local storage
    localStorage.clear()
    showToast(t('toast.data_deleted'))
    showDeleteModal2.value = false
    await authStore.logout()
    setTimeout(() => router.push('/'), 800)
  } catch (err) {
    showToast('Gagal menghapus data: ' + err.message, 'error')
  } finally {
    isDeletingData.value = false
  }
}

// ====== DATA FETCHING ======
const getPlaceName = (id) => {
  const place = dummyPlaces.find(p => p.id === parseInt(id))
  return place ? place.name : `Place #${id}`
}

const fetchReviewsAndStats = async () => {
  if (!authStore.isAuthenticated) return
  isLoadingReviews.value = true
  try {
    const [revData, statData] = await Promise.all([
      getUserReviews(authStore.user.uid, authStore.user.token),
      getUserStats(authStore.user.uid)
    ])
    reviews.value = revData
    stats.value = statData
  } catch (error) {
    console.error('Failed to fetch user data', error)
  } finally {
    isLoadingReviews.value = false
  }
}

watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) fetchReviewsAndStats()
  else {
    reviews.value = []
    stats.value = { total_reviews: 0, total_photos: 0, hidden_gems_found: 0, verified: false }
  }
})

onMounted(() => {
  // settingsStore already initialized in App.vue — just fetch user data
  if (authStore.isAuthenticated) fetchReviewsAndStats()
})

// ====== BADGE LOGIC ======
const calculatedBadges = computed(() => {
  const { total_reviews, total_photos, hidden_gems_found, verified } = stats.value
  return [
    { id: 1, emoji: '🆕', name: 'Newcomer', desc: 'Tulis review pertamamu!', icon: Star, unlocked: total_reviews >= 1, color: 'bg-yellow-100 text-yellow-600', hasProgress: true, current: total_reviews, target: 1, justUnlocked: total_reviews === 1 },
    { id: 2, emoji: '✍️', name: 'Reviewer', desc: 'Tulis 5 review untuk unlock badge ini', icon: Flame, unlocked: total_reviews >= 5, color: 'bg-orange-100 text-orange-600', hasProgress: true, current: total_reviews, target: 5, justUnlocked: total_reviews === 5 },
    { id: 3, emoji: '📸', name: 'Photographer', desc: 'Upload 5 foto di review', icon: Compass, unlocked: total_photos >= 5, color: 'bg-blue-100 text-blue-600', hasProgress: true, current: total_photos, target: 5, justUnlocked: total_photos === 5 },
    { id: 4, emoji: '💎', name: 'Gem Hunter', desc: 'Temukan 3 hidden gem', icon: MapPinIcon, unlocked: hidden_gems_found >= 3, color: 'bg-emerald-100 text-emerald-600', hasProgress: true, current: hidden_gems_found, target: 3, justUnlocked: hidden_gems_found === 3 },
    { id: 5, emoji: '🔥', name: 'Trend Setter', desc: 'Review-mu jadi trending (Akan Datang)', icon: Award, unlocked: false, color: 'bg-purple-100 text-purple-600', hasProgress: false, current: 0, target: 1, justUnlocked: false },
    { id: 6, emoji: '👑', name: 'Local Guide', desc: 'Tulis 20 review berkualitas', icon: Shield, unlocked: total_reviews >= 20, color: 'bg-indigo-100 text-indigo-600', hasProgress: true, current: total_reviews, target: 20, justUnlocked: total_reviews === 20 },
    { id: 7, emoji: '🎯', name: 'Expert', desc: 'Login Google + 10 review', icon: Award, unlocked: verified && total_reviews >= 10, color: 'bg-red-100 text-red-600', hasProgress: true, current: verified ? total_reviews : 0, target: 10, justUnlocked: verified && total_reviews === 10 }
  ]
})

const unlockedBadgesCount = computed(() => calculatedBadges.value.filter(b => b.unlocked).length)
const userLevel = computed(() => {
  const n = unlockedBadgesCount.value
  if (n >= 7) return 5; if (n >= 5) return 4; if (n >= 3) return 3; if (n >= 1) return 2; return 1
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translate(-50%, -16px); }

@keyframes pulseOnce {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(16,185,129,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
.animate-pulse-once { animation: pulseOnce 1s ease-out; }
</style>

