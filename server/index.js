import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { analyzePlace, parseSearchQuery } from './gemini.js'
import { db, auth } from './firebase.js'

dotenv.config()

const app = express()

// ==========================================
// SECURITY & CORS CONFIGURATION
// ==========================================

// 1. Rate Limiting: Mencegah spam & proteksi kuota Gemini
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP dalam 15 menit
  message: { error: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Terapkan limiter ke semua route /api/
app.use('/api/', limiter)

// 2. Restricted CORS: Hanya izinkan domain yang kita kenal
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.a\.run\.app$/,  // Cloud Run (regex untuk mencakup subdomain)
  /\.web\.app$/      // Firebase Hosting (regex untuk mencakup subdomain)
]

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika tidak ada origin (seperti mobile app atau curl) 
    // atau jika origin cocok dengan daftar allowedOrigins
    if (!origin) return callback(null, true)

    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) return pattern.test(origin)
      return pattern === origin
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      console.warn(`[Security] Blocked CORS request from: ${origin}`)
      callback(new Error('Not allowed by CORS Security Policy'))
    }
  }
}))

app.use(express.json())

const PORT = process.env.PORT || 3000

// ==========================================
// CACHE CONFIGURATION
// ==========================================
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days cache for place details & analysis
const SEARCH_CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours for search results


// ==========================================
// MIDDLEWARE
// ==========================================
const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' })
  }

  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await auth.verifyIdToken(idToken)
    if (decodedToken.admin === true) {
      req.user = decodedToken
      next()
    } else {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }
  } catch (error) {
    console.error('Error verifying admin token:', error)
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

// Verify any authenticated user (not just admin)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' })
  }
  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await auth.verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

import { searchNearby, getPlaceDetails, searchByText, reverseGeocode } from './places.js'

// Helper for caching Place Details
async function getPlaceDetailsWithCache(placeId) {
  try {
    const cacheRef = db.collection('places_details_cache').doc(placeId)
    const doc = await cacheRef.get()
    const now = Date.now()

    if (doc.exists) {
      const data = doc.data()
      const cachedAt = data.cached_at ? new Date(data.cached_at).getTime() : 0

      if (now - cachedAt < CACHE_DURATION_MS) {
        console.log(`[Cache Hit] Returning cached details for: ${placeId}`)
        return data.result
      }
      console.log(`[Cache Stale] Refreshing details for: ${placeId}`)
    }

    // Call real API
    const result = await getPlaceDetails(placeId)

    // Save to cache
    await cacheRef.set({
      place_id: placeId,
      result: result,
      cached_at: new Date().toISOString()
    })

    console.log(`[Cache Miss] Saved new details for: ${placeId}`)
    return result
  } catch (error) {
    console.error(`[Cache Error] Error in getPlaceDetailsWithCache for ${placeId}:`, error.message)
    // Fallback to real API if cache fails
    return await getPlaceDetails(placeId)
  }
}


// ==========================================
// GOOGLE PLACES API ROUTES
// ==========================================

// GET /api/places/nearby
app.get('/api/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius, type } = req.query
    const rRadius = parseInt(radius) || 5000
    const rType = type || 'restaurant'

    // Create a cache key based on a 1km grid (2 decimal places)
    const latGrid = parseFloat(lat).toFixed(2)
    const lngGrid = parseFloat(lng).toFixed(2)
    const cacheKey = `nearby_${latGrid}_${lngGrid}_${rRadius}_${rType}`

    const cacheRef = db.collection('places_search_cache').doc(cacheKey)
    const cacheDoc = await cacheRef.get()

    if (cacheDoc.exists) {
      const data = cacheDoc.data()
      const cachedAt = data.cached_at ? new Date(data.cached_at).getTime() : 0
      if (Date.now() - cachedAt < SEARCH_CACHE_DURATION_MS) {
        console.log(`[Search Cache Hit] Nearby: ${cacheKey}`)
        return res.json({ results: data.results })
      }
    }

    const places = await searchNearby(
      parseFloat(lat),
      parseFloat(lng),
      rRadius,
      rType
    )

    // Save to cache
    await cacheRef.set({
      results: places,
      cached_at: new Date().toISOString()
    })

    res.json({ results: places })
  } catch (error) {
    console.error('Error fetching nearby places:', error)
    res.status(500).json({ error: error.message })
  }
})


