import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { Search, SlidersHorizontal, MapPin, Briefcase, Heart, MessageCircle, Compass } from 'lucide-react'

export const Route = createFileRoute('/discover')({
  component: withOnboardingComplete(Discover),
})

function Discover() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'services'>('all')
  const [category, setCategory] = useState('')
  const [province, setProvince] = useState('')

  const posts = useConvexQuery(api.posts.listPosts, {})
  const services = useConvexQuery(api.services.listServices, {})

  const commonProvinces = [
    'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay',
    'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes',
    'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
    'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz',
    'Catanduanes', 'Cavite', 'Cebu', 'Cotabato', 'Davao del Norte',
    'Davao del Sur', 'Davao de Oro', 'Davao Occidental', 'Dinagat Islands',
    'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur',
    'Ilocos Norte', 'Ilocos Sur', 'Isabela', 'Kalinga', 'Laguna',
    'Lanao del Norte', 'Lanao del Sur', 'La Union', 'Leyte', 'Maguindanao',
    'Marinduque', 'Masbate', 'Mindoro Occidental', 'Mindoro Oriental',
    'Misamis Occidental', 'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
    'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
    'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
    'Rizal', 'Romblon', 'Sarangani', 'Siquijor', 'Sorsogon',
    'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
    'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zambales Norte',
    'Zambales del Sur', 'Zamboanga del Norte', 'Zamboanga Sibugay',
    'Zamboanga del Sur',
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
          p.tags.some((t: string) => t.toLowerCase().includes(term))
      )

    const filteredServices =
      (services ?? []).filter(
        (s) =>
          (category ? s.category === category : true) &&
          (province ? s.location.includes(province) : true) &&
          (s.title.toLowerCase().includes(term) ||
            s.description.toLowerCase().includes(term))
      )

    return {
      posts: filterType === 'all' || filterType === 'posts' ? filteredPosts : [],
      services:
        filterType === 'all' || filterType === 'services' ? filteredServices : [],
    }
  })()

  const totalResults =
    filteredResults.posts.length +
    filteredResults.services.length

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Discover</h1>
          <p className="text-muted-foreground text-sm mt-1">Find people, posts, and services near you</p>
        </div>

        {/* Search & Filters */}
        <div className="card-elevated rounded-2xl p-5 mb-8 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts or services..."
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
                    e.target.value as typeof filterType
                  )
                }
                className="input-warm text-sm py-2"
              >
                <option value="all">All</option>
                <option value="posts">Posts</option>
                <option value="services">Services</option>
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
                          ₱{service.pricePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span>
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
      </div>
    </div>
  )
}
