<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
    
    <!-- TOP BAR (Mobile Only) -->
    <header class="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-slate-900 dark:bg-primary-500 rounded-lg flex items-center justify-center">
          <ShieldCheck :size="18" class="text-white" />
        </div>
        <h1 class="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Admin Panel</h1>
      </div>
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90"
      >
        <span :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''" class="w-5 h-0.5 bg-slate-600 dark:bg-slate-400 transition-all duration-300 origin-center"></span>
        <span :class="mobileMenuOpen ? 'opacity-0 scale-0' : ''" class="w-5 h-0.5 bg-slate-600 dark:bg-slate-400 transition-all duration-300"></span>
        <span :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''" class="w-5 h-0.5 bg-slate-600 dark:bg-slate-400 transition-all duration-300 origin-center"></span>
      </button>
    </header>

    <!-- MOBILE SIDEBAR OVERLAY -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 lg:hidden">
        <div @click="mobileMenuOpen = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
        <div class="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-2xl p-6 flex flex-col border-r border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-10 px-2">
             <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
               <ShieldCheck :size="22" class="text-white" />
             </div>
             <h1 class="font-black text-xl text-slate-900 dark:text-white">LokaLens</h1>
          </div>

          <nav class="flex-1 space-y-1">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id; mobileMenuOpen = false"
              :class="activeTab === tab.id 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all group"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                :class="activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-800/30' : 'bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800'">
                <component :is="tab.icon" :size="18" />
              </div>
              <span class="flex-1 text-left">{{ tab.label }}</span>
              <span v-if="getTabBadge(tab.id) > 0" 
                class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">
                {{ getTabBadge(tab.id) }}
              </span>
            </button>
          </nav>

          <div class="pt-6 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <button @click="router.push('/app/home')" class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">
              <LogOut :size="18" /> Exit Admin
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="flex">
      <!-- DESKTOP SIDEBAR -->
      <aside class="hidden lg:flex flex-col w-72 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 sticky top-0 overflow-y-auto">
        <div class="flex items-center gap-3 mb-10 px-2">
           <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
             <ShieldCheck :size="22" class="text-white" />
           </div>
           <div>
             <h1 class="font-black text-xl leading-none text-slate-900 dark:text-white">LokaLens</h1>
             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Dashboard</p>
           </div>
        </div>

        <nav class="flex-1 space-y-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="activeTab === tab.id 
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
            class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all group"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              :class="activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-800/30' : 'bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800'">
              <component :is="tab.icon" :size="18" />
            </div>
            <span class="flex-1 text-left">{{ tab.label }}</span>
            <span v-if="getTabBadge(tab.id) > 0" 
              class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">
              {{ getTabBadge(tab.id) }}
            </span>
          </button>
        </nav>

        <div class="pt-6 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <button @click="router.push('/app/home')" class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">
            <LogOut :size="18" /> Exit Admin
          </button>
        </div>
      </aside>

      <!-- CONTENT AREA -->
      <main class="flex-1 min-h-screen overflow-x-hidden">
        <div class="max-w-6xl mx-auto p-4 md:p-8 lg:p-10 animate-fade-in" :key="activeTab">
          
          <!-- TAB: DASHBOARD -->
          <div v-if="activeTab === 'dashboard'" class="space-y-10">
            <div class="flex items-end justify-between">
              <div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white">Dashboard</h2>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Ringkasan statistik sistem hari ini.</p>
              </div>
              <button @click="fetchData" class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
                <RefreshCw :size="20" :class="{'animate-spin': isLoading}" class="text-slate-500" />
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div v-for="stat in statsCards" :key="stat.label" class="bg-white dark:bg-slate-800 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div class="flex justify-between items-start mb-4">
                  <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">{{ stat.label }}</p>
                  <div class="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                    <LayoutDashboard :size="14" class="group-hover:text-white" />
                  </div>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-black" :class="stat.color">{{ stat.value }}</span>
                  <span v-if="stat.subValue" class="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{{ stat.subValue }}</span>
                </div>
              </div>
            </div>

            <!-- RECENT ACTIVITY -->
            <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 class="font-black text-xl mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                <History :size="24" class="text-primary-500" /> Aktivitas Terbaru
              </h3>
              <div class="space-y-6">
                <div v-if="isLoading" class="flex justify-center p-12"><RefreshCw class="animate-spin text-slate-400" :size="32" /></div>
                <div v-else class="text-center py-16">
                  <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck :size="32" class="text-slate-300" />
                  </div>
                  <p class="text-slate-400 font-bold italic">Pilih tab di samping untuk melakukan moderasi data.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: PENDING -->
          <div v-if="activeTab === 'pending'" class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white">Antrean Moderasi</h2>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Review baru yang butuh persetujuan admin.</p>
              </div>
              <button @click="fetchData" class="w-fit px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-sm">
                <RefreshCw :size="18" :class="{'animate-spin': isLoading}" /> Refresh
              </button>
            </div>

            <div v-if="queue.length === 0" class="bg-white dark:bg-slate-800 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 dark:border-slate-700 shadow-sm">
              <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 :size="48" class="text-emerald-400" />
              </div>
              <h3 class="text-2xl font-black mb-2">Semua Bersih!</h3>
              <p class="text-slate-500 max-w-xs mx-auto font-medium">Belum ada review baru yang masuk untuk dimoderasi hari ini.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="item in queue" :key="item.id" class="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all">
                <div class="flex justify-between items-start mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                      {{ item.id.slice(-4) }}
                    </div>
                    <div>
                      <h4 class="font-black text-slate-900 dark:text-white text-sm">Tempat #{{ item.place_id.slice(0, 8) }}...</h4>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ formatTime(item.created_at) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-full text-[10px] font-black">
                    <Star :size="12" class="fill-amber-600" /> {{ item.rating }}
                  </div>
                </div>

                <div class="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl mb-6 min-h-[100px]">
                  <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{{ item.review_text }}"</p>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <button @click="openDetail(item)" class="py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest">Detail</button>
                  <button @click="openReject(item)" class="py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black rounded-2xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/50 uppercase tracking-widest">Tolak</button>
                  <button @click="handleApprove(item.id)" :disabled="processingId === item.id" class="py-3.5 bg-emerald-500 text-white text-[10px] font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw v-if="processingId === item.id" :size="12" class="animate-spin" />
                    <span v-else>Setujui</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: APPROVED -->
          <div v-if="activeTab === 'approved'" class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white">Review Disetujui</h2>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Ulasan yang sudah dipublikasikan ke publik.</p>
              </div>
              <div class="flex items-center gap-3">
                 <input type="date" v-model="filterDate" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm" />
                 <button v-if="filterDate" @click="filterDate = ''" class="px-4 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-xs uppercase tracking-widest border border-red-100 dark:border-red-900/50">
                    Reset
                 </button>
                 <button @click="fetchApproved" class="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-90 transition-all">
                    <RefreshCw :size="20" :class="{'animate-spin': isFetchingApproved}" />
                 </button>
              </div>
            </div>

            <div v-if="approvedReviews.length === 0" class="text-center py-32 opacity-40 grayscale italic font-bold">
               <CheckCircle2 :size="64" class="mx-auto mb-4" />
               Belum ada review yang disetujui.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="item in filteredApproved" :key="item.id" class="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-emerald-50 dark:border-emerald-900/30 shadow-sm relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <CheckCircle class="w-12 h-12 text-emerald-500" />
                </div>
                <div class="flex justify-between items-start mb-6">
                  <div>
                    <h4 class="font-black text-emerald-600 dark:text-emerald-400 text-lg">Tempat #{{ item.place_id.slice(0, 8) }}</h4>
                    <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      <Calendar :size="12" /> {{ formatTime(item.approved_at || item.updated_at) }}
                    </div>
                  </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl mb-2">
                  <p class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed" :class="{'line-clamp-3': !item.expanded}">"{{ item.review_text }}"</p>
                </div>
                <button v-if="item.review_text.length > 150" @click="item.expanded = !item.expanded" class="text-[10px] font-black text-primary-500 mt-2 uppercase tracking-widest ml-1">{{ item.expanded ? 'Ciutkan' : 'Baca Selengkapnya' }}</button>
                
                <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button @click="handleRestore(item.id)" class="flex-1 py-2 bg-amber-500 text-white text-[10px] font-black rounded-xl hover:bg-amber-600 transition-all uppercase tracking-widest shadow-sm">Pending</button>
                  <button @click="openReject(item)" class="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/50 uppercase tracking-widest">Tolak</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: REJECTED -->
          <div v-if="activeTab === 'rejected'" class="space-y-6">
            <div>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white">Review Ditolak</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium">Ulasan yang tidak lolos kriteria moderasi.</p>
            </div>

            <div v-if="rejectedReviews.length === 0" class="text-center py-32 opacity-40 italic font-bold">
               <XCircle :size="64" class="mx-auto mb-4" />
               Tidak ada review yang ditolak.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="item in rejectedReviews" :key="item.id" class="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-red-50 dark:border-red-900/30 shadow-sm">
                <div class="flex justify-between items-start mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-400">
                      <XCircle :size="20" />
                    </div>
                    <div>
                      <h4 class="font-black text-red-600 dark:text-red-400">Tempat #{{ item.place_id.slice(0, 8) }}</h4>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ditolak oleh Admin</p>
                    </div>
                  </div>
                </div>
                <div class="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl">
                   <p class="text-[10px] font-black text-red-800 dark:text-red-400 uppercase tracking-widest mb-1.5">Alasan Penolakan:</p>
                   <p class="text-xs text-red-600 dark:text-red-300 font-bold">{{ item.rejection_reason }}</p>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 italic mb-6">"{{ item.review_text }}"</p>
                <div class="grid grid-cols-2 gap-2">
                  <button @click="handleRestore(item.id)" class="py-3.5 bg-amber-500 text-white text-[10px] font-black rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest">
                    Pulihkan
                  </button>
                  <button @click="confirmSingleDelete(item.id)" class="py-3.5 bg-red-600 text-white text-[10px] font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: PERMANENT DELETE -->
          <div v-if="activeTab === 'permanent_delete'" class="space-y-8">
            <div class="bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-red-500/30 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
               <AlertTriangle class="w-20 h-20 opacity-20 absolute -right-4 -bottom-4 rotate-12" />
               <div class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shrink-0">
                 <Trash2 :size="40" />
               </div>
               <div>
                 <h2 class="text-3xl font-black mb-2 leading-tight">Hapus Massal</h2>
                 <p class="text-red-100 font-medium">Pilih beberapa ulasan sekaligus untuk dihapus permanen secara massal. Tindakan ini tidak dapat dibatalkan.</p>
               </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <label class="flex items-center gap-4 cursor-pointer group">
                 <div class="relative">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="peer sr-only" />
                    <div class="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-lg peer-checked:bg-red-500 peer-checked:border-red-500 transition-all flex items-center justify-center">
                       <Check :size="14" class="text-white scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                 </div>
                 <span class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pilih Semua ({{ rejectedReviews.length }})</span>
              </label>
              <button v-if="selectedIds.length > 0" @click="showConfirmDelete = true" class="w-full sm:w-fit px-8 py-4 bg-red-600 text-white text-[11px] font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest animate-fade-in">
                <Trash2 :size="18" /> Hapus Terpilih ({{ selectedIds.length }})
              </button>
            </div>

            <div v-if="rejectedReviews.length === 0" class="text-center py-32 opacity-40 italic font-bold">Daftar kosong. Review yang ditolak akan muncul di sini.</div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="item in rejectedReviews" :key="item.id" 
                @click="toggleSelect(item.id)"
                class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 transition-all cursor-pointer group relative"
                :class="selectedIds.includes(item.id) ? 'border-red-500 shadow-xl shadow-red-500/10' : 'border-slate-100 dark:border-slate-700 hover:border-red-200'">
                <div class="absolute top-4 right-4 w-6 h-6 border-2 rounded-lg transition-all flex items-center justify-center"
                   :class="selectedIds.includes(item.id) ? 'bg-red-500 border-red-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 group-hover:border-red-400'">
                   <Check v-if="selectedIds.includes(item.id)" :size="14" class="text-white" />
                </div>
                <div class="mb-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ID: {{ item.id.slice(-6) }}</span>
                  <span class="text-xs font-black text-red-500">{{ item.rejection_reason }}</span>
                </div>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">"{{ item.review_text }}"</p>
              </div>
            </div>
          </div>

          <!-- TAB: PARKING VERIFICATION -->
          <div v-if="activeTab === 'parking'" class="space-y-10">
            <div class="text-center max-w-2xl mx-auto space-y-4">
              <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center mx-auto text-blue-500 shadow-lg shadow-blue-500/10">
                 <CircleParking :size="40" />
              </div>
              <h2 class="text-4xl font-black text-slate-900 dark:text-white">Verifikasi Parkir Admin</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium">Lakukan survey lapangan atau verifikasi manual untuk memberikan lencana resmi pada lokasi tertentu.</p>
            </div>

            <div class="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl max-w-3xl mx-auto">
              <div class="flex flex-col md:flex-row gap-3 mb-12">
                <div class="relative flex-1 group">
                  <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" :size="20" />
                  <input v-model="parkingPlaceId" @keyup.enter="searchParkingPlace" placeholder="Masukkan Place ID (Contoh: ChIJ...)" class="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" />
                </div>
                <button @click="searchParkingPlace" :disabled="isSearchingParking" class="px-10 py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95">
                  <RefreshCw v-if="isSearchingParking" :size="20" class="animate-spin" />
                  <span v-else>Cari Lokasi</span>
                </button>
              </div>

              <div v-if="parkingInfo" class="space-y-12 animate-fade-in">
                <!-- Place Info Card -->
                <div class="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 relative overflow-hidden">
                  <div class="absolute -right-6 -bottom-6 opacity-5 rotate-12">
                     <CircleParking :size="120" class="text-blue-500" />
                  </div>
                  <div class="relative z-10">
                    <p class="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Lokasi Terdeteksi
                    </p>
                    <h3 class="font-black text-2xl text-slate-900 dark:text-white mb-2 leading-tight">{{ parkingInfo.name }}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">{{ parkingInfo.address }}</p>
                    
                    <div class="flex flex-col sm:flex-row gap-6 pt-8 border-t border-blue-100 dark:border-blue-800/50">
                      <div class="flex-1">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Badge Komunitas Saat Ini</p>
                        <div v-if="parkingInfo.community_parking?.label_text" class="inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span class="text-sm font-black text-slate-700 dark:text-slate-200">{{ parkingInfo.community_parking.label_text }}</span>
                          <span class="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">{{ parkingInfo.community_parking.source_count }} Laporkan</span>
                        </div>
                        <div v-else class="text-sm text-slate-400 italic font-medium">Belum ada laporan dari komunitas.</div>
                      </div>
                      
                      <div v-if="parkingInfo.admin_parking" class="flex-1">
                        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Verified Admin Aktif ✓</p>
                        <div class="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
                          <span class="text-lg">{{ parkingInfo.admin_parking.label_icon }}</span>
                          <span class="text-sm font-black uppercase tracking-tight">{{ parkingInfo.admin_parking.label_text }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Form Section -->
                <div class="space-y-8">
                  <div class="flex items-center gap-3">
                     <ShieldCheck :size="24" class="text-emerald-500" />
                     <h4 class="font-black text-xl text-slate-900 dark:text-white">Panel Verifikasi</h4>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button v-for="type in parkingTypes" :key="type.id" 
                      @click="selectedParkingType = type.id"
                      class="group p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between"
                      :class="selectedParkingType === type.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10' 
                        : 'border-slate-50 dark:border-slate-700 hover:border-blue-200'">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all"
                          :class="selectedParkingType === type.id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 group-hover:scale-110'">
                          {{ type.icon }}
                        </div>
                        <span class="text-sm font-black" :class="selectedParkingType === type.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'">{{ type.label }}</span>
                      </div>
                      <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                         :class="selectedParkingType === type.id ? 'bg-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-600'">
                         <Check v-if="selectedParkingType === type.id" :size="14" class="text-white" />
                      </div>
                    </button>
                  </div>

                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Catatan Verifikasi (Tampil di Detail)</label>
                    <textarea v-model="adminParkingNotes" placeholder="Jelaskan alasan verifikasi ini (misal: survey lapangan 2026, kerja sama resmi, dll)..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[140px] leading-relaxed transition-all"></textarea>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-4 pt-4">
                    <button @click="saveAdminParking" :disabled="isSavingParking" class="flex-1 py-5 bg-emerald-500 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95">
                      <RefreshCw v-if="isSavingParking" :size="22" class="animate-spin" />
                      <CheckCircle v-else :size="22" />
                      Simpan Lencana Verifikasi
                    </button>
                    <button v-if="parkingInfo.admin_parking" @click="removeAdminParking" :disabled="isSavingParking" class="px-8 py-5 bg-red-50 text-red-600 font-black rounded-3xl hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <Trash2 :size="22" />
                    </button>
                  </div>
                </div>

                <!-- History Audit -->
                <div v-if="parkingHistory.length > 0" class="pt-12 border-t-2 border-dashed border-slate-100 dark:border-slate-700">
                  <div class="flex items-center gap-3 mb-8">
                     <History :size="24" class="text-slate-400" />
                     <h4 class="font-black text-xl text-slate-900 dark:text-white">Log Aktivitas Verifikasi</h4>
                  </div>
                  <div class="space-y-4">
                    <div v-for="(log, idx) in parkingHistory" :key="idx" class="flex items-start gap-5 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                      <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
                        <Info v-if="log.action === 'ADMIN_PARKING_UNVERIFY'" :size="20" class="text-red-500" />
                        <CheckCircle v-else :size="20" class="text-emerald-500" />
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                            {{ log.action === 'ADMIN_PARKING_UNVERIFY' ? 'Verifikasi Dihapus' : 'Verifikasi Diperbarui' }}
                          </span>
                          <span class="text-[10px] font-bold text-slate-400">{{ formatTime(log.timestamp) }}</span>
                        </div>
                        <p class="text-[10px] text-slate-500 font-bold mb-2">Admin: <span class="text-slate-900 dark:text-slate-300">{{ log.admin_email }}</span></p>
                        <p v-if="log.parking_type" class="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-fit uppercase tracking-tighter">Kategori: {{ log.parking_type.replace('_', ' ') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else-if="!isSearchingParking" class="py-24 text-center opacity-40 grayscale group">
                <div class="relative inline-block mb-8">
                   <CircleParking :size="100" class="mx-auto text-slate-300 group-hover:text-blue-400 transition-colors duration-700" />
                   <Search :size="32" class="absolute -bottom-2 -right-2 text-slate-400" />
                </div>
                <p class="font-black text-xl text-slate-400 uppercase tracking-[0.25em]">Cari Lokasi Untuk Verifikasi</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>

    <!-- REJECT MODAL -->
    <div v-if="rejectModal.show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div class="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-40 h-40 bg-red-500/5 rounded-full"></div>
        
        <h3 class="font-black text-3xl mb-3 text-red-600 flex items-center gap-4"><XCircle :size="36"/> Tolak Review</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest">Alasan penolakan moderasi</p>
        
        <div class="space-y-3 mb-10">
           <button v-for="opt in rejectionOptions" :key="opt" 
             @click="rejectModal.reason = opt"
             class="w-full p-5 rounded-[1.5rem] border-2 text-left text-sm font-black transition-all flex items-center justify-between"
             :class="rejectModal.reason === opt ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-50 dark:border-slate-700 hover:border-red-200'">
             {{ opt }}
             <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                :class="rejectModal.reason === opt ? 'bg-red-500 border-red-500' : 'border-slate-200 dark:border-slate-600'">
                <Check v-if="rejectModal.reason === opt" :size="14" class="text-white" />
             </div>
           </button>
        </div>
        
        <textarea v-if="rejectModal.reason === 'Alasan lainnya...'" v-model="rejectModal.customReason" placeholder="Tuliskan alasan spesifik kamu di sini..." rows="3" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-sm mb-10 outline-none focus:ring-4 focus:ring-red-500/10 text-slate-900 dark:text-white font-bold"></textarea>

        <div class="grid grid-cols-2 gap-4">
          <button @click="rejectModal.show = false" class="py-5 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all">Batal</button>
          <button @click="submitReject" :disabled="processingId !== null" class="py-5 text-xs font-black bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest">
            <RefreshCw v-if="processingId !== null" :size="14" class="animate-spin" /> Tolak Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div v-if="detailModal.show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-800 rounded-[3.5rem] w-full max-w-2xl p-0 shadow-2xl animate-fade-in overflow-hidden border border-slate-100 dark:border-slate-700">
        <div class="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80 backdrop-blur-xl">
          <h3 class="font-black text-2xl text-slate-900 dark:text-white flex items-center gap-4"><Eye :size="28" class="text-primary-500"/> Detail Review</h3>
          <button @click="detailModal.show = false" class="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90"><X :size="24"/></button>
        </div>
        <div class="p-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div class="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-primary-500/30">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Place ID</p>
              <p class="text-xs font-black text-slate-900 dark:text-white truncate">{{ detailModal.item.place_id }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-primary-500/30">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">User ID</p>
              <p class="text-xs font-black text-slate-900 dark:text-white truncate">{{ detailModal.item.user_id.slice(0, 10) }}...</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-primary-500/30">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rating</p>
              <div class="flex items-center gap-1.5 text-xs font-black text-amber-500"><Star :size="16" class="fill-amber-500"/> {{ detailModal.item.rating }}</div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-primary-500/30">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal</p>
              <p class="text-xs font-black text-slate-900 dark:text-white">{{ new Date(detailModal.item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
            </div>
          </div>
          
          <div class="mb-10 bg-slate-900 text-emerald-50 p-10 rounded-[3rem] border-2 border-emerald-500/20 shadow-2xl relative">
            <Quote class="absolute -top-4 -left-4 w-12 h-12 text-emerald-500 opacity-20" />
            <div class="flex items-center gap-3 mb-6 text-emerald-400">
               <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span class="text-[10px] font-black uppercase tracking-[0.3em]">Isi Review Pengguna</span>
            </div>
            <p class="text-xl leading-relaxed font-bold italic opacity-90">"{{ detailModal.item.review_text }}"</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="handleApprove(detailModal.item.id); detailModal.show = false" class="flex-1 py-5 bg-emerald-500 text-white font-black rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-3">
              <CheckCircle :size="24"/> Setujui & Publikasikan
            </button>
            <button @click="openReject(detailModal.item); detailModal.show = false" class="py-5 px-10 bg-red-50 text-red-600 font-black rounded-3xl hover:bg-red-100 transition-all border border-red-100 active:scale-95 flex items-center justify-center gap-3">
              <XCircle :size="24"/> Tolak Review
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PERMANENT DELETE CONFIRM MODAL -->
    <div v-if="showConfirmDelete" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
      <div class="bg-white dark:bg-slate-800 rounded-[3.5rem] w-full max-w-sm p-12 shadow-2xl text-center border-4 border-red-600/20 animate-bounce-once">
        <div class="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
          <Trash2 :size="48" />
        </div>
        <h3 class="font-black text-3xl mb-4 text-red-600 leading-tight">Yakin Hapus Permanen?</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-bold">
          Kamu akan menghapus <span class="text-red-600 px-2 py-0.5 bg-red-50 rounded-lg">{{ selectedIds.length }} review</span> selamanya. 
          <br><br>
          <span class="text-[10px] uppercase tracking-[0.2em] text-red-500 bg-red-50 px-3 py-1 rounded-full">Tindakan ini tidak bisa dibatalkan!</span>
        </p>
        <div class="flex flex-col gap-3">
           <button @click="handlePermanentDelete" :disabled="isDeleting" class="py-5 text-sm font-black bg-red-600 text-white rounded-[1.5rem] hover:bg-red-700 shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all">
             <RefreshCw v-if="isDeleting" :size="20" class="animate-spin" /> YAKIN, HAPUS SEKARANG!
           </button>
           <button @click="closeConfirmDelete" class="py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl">Batal</button>
        </div>
      </div>
    </div>

    <!-- GLOBAL TOAST -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[200] transition-all duration-700 pointer-events-none" :class="toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90'">
      <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 text-sm font-black border border-slate-700 dark:border-slate-100">
        <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg" :class="toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'">
          <CheckCircle v-if="toast.type === 'success'" :size="24" />
          <AlertTriangle v-else :size="24" />
        </div>
        <div class="flex flex-col">
           <span class="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">{{ toast.type === 'success' ? 'Berhasil' : 'Peringatan' }}</span>
           <span class="text-lg leading-none">{{ toast.message }}</span>
        </div>
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
  deletePermanentReviews,
  getParkingHistory,
  verifyParking,
  removeParkingVerification,
  fetchPlaceDetails
} from '../utils/api'
import { 
  ShieldCheck, AlertCircle, ListChecks, CheckCircle, RefreshCw, Star, XCircle, 
  Eye, X, LayoutDashboard, History, CheckCircle2, Calendar, Check, 
  Trash2, AlertTriangle, Quote, Clock, CircleParking, Search, Info, LogOut
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// NAVIGATION
const activeTab = ref('dashboard')
const mobileMenuOpen = ref(false)
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'permanent_delete', label: 'Hapus Massal', icon: Trash2 },
  { id: 'parking', label: 'Verifikasi Parkir', icon: CircleParking },
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

// PARKING VERIFICATION STATE
const parkingPlaceId = ref('')
const isSearchingParking = ref(false)
const parkingInfo = ref(null)
const selectedParkingType = ref('belum_ada_info')
const adminParkingNotes = ref('')
const parkingHistory = ref([])
const isSavingParking = ref(false)

const parkingTypes = [
  { id: 'kang_parkir', label: 'Ada Kang Parkir', icon: '🔴', color: 'text-red-500' },
  { id: 'resmi', label: 'Parkir Resmi', icon: '🟣', color: 'text-indigo-500' },
  { id: 'bayar', label: 'Parkir Berbayar', icon: '🟠', color: 'text-orange-500' },
  { id: 'gratis', label: 'Parkir Gratis', icon: '🟢', color: 'text-emerald-500' },
  { id: 'ada_parkir', label: 'Ada Parkir', icon: '🔵', color: 'text-blue-500' },
  { id: 'belum_ada_info', label: 'Belum Ada Info', icon: '⚪', color: 'text-slate-400' },
  { id: 'tidak_ada_parkir', label: 'Tidak Ada Parkir', icon: '❌', color: 'text-gray-500' },
]

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

const singleDeleteId = ref(null)

const confirmSingleDelete = (id) => {
  singleDeleteId.value = id
  showConfirmDelete.value = true
}

const closeConfirmDelete = () => {
  showConfirmDelete.value = false
  singleDeleteId.value = null
}

const submitReject = async () => {
  processingId.value = rejectModal.value.id
  const finalReason = rejectModal.value.reason === 'Alasan lainnya...' ? rejectModal.value.customReason : rejectModal.value.reason
  try {
    const token = authStore.user?.token || ''
    await rejectReview(processingId.value, finalReason, token)
    showToast('Review ditolak.', 'success')
    queue.value = queue.value.filter(item => item.id !== processingId.value)
    approvedReviews.value = approvedReviews.value.filter(item => item.id !== processingId.value)
    rejectModal.value.show = false
    fetchData()
    if (activeTab.value === 'approved') fetchApproved()
  } catch (error) { showToast(error.message, 'error') }
  finally { processingId.value = null }
}

const handleRestore = async (id) => {
  try {
    const token = authStore.user?.token || ''
    await restoreReview(id, token)
    showToast('Review dikembalikan ke pending.', 'success')
    rejectedReviews.value = rejectedReviews.value.filter(r => r.id !== id)
    approvedReviews.value = approvedReviews.value.filter(r => r.id !== id)
    fetchData()
    if (activeTab.value === 'approved') fetchApproved()
    if (activeTab.value === 'rejected') fetchRejected()
  } catch (e) { showToast(e.message, 'error') }
}

const handlePermanentDelete = async () => {
  const idsToDelete = singleDeleteId.value ? [singleDeleteId.value] : selectedIds.value
  if (idsToDelete.length === 0) return
  isDeleting.value = true
  try {
    const token = authStore.user?.token || ''
    await deletePermanentReviews(idsToDelete, token)
    showToast(`${idsToDelete.length} review dihapus permanen`, 'success')
    rejectedReviews.value = rejectedReviews.value.filter(r => !idsToDelete.includes(r.id))
    if (singleDeleteId.value) {
      singleDeleteId.value = null
    } else {
      selectedIds.value = []
    }
    showConfirmDelete.value = false
    fetchData() // Refresh counts
  } catch (e) { showToast(e.message, 'error') }
  finally { isDeleting.value = false }
}

const searchParkingPlace = async () => {
  if (!parkingPlaceId.value) return
  isSearchingParking.value = true
  parkingInfo.value = null
  try {
    const token = authStore.user?.token || ''
    const [details, history] = await Promise.all([
      fetchPlaceDetails(parkingPlaceId.value),
      getParkingHistory(parkingPlaceId.value, token)
    ])
    
    parkingInfo.value = {
      name: details.name,
      address: details.formatted_address,
      ...history
    }
    
    if (history.admin_parking) {
      selectedParkingType.value = history.admin_parking.parking_type
      adminParkingNotes.value = history.admin_parking.notes || ''
    } else {
      selectedParkingType.value = 'belum_ada_info'
      adminParkingNotes.value = ''
    }
    
    parkingHistory.value = history.history || []
  } catch (e) {
    showToast('Tempat tidak ditemukan atau error', 'error')
  } finally {
    isSearchingParking.value = false
  }
}

const saveAdminParking = async () => {
  if (!parkingPlaceId.value) return
  isSavingParking.value = true
  try {
    const token = authStore.user?.token || ''
    await verifyParking({
      place_id: parkingPlaceId.value,
      admin_parking_type: selectedParkingType.value,
      admin_notes: adminParkingNotes.value
    }, token)
    
    showToast('Verifikasi admin berhasil disimpan', 'success')
    searchParkingPlace() // Refresh
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    isSavingParking.value = false
  }
}

const removeAdminParking = async () => {
  if (!parkingPlaceId.value) return
  if (!confirm('Hapus verifikasi admin untuk tempat ini?')) return
  
  isSavingParking.value = true
  try {
    const token = authStore.user?.token || ''
    await removeParkingVerification(parkingPlaceId.value, token)
    showToast('Verifikasi admin dihapus', 'success')
    searchParkingPlace() // Refresh
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    isSavingParking.value = false
  }
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
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.slide-enter-active, .slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); opacity: 0; }

.animate-pulse-once { animation: pulse 1.5s ease-out; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

.animate-bounce-once { animation: bounceCustom 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes bounceCustom { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