// GET /api/places/details/:placeId
app.get('/api/places/details/:placeId', async (req, res) => {
  try {
    const details = await getPlaceDetailsWithCache(req.params.placeId)
    res.json(details)
  } catch (error) {

    console.error('Error fetching place details:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/places/search
app.get('/api/places/search', async (req, res) => {
  try {
    const { query, lat, lng } = req.query

    // Cache Check First
    const latGrid = parseFloat(lat || 0).toFixed(2)
    const lngGrid = parseFloat(lng || 0).toFixed(2)
    const sanitizedQuery = (query || '').toLowerCase().trim().replace(/[^a-z0-t0-9]/g, '_')
    const cacheKey = `search_${sanitizedQuery}_${latGrid}_${lngGrid}`

    const cacheRef = db.collection('places_search_cache').doc(cacheKey)
    const cacheDoc = await cacheRef.get()

    if (cacheDoc.exists) {
      const data = cacheDoc.data()
      const cachedAt = data.cached_at ? new Date(data.cached_at).getTime() : 0
      if (Date.now() - cachedAt < SEARCH_CACHE_DURATION_MS) {
        console.log(`[Search Cache Hit] Text Search: ${cacheKey}`)
        return res.json({ results: data.results })
      }
    }

    let finalQuery = query
    let extraParams = {}

    // Jika query panjang (natural language), minta AI parsing intent-nya
    if (query && query.length > 20) {
      console.log(`[Backend] AI Parsing query: "${query}"`)
      const aiIntent = await parseSearchQuery(query)
      if (aiIntent) {
        finalQuery = aiIntent.keywords || query
        if (aiIntent.max_price !== undefined) extraParams.maxprice = aiIntent.max_price
        if (aiIntent.min_price !== undefined) extraParams.minprice = aiIntent.min_price
        if (aiIntent.type) extraParams.type = aiIntent.type
      }
    }

    const results = await searchByText(finalQuery, parseFloat(lat), parseFloat(lng), extraParams)

    // Save to cache
    await cacheRef.set({
      results: results,
      cached_at: new Date().toISOString()
    })

    res.json({ results })
  } catch (error) {
    console.error('Error searching places:', error)
    res.status(500).json({ error: error.message })
  }
})


// GET /api/places/reverse-geocode
app.get('/api/places/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query

    // Cache Check
    const latGrid = parseFloat(lat).toFixed(2)
    const lngGrid = parseFloat(lng).toFixed(2)
    const cacheKey = `geo_${latGrid}_${lngGrid}`

    const cacheRef = db.collection('places_search_cache').doc(cacheKey)
    const cacheDoc = await cacheRef.get()

    if (cacheDoc.exists) {
      const data = cacheDoc.data()
      const cachedAt = data.cached_at ? new Date(data.cached_at).getTime() : 0
      if (Date.now() - cachedAt < SEARCH_CACHE_DURATION_MS) {
        console.log(`[Search Cache Hit] Reverse Geocode: ${cacheKey}`)
        return res.json({ address: data.address })
      }
    }

    const address = await reverseGeocode(parseFloat(lat), parseFloat(lng))

    // Save to cache
    await cacheRef.set({
      address: address,
      cached_at: new Date().toISOString()
    })

    res.json({ address })
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    res.status(500).json({ error: error.message })
  }
})


// ==========================================
// GEMINI AI ROUTES
// ==========================================

// UPGRADE /api/analyze — pakai data REAL dari Places API
app.post('/api/analyze', async (req, res) => {
  try {
    const { place_id, user_lat, user_lng, name, reviews, place_lat, place_lng } = req.body

    // 🔥 NEW: Check for existing analysis in cache first
    if (place_id) {
      try {
        const cacheRef = db.collection('places_analysis').doc(place_id)
        const doc = await cacheRef.get()
        if (doc.exists) {
          const data = doc.data()
          const analyzedAt = data.analyzed_at ? new Date(data.analyzed_at).getTime() : 0

          // Smart Validation: Jika cache masih dalam durasi tapi data KRITIKAL (red_flag/location_data) hilang, paksa re-analyze
          const isDataComplete = data.red_flag !== undefined && data.location_data !== undefined

          if (Date.now() - analyzedAt < CACHE_DURATION_MS && isDataComplete) {
            console.log(`[Cache Hit] Returning cached analysis for: ${place_id}`)
            return res.json(data)
          }
          console.log(`[Cache Miss/Incomplete] Refreshing analysis for: ${place_id}`)
        }
      } catch (cacheErr) {
        console.warn('[Cache Error] Failed to read from places_analysis:', cacheErr.message)
      }
    }

    // 1. Ambil data real dari Google Places JIKA ada place_id
    let placeData = {
      reviews: []
    }

    if (place_id) {
      console.log(`[Backend] Analyzing place via ID: ${place_id}`)
      const details = await getPlaceDetailsWithCache(place_id)

      // Ambil review Google (maks 5)

      const googleReviews = details.reviews?.map(r => r.text) || []

      // 🔥 BARU: Ambil SEMUA ulasan internal dari database LokaLens
      let internalReviews = []
      try {
        const snapshot = await db.collection('reviews_private')
          .where('place_id', '==', place_id)
          .get()

        snapshot.forEach(doc => {
          const data = doc.data()
          if (data.review_text) {
            internalReviews.push(data.review_text)
          }
        })
        console.log(`[Backend] Total ulasan untuk analisis: ${internalReviews.length} (LokaLens) + ${googleReviews.length} (Google)`)
      } catch (dbErr) {
        console.warn('[Backend] Gagal ambil ulasan internal:', dbErr.message)
      }

      // Simpan statistik untuk dikirim ke UI
      const reviewStats = {
        google_count: googleReviews.length,
        lokalens_count: internalReviews.length,
        total_google_all: details.user_ratings_total || 0
      }

      placeData = {
        name: details.name,
        category: details.types?.[0] || 'restaurant',
        rating: details.rating,
        // Gabungkan semua (LokaLens diprioritaskan di depan)
        reviews: [...internalReviews, ...googleReviews],
        place_lat: details.geometry?.location?.lat,
        place_lng: details.geometry?.location?.lng,
        address: details.formatted_address,
        review_stats: reviewStats // 🔥 BARU: Kirim stats ke frontend
      }
    } else {
      // ... manual input logic
    }

    // 2. Kirim ke Gemini untuk analisis
    const analysisResult = await analyzePlace({
      ...placeData,
      user_lat,
      user_lng
    })

    // 🔥 VALIDASI: Pastikan data kritikal ada sebelum lanjut ke caching/response
    if (!analysisResult.ai_summary) throw new Error("Validation Error: ai_summary is missing")
    if (!analysisResult.location_data?.latitude || !analysisResult.location_data?.longitude) throw new Error("Validation Error: Missing coordinates")

    // Tambahkan stats ke hasil akhir sebelum dikirim ke frontend
    const finalResult = {
      ...analysisResult,
      review_stats: placeData.review_stats
    }

    // 🔥 CACHE to Firestore 'places_analysis' for Smart Parking labels
    if (place_id) {
      try {
        const parkingNotes = (analysisResult.parking_info?.parking_notes || '').toLowerCase()
        const placeRef = db.collection('places_analysis').doc(place_id)
        await placeRef.set({
          place_id,
          ai_summary: analysisResult.ai_summary,
          parking_info: {
            parking_available: analysisResult.parking_info?.parking_available ?? null,
            parking_notes: analysisResult.parking_info?.parking_notes || null,
            parking_sentiment: analysisResult.parking_info?.parking_sentiment || null,
            // 🔥 New AI-detected fields (more accurate than keyword heuristics)
            has_informal_attendant: analysisResult.parking_info?.has_informal_attendant ?? false,
            is_paid_parking: analysisResult.parking_info?.is_paid_parking ?? false,
            is_official_parking: analysisResult.parking_info?.is_official_parking ?? false,
            // Fallback keyword-based detection for old cached data
            is_free_parking: !(analysisResult.parking_info?.is_paid_parking) && (parkingNotes.includes('gratis') || parkingNotes.includes('tidak bayar') || parkingNotes.includes('free')),
            paid_parking: analysisResult.parking_info?.is_paid_parking ?? (parkingNotes.includes('bayar') || parkingNotes.includes('berbayar') || parkingNotes.includes('retribusi'))
          },
          best_menu: analysisResult.best_menu || null,
          best_time: analysisResult.best_time || null,
          budget_per_person: analysisResult.budget_per_person || null,
          tags: analysisResult.tags || [],
          tag_colors: analysisResult.tag_colors || [],
          community_updates: analysisResult.community_updates || [],
          location_data: analysisResult.location_data || null,
          red_flag: analysisResult.red_flag ?? "", // FIX: Gunakan ?? "" agar string kosong tetap tersimpan
          vibes: analysisResult.vibes ?? "", // FIX: Gunakan ?? "" agar string kosong tetap tersimpan
          score_overall: analysisResult.score_overall || null,
          score_taste: analysisResult.score_taste || null,
          score_service: analysisResult.score_service || null,
          score_value: analysisResult.score_value || null,
          worth_it: analysisResult.worth_it ?? null,
          hidden_gem: analysisResult.hidden_gem ?? null,
          review_stats: placeData.review_stats,
          analyzed_at: new Date().toISOString()
        }, { merge: true })
        console.log(`[Firestore] Cached analysis for place_id: ${place_id}`)
      } catch (cacheErr) {
        // Non-fatal: log and continue — response already ready
        console.warn('[Firestore] Failed to cache analysis:', cacheErr.message)
      }
    }

    res.json(finalResult)
  } catch (error) {
    console.error('API /analyze Error:', error)
    res.status(500).json({ error: error.message || 'Failed to analyze place' })
  }
})

// GET /api/places/parking-batch?place_ids=id1,id2,id3
app.get('/api/places/parking-batch', async (req, res) => {
  try {
    const placeIds = (req.query.place_ids || '').split(',').map(s => s.trim()).filter(Boolean)

    if (placeIds.length === 0) return res.json({})

    const parkingData = {}
    const batchSize = 10 // Firestore 'in' query limit

    for (let i = 0; i < placeIds.length; i += batchSize) {
      const batch = placeIds.slice(i, i + batchSize)
      const snapshot = await db.collection('places_analysis')
        .where('place_id', 'in', batch)
        .get()

      snapshot.forEach(doc => {
        const data = doc.data()
        // Kirim data lengkap (AI + Komunitas) untuk Smart Parking Badge
        parkingData[data.place_id] = {
          // Data Komunitas
          dominant_type: data.parking_info?.dominant_type || null,
          source_count: data.parking_info?.source_count || 0,
          label_text: data.parking_info?.label_text || null,
          label_icon: data.parking_info?.label_icon || null,

          // Data AI (Fallback)
          has_informal_attendant: data.parking_info?.has_informal_attendant || false,
          is_paid: data.parking_info?.is_paid_parking || data.parking_info?.paid_parking || false,
          is_free: data.parking_info?.is_free_parking || false,
          is_official: data.parking_info?.is_official_parking || false,

          notes: data.parking_info?.parking_notes || null,
          analyzed: true
        }
      })
    }

    // Mark unanalyzed places
    placeIds.forEach(id => {
      if (!parkingData[id]) parkingData[id] = { analyzed: false }
    })

    res.json(parkingData)
  } catch (error) {
    console.error('Error in parking-batch:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// REVIEWS PRIVATE ROUTES (Firebase Firestore)
// ==========================================
app.post('/api/reviews-private', async (req, res) => {
  const { place_id, rating, review_text, parking_type, parking_notes, photo, user_id } = req.body

  if (!rating || rating < 1.0 || rating > 5.0) {
    return res.status(400).json({ error: 'Rating wajib antara 1.0 sampai 5.0' })
  }

  if (!review_text || review_text.length < 10) {
    return res.status(400).json({ error: 'Review text minimal 10 karakter' })
  }

  // Validasi parking
  const validParkingTypes = ['kang_parkir', 'resmi', 'bayar', 'gratis', 'ada_parkir', 'belum_ada_info']
  if (!parking_type || !validParkingTypes.includes(parking_type)) {
    return res.status(400).json({ error: 'Kategori parkir WAJIB dipilih' })
  }

  try {
    const reviewData = {
      place_id,
      rating,
      review_text,
      parking_type,
      parking_notes: parking_notes || null,
      photo: photo || null,
      user_id: user_id || 'anon_user',
      status: 'approved', // Langsung approve dulu agar testing terasa instan
      is_public: false,
      created_at: new Date().toISOString()
    }

    const docRef = await db.collection('reviews_private').add(reviewData)

    // 🔥 AUTO-UPDATE places_analysis dengan Dominant Type
    const analysisRef = db.collection('places_analysis').doc(place_id)

    // Ambil semua review untuk place ini
    const reviewsSnapshot = await db.collection('reviews_private')
      .where('place_id', '==', place_id)
      .where('status', '==', 'approved')
      .get()

    // Hitung per kategori
    const counts = { kang_parkir: 0, resmi: 0, bayar: 0, gratis: 0, ada_parkir: 0, total: 0 }
    const notesList = []

    reviewsSnapshot.forEach(doc => {
      const data = doc.data()
      if (counts[data.parking_type] !== undefined) {
        counts[data.parking_type]++
        counts.total++
      }
      if (data.parking_notes) notesList.push(data.parking_notes)
    })

    // Tentukan status parkir dominan
    let dominantType = 'belum_ada_info'
    let dominantCount = 0
    Object.entries(counts).forEach(([type, count]) => {
      if (type !== 'total' && count > dominantCount) {
        dominantType = type
        dominantCount = count
      }
    })

    const parkingLabels = {
      kang_parkir: { text: 'Ada Kang Parkir ⚠️', icon: '🔴', sentiment: 'negatif' },
      resmi: { text: 'Parkir Resmi ✅', icon: '🟣', sentiment: 'positif' },
      bayar: { text: 'Parkir Berbayar', icon: '🟠', sentiment: 'netral' },
      gratis: { text: 'Parkir Gratis', icon: '🟢', sentiment: 'positif' },
      ada_parkir: { text: 'Ada Parkir', icon: '🔵', sentiment: 'netral' },
      belum_ada_info: { text: 'Belum Ada Info', icon: '⚪', sentiment: 'netral' }
    }

    const label = parkingLabels[dominantType]

    await analysisRef.set({
      place_id,
      parking_info: {
        dominant_type: dominantType,
        dominant_count: dominantCount,
        label_text: label.text,
        label_icon: label.icon,
        parking_sentiment: label.sentiment,
        parking_notes: notesList.slice(-3).join(' | '), // Ambil 3 notes terbaru
        counts: counts,
        source_count: counts.total,
        analyzed: true
      },
      updated_at: new Date().toISOString()
    }, { merge: true })

    res.status(200).json({
      message: "Review + info parkir tersimpan! 🔒 AI LokaLens makin pintar!",
      data: { id: docRef.id, ...reviewData }
    })
  } catch (error) {
    console.error('Error saving review to Firestore:', error)
    res.status(500).json({ error: 'Gagal menyimpan review' })
  }
})

app.get('/api/reviews-private/user/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const snapshot = await db.collection('reviews_private')
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc')
      .get()

    if (snapshot.empty) {
      return res.json([])
    }

    const reviews = []
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() })
    })

    res.json(reviews)
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    // Sometimes Firestore requires an index for orderBy and where together
    if (error.message && error.message.includes('index')) {
      res.status(500).json({ error: 'Firestore index required. Check server logs for the URL to create it.' })
    } else {
      res.status(500).json({ error: 'Gagal mengambil riwayat review' })
    }
  }
})

