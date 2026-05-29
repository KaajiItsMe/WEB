/**
 * LokaLens API Utility
 * Connects frontend Vue application to the Express backend.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lokalens-backend-475607089587.asia-southeast2.run.app/api'

/**
 * Enhanced fetch with HTML response detection
 */
async function fetchJSON(url, options = {}) {
  console.log('🚀 Fetching:', url)
  try {
    const response = await fetch(url, options)
    const text = await response.text()

    // Specific Status Handling
    if (response.status === 429) {
      throw new Error('Terlalu banyak permintaan (Rate Limit). Tunggu sebentar (15 menit) sebelum mencoba lagi.')
    }

    if (response.status === 403) {
      throw new Error('Akses ditolak (Forbidden). Pastikan Anda memiliki izin yang benar.')
    }

    try {
      const data = JSON.parse(text)
      if (!response.ok) {
        throw new Error(data.error || data.message || `Server error: ${response.status}`)
      }
      return data
    } catch (e) {
      // If it's a parse error, check if it's actually HTML (server error page)
      if (text.includes('<!doctype html>') || text.includes('<html>')) {
        console.error('Backend HTML response:', text.substring(0, 500))
        throw new Error('Backend sedang bermasalah atau sedang restart. Silakan refresh halaman dalam beberapa saat.')
      }
      // Re-throw if it's already our custom error
      if (e.message.includes('Server error') || e.message.includes('Rate Limit')) throw e
      
      throw new Error(text || `Error ${response.status}: Respon server tidak valid`)
    }
  } catch (e) {
    // Network errors (CORS block, server down, etc.)
    if (e.message === 'Failed to fetch' || e.message.includes('NetworkError')) {
      throw new Error('Gagal terhubung ke server. Periksa koneksi internet atau pastikan backend sedang berjalan.')
    }
    throw e
  }
}

// ==========================
// PLACES API CALLS
// ==========================

export async function fetchNearbyPlaces(lat, lng, radius = 5000, type = 'restaurant') {
  const url = `${API_BASE_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`
  return await fetchJSON(url)
}

export async function fetchPlaceDetails(placeId) {
  const url = `${API_BASE_URL}/places/details/${placeId}`
  return await fetchJSON(url)
}

export async function searchPlaces(query, lat, lng) {
  const url = `${API_BASE_URL}/places/search?query=${query}&lat=${lat}&lng=${lng}`
  return await fetchJSON(url)
}

export async function fetchParkingBatch(placeIds = []) {
  if (!placeIds.length) return {}
  const ids = placeIds.join(',')
  return await fetchJSON(`${API_BASE_URL}/places/parking-batch?place_ids=${ids}`)
}

export async function reverseGeocode(lat, lng) {
  const url = `${API_BASE_URL}/places/reverse-geocode?lat=${lat}&lng=${lng}`
  return await fetchJSON(url)
}

// ==========================
// GEMINI AI CALLS
// ==========================

export const analyzePlace = async (placeInputData) => {
  return await fetchJSON(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(placeInputData)
  })
}

// ==========================
// REVIEWS & USER API
// ==========================

export const submitPrivateReview = async (
  placeId,
  rating,
  reviewText,
  parkingType,
  parkingNotes = null,
  photo = null,
  userId = 'anon_user'
) => {
  return await fetchJSON(`${API_BASE_URL}/reviews-private`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      place_id: placeId,
      rating,
      review_text: reviewText,
      parking_type: parkingType,
      parking_notes: parkingNotes,
      photo,
      user_id: userId
    })
  })
}

export const getUserReviews = async (uid, token) => {
  const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
  return await fetchJSON(`${API_BASE_URL}/reviews-private/user/${uid}`, { headers })
}

export const getUserStats = async (uid) => {
  return await fetchJSON(`${API_BASE_URL}/user/stats/${uid}`)
}

export const deleteUserData = async (token) => {
  return await fetchJSON(`${API_BASE_URL}/user/data`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
}

// ==========================
// ADMIN API CALLS
// ==========================
const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const getAdminDashboard = async (token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/dashboard`, {
    headers: getAuthHeaders(token)
  })
}

export const getModerationQueue = async (token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/data-quality`, {
    headers: getAuthHeaders(token)
  })
}

export const approveReview = async (id, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  })
}

export const rejectReview = async (id, reason, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ reason })
  })
}

export const getApprovedReviews = async (token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/approved`, {
    headers: getAuthHeaders(token)
  })
}

export const getRejectedReviews = async (token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/rejected`, {
    headers: getAuthHeaders(token)
  })
}

export const restoreReview = async (id, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/restore`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ review_id: id })
  })
}

export const deletePermanentReviews = async (ids, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/reviews/permanent`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ review_ids: ids })
  })
}

export const getParkingHistory = async (placeId, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/parking-history/${placeId}`, {
    headers: getAuthHeaders(token)
  })
}

export const verifyParking = async (data, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/parking-verify`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  })
}

export const removeParkingVerification = async (placeId, token) => {
  return await fetchJSON(`${API_BASE_URL}/admin/parking-verify/${placeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
}

export const deleteUserReview = async (id, token) => {
  return await fetchJSON(`${API_BASE_URL}/reviews-private/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
}
