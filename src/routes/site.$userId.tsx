import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/site/$userId')({
  component: SitePreview,
})

type ContentBlock = {
  type: 'heading' | 'text' | 'image'
  value: string
}

function SitePreview() {
  const { userId } = Route.useParams()
  const data = useConvexQuery(api.pages.getPublicSite, {
    userId: userId as Id<'users'>,
  })

  const [activePageIndex, setActivePageIndex] = useState<number>(0)

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-elevated p-8 rounded-2xl animate-fade-in">
          <div className="w-8 h-8 border-3 border-[#c1519c] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted mt-4 font-medium">Loading site...</p>
        </div>
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-elevated p-12 rounded-2xl text-center max-w-md animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-[#c1519c]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Site Not Found
          </h1>
          <p className="text-muted">
            This site doesn't exist or hasn't been published yet.
          </p>
        </div>
      </div>
    )
  }

  const { site, pages } = data

  // Default to homepage or first page
  const homePageIndex = pages.findIndex((p) => p.isHomePage)
  const defaultIndex = homePageIndex >= 0 ? homePageIndex : 0

  const currentPage = pages[activePageIndex ?? defaultIndex]

  let contentBlocks: ContentBlock[] = []
  if (currentPage?.content) {
    try {
      contentBlocks = JSON.parse(currentPage.content)
    } catch {
      contentBlocks = []
    }
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Site Navigation Bar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-[#ede4ef]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">
            {site.name}
          </h1>
          {pages.length > 1 && (
            <nav className="flex items-center gap-1">
              {pages.map((page, index) => (
                <button
                  key={page._id}
                  onClick={() => setActivePageIndex(index)}
                  className={`px-3 py-1.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    index === (activePageIndex ?? defaultIndex)
                      ? 'bg-[#c1519c] text-white shadow-sm'
                      : 'text-muted hover:bg-[#c1519c]/10 hover:text-foreground'
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {site.description && (
          <p className="text-muted mb-8 text-center">{site.description}</p>
        )}

        {currentPage ? (
          <div className="card-elevated rounded-2xl p-8 animate-fade-up">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              {currentPage.title}
            </h2>
            <div className="space-y-6">
              {contentBlocks.map((block, i) => {
                switch (block.type) {
                  case 'heading':
                    return (
                      <h2
                        key={i}
                        className="font-heading text-xl font-semibold text-foreground"
                      >
                        {block.value}
                      </h2>
                    )
                  case 'text':
                    return (
                      <p key={i} className="text-foreground/80 leading-relaxed">
                        {block.value}
                      </p>
                    )
                  case 'image':
                    return (
                      <img
                        key={i}
                        src={block.value}
                        alt=""
                        className="rounded-2xl shadow-sm w-full object-cover"
                      />
                    )
                  default:
                    return null
                }
              })}
              {contentBlocks.length === 0 && (
                <p className="text-muted text-center py-8">
                  This page has no content yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="card-elevated rounded-2xl p-12 text-center">
            <p className="text-muted">No pages available.</p>
          </div>
        )}
      </main>
    </div>
  )
}