// ==========================================
// USER STATS ROUTE
// ==========================================
app.get('/api/user/stats/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const snapshot = await db.collection('reviews_private')
      .where('user_id', '==', uid)
      .get()

    let total_reviews = 0
    let total_photos = 0
    let hidden_gems_found = 0

    snapshot.forEach(doc => {
      const data = doc.data()
      total_reviews++
      if (data.photo) total_photos++
      // Mock hidden gem logic for now: rating >= 4.3 (or custom logic as requested)
      if (data.rating >= 4.3) hidden_gems_found++
    })

    let verified = false
    try {
      const userRecord = await auth.getUser(uid)
      verified = userRecord.providerData.some(p => p.providerId === 'google.com')
    } catch (e) {
      console.error('Error fetching user auth data:', e)
    }

    res.json({
      total_reviews,
      total_photos,
      hidden_gems_found,
      verified
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'Gagal mengambil statistik pengguna' })
  }
})

// ==========================================
// ADMIN PANEL ROUTES (Firestore)
// ==========================================
app.get('/api/admin/data-quality', adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('reviews_private')
      .where('status', 'in', ['pending', 'flagged'])
      .orderBy('created_at', 'desc')
      .get()

    const reviews = []
    snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }))
    res.json(reviews)
  } catch (error) {
    console.error('Error fetching data-quality:', error)
    if (error.message && error.message.includes('index')) {
      res.status(500).json({ error: 'Firestore index required for status + created_at. Check server console for URL.' })
    } else {
      res.status(500).json({ error: 'Gagal mengambil antrean moderasi' })
    }
  }
})

