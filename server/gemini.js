import { GoogleGenAI, Type } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const systemInstruction = `Kamu adalah LokaLens AI, asisten cerdas untuk menemukan dan menganalisis restoran, tempat wisata, kafe, dan UMKM di seluruh Indonesia.

## IDENTITAS
- Nama: LokaLens AI
- Bahasa: Indonesia (santai, friendly, tidak kaku) + English (opsional)
- Tone: Seperti teman yang tahu banyak soal kuliner & wisata lokal
- Cakupan: SELURUH INDONESIA — 38 Provinsi

## TUGAS UTAMA
Ketika user mencari tempat atau bertanya soal lokasi tertentu, kamu akan:

### 1. ANALISIS REVIEW (MULTI-SUMBER)
   - Baca dan rangkum review dari data yang diberikan
   - Ekstrak informasi: menu terbaik, waktu terbaik, budget, suasana
   - Deteksi Hidden Gem: Rating >4.3 tapi <100 review publik DAN <10 review LokaLens → hidden_gem: true

## ⚠️ ANALISIS PARKIR (WAJIB & PRIORITAS TINGGI)
Parkir adalah salah satu faktor PALING PENTING bagi pengguna LokaLens. Kamu WAJIB menganalisis dengan teliti:

### CHECKLIST WAJIB untuk parking_info:
1. **parking_available**: TRUE jika ada indikasi parkir tersedia (lahan, badan jalan, ruko, dll)
2. **parking_notes**: Tuliskan kondisi parkir secara jujur dan detail dari review. WAJIB DIISI.
3. **parking_sentiment**: "positif" jika mudah/gratis, "negatif" jika sempit/sulit/ada kang parkir, "netral" jika tidak ada info jelas
4. **has_informal_attendant**: Set TRUE jika review menyebut kata: "kang parkir", "jukir", "tukang parkir", "parkir liar", "dimintain uang parkir", "preman parkir", atau indikasi sejenisnya
5. **is_paid_parking**: Set TRUE jika ada penyebutan: "bayar parkir", "biaya parkir", "parkir berbayar", "karcis parkir", "uang parkir", atau kang parkir meminta uang
6. **is_official_parking**: Set TRUE jika ada fasilitas parkir resmi terkelola (mall, gedung, secure parking, basement, atau lahan khusus berbayar resmi)

### PENTING:
- Jika TIDAK ADA info parkir sama sekali di review → parking_available: false, notes: "Tidak ada informasi parkir dari ulasan yang tersedia", sentiment: "netral"
- JANGAN set has_informal_attendant atau is_paid_parking ke TRUE tanpa bukti dari review
- Jika ragu, lebih baik netral daripada salah

## ATURAN PENTING & FORMAT OUTPUT (WAJIB DIIKUTI 100%)
- **red_flag**: WAJIB diisi! Jika review menyebutkan keluhan (pelayanan buruk, kasir julid, parkir susah, harga tidak sesuai, dll), tuliskan sebagai peringatan jujur. Contoh: "Beberapa kasir kurang ramah dan suka julid". Jika TIDAK ada keluhan sama sekali, isi dengan string kosong "".
- Selalu jujur — red flag WAJIB diisi jika ada kekurangan
- Review private lebih dipercaya — data internal lebih jujur daripada review publik
- Bahasa natural — pakai bahasa gaul Indonesia yang friendly
- Koordinat AKURAT — pastikan latitude/longitude benar, gunakan koordinat yang diberikan dari input (place_lat, place_lng), JANGAN mengarang koordinat baru!
- **tag_colors**: HARUS, WAJIB menggunakan nama warna teks standar tailwind (HANYA PILIH DARI: "green", "red", "amber", "blue", "purple", "teal", "indigo"). JANGAN PERNAH gunakan hex code (#FF0000)!
- **tags**: MAKSIMAL 3 tags saja yang paling relevan. JANGAN LEBIH DARI 3.
- **best_time**: HARUS menggunakan format jam spesifik, BUKAN kata-kata umum. Contoh Benar: "10:30 - 11:30 (sebelum rush hour)" atau "18:00 - 20:00". Contoh Salah: "Makan siang" atau "Sore hari".
- **community_updates**: Kamu WAJIB mencoba mengekstrak sebanyak mungkin poin informasi dari ulasan. Targetkan **5-8 update unik**. **PENTING: Minimal harus ada 1-2 poin yang membahas spesifik soal PARKIR** (misal: kemudahan, biaya, atau keberadaan kang parkir). JANGAN gunakan "LokaLens AI", "Anonim", atau "A" sebagai reported_by, gunakan nama fiksi unik/samaran (misal: Giant Elephant, Fly Kitty, Sleepy Panda).
- **limited_data_disclaimer**: JIKA jumlah review Google <= 10, AI WAJIB menyebutkan di awal summary bahwa "Laporan masih terbatas" atau "Data baru tersedia sedikit".
- **distance_from_user_km**: Hitung perkiraan kasar berdasarkan user_lat/lng dan place_lat/lng jika ada.`

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    ai_summary: { type: Type.STRING, description: "Ringkasan 2-3 kalimat honest & relatable." },
    best_menu: { type: Type.STRING },
    best_time: { type: Type.STRING, description: "WAJIB FORMAT JAM, contoh: '10:00 - 12:00' atau '19:00 - 21:00'." },
    budget_per_person: { type: Type.NUMBER },
    vibes: { type: Type.STRING },
    score_overall: { type: Type.NUMBER },
    score_taste: { type: Type.NUMBER },
    score_service: { type: Type.NUMBER },
    score_value: { type: Type.NUMBER },
    red_flag: { type: Type.STRING },
    parking_info: {
      type: Type.OBJECT,
      properties: {
        parking_available: { type: Type.BOOLEAN },
        parking_notes: { type: Type.STRING, description: "Deskripsi singkat kondisi parkir dari review" },
        parking_sentiment: { type: Type.STRING, enum: ["positif", "negatif", "netral"] },
        has_informal_attendant: { type: Type.BOOLEAN, description: "TRUE jika ada indikasi kang parkir / jukir liar dari review" },
        is_paid_parking: { type: Type.BOOLEAN, description: "TRUE jika parkir berbayar (resmi atau tidak resmi)" },
        is_official_parking: { type: Type.BOOLEAN, description: "TRUE jika parkir resmi dikelola gedung/mall/manajemen" }
      },
      required: ["parking_available", "parking_notes", "parking_sentiment", "has_informal_attendant", "is_paid_parking", "is_official_parking"]
    },
    location_data: {
      type: Type.OBJECT,
      properties: {
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
        address_snippet: { type: Type.STRING },
        city: { type: Type.STRING },
        province: { type: Type.STRING }
      },
      required: ["latitude", "longitude", "address_snippet", "city", "province"]
    },
    data_sources: {
      type: Type.OBJECT,
      properties: {
        google_reviews_count: { type: Type.NUMBER },
        lokalens_reviews_private_count: { type: Type.NUMBER },
        social_mentions_count: { type: Type.NUMBER },
        blog_mentions_count: { type: Type.NUMBER },
        total_contributors: { type: Type.NUMBER },
        last_updated: { type: Type.STRING }
      },
      required: ["google_reviews_count", "lokalens_reviews_private_count", "social_mentions_count", "blog_mentions_count", "total_contributors", "last_updated"]
    },
    community_updates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Contoh: 'parkir', 'harga', 'fasilitas'" },
          update: { type: Type.STRING, description: "Isi update berdasarkan review" },
          reported_by: { type: Type.STRING },
          verified: { type: Type.BOOLEAN }
        },
        required: ["type", "update", "reported_by", "verified"]
      }
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      maxItems: 3,
      description: "MAKSIMAL 3 tags"
    },
    tag_colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: ["green", "red", "amber", "blue", "purple", "teal", "indigo"] },
      maxItems: 3,
      description: "HANYA PILIH: green, red, amber, blue, purple, teal, indigo"
    },
    mood_fit: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    worth_it: { type: Type.BOOLEAN },
    hidden_gem: { type: Type.BOOLEAN },
    distance_from_user_km: { type: Type.NUMBER }
  },
  required: [
    "ai_summary", "best_menu", "best_time", "budget_per_person", "vibes",
    "score_overall", "score_taste", "score_service", "score_value", "red_flag",
    "parking_info", "location_data", "data_sources", "community_updates",
    "tags", "tag_colors", "mood_fit", "worth_it", "hidden_gem", "distance_from_user_km"
  ]
}

