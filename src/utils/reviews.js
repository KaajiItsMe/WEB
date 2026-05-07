/**
 * LokaLens Reviews Utility
 * Wrapper for API calls to backend review system.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const submitPrivateReview = async (placeId, rating, reviewText, photo = null, userId = 'anon_user') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews-private`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        place_id: placeId,
        rating,
        review_text: reviewText,
        photo,
        user_id: userId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Gagal menyimpan review')
    }

    return await response.json()
  } catch (error) {
    console.error('submitPrivateReview Error:', error)
    throw error
  }
}

export const getUserReviews = async (uid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews-private/user/${uid}`)
    
    if (!response.ok) {
      throw new Error('Gagal mengambil riwayat review')
    }

    return await response.json()
  } catch (error) {
    console.error('getUserReviews Error:', error)
    throw error
  }
}