app.post('/api/admin/reviews/:id/approve', adminAuth, async (req, res) => {
  const { id } = req.params
  try {
    const now = new Date().toISOString()
    await db.collection('reviews_private').doc(id).update({
      status: 'approved',
      used_by_ai: true,
      updated_at: now,
      approved_at: now
    })
    res.json({ message: `Review ${id} approved.` })
  } catch (error) {
    console.error('Error approving review:', error)
    res.status(500).json({ error: 'Gagal menyetujui review' })
  }
})

app.post('/api/admin/reviews/:id/reject', adminAuth, async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  try {
    const now = new Date().toISOString()
    await db.collection('reviews_private').doc(id).update({
      status: 'rejected',
      rejection_reason: reason || 'Tidak sesuai pedoman',
      updated_at: now,
      rejected_at: now
    })
    res.json({ message: `Review ${id} rejected.` })
  } catch (error) {
    console.error('Error rejecting review:', error)
    res.status(500).json({ error: 'Gagal menolak review' })
  }
})

app.get('/api/admin/reviews/approved', adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('reviews_private')
      .where('status', '==', 'approved')
      .orderBy('approved_at', 'desc')
      .get()
    const reviews = []
    snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }))
    res.json(reviews)
  } catch (error) {
    console.error('Error fetching approved reviews:', error)
    res.status(500).json({ error: 'Gagal mengambil daftar review disetujui' })
  }
})

