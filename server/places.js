import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

// Nearby Search
export async function searchNearby(lat, lng, radius = 5000, type = 'restaurant') {
  const response = await axios.get(`${BASE_URL}/nearbysearch/json`, {
    params: {
      location: `${lat},${lng}`,
      radius: radius,
      type: type,
      key: PLACES_API_KEY
    }
  })
  return response.data.results
}

// Place Details (dengan reviews)
export async function getPlaceDetails(place_id) {
  const response = await axios.get(`${BASE_URL}/details/json`, {
    params: {
      place_id: place_id,
      fields: 'place_id,name,rating,user_ratings_total,reviews,formatted_address,geometry,photos,price_level,opening_hours,types',
      language: 'id',
      key: PLACES_API_KEY
    }
  })
  return response.data.result
}

// Text Search
export async function searchByText(query, lat, lng, extraParams = {}) {
  const response = await axios.get(`${BASE_URL}/textsearch/json`, {
    params: {
      query: query,
      location: `${lat},${lng}`,
      radius: 10000,
      language: 'id',
      key: PLACES_API_KEY,
      ...extraParams
    }
  })
  return response.data.results
}

// Reverse Geocode (koordinat → alamat)
export async function reverseGeocode(lat, lng) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      latlng: `${lat},${lng}`,
      language: 'id',
      key: PLACES_API_KEY
    }
  })
  if (response.data.results.length > 0) {
    return response.data.results[0].formatted_address
  }
  return null
}
