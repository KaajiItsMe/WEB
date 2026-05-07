/**
 * LokaLens API Utility
 * Connects frontend Vue application to the Express backend.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Enhanced fetch with HTML response detection
 */
async function fetchJSON(url, options = {}) {
  console.log('🚀 Fetching:', url)
  const response = await fetch(url, options)
  const text = await response.text()
  
  try {
    const data = JSON.parse(text)
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`)
    }
    return data
  } catch (e) {
    if (text.includes('<!doctype html>') || text.includes('<html>')) {
      console.error('Expected JSON but received HTML. Possible backend 404 or server error:', text.substring(0, 500))
      throw new Error('Server returned HTML instead of JSON. Pastikan backend (node server/index.js) sedang berjalan di port 3000.')
    }
    throw new Error(text || 'Invalid server response')
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

export const submitPrivateReview = async (placeId, rating, reviewText, photo = null, userId = 'anon_user') => {
  return await fetchJSON(`${API_BASE_URL}/reviews-private`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      place_id: placeId,
      rating,
      review_text: reviewText,
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