app.get('/api/admin/reviews/rejected', adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('reviews_private')
      .where('status', '==', 'rejected')
      .orderBy('rejected_at', 'desc')
      .get()
    const reviews = []
    snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }))
    res.json(reviews)
  } catch (error) {
    console.error('Error fetching rejected reviews:', error)
    res.status(500).json({ error: 'Gagal mengambil daftar review ditolak' })
  }
})

app.post('/api/admin/reviews/restore', adminAuth, async (req, res) => {
  const { review_id } = req.body
  try {
    await db.collection('reviews_private').doc(review_id).update({
      status: 'pending',
      rejection_reason: null,
      rejected_at: null,
      updated_at: new Date().toISOString()
    })
    res.json({ message: 'Review dikembalikan ke pending' })
  } catch (error) {
    console.error('Error restoring review:', error)
    res.status(500).json({ error: 'Gagal mengembalikan review' })
  }
})

app.post('/api/admin/reviews/permanent', adminAuth, async (req, res) => {
  const { review_ids } = req.body
  if (!Array.isArray(review_ids) || review_ids.length === 0) {
    return res.status(400).json({ error: 'Review IDs wajib berupa array' })
  }
  try {
    const batch = db.batch()
    review_ids.forEach(id => {
      batch.delete(db.collection('reviews_private').doc(id))
    })
    await batch.commit()

    // Security Log
    await db.collection('security-log').add({
      action: 'PERMANENT_DELETE_REVIEWS',
      admin_uid: req.user.uid,
      admin_email: req.user.email,
      count: review_ids.length,
      ids: review_ids,
      timestamp: new Date().toISOString()
    })

    res.json({ message: `${review_ids.length} review dihapus permanen`, deleted_count: review_ids.length })
  } catch (error) {
    console.error('Error permanent deleting reviews:', error)
    res.status(500).json({ error: 'Gagal menghapus review secara permanen' })
  }
})

