import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase'
import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore'

export const useSavedStore = defineStore('saved', () => {
  // In-memory list — synced from Firestore (logged in) or localStorage (guest)
  const savedPlaces = ref([])
  const isLoading = ref(true)
  const isLoaded = ref(false)
  // Migration banner: set to true when localStorage data found after login
  const hasMigrationPending = ref(false)

  // ─── HELPERS ──────────────────────────────────────────────
  const _localKey = 'lokalens_saved_places'

  const _firestoreRef = (uid, placeId) =>
    doc(db, 'users', uid, 'saved_places', String(placeId))

  const _userCollection = (uid) =>
    collection(db, 'users', uid, 'saved_places')

  // ─── PUBLIC API ───────────────────────────────────────────

  /** Load saved places for a user from Firestore, or from localStorage for guests */
  const load = async (uid = null) => {
    isLoading.value = true
    isLoaded.value = false
    
    if (uid) {
      // Logged-in: load from Firestore
      try {
        const snap = await getDocs(_userCollection(uid))
        savedPlaces.value = snap.docs.map(d => d.data())
      } catch (e) {
        console.error('Failed to load saved places from Firestore', e)
      }

      // Check if there's old localStorage data to migrate
      const localData = JSON.parse(localStorage.getItem(_localKey) || '[]')
      if (localData.length > 0) {
        hasMigrationPending.value = true
      }
    } else {
      // Guest: load from localStorage
      savedPlaces.value = JSON.parse(localStorage.getItem(_localKey) || '[]')
    }
    
    isLoaded.value = true
    isLoading.value = false
  }

  const isSaved = (placeId) =>
    savedPlaces.value.some(p => String(p.id) === String(placeId))

  /**
   * Toggle save — requires uid when logged in.
   * Returns: { success, requiresLogin }
   */
  const toggleSave = async (place, uid = null) => {
    const alreadySaved = isSaved(place.id)

    if (!uid) {
      // Guest — block save
      return { success: false, requiresLogin: true }
    }

    if (alreadySaved) {
      // Remove from Firestore + memory
      await deleteDoc(_firestoreRef(uid, place.id))
      savedPlaces.value = savedPlaces.value.filter(p => String(p.id) !== String(place.id))
    } else {
      // Add to Firestore + memory
      const data = {
        id: place.id,
        name: place.name,
        rating: place.rating || null,
        budget: place.budget || null,
        image: place.image || null,
        saved_at: new Date().toISOString(),
      }
      await setDoc(_firestoreRef(uid, place.id), data)
      savedPlaces.value.push(data)
    }
    return { success: true, requiresLogin: false }
  }

  /** Migrate localStorage data → Firestore, then clear localStorage */
  const migrateFromLocalStorage = async (uid) => {
    const localData = JSON.parse(localStorage.getItem(_localKey) || '[]')
    for (const place of localData) {
      const data = {
        id: place.id,
        name: place.name,
        rating: place.rating || null,
        budget: place.budget || null,
        image: place.image || null,
        saved_at: place.saved_at || new Date().toISOString(),
      }
      await setDoc(_firestoreRef(uid, place.id), data).catch(() => {})
      if (!isSaved(place.id)) savedPlaces.value.push(data)
    }
    localStorage.removeItem(_localKey)
    hasMigrationPending.value = false
  }

  /** Dismiss migration offer without migrating */
  const dismissMigration = () => {
    hasMigrationPending.value = false
  }

  /** Clear in-memory list on logout */
  const clear = () => {
    savedPlaces.value = []
    isLoaded.value = false
    isLoading.value = false
    hasMigrationPending.value = false
  }

  return {
    savedPlaces,
    isLoaded,
    hasMigrationPending,
    load,
    isSaved,
    toggleSave,
    migrateFromLocalStorage,
    dismissMigration,
    clear,
  }
})
