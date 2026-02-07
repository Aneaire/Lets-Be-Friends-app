import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { withOnboardingComplete } from '../../lib/auth'
import { Search, SlidersHorizontal, MapPin, Briefcase, ArrowUpDown } from 'lucide-react'
import ServiceCard from '../../components/ServiceCard'

export const Route = createFileRoute('/services/')({
  component: withOnboardingComplete(ServicesPage),
})

const CATEGORIES = [
  'Tutoring & Education',
  'Music & Arts',
  'Fitness & Sports',
  'Tech & IT Support',
  'Home Services',
  'Photography & Video',
  'Beauty & Wellness',
  'Cooking & Food',
  'Language & Translation',
  'Other',
]

const PROVINCES = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay',
  'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes',
  'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan',
  'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz',
  'Catanduanes', 'Cavite', 'Cebu', 'Cotabato', 'Davao del Norte',
  'Davao del Sur', 'Davao de Oro', 'Davao Occidental', 'Dinagat Islands',
  'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur',
  'Isabela', 'Kalinga', 'Laguna', 'Lanao del Norte', 'Lanao del Sur',
  'La Union', 'Leyte', 'Maguindanao', 'Marinduque', 'Masbate',
  'Mindoro Occidental', 'Mindoro Oriental', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
  'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
  'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
  'Rizal', 'Romblon', 'Sarangani', 'Siquijor', 'Sorsogon',
  'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu',
  'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi',
  'Zambales', 'Zamboanga del Norte', 'Zamboanga Sibugay', 'Zamboanga del Sur',
]

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating'

function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [province, setProvince] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const services = useConvexQuery(api.services.listServices, {
    category: selectedCategory || undefined,
    location: province || undefined,
  })

  const filteredAndSorted = useMemo(() => {
    if (!services) return null

    const term = searchTerm.toLowerCase()
    let result = services.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.tags.some((t: string) => t.toLowerCase().includes(term))
    )

    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'price-asc':
        result = [...result].sort((a, b) => a.pricePerHour - b.pricePerHour)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.pricePerHour - a.pricePerHour)
        break
    }

    return result
  }, [services, searchTerm, sortBy])

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-3 mb-1">
            <Briefcase className="h-7 w-7 text-primary" />
            <h1 className="font-heading text-3xl font-bold text-foreground">Services</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1 ml-10">
            Browse and discover services offered by the community
          </p>
        </div>

        {/* Search and Filters */}
        <div
          className="card-elevated rounded-2xl p-5 mb-8 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-warm w-full pl-10"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-warm text-sm py-2"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="input-warm text-sm py-2"
              >
                <option value="">All Provinces</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-warm text-sm py-2"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === ''
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {filteredAndSorted && (
          <p
            className="text-muted-foreground text-sm mb-5 font-medium animate-fade-up"
            style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
          >
            {filteredAndSorted.length} service{filteredAndSorted.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Loading state */}
        {!services && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elevated rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-muted/30" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted/30 rounded w-3/4" />
                  <div className="h-3 bg-muted/20 rounded w-full" />
                  <div className="h-3 bg-muted/20 rounded w-2/3" />
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-6 h-6 rounded-full bg-muted/30" />
                    <div className="h-3 bg-muted/20 rounded w-20" />
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <div className="h-5 bg-muted/30 rounded w-16" />
                    <div className="h-3 bg-muted/20 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service grid */}
        {filteredAndSorted && filteredAndSorted.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSorted.map((service, i) => (
              <ServiceCard key={service._id} service={service} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredAndSorted && filteredAndSorted.length === 0 && (
          <div className="card-warm rounded-2xl p-12 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No services found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchTerm || selectedCategory || province
                ? 'Try adjusting your search or filters'
                : 'No services have been listed yet. Be the first to offer one!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