app.post('/api/admin/users/:uid/ban', adminAuth, async (req, res) => {
  const { uid } = req.params
  try {
    await db.collection('users').doc(uid).set({
      banned: true,
      banned_at: new Date().toISOString()
    }, { merge: true })

    // Revoke sessions
    await auth.revokeRefreshTokens(uid)
    res.json({ message: `User ${uid} banned successfully.` })
  } catch (error) {
    console.error('Error banning user:', error)
    res.status(500).json({ error: 'Gagal melakukan ban user' })
  }
})

app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
  try {
    const [totalSnap, pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
      db.collection('reviews_private').count().get(),
      db.collection('reviews_private').where('status', '==', 'pending').count().get(),
      db.collection('reviews_private').where('status', '==', 'approved').count().get(),
      db.collection('reviews_private').where('status', '==', 'rejected').count().get()
    ])

    // Get today's start ISO string
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySnap = await db.collection('reviews_private')
      .where('created_at', '>=', today.toISOString())
      .count().get()

    res.json({
      total_reviews: totalSnap.data().count,
      pending: pendingSnap.data().count,
      approved: approvedSnap.data().count,
      rejected: rejectedSnap.data().count,
      today_added: todaySnap.data().count,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    if (error.message && error.message.includes('index')) {
      res.status(500).json({ error: 'Firestore index required for created_at. Check server console for URL.' })
    } else {
      res.status(500).json({ error: 'Gagal mengambil statistik dashboard' })
    }
  }
})

// ==========================================
// USER DATA - GDPR HARD DELETE
// ==========================================
app.delete('/api/user/data', verifyToken, async (req, res) => {
  const uid = req.user.uid
  try {
    const snapshot = await db.collection('reviews_private')
      .where('user_id', '==', uid)
      .get()

    if (!snapshot.empty) {
      const batch = db.batch()
      snapshot.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }

    // Also remove any user document
    await db.collection('users').doc(uid).delete().catch(() => { })

    res.json({
      message: `Semua data untuk user ${uid} telah dihapus secara permanen.`,
      deleted_reviews: snapshot.size
    })
  } catch (error) {
    console.error('Error deleting user data:', error)
    res.status(500).json({ error: 'Gagal menghapus data pengguna' })
  }
})

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`LokaLens Backend running on port ${PORT}`)
})
