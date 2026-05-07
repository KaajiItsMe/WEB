export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  })
}

export const reverseGeocode = async (lat, lng) => {
  try {
    // Nominatim usage policy requires a unique user agent, but for browser fetch it's usually fine
    // as long as the volume is very low.
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()
    
    // Extract district/city/suburb
    const address = data.address
    const area = address.suburb || address.village || address.city_district || address.town || address.city || address.county
    const city = address.city || address.county || address.state
    
    if (area && city && area !== city) {
      return `${area}, ${city}`
    } else if (area || city) {
      return area || city
    }
    
    return data.display_name.split(',').slice(0, 2).join(', ') // Fallback
  } catch (error) {
    console.error('Reverse geocode error:', error)
    return null
  }
}

export const watchUserLocation = (callback) => {
  if (!('geolocation' in navigator)) {
    console.error('Geolocation is not supported by your browser')
    return null
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }, null)
    },
    (error) => {
      callback(null, error)
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )

  return watchId
}

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}
