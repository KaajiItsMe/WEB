<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20 md:pb-8">
    <!-- Navbar -->
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-slate-900 dark:bg-primary-500 rounded-lg flex items-center justify-center">
            <ShieldCheck :size="18" class="text-white" />
          </div>
          <h1 class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">LokaLens Admin</h1>
        </div>
        <div class="flex items-center gap-4">
          <button @click="router.push('/app/home')" class="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Exit Admin</button>
        </div>
      </div>
      
      <!-- TABS BAR -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-700/50">
        <div class="flex overflow-x-auto hide-scrollbar gap-6 py-3">
          <button v-for="tab in tabs" :key="tab.id" 
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-1 pb-1 border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === tab.id 
              ? 'border-emerald-500 text-emerald-600 font-bold' 
              : 'border-transparent text-slate-500 font-medium hover:text-slate-700 dark:hover:text-slate-300'">
            <component :is="tab.icon" :size="18" />
            {{ tab.label }}
            <span v-if="getTabBadge(tab.id) > 0" 
              class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              :class="tab.id === 'pending' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">
              {{ getTabBadge(tab.id) }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" :key="activeTab">
      
      <!-- TAB: DASHBOARD -->
      <div v-if="activeTab === 'dashboard'" class="space-y-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="stat in statsCards" :key="stat.label" class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{{ stat.label }}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black" :class="stat.color">{{ stat.value }}</span>
              <span v-if="stat.subValue" class="text-[10px] text-emerald-500 font-bold">{{ stat.subValue }}</span>
            </div>
          </div>
        </div>

        <!-- RECENT ACTIVITY MOCK / PLACEHOLDER -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <History :size="20" class="text-primary-500" /> Ringkasan Aktivitas
          </h3>
          <div class="space-y-4">
            <div v-if="isLoading" class="flex justify-center p-8"><RefreshCw class="animate-spin text-slate-400" /></div>
            <p v-else class="text-slate-500 text-sm italic text-center py-8">Dashboard statistik utama. Pindah tab untuk aksi moderasi.</p>
          </div>
        </div>
      </div>

      <!-- TAB: PENDING -->
      <div v-if="activeTab === 'pending'" class="space-y-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-black text-2xl">Antrean Moderasi</h2>
          <button @click="fetchData" class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50">
            <RefreshCw :size="18" :class="{'animate-spin': isLoading}" />
          </button>
        </div>
        <div v-if="queue.length === 0" class="bg-white dark:bg-slate-800 p-16 rounded-2xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <CheckCircle2 :size="64" class="mx-auto text-emerald-400 mb-4 opacity-50" />
          <h3 class="text-xl font-bold">Semua Bersih!</h3>
          <p class="text-slate-500 max-w-xs mx-auto text-sm mt-2">Belum ada review baru yang masuk untuk dimoderasi.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-4">
          <div v-for="item in queue" :key="item.id" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-black text-slate-600 dark:text-slate-400">ID: {{ item.id.slice(-6) }}</span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ formatTime(item.created_at) }}</span>
                </div>
                <h4 class="font-bold text-slate-900 dark:text-white mb-1">Tempat #{{ item.place_id }}</h4>
                <div class="flex items-center gap-1 text-sm font-bold text-amber-500 mb-3"><Star :size="14" class="fill-amber-500" /> {{ item.rating }}</div>
                <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">"{{ item.review_text }}"</p>
              </div>
              <div class="flex md:flex-col gap-2 shrink-0">
                <button @click="openDetail(item)" class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Eye :size="14" /> Detail
                </button>
                <button @click="openReject(item)" class="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/50">
                  <XCircle :size="14" /> Tolak
                </button>
                <button @click="handleApprove(item.id)" :disabled="processingId === item.id" class="flex-1 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  <RefreshCw v-if="processingId === item.id" :size="14" class="animate-spin" />
                  <CheckCircle v-else :size="14" /> Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: APPROVED -->
      <div v-if="activeTab === 'approved'" class="space-y-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="font-black text-2xl">Review Disetujui</h2>
          <div class="flex gap-2">
             <input type="date" v-model="filterDate" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500" />
             <button @click="fetchApproved" class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50">
                <RefreshCw :size="18" :class="{'animate-spin': isFetchingApproved}" />
             </button>
          </div>
        </div>
        <div v-if="approvedReviews.length === 0" class="text-center py-20 opacity-50">Belum ada review yang disetujui.</div>
        <div v-else class="grid grid-cols-1 gap-4">
          <div v-for="item in filteredApproved" :key="item.id" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-bold text-emerald-600 dark:text-emerald-400">Tempat #{{ item.place_id }}</h4>
                <div class="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-1">
                  <Calendar :size="10" /> {{ formatTime(item.approved_at || item.updated_at) }}
                </div>
              </div>
              <div class="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                 <Check :size="12" /> APPROVED
              </div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-300" :class="{'line-clamp-2': !item.expanded}">"{{ item.review_text }}"</p>
            <button v-if="item.review_text.length > 150" @click="item.expanded = !item.expanded" class="text-[10px] font-bold text-primary-500 mt-2 uppercase">{{ item.expanded ? 'Ciutkan' : 'Baca Selengkapnya' }}</button>
          </div>
        </div>
      </div>

      <!-- TAB: REJECTED -->
      <div v-if="activeTab === 'rejected'" class="space-y-4">
        <h2 class="font-black text-2xl mb-4">Review Ditolak</h2>
        <div v-if="rejectedReviews.length === 0" class="text-center py-20 opacity-50">Tidak ada review yang ditolak.</div>
        <div v-else class="grid grid-cols-1 gap-4">
          <div v-for="item in rejectedReviews" :key="item.id" class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div class="flex flex-col md:flex-row justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-bold text-red-600 dark:text-red-400">Tempat #{{ item.place_id }}</h4>
                  <span class="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-[10px] font-black text-red-600 rounded">REJECTED</span>
                </div>
                <div class="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg">
                   <p class="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Alasan Penolakan:</p>
                   <p class="text-xs text-red-600 dark:text-red-400 font-medium">{{ item.rejection_reason }}</p>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 italic">"{{ item.review_text }}"</p>
              </div>
              <div class="flex gap-2 shrink-0 h-fit">
                <button @click="handleRestore(item.id)" class="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-200 transition-colors border border-amber-200">
                  Pulihkan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: PERMANENT DELETE -->
      <div v-if="activeTab === 'permanent_delete'" class="space-y-4">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl mb-6">
          <div class="flex gap-3 items-center">
            <AlertTriangle class="text-red-600" :size="32" />
            <div>
              <p class="font-black text-red-800 dark:text-red-400">Area Berbahaya</p>
              <p class="text-xs text-red-700 dark:text-red-500">Review yang sudah dihapus permanen tidak bisa dikembalikan. Gunakan hanya untuk spam/konten terlarang.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center px-2">
          <div class="flex items-center gap-3">
             <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer" />
             <span class="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Pilih Semua</span>
          </div>
          <button v-if="selectedIds.length > 0" @click="showConfirmDelete = true" class="px-6 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center gap-2">
            <Trash2 :size="16" /> Hapus Permanen ({{ selectedIds.length }})
          </button>
        </div>

        <div v-if="rejectedReviews.length === 0" class="text-center py-20 opacity-50 italic">Kosong. Reject review dulu untuk melihat daftar di sini.</div>
        <div v-else class="grid grid-cols-1 gap-3">
          <div v-for="item in rejectedReviews" :key="item.id" 
            @click="toggleSelect(item.id)"
            class="bg-white dark:bg-slate-800 p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4"
            :class="selectedIds.includes(item.id) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : 'border-slate-200 dark:border-slate-700 hover:border-red-300'">
            <input type="checkbox" :checked="selectedIds.includes(item.id)" @click.stop class="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <div class="flex-1">
              <div class="flex justify-between">
                <span class="text-[10px] font-black text-slate-400">{{ item.id }}</span>
                <span class="text-[10px] font-bold text-red-500">{{ item.rejection_reason }}</span>
              </div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">"{{ item.review_text }}"</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- REJECT MODAL -->
    <div v-if="rejectModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-700">
        <h3 class="font-black text-2xl mb-2 text-red-600 flex items-center gap-3"><XCircle :size="28"/> Tolak Review</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">Kenapa review ini tidak layak diteruskan ke AI?</p>
        
        <div class="space-y-3 mb-6">
           <button v-for="opt in rejectionOptions" :key="opt" 
             @click="rejectModal.reason = opt"
             class="w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between"
             :class="rejectModal.reason === opt ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-100 dark:border-slate-700 hover:border-red-200'">
             {{ opt }}
             <CheckCircle2 v-if="rejectModal.reason === opt" :size="18" />
           </button>
        </div>
        
        <textarea v-if="rejectModal.reason === 'Alasan lainnya...'" v-model="rejectModal.customReason" placeholder="Ketik alasan spesifik..." rows="3" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm mb-6 outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"></textarea>

        <div class="grid grid-cols-2 gap-3">
          <button @click="rejectModal.show = false" class="py-4 text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">Batal</button>
          <button @click="submitReject" :disabled="processingId !== null" class="py-4 text-sm font-black bg-red-500 text-white rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            <RefreshCw v-if="processingId !== null" :size="18" class="animate-spin" /> Tolak Review
          </button>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div v-if="detailModal.show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-0 shadow-2xl animate-fade-in overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
          <h3 class="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2"><Eye :size="24" class="text-primary-500"/> Detail Review</h3>
          <button @click="detailModal.show = false" class="p-2 text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-700 rounded-full"><X :size="20"/></button>
        </div>
        <div class="p-8">
          <div class="grid grid-cols-2 gap-6 mb-8">
            <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Place ID</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ detailModal.item.place_id }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User ID</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ detailModal.item.user_id }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
              <div class="flex items-center gap-1 text-sm font-black text-amber-500"><Star :size="16" class="fill-amber-500"/> {{ detailModal.item.rating }}</div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">{{ new Date(detailModal.item.created_at).toLocaleDateString('id-ID') }}</p>
            </div>
          </div>
          <div class="mb-8 bg-slate-900 text-emerald-50 p-6 rounded-3xl border-2 border-emerald-500/20 shadow-inner">
            <div class="flex items-center gap-2 mb-3 text-emerald-400">
               <Quote :size="20" />
               <span class="text-[10px] font-black uppercase tracking-widest">Review Content</span>
            </div>
            <p class="text-base leading-relaxed font-medium italic">"{{ detailModal.item.review_text }}"</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button @click="handleApprove(detailModal.item.id); detailModal.show = false" class="py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2">
              <CheckCircle :size="20"/> Setujui
            </button>
            <button @click="openReject(detailModal.item); detailModal.show = false" class="py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all border border-red-200 active:scale-95 flex items-center justify-center gap-2">
              <XCircle :size="20"/> Tolak
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PERMANENT DELETE CONFIRM MODAL -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center border-4 border-red-500 animate-pulse-once">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 :size="40" />
        </div>
        <h3 class="font-black text-2xl mb-4 text-red-600">Hapus Permanen?</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Kamu akan menghapus <span class="font-black text-red-600">{{ selectedIds.length }} review</span> secara permanen dari database.
          <br><br>
          <span class="font-bold uppercase text-xs tracking-widest text-red-500">Tindakan ini TIDAK DAPAT DIBATALKAN!</span>
        </p>
        <div class="grid grid-cols-2 gap-3">
           <button @click="showConfirmDelete = false" class="py-4 text-sm font-black text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-2xl hover:bg-slate-200">Batal</button>
           <button @click="handlePermanentDelete" :disabled="isDeleting" class="py-4 text-sm font-black bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/40 flex items-center justify-center gap-2 disabled:opacity-50">
             <RefreshCw v-if="isDeleting" :size="18" class="animate-spin" /> Yakin, Hapus!
           </button>
        </div>
      </div>
    </div>

    <!-- GLOBAL TOAST -->
    <div class="fixed bottom-6 right-6 z-[100] transition-all duration-500 pointer-events-none" :class="toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90'">
      <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-sm font-black border border-slate-700 dark:border-slate-100">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">
          <CheckCircle v-if="toast.type === 'success'" :size="20" />
          <AlertTriangle v-else :size="20" />
        </div>
        {{ toast.message }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  getAdminDashboard, 
  getModerationQueue, 
  getApprovedReviews, 
  getRejectedReviews, 
  approveReview, 
  rejectReview, 
  restoreReview, 
  deletePermanentReviews 
} from '../utils/api'
import { 
  ShieldCheck, AlertCircle, ListChecks, CheckCircle, RefreshCw, Star, XCircle, 
  Eye, X, LayoutDashboard, History, CheckCircle2, Calendar, Check, 
  Trash2, AlertTriangle, Quote, Clock 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// TABS SYSTEM
const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'permanent_delete', label: 'Hapus Permanen', icon: Trash2 },
]