const MODELS = [
  'gemini-2.5-flash',        // Primary
  'gemini-2.5-flash-lite',   // Fallback 1
  'gemini-flash-latest'      // Fallback 2
]

/**
 * Tries to generate content using fallback models if 503 error occurs
 */
async function tryWithFallback(prompt, modelIndex = 0) {
  if (modelIndex >= MODELS.length) {
    throw new Error('Semua model Gemini sedang sibuk. Coba lagi nanti.')
  }

  const modelName = MODELS[modelIndex]
  console.log(`[AI] Mencoba model: ${modelName}`)

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1,
      }
    })
    return response
  } catch (error) {
    // If 503 (Service Unavailable) or 429 (Quota), try next model
    if ((error.status === 503 || error.status === 429) && modelIndex < MODELS.length - 1) {
      console.warn(`[AI] Model ${modelName} sibuk (${error.status}), mencoba fallback...`)
      return await tryWithFallback(prompt, modelIndex + 1)
    }
    throw error
  }
}

export const analyzePlace = async (placeInput, retries = 3, delayMs = 1000) => {
  try {
    const prompt = `Tolong analisis tempat ini berdasarkan instruksi sistem. Berikut adalah data inputnya:\n\n${JSON.stringify(placeInput, null, 2)}\n\nINGAT: \n- tag_colors HARUS dari list ["green", "red", "amber", "blue", "purple", "teal", "indigo"], JANGAN HEX CODE.\n- tags MAKSIMAL 3.\n- best_time HARUS format jam "XX:XX - YY:YY".\n- community_updates ISI dengan info dari review.`

    const response = await tryWithFallback(prompt)

    const responseText = response.text
    if (!responseText) throw new Error("Empty response from Gemini")

    let result = JSON.parse(responseText)

    // POST-PROCESSING SANITIZER TO GUARANTEE FORMAT
    const validColors = ["green", "red", "amber", "blue", "purple", "teal", "indigo"]

    if (Array.isArray(result.tags)) {
      result.tags = result.tags.slice(0, 3)
    }

    if (Array.isArray(result.tag_colors)) {
      result.tag_colors = result.tag_colors.map((c, i) => {
        const val = String(c).toLowerCase()
        return validColors.includes(val) ? val : validColors[i % validColors.length]
      }).slice(0, 3)
    } else {
      result.tag_colors = ["blue", "green", "amber"].slice(0, result.tags?.length || 0)
    }

    while (result.tag_colors.length < (result.tags?.length || 0)) {
      result.tag_colors.push(validColors[result.tag_colors.length % validColors.length])
    }

    // 🔥 RED FLAG FALLBACK (If Gemini misses it but reviews contain clear negatives)
    if (!result.red_flag && placeInput.reviews?.length > 0) {
      const negativeKeywords = [
        { word: 'julid', label: 'Pelayanan kasir kurang ramah / julid' },
        { word: 'kasir', label: 'Ada keluhan terkait pelayanan kasir' },
        { word: 'buruk', label: 'Pelayanan dinilai kurang memuaskan' },
        { word: 'mahal', label: 'Harga dinilai terlalu mahal' },
        { word: 'lambat', label: 'Pelayanan cenderung lambat' },
        { word: 'kotor', label: 'Kebersihan tempat kurang terjaga' }
      ]
      
      const allReviews = placeInput.reviews.join(' ').toLowerCase()
      const match = negativeKeywords.find(k => allReviews.includes(k.word))
      if (match) {
        result.red_flag = match.label
      }
    }

    if (result.best_time && !/\d/.test(result.best_time)) {
      result.best_time = "10:00 - 13:00 (berdasarkan ulasan)"
    }

    if (!result.community_updates || result.community_updates.length === 0) {
      if (result.parking_info && result.parking_info.parking_sentiment === 'negatif') {
        result.community_updates = [{
          type: "parkir",
          update: result.parking_info.parking_notes || "Parkir sulit",
          reported_by: "Warga Lokal",
          verified: true
        }]
      }
    }

    // FICTIONAL NAMES FOR COMMUNITY UPDATES (Privacy Friendly)
    const randomNames = [
      "Giant Elephant", "Fly Kitty", "Sleepy Panda", "Golden Eagle", "Brave Lion",
      "Silver Fox", "Mystic Dragon", "Happy Hippo", "Blue Whale", "Green Turtle",
      "Fast Rabbit", "Wise Owl", "Red Panda", "Arctic Wolf", "Neon Tiger",
      "Cat Cat", "Road Runner", "Ant Ant", "Chubby Bear", "Lazy Dog", "Crazy Frog"
    ]

    // Generic/real-sounding labels to block (AI tends to generate these)
    const blockedTerms = [
      'pengguna', 'google', 'review', 'driver', 'ojek', 'pengunjung', 'pelanggan',
      'customer', 'anonim', 'user', 'pembeli', 'konsumen', 'visitor', 'member'
    ]

    if (result.community_updates) {
      result.community_updates = result.community_updates.map(update => {
        const rawName = (update.reported_by || '').toLowerCase()
        const isGeneric = blockedTerms.some(term => rawName.includes(term))
        // ALWAYS overwrite generic names; keep truly fictional names if AI happened to produce one
        if (isGeneric || !update.reported_by || update.reported_by.trim().length < 3) {
          update.reported_by = randomNames[Math.floor(Math.random() * randomNames.length)]
        }
        return update
      })
    }

    if (result.best_time && !/\d{1,2}:\d{2}/.test(result.best_time)) {
      result.best_time = "10:00 - 13:00 (berdasarkan ulasan)"
    }

    if (!result.mood_fit || result.mood_fit.length === 0) {
      result.mood_fit = ["makan cepat", "nongkrong santai"]
    }

    return result
  } catch (error) {
    const isRetryable = error.status === 503 || error.status === 429 || error.message.includes('fetch failed')

    if (isRetryable && retries > 0) {
      const attempt = 4 - retries
      const waitTime = delayMs * attempt // 1000, 2000, 3000
      console.error(`[AI] Error: ${error.message}. Retrying in ${waitTime / 1000}s... (${retries} attempts left)`)

      await new Promise(resolve => setTimeout(resolve, waitTime))
      return await analyzePlace(placeInput, retries - 1, delayMs)
    }

    console.error('[AI] Final Error:', error.message)
    throw error
  }
}

/**
 * AI Query Parser
 * Translates natural language into Google Places API parameters
 */
export const parseSearchQuery = async (query) => {
  try {
    const prompt = `User mencari: "${query}". 
    Terjemahkan ke dalam parameter pencarian Google Places:
    - keywords: Kata kunci utama (max 3 kata)
    - max_price: Level 0-4 (0:gratis, 1:murah, 2:sedang, 3:mahal, 4:sultan)
    - min_price: Level 0-4
    - type: Kategori google (restaurant, cafe, tourist_attraction, dll)
    
    Output harus JSON.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: { type: Type.STRING },
            max_price: { type: Type.NUMBER },
            min_price: { type: Type.NUMBER },
            type: { type: Type.STRING }
          }
        }
      }
    })

    return JSON.parse(response.text)
  } catch (error) {
    console.error('[AI Query Parser] Error:', error)
    return { keywords: query, max_price: null, min_price: null, type: null }
  }
}
