import { MapPin, Navigation, ShieldOff } from 'lucide-react'

interface LocationPermissionProps {
  onEnable: () => void
  onDismiss: () => void
  loading?: boolean
  denied?: boolean
}

export function LocationPermission({ onEnable, onDismiss, loading, denied }: LocationPermissionProps) {
  if (denied) {
    return (
      <div className="card-warm rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-muted/20 flex items-center justify-center shrink-0">
            <ShieldOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1">Location access denied</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To see nearby people, posts, and services, enable location access in your browser settings, then refresh the page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-foreground mb-1">Discover what's nearby</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Enable location to find friends, posts, and services near you. Your location is only shared with people you choose.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onEnable}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <MapPin className="w-4 h-4" />
              {loading ? 'Getting location...' : 'Enable Location'}
            </button>
            <button
              onClick={onDismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
