import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')
  const language = ref(localStorage.getItem('lokalens_lang') || 'id')
  const notificationEnabled = ref(
    localStorage.getItem('notification_permission') === 'granted' &&
    ('Notification' in window) && Notification.permission === 'granted'
  )
  const locationEnabled = ref(localStorage.getItem('location_permission') === 'granted')

  // WATCH: setiap perubahan theme → update localStorage + DOM langsung
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }, { immediate: true })

  // WATCH: setiap perubahan language → update localStorage
  watch(language, (newLang) => {
    localStorage.setItem('lokalens_lang', newLang)
  }, { immediate: true })

  // ─── ACTIONS ──────────────────────────────────────────────

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setLanguage(lang) {
    language.value = lang
  }

  async function requestNotification() {
    if (!('Notification' in window)) return { success: false, reason: 'unsupported' }
    if (Notification.permission === 'denied') return { success: false, reason: 'denied' }
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    notificationEnabled.value = granted
    localStorage.setItem('notification_permission', granted ? 'granted' : 'denied')
    return { success: granted, reason: granted ? null : 'denied' }
  }

  function disableNotification() {
    notificationEnabled.value = false
    localStorage.setItem('notification_permission', 'denied')
  }

  function requestLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, reason: 'unsupported' }); return
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          locationEnabled.value = true
          localStorage.setItem('location_permission', 'granted')
          resolve({ success: true })
        },
        () => {
          locationEnabled.value = false
          localStorage.setItem('location_permission', 'denied')
          resolve({ success: false, reason: 'denied' })
        }
      )
    })
  }

  function disableLocation() {
    locationEnabled.value = false
    localStorage.setItem('location_permission', 'denied')
  }

  return {
    theme,
    language,
    notificationEnabled,
    locationEnabled,
    toggleTheme,
    setLanguage,
    requestNotification,
    disableNotification,
    requestLocation,
    disableLocation,
  }
})
