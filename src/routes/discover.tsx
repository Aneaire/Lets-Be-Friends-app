import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { Search, Filter, MapPin, Briefcase } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Discover</h1>

        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value as typeof filterType
                  )
                }
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          <p className="text-muted-foreground mb-4">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        ) : null}

        <div className="space-y-8">
          {filteredResults.posts.length > 0 &&
            (filterType === 'all' || filterType === 'posts') && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Posts ({filteredResults.posts.length})
                </h2>
                <div className="grid gap-4">
                  {filteredResults.posts.map((post) => (
                    <Link
                      key={post._id}
                      to="/post/$postId"
                      params={{ postId: post._id as string }}
                      className="bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer block"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                            {post.userId.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold">User</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mb-4 whitespace-pre-wrap">
                        {post.caption}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.likesCount} Likes</span>
                        <span>{post.commentsCount} Comments</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          {filteredResults.services.length > 0 &&
            (filterType === 'all' || filterType === 'services') && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services ({filteredResults.services.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.services.map((service) => (
                    <Link
                      key={service._id}
                      to="/service/$serviceId"
                      params={{ serviceId: service._id as string }}
                      className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer block"
                    >
                      <h3 className="font-semibold mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          ₱{service.pricePerHour}/hr
                        </span>
                        <span className="text-muted-foreground">
                          {service.category}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {service.location}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          {totalResults === 0 && (searchTerm || category || province) && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No results found. Try adjusting your search or filters.</p>
            </div>
          )}

          {!searchTerm && !category && !province && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Use the search bar and filters to discover content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
