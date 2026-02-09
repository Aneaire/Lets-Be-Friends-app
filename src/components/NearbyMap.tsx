import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from '@tanstack/react-router'
import { Heart, MessageCircle } from 'lucide-react'

function makeIcon(color: string, size = 12) {
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25);"></div>`,
  })
}

const ICONS = {
  user: makeIcon('#c1519c', 14),
  post: makeIcon('#e088c0', 12),
  service: makeIcon('#1093ed', 14),
  self: makeIcon('#3b82f6', 16),
}

interface NearbyUser {
  _id: string
  fullName: string
  username?: string
  avatarUrl?: string
  bio?: string
  distance: number
  locationLat?: number
  locationLng?: number
}

interface NearbyPost {
  _id: string
  caption: string
  authorName?: string
  authorAvatar?: string
  authorLat?: number
  authorLng?: number
  distance: number
  likesCount: number
  commentsCount: number
}

interface NearbyService {
  _id: string
  title: string
  description: string
  category: string
  pricePerHour: number
  ownerName?: string
  ownerLat?: number
  ownerLng?: number
  distance: number
}

interface NearbyMapProps {
  lat: number
  lng: number
  radius: number
  users: NearbyUser[]
  posts: NearbyPost[]
  services: NearbyService[]
}

function MapUpdater({ lat, lng, radius }: { lat: number; lng: number; radius: number }) {
  const map = useMap()
  useEffect(() => {
    const zoom = radius <= 1 ? 15 : radius <= 5 ? 13 : radius <= 10 ? 12 : radius <= 25 ? 11 : 10
    map.setView([lat, lng], zoom, { animate: true })
  }, [map, lat, lng, radius])
  return null
}

export function NearbyMap({ lat, lng, radius, users, posts, services }: NearbyMapProps) {
  const zoom = useMemo(() => {
    if (radius <= 1) return 15
    if (radius <= 5) return 13
    if (radius <= 10) return 12
    if (radius <= 25) return 11
    return 10
  }, [radius])

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 'clamp(350px, 60vh, 550px)' }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={lat} lng={lng} radius={radius} />

        {/* Radius circle */}
        <Circle
          center={[lat, lng]}
          radius={radius * 1000}
          pathOptions={{ color: '#c1519c', fillColor: '#c1519c', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' }}
        />

        {/* Self marker */}
        <Marker position={[lat, lng]} icon={ICONS.self}>
          <Popup>
            <div className="font-semibold text-sm">Your location</div>
          </Popup>
        </Marker>

        {/* User markers */}
        {users.map((user) =>
          user.locationLat && user.locationLng ? (
            <Marker key={`u-${user._id}`} position={[user.locationLat, user.locationLng]} icon={ICONS.user}>
              <Popup>
                <div className="min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-pink flex items-center justify-center text-white text-[10px] font-semibold">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm leading-tight">{user.fullName}</div>
                      {user.username && <div className="text-[11px] text-muted-foreground">@{user.username}</div>}
                    </div>
                  </div>
                  {user.bio && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{user.bio}</p>}
                  <Link to="/profile/$userId" params={{ userId: user._id }} className="text-[11px] text-primary font-medium mt-1.5 inline-block hover:underline">
                    View profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}

        {/* Post markers */}
        {posts.map((post) =>
          post.authorLat && post.authorLng ? (
            <Marker key={`p-${post._id}`} position={[post.authorLat, post.authorLng]} icon={ICONS.post}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="text-[11px] text-muted-foreground mb-0.5">{post.authorName ?? 'User'}</div>
                  <p className="text-sm line-clamp-3 leading-snug">{post.caption}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likesCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount}</span>
                  </div>
                  <Link to="/post/$postId" params={{ postId: post._id as string }} className="text-[11px] text-primary font-medium mt-1.5 inline-block hover:underline">
                    View post
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}

        {/* Service markers */}
        {services.map((service) =>
          service.ownerLat && service.ownerLng ? (
            <Marker key={`s-${service._id}`} position={[service.ownerLat, service.ownerLng]} icon={ICONS.service}>
              <Popup>
                <div className="min-w-[180px]">
                  <span className="text-[10px] font-medium text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">{service.category}</span>
                  <div className="font-semibold text-sm mt-1">{service.title}</div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{service.description}</p>
                  <div className="font-semibold text-primary text-sm mt-1">P{service.pricePerHour}<span className="text-[10px] text-muted-foreground font-normal">/hr</span></div>
                  <Link to="/service/$serviceId" params={{ serviceId: service._id as string }} className="text-[11px] text-primary font-medium mt-1 inline-block hover:underline">
                    View service
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>
    </div>
  )
}
