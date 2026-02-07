import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery as useConvexQuery, useMutation } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useGeolocation } from '../hooks/useGeolocation'
import { LocationPermission } from '../components/LocationPermission'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Heart,
  MessageCircle,
  Compass,
  Navigation,
  Users,
} from 'lucide-react'

export const Route = createFileRoute('/discover')({
  component: withOnboardingComplete(Discover),
})

const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
]

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

function DistanceBadge({ distance }: { distance: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
      <MapPin className="w-3 h-3" />
      {formatDistance(distance)}
    </span>
  )
}

function Discover() {
  const { userId } = useAuth()
  const [activeTab, setActiveTab] = useState<'search' | 'nearby'>('nearby')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'services' | 'users'>('all')
  const [category, setCategory] = useState('')
  const [province, setProvince] = useState('')
  const [radius, setRadius] = useState(25)
  const [locationDismissed, setLocationDismissed] = useState(false)

  const geo = useGeolocation()
  const updateLocation = useMutation(api.users.updateUserLocation)

  // Auto-sync location to backend when obtained
  useEffect(() => {
    if (geo.hasLocation && userId) {
      void updateLocation({
        clerkId: userId,
        locationLat: geo.lat!,
        locationLng: geo.lng!,
      })
    }
  }, [geo.hasLocation, geo.lat, geo.lng, userId, updateLocation])

  // Auto-request location if previously granted
  useEffect(() => {
    if (geo.permissionState === 'granted' && !geo.hasLocation && !geo.loading) {
      geo.requestLocation()
    }
  }, [geo.permissionState, geo.hasLocation, geo.loading, geo.requestLocation])

  const nearbyUsers = useConvexQuery(
    api.users.listUsersNearby,
    geo.hasLocation ? { lat: geo.lat!, lng: geo.lng!, radius } : 'skip',
  )
  const nearbyPosts = useConvexQuery(
    api.posts.listPostsNearby,
    geo.hasLocation ? { lat: geo.lat!, lng: geo.lng!, radius } : 'skip',
  )
  const nearbyServices = useConvexQuery(
    api.services.listServicesNearby,
    geo.hasLocation ? { lat: geo.lat!, lng: geo.lng!, radius } : 'skip',
  )

  const posts = useConvexQuery(api.posts.listPosts, {})
  const services = useConvexQuery(api.services.listServices, {})
  const searchedUsers = useConvexQuery(api.search.searchUsers, { searchTerm })

  const commonProvinces = [
    'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay',
    'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes',
    'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
    'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz',
    'Catanduanes', 'Cavite', 'Cebu', 'Cotabato', 'Davao del Norte',
    'Davao del Sur', 'Davao de Oro', 'Davao Occidental', 'Dinagat Islands',
    'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur',
    'Isabela', 'Kalinga', 'Laguna',
    'Lanao del Norte', 'Lanao del Sur', 'La Union', 'Leyte', 'Maguindanao',
    'Marinduque', 'Masbate', 'Mindoro Occidental', 'Mindoro Oriental',
    'Misamis Occidental', 'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
    'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
    'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
    'Rizal', 'Romblon', 'Sarangani', 'Siquijor', 'Sorsogon',
    'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
    'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales',
    'Zamboanga del Norte', 'Zamboanga Sibugay', 'Zamboanga del Sur',
  ]

  const uniqueCategories = services
    ? Array.from(new Set(services.map((s) => s.category)))
    : []

  const filteredResults = (() => {
    const term = searchTerm.toLowerCase()

    const filteredPosts =
      (posts ?? []).filter(
        (p) =>
          p.caption.toLowerCase().includes(term) ||
          p.tags.some((t: string) => t.toLowerCase().includes(term)),
      )

    const filteredServices =
      (services ?? []).filter(
        (s) =>
          (category ? s.category === category : true) &&
          (province ? s.location.includes(province) : true) &&
          (s.title.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term)),
      )

    return {
      posts: filterType === 'all' || filterType === 'posts' ? filteredPosts : [],
      services:
        filterType === 'all' || filterType === 'services' ? filteredServices : [],
      users:
        filterType === 'all' || filterType === 'users' ? (searchedUsers ?? []) : [],
    }
  })()

  const totalResults =
    filteredResults.posts.length +
    filteredResults.services.length +
    filteredResults.users.length

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Discover</h1>
          <p className="text-muted-foreground text-sm mt-1">Find people, posts, and services near you</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/15 rounded-xl mb-6 w-fit animate-fade-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'nearby'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Nearby
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Nearby Tab */}
        {activeTab === 'nearby' && (
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {/* Location Permission CTA */}
            {!geo.hasLocation && !locationDismissed && (
              <LocationPermission
                onEnable={geo.requestLocation}
                onDismiss={() => setLocationDismissed(true)}
                loading={geo.loading}
                denied={geo.permissionState === 'denied'}
              />
            )}

            {/* Radius Filter */}
            {geo.hasLocation && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground font-medium">Radius:</span>
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRadius(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      radius === opt.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted/15 text-muted-foreground hover:text-foreground hover:bg-muted/25'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Nearby Users */}
            {geo.hasLocation && nearbyUsers && nearbyUsers.length > 0 && (
              <section>
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  People Nearby ({nearbyUsers.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyUsers.map((user) => (
                    <Link
                      key={user._id}
                      to="/profile/$userId"
                      params={{ userId: user._id }}
                      className="card-elevated rounded-2xl p-5 block group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-pink flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.fullName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {user.fullName}
                          </div>
                          {user.username && (
                            <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                          )}
                        </div>
                      </div>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{user.bio}</p>
                      )}
                      <DistanceBadge distance={user.distance} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Nearby Posts */}
            {geo.hasLocation && nearbyPosts && nearbyPosts.length > 0 && (
              <section>
                <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
                  Posts Nearby ({nearbyPosts.length})
                </h2>
                <div className="grid gap-4">
                  {nearbyPosts.map((post) => (
                    <Link
                      key={post._id}
                      to="/post/$postId"
                      params={{ postId: post._id as string }}
                      className="card-elevated rounded-2xl p-5 block group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {post.authorAvatar ? (
                              <img src={post.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (post.authorName ?? 'U').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">{post.authorName ?? 'User'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <DistanceBadge distance={post.distance} />
                      </div>
                      <p className="mb-3 whitespace-pre-wrap text-foreground/90 text-[15px] leading-relaxed line-clamp-3">
                        {post.caption}
                      </p>
                      <div className="flex items-center gap-5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Nearby Services */}
            {geo.hasLocation && nearbyServices && nearbyServices.length > 0 && (
              <section>
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  Services Nearby ({nearbyServices.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyServices.map((service) => (
                    <Link
                      key={service._id}
                      to="/service/$serviceId"
                      params={{ serviceId: service._id as string }}
                      className="card-elevated rounded-2xl p-5 block group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                          {service.category}
                        </span>
                        <DistanceBadge distance={service.distance} />
                      </div>
                      <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-primary text-lg">
                          P{service.pricePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span>
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {service.ownerName}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {geo.hasLocation &&
              nearbyUsers !== undefined &&
              nearbyPosts !== undefined &&
              nearbyServices !== undefined &&
              nearbyUsers.length === 0 &&
              nearbyPosts.length === 0 &&
              nearbyServices.length === 0 && (
                <div className="card-warm rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nothing nearby yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Try increasing the radius to discover more</p>
                </div>
              )}

            {/* Loading State */}
            {geo.hasLocation && (nearbyUsers === undefined || nearbyPosts === undefined || nearbyServices === undefined) && (
              <div className="card-warm rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Navigation className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Finding things nearby...</p>
              </div>
            )}

            {/* Dismissed / no location */}
            {!geo.hasLocation && locationDismissed && (
              <div className="card-warm rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Location not enabled</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Enable location to discover nearby content</p>
                <button
                  onClick={() => {
                    setLocationDismissed(false)
                    geo.requestLocation()
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Enable Location
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search & Filters */}
            <div className="card-elevated rounded-2xl p-5 mb-8 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search people, posts, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-warm w-full pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as typeof filterType,
                      )
                    }
                    className="input-warm text-sm py-2"
                  >
                    <option value="all">All</option>
                    <option value="posts">Posts</option>
                    <option value="services">Services</option>
                    <option value="users">People</option>
                  </select>
                </div>

                {filterType === 'all' || filterType === 'services' ? (
                  <>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-warm text-sm py-2"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="input-warm text-sm py-2"
                    >
                      <option value="">All Provinces</option>
                      {commonProvinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
            </div>

            {searchTerm || category || province ? (
              <p className="text-muted-foreground text-sm mb-5 font-medium">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''}
              </p>
            ) : null}

            <div className="space-y-10">
              {/* Posts Section */}
              {filteredResults.posts.length > 0 &&
                (filterType === 'all' || filterType === 'posts') && (
                  <section className="animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
                      Posts ({filteredResults.posts.length})
                    </h2>
                    <div className="grid gap-4">
                      {filteredResults.posts.map((post) => (
                        <Link
                          key={post._id}
                          to="/post/$postId"
                          params={{ postId: post._id as string }}
                          className="card-elevated rounded-2xl p-5 block group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center text-white font-semibold text-sm">
                                {post.userId.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-foreground">User</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="mb-3 whitespace-pre-wrap text-foreground/90 text-[15px] leading-relaxed">
                            {post.caption}
                          </p>
                          <div className="flex items-center gap-5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4" />
                              {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageCircle className="w-4 h-4" />
                              {post.commentsCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* Services Section */}
              {filteredResults.services.length > 0 &&
                (filterType === 'all' || filterType === 'services') && (
                  <section className="animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                    <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                      <Briefcase className="h-5 w-5 text-secondary" />
                      Services ({filteredResults.services.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.services.map((service) => (
                        <Link
                          key={service._id}
                          to="/service/$serviceId"
                          params={{ serviceId: service._id as string }}
                          className="card-elevated rounded-2xl p-5 block group"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                              {service.category}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-bold text-primary text-lg">
                              P{service.pricePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span>
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[120px]">
                                {service.location}
                              </span>
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* People Section */}
              {filteredResults.users.length > 0 &&
                (filterType === 'all' || filterType === 'users') && (
                  <section className="animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
                    <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                      <Users className="h-5 w-5 text-primary" />
                      People ({filteredResults.users.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.users.map((user) => (
                        <Link
                          key={user._id}
                          to="/profile/$userId"
                          params={{ userId: user._id }}
                          className="card-elevated rounded-2xl p-5 block group"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-pink flex items-center justify-center text-white font-semibold text-sm shrink-0">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                user.fullName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {user.fullName}
                              </div>
                              {user.username && (
                                <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                              )}
                            </div>
                          </div>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {totalResults === 0 && (searchTerm || category || province) && (
                <div className="card-warm rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
                </div>
              )}

              {!searchTerm && !category && !province && (
                <div className="card-warm rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Start exploring</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Use the search bar and filters to discover content</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
