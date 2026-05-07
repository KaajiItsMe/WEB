/**
 * LokaLens Maps Utility
 * Assembles URLs for navigation outside of AI context to ensure accuracy.
 */

export const buildMapsUrl = (lat, lng, address = '') => {
  const query = address ? encodeURIComponent(address) : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export const buildDirectionsUrl = (lat, lng) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export const buildWazeUrl = (lat, lng) => {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

export const detectMobileOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  if (/android/i.test(userAgent)) {
    return 'android'
  }
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios'
  }
  return 'desktop'
}

export const openNavigation = (lat, lng, address = '') => {
  const os = detectMobileOS()
  let url = ''

  if (os === 'android' || os === 'ios') {
    // Attempt deep link or universal link for directions
    url = buildDirectionsUrl(lat, lng)
  } else {
    // Desktop fallback
    url = buildMapsUrl(lat, lng, address)
  }

  window.open(url, '_blank')
}