// STATE
const isLoading = ref(true)
const dashboard = ref({ total_reviews: 0, pending: 0, approved: 0, rejected: 0, today_added: 0 })
const queue = ref([])
const approvedReviews = ref([])
const rejectedReviews = ref([])
const processingId = ref(null)
const isFetchingApproved = ref(false)
const filterDate = ref('')

// SELECTION SYSTEM (Permanent Delete)
const selectedIds = ref([])
const isDeleting = ref(false)
const showConfirmDelete = ref(false)

const isAllSelected = computed(() => 
  rejectedReviews.value.length > 0 && selectedIds.value.length === rejectedReviews.value.length
)

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) selectedIds.value = []
  else selectedIds.value = rejectedReviews.value.map(r => r.id)
}

// TOAST SYSTEM
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// MODALS
const rejectionOptions = ['Bahasa kasar / tidak sopan', 'Spam / promosi', 'Teks tidak relevan / sampah', 'Alasan lainnya...']
const rejectModal = ref({ show: false, id: null, reason: 'Bahasa kasar / tidak sopan', customReason: '' })
const detailModal = ref({ show: false, item: null })

// DATA FETCHING
const fetchData = async () => {
  isLoading.value = true
  try {
    const token = authStore.user?.token || ''
    const [dashRes, queueRes] = await Promise.all([
      getAdminDashboard(token),
      getModerationQueue(token)
    ])
    dashboard.value = dashRes
    queue.value = queueRes
  } catch (error) {
    console.error(error)
    showToast('Gagal memuat data admin', 'error')
  } finally {
    isLoading.value = false
  }
}

