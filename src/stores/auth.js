import { defineStore } from 'pinia'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAdmin: false,
    loading: true,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userData: (state) => state.user
  },

  actions: {
    async loginWithGoogle() {
      this.loading = true
      this.error = null
      try {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        // Force refresh token to get latest custom claims
        const tokenResult = await user.getIdTokenResult(true)
        
        this.user = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          token: tokenResult.token
        }
        this.isAdmin = tokenResult.claims.admin === true
      } catch (error) {
        console.error('Google Sign-In Error:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await signOut(auth)
        this.user = null
        this.isAdmin = false
      } catch (error) {
        console.error('Logout Error:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    checkAuth() {
      return new Promise((resolve) => {
        this.loading = true
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Check claims
              const tokenResult = await user.getIdTokenResult()
              this.user = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                token: tokenResult.token
              }
              this.isAdmin = tokenResult.claims.admin === true
            } catch (e) {
              console.error('Failed to get token result', e)
              this.user = null
              this.isAdmin = false
            }
          } else {
            this.user = null
            this.isAdmin = false
          }
          this.loading = false
          resolve(this.user)
        })
      })
    }
  }
})
