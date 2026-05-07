import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// import { getAnalytics } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf5uemgIZwhtp2B3DpAhzDttQ9CoPorhU",
  authDomain: "lokalens-web.firebaseapp.com",
  projectId: "lokalens-web",
  storageBucket: "lokalens-web.firebasestorage.app",
  messagingSenderId: "463912245309",
  appId: "1:463912245309:web:39e9cf7d7987480822b254",
  measurementId: "G-L8JJ9SWEB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Analytics di-comment dulu (menghindari error ERR_FILE_NOT_FOUND dari ekstensi chrome)
// let analytics;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

// Initialize Auth & Firestore
const auth = getAuth(app)
const db = getFirestore(app)

// Setup Google Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export { auth, db, googleProvider }