const fetchApproved = async () => {
  isFetchingApproved.value = true
  try {
    const token = authStore.user?.token || ''
    const res = await getApprovedReviews(token)
    approvedReviews.value = res.map(r => ({ ...r, expanded: false }))
  } catch (e) { showToast(e.message, 'error') }
  finally { isFetchingApproved.value = false }
}

const fetchRejected = async () => {
  try {
    const token = authStore.user?.token || ''
    const res = await getRejectedReviews(token)
    rejectedReviews.value = res.map(r => ({ ...r, expanded: false }))
  } catch (e) { showToast(e.message, 'error') }
}

// Watch active tab to fetch specific data
watch(activeTab, (tab) => {
  if (tab === 'dashboard' || tab === 'pending') fetchData()
  if (tab === 'approved') fetchApproved()
  if (tab === 'rejected' || tab === 'permanent_delete') fetchRejected()
})

// ACTIONS
const handleApprove = async (id) => {
  processingId.value = id
  try {
    const token = authStore.user?.token || ''
    await approveReview(id, token)
    showToast('Review disetujui!', 'success')
    queue.value = queue.value.filter(item => item.id !== id)
    dashboard.value.pending -= 1
    dashboard.value.approved += 1
  } catch (error) { showToast(error.message, 'error') }
  finally { processingId.value = null }
}

