import { createI18n } from 'vue-i18n'

const messages = {
  id: {
    welcome: 'Selamat Datang di LokaLens',
    settings: {
      title: 'Pengaturan',
      language: 'Bahasa (Klik untuk ganti ke Inggris)',
      language_desc: 'Indonesia (Default)',
      dark_mode: 'Dark Mode',
      dark_mode_desc: 'Tampilan gelap untuk malam hari',
      notification: 'Notifikasi',
      notification_desc: 'Pemberitahuan untuk update tempat',
      location: 'Lokasi',
      location_desc: 'Deteksi lokasi Anda secara otomatis',
      permissions: 'Perizinan Akses',
    },
    toast: {
      language_changed: 'Bahasa diubah ke Indonesia 🇮🇩',
      dark_on: 'Dark mode diaktifkan 🌙',
      dark_off: 'Light mode diaktifkan ☀️',
      notif_on: 'Notifikasi diaktifkan ✅',
      notif_off: 'Notifikasi dimatikan 🔕',
      notif_blocked: 'Notifikasi diblokir. Buka pengaturan browser untuk mengaktifkan.',
      location_on: 'Akses lokasi diaktifkan 📍',
      location_off: 'Lokasi dimatikan. Beberapa fitur mungkin tidak akurat.',
      location_blocked: 'Lokasi diblokir. Buka pengaturan browser untuk mengaktifkan.',
      data_deleted: 'Semua data telah dihapus 🗑️',
    },
    delete: {
      button: 'Hapus Data Saya',
      confirm_title: 'Konfirmasi Hapus Data',
      confirm_msg: 'Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini TIDAK DAPAT DIBATALKAN.',
      confirm_2_title: 'Konfirmasi Terakhir',
      confirm_2_msg: 'Ini adalah konfirmasi terakhir. Semua review, badge, dan riwayat Anda akan hilang selamanya.',
      cancel: 'Batal',
      confirm: 'Ya, Hapus Semua',
      final_confirm: 'Saya Mengerti, Hapus Sekarang',
      warning: 'Tindakan ini TIDAK DAPAT DIBATALKAN',
    }
  },
  en: {
    welcome: 'Welcome to LokaLens',
    settings: {
      title: 'Settings',
      language: 'Language (Click to change to Indonesia)',
      language_desc: 'English',
      dark_mode: 'Dark Mode',
      dark_mode_desc: 'Dark appearance for night time',
      notification: 'Notifications',
      notification_desc: 'Alerts for place updates',
      location: 'Location',
      location_desc: 'Automatically detect your location',
      permissions: 'Access Permissions',
    },
    toast: {
      language_changed: 'Language changed to English 🇬🇧',
      dark_on: 'Dark mode enabled 🌙',
      dark_off: 'Light mode enabled ☀️',
      notif_on: 'Notifications enabled ✅',
      notif_off: 'Notifications disabled 🔕',
      notif_blocked: 'Notifications blocked. Open browser settings to enable.',
      location_on: 'Location access enabled 📍',
      location_off: 'Location disabled. Some features may be inaccurate.',
      location_blocked: 'Location blocked. Open browser settings to enable.',
      data_deleted: 'All data has been deleted 🗑️',
    },
    delete: {
      button: 'Delete My Data',
      confirm_title: 'Confirm Data Deletion',
      confirm_msg: 'Are you sure you want to delete ALL your data? This action CANNOT be undone.',
      confirm_2_title: 'Final Confirmation',
      confirm_2_msg: 'This is your last chance. All your reviews, badges, and history will be gone forever.',
      cancel: 'Cancel',
      confirm: 'Yes, Delete Everything',
      final_confirm: 'I Understand, Delete Now',
      warning: 'This action CANNOT be undone',
    }
  }
}

// Check local storage for language preference, fallback to navigator language or 'id'
const savedLang = localStorage.getItem('lokalens_lang')
const browserLang = navigator.language.split('-')[0]
const defaultLang = savedLang || (['id', 'en'].includes(browserLang) ? browserLang : 'id')

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: defaultLang,
  fallbackLocale: 'en',
  messages,
})

export default i18n
