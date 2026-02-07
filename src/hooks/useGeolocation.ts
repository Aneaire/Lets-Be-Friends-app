import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  loading: boolean
  error: string | null
  permissionState: PermissionState | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
    permissionState: null,
  })

  // Check cached location on mount
  useEffect(() => {
    const cached = localStorage.getItem('lbf-geolocation')
    if (cached) {
      try {
        const { lat, lng } = JSON.parse(cached)
        setState((s) => ({ ...s, lat, lng }))
      } catch {
        // ignore
      }
    }

    // Check permission state
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState((s) => ({ ...s, permissionState: result.state }))
        result.addEventListener('change', () => {
          setState((s) => ({ ...s, permissionState: result.state }))
        })
      })
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser' }))
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        localStorage.setItem('lbf-geolocation', JSON.stringify({ lat, lng }))
        setState({ lat, lng, loading: false, error: null, permissionState: 'granted' })
      },
      (err) => {
        let error = 'Unable to get location'
        if (err.code === err.PERMISSION_DENIED) {
          error = 'Location permission denied'
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          error = 'Location unavailable'
        } else if (err.code === err.TIMEOUT) {
          error = 'Location request timed out'
        }
        setState((s) => ({ ...s, loading: false, error, permissionState: err.code === err.PERMISSION_DENIED ? 'denied' : s.permissionState }))
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  return {
    ...state,
    requestLocation,
    hasLocation: state.lat !== null && state.lng !== null,
  }
}