const openReject = (item) => {
  rejectModal.value = { show: true, id: item.id, reason: rejectionOptions[0], customReason: '' }
}

const submitReject = async () => {
  processingId.value = rejectModal.value.id
  const finalReason = rejectModal.value.reason === 'Alasan lainnya...' ? rejectModal.value.customReason : rejectModal.value.reason
  try {
    const token = authStore.user?.token || ''
    await rejectReview(processingId.value, finalReason, token)
    showToast('Review ditolak.', 'success')
    queue.value = queue.value.filter(item => item.id !== processingId.value)
    dashboard.value.pending -= 1
    dashboard.value.rejected += 1
    rejectModal.value.show = false
  } catch (error) { showToast(error.message, 'error') }
  finally { processingId.value = null }
}

const handleRestore = async (id) => {
  try {
    const token = authStore.user?.token || ''
    await restoreReview(id, token)
    showToast('Review dikembalikan ke pending.', 'success')
    rejectedReviews.value = rejectedReviews.value.filter(r => r.id !== id)
    dashboard.value.rejected -= 1
    dashboard.value.pending += 1
  } catch (e) { showToast(e.message, 'error') }
}

const handlePermanentDelete = async () => {
  if (selectedIds.value.length === 0) return
  isDeleting.value = true
  try {
    const token = authStore.user?.token || ''
    await deletePermanentReviews(selectedIds.value, token)
    showToast(`${selectedIds.value.length} review dihapus permanen`, 'success')
    rejectedReviews.value = rejectedReviews.value.filter(r => !selectedIds.value.includes(r.id))
    selectedIds.value = []
    showConfirmDelete.value = false
    fetchData() // Refresh counts
  } catch (e) { showToast(e.message, 'error') }
  finally { isDeleting.value = false }
}

// HELPERS
const openDetail = (item) => { detailModal.value = { show: true, item } }
const formatTime = (iso) => iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'
const getTabBadge = (id) => {
  if (id === 'pending') return dashboard.value.pending
  if (id === 'rejected' || id === 'permanent_delete') return rejectedReviews.value.length
  return 0
}

const filteredApproved = computed(() => {
  if (!filterDate.value) return approvedReviews.value
  return approvedReviews.value.filter(r => {
    const date = (r.approved_at || r.updated_at).split('T')[0]
    return date === filterDate.value
  })
})

const statsCards = computed(() => [
  { label: 'Total Review', value: dashboard.value.total_reviews, subValue: `+${dashboard.value.today_added} today`, color: 'text-slate-900 dark:text-white' },
  { label: 'Pending', value: dashboard.value.pending, color: 'text-red-500' },
  { label: 'Approved', value: dashboard.value.approved, color: 'text-emerald-500' },
  { label: 'Rejected', value: dashboard.value.rejected, color: 'text-slate-500' },
])

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-pulse-once { animation: pulse 1.5s ease-out; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
</style>
