import { createRouter, createWebHistory } from 'vue-router'
import Onboarding from '../views/Onboarding.vue'
import MainLayout from '../views/MainLayout.vue'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import Saved from '../views/Saved.vue'
import Profile from '../views/Profile.vue'
import PlaceDetail from '../views/PlaceDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Onboarding',
    component: Onboarding,
    beforeEnter: (to, from) => {
      const hasCompletedOnboarding = localStorage.getItem('lokalens_onboarding_completed')
      if (hasCompletedOnboarding) {
        return { name: 'Home' } // ✅ RETURN, bukan next()
      }
      return true // ✅ Lanjutkan
    }
  },
  {
    path: '/place/:id',
    name: 'PlaceDetail',
    component: PlaceDetail
  },
  {
    path: '/app',
    component: MainLayout,
    beforeEnter: (to, from) => {
      const onboardingDone = localStorage.getItem('lokalens_onboarding_completed')

      if (onboardingDone !== 'true') {
        return '/' // ✅ RETURN, bukan next()
      }
      return true // ✅ Lanjutkan
    },
    redirect: '/app/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home
      },
      {
        path: 'search',
        name: 'Search',
        component: Search
      },
      {
        path: 'saved',
        name: 'Saved',
        component: Saved
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    beforeEnter: async (to, from) => {
      const { auth } = await import('../firebase.js')
      const user = auth.currentUser || await new Promise(resolve => {
        const unsub = auth.onAuthStateChanged(u => { unsub(); resolve(u) })
      })

      if (!user) {
        return '/app/home' // ✅ RETURN
      }

      try {
        const token = await user.getIdTokenResult()
        if (token.claims.admin === true) {
          return true // ✅ Lanjutkan
        } else {
          return '/app/home' // ✅ RETURN
        }
      } catch (e) {
        console.error('Admin Check Error:', e)
        return '/app/home' // ✅ RETURN
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router