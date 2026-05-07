<template>
  <!-- No :key here — MainLayout (sidebar/nav) stays mounted between pages -->
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { useSavedStore } from './stores/saved'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const savedStore = useSavedStore()
const { locale } = useI18n()

onMounted(async () => {
  // 1. Check auth first (waits for initial Firebase resolution)
  await authStore.checkAuth()
})

// 2. Sync favorites whenever user changes (login, logout, or initial load)
watch(() => authStore.user?.uid, async (newUid) => {
  await savedStore.load(newUid || null)
}, { immediate: true })

// Sync i18n locale immediately + reactively whenever language changes
watch(() => settingsStore.language, (lang) => {
  locale.value = lang
}, { immediate: true })
</script>
