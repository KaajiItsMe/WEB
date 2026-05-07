import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

if (!admin.apps.length) {
  // Parsing private key to handle newline characters properly
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    })
    console.log('Firebase Admin SDK initialized successfully.')
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error.stack)
  }
}

export const db = admin.firestore()
export const auth = admin.auth()
