import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { PageBuilderProgress } from '../components/PageBuilderProgress'
import {
  FileText,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Layout,
  GripVertical,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Globe,
  Home,
  Type,
  AlignLeft,
  Image,
  Minus,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/site-builder')({
  component: withOnboardingComplete(SiteBuilder),
})

type ContentBlock = {
  type: 'heading' | 'text' | 'image'
  value: string
}

type WizardStep = 'plan' | 'site' | 'editor' | 'linker'

const PLANS = [
  {
    id: 'lite',
    name: 'Lite',
    pages: 5,
    icon: Zap,
    description: 'Perfect for a simple personal page',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
  },
  {
    id: 'medium',
    name: 'Medium',
    pages: 17,
    icon: Sparkles,
    description: 'Great for portfolios and small businesses',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  {
    id: 'premium',
    name: 'Premium',
    pages: 55,
    icon: Crown,
    description: 'Unlimited creativity for large projects',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function SiteBuilder() {
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  const userPlan = useConvexQuery(
    api.plans.getUserPlan,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  )

  const userSite = useConvexQuery(
    api.pages.getUserSite,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  )

  const sitePages = useConvexQuery(
    api.pages.listPages,
    userSite?._id ? { siteId: userSite._id } : 'skip',
  )

  const setPlan = useConvexMutation(api.plans.setUserPlan)
  const createSite = useConvexMutation(api.pages.createSite)
  const createPage = useConvexMutation(api.pages.createPage)
  const updatePage = useConvexMutation(api.pages.updatePage)
  const deletePage = useConvexMutation(api.pages.deletePage)
  const publishSite = useConvexMutation(api.pages.publishSite)
  const reorderPages = useConvexMutation(api.pages.reorderPages)

  // Determine initial step based on existing data
  const getInitialStep = (): WizardStep => {
    if (!userPlan || userPlan.plan === 'lite') return 'plan'
    if (!userSite) return 'site'
    return 'editor'
  }

  const [step, setStep] = useState<WizardStep | null>(null)
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')

  // Page editor state
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { type: 'heading', value: '' },
    { type: 'text', value: '' },
  ])
  const [isHomePage, setIsHomePage] = useState(false)

  const [saving, setSaving] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [editingPageId, setEditingPageId] = useState<Id<'sitePages'> | null>(null)

  // Resolve the actual step
  const currentStep = step ?? getInitialStep()

  const pageCount = sitePages?.length ?? 0
  const maxPages = userPlan?.maxPages ?? 5
  const planName = userPlan?.plan ?? 'lite'

  // ─── Plan Selection ───

  const handleSelectPlan = async (planId: string) => {
    if (!currentUser) return
    setSaving(true)
    try {
      await setPlan({ userId: currentUser._id, plan: planId })
      if (userSite) {
        setStep('editor')
      } else {
        setStep('site')
      }
    } finally {
      setSaving(false)
    }
  }

  // ─── Site Setup ───

  const handleCreateSite = async () => {
    if (!currentUser || !siteName.trim()) return
    setSaving(true)
    try {
      await createSite({
        userId: currentUser._id,
        name: siteName.trim(),
        description: siteDescription.trim() || undefined,
      })
      setStep('editor')
    } finally {
      setSaving(false)
    }
  }

  // ─── Page Editor ───

  const handleTitleChange = (value: string) => {
    setPageTitle(value)
    if (!slugManuallyEdited) {
      setPageSlug(slugify(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setPageSlug(slugify(value))
  }

  const updateBlock = (index: number, value: string) => {
    setContentBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, value } : b)))
  }

  const addBlock = (type: ContentBlock['type']) => {
    setContentBlocks((prev) => [...prev, { type, value: '' }])
  }

  const removeBlock = (index: number) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const resetPageForm = useCallback(() => {
    setPageTitle('')
    setPageSlug('')
    setSlugManuallyEdited(false)
    setContentBlocks([
      { type: 'heading', value: '' },
      { type: 'text', value: '' },
    ])
    setIsHomePage(false)
    setEditingPageId(null)
  }, [])

  const handleSavePage = async () => {
    if (!currentUser || !userSite || !pageTitle.trim() || !pageSlug.trim()) return
    setSaving(true)
    try {
      const content = JSON.stringify(contentBlocks.filter((b) => b.value.trim()))

      if (editingPageId) {
        await updatePage({
          pageId: editingPageId,
          title: pageTitle.trim(),
          slug: pageSlug.trim(),
          content,
          isHomePage,
        })
      } else {
        await createPage({
          siteId: userSite._id,
          userId: currentUser._id,
          title: pageTitle.trim(),
          slug: pageSlug.trim(),
          content,
          pageOrder: pageCount,
          isHomePage: pageCount === 0 ? true : isHomePage,
        })
      }
      setShowSavedModal(true)
    } finally {
      setSaving(false)
    }
  }

  const handleEditPage = (page: NonNullable<typeof sitePages>[number]) => {
    setEditingPageId(page._id)
    setPageTitle(page.title)
    setPageSlug(page.slug)
    setSlugManuallyEdited(true)
    setIsHomePage(page.isHomePage)
    try {
      const blocks = JSON.parse(page.content) as ContentBlock[]
      setContentBlocks(blocks.length > 0 ? blocks : [{ type: 'heading', value: '' }, { type: 'text', value: '' }])
    } catch {
      setContentBlocks([{ type: 'text', value: page.content }])
    }
    setStep('editor')
  }

  const handleDeletePage = async (pageId: Id<'sitePages'>) => {
    await deletePage({ pageId })
  }

  // ─── Navigation Linker ───

  const handleMoveUp = async (index: number) => {
    if (!sitePages || index === 0) return
    const reordered = [...sitePages]
    ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
    await reorderPages({
      pages: reordered.map((p, i) => ({ pageId: p._id, pageOrder: i })),
    })
  }

  const handleMoveDown = async (index: number) => {
    if (!sitePages || index === sitePages.length - 1) return
    const reordered = [...sitePages]
    ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
    await reorderPages({
      pages: reordered.map((p, i) => ({ pageId: p._id, pageOrder: i })),
    })
  }

  const handleSetHomePage = async (pageId: Id<'sitePages'>) => {
    await updatePage({ pageId, isHomePage: true })
  }

  const handlePublish = async () => {
    if (!userSite) return
    setPublishing(true)
    try {
      await publishSite({ siteId: userSite._id })
      setPublished(true)
    } finally {
      setPublishing(false)
    }
  }

  // ─── Loading ───

  if (!currentUser || userPlan === undefined) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-warm rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Layout className="w-7 h-7 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Loading site builder...</p>
        </div>
      </div>
    )
  }

  // ─── Render ───

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => router.navigate({ to: '/' })}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Site Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage your personal site pages</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          {(['plan', 'site', 'editor', 'linker'] as WizardStep[]).map((s, i) => {
            const labels = ['Plan', 'Setup', 'Pages', 'Publish']
            const isActive = s === currentStep
            const isPast =
              (['plan', 'site', 'editor', 'linker'].indexOf(currentStep) >
                ['plan', 'site', 'editor', 'linker'].indexOf(s))
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-0.5 ${isPast ? 'bg-primary' : 'bg-border'}`} />}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : isPast
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted/15 text-muted-foreground'
                  }`}
                >
                  {isPast ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar (shown after plan selection) */}
        {userPlan && userSite && (
          <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.08s', animationFillMode: 'both' }}>
            <PageBuilderProgress plan={planName} currentCount={pageCount} maxPages={maxPages} />
          </div>
        )}

        {/* ═══ Step 1: Plan Selection ═══ */}
        {currentStep === 'plan' && (
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="text-center mb-2">
              <h2 className="font-heading text-2xl font-bold text-foreground">Choose Your Plan</h2>
              <p className="text-muted-foreground text-sm mt-1">Select a plan that fits your needs</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = planName === plan.id && userPlan.plan !== 'lite'
                return (
                  <div
                    key={plan.id}
                    className={`card-elevated rounded-2xl p-6 text-center relative transition-all ${
                      isCurrentPlan ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {plan.id === 'medium' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl ${plan.bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-7 h-7 ${plan.color}`} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="mb-5">
                      <span className="font-heading text-3xl font-bold text-foreground">{plan.pages}</span>
                      <span className="text-muted-foreground text-sm ml-1">pages</span>
                    </div>
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={saving}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
                        isCurrentPlan
                          ? 'bg-primary/10 text-primary'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Skip if user already has a plan */}
            {userPlan && userPlan.plan !== 'lite' && (
              <div className="text-center">
                <button
                  onClick={() => setStep(userSite ? 'editor' : 'site')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-1"
                >
                  Keep current plan
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 2: Site Setup ═══ */}
        {currentStep === 'site' && (
          <div className="max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">Set Up Your Site</h2>
              <p className="text-muted-foreground text-sm mt-1">Give your site a name to get started</p>
            </div>

            <div className="card-elevated rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Site Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="input-warm w-full"
                  placeholder="My Personal Site"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="input-warm w-full min-h-[100px] resize-none"
                  placeholder="A brief description of your site..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('plan')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-all border border-border hover:border-foreground/20"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1.5" />
                  Back
                </button>
                <button
                  onClick={handleCreateSite}
                  disabled={saving || !siteName.trim()}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {saving ? 'Creating...' : 'Create Site'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 3: Page Editor ═══ */}
        {currentStep === 'editor' && (
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {/* Existing pages list */}
            {sitePages && sitePages.length > 0 && !editingPageId && (
              <div className="card-elevated rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Your Pages ({sitePages.length})
                </h3>
                <div className="space-y-2">
                  {sitePages.map((page) => (
                    <div
                      key={page._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {page.isHomePage && (
                          <span className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Home className="w-3.5 h-3.5 text-primary" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-foreground block truncate">{page.title}</span>
                          <span className="text-xs text-muted-foreground">/{page.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-all"
                          title="Edit page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page._id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Delete page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page editor form */}
            <div className="card-elevated rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {editingPageId ? 'Edit Page' : 'New Page'}
                </h3>
                {editingPageId && (
                  <button
                    onClick={resetPageForm}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Page Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="input-warm w-full"
                    placeholder="About Me"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Slug <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-0">
                    <span className="text-muted-foreground text-sm px-3 py-2 bg-muted/10 border border-r-0 border-border rounded-l-xl">/</span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="input-warm w-full rounded-l-none"
                      placeholder="about-me"
                    />
                  </div>
                </div>
              </div>

              {/* Set as homepage */}
              {pageCount > 0 && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isHomePage ? 'bg-primary border-primary' : 'border-border'
                    }`}
                    onClick={() => setIsHomePage(!isHomePage)}
                  >
                    {isHomePage && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">Set as homepage</span>
                </label>
              )}

              {/* Content Blocks */}
              <div>
                <label className="block text-sm font-medium mb-3 text-foreground">Content Blocks</label>
                <div className="space-y-3">
                  {contentBlocks.map((block, index) => (
                    <div key={index} className="relative group">
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 mt-2.5 text-muted-foreground/50">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              {block.type === 'heading' && <Type className="w-3 h-3" />}
                              {block.type === 'text' && <AlignLeft className="w-3 h-3" />}
                              {block.type === 'image' && <Image className="w-3 h-3" />}
                              {block.type}
                            </span>
                            {contentBlocks.length > 1 && (
                              <button
                                onClick={() => removeBlock(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {block.type === 'heading' && (
                            <input
                              type="text"
                              value={block.value}
                              onChange={(e) => updateBlock(index, e.target.value)}
                              className="input-warm w-full font-heading text-lg font-bold"
                              placeholder="Section heading..."
                            />
                          )}
                          {block.type === 'text' && (
                            <textarea
                              value={block.value}
                              onChange={(e) => updateBlock(index, e.target.value)}
                              className="input-warm w-full min-h-[100px] resize-none"
                              placeholder="Write your content here..."
                            />
                          )}
                          {block.type === 'image' && (
                            <input
                              type="url"
                              value={block.value}
                              onChange={(e) => updateBlock(index, e.target.value)}
                              className="input-warm w-full"
                              placeholder="https://example.com/image.jpg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add block buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => addBlock('heading')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all border border-border/50"
                  >
                    <Type className="w-3.5 h-3.5" />
                    Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('text')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all border border-border/50"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('image')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all border border-border/50"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Image
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep('plan')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-all border border-border hover:border-foreground/20"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1.5" />
                  Change Plan
                </button>
                <button
                  onClick={handleSavePage}
                  disabled={saving || !pageTitle.trim() || !pageSlug.trim()}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : editingPageId ? 'Update Page' : 'Save Page'}
                  <Check className="w-4 h-4" />
                </button>
                {sitePages && sitePages.length > 0 && (
                  <button
                    onClick={() => setStep('linker')}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Finish & Publish
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Saved Modal */}
            {showSavedModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in">
                <div className="card-elevated rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Page {editingPageId ? 'Updated' : 'Saved'}!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {pageCount < maxPages
                      ? 'Would you like to add another page or finish up?'
                      : 'You have reached your plan limit. Finish & link your pages.'}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {pageCount < maxPages && (
                      <button
                        onClick={() => {
                          setShowSavedModal(false)
                          resetPageForm()
                        }}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Page
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowSavedModal(false)
                        resetPageForm()
                        setStep('linker')
                      }}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Layout className="w-4 h-4" />
                      Finish & Link Pages
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 4: Navigation Linker ═══ */}
        {currentStep === 'linker' && (
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {published ? (
              /* Published success */
              <div className="card-elevated rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 animate-scale-in">
                  <Globe className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Your Site is Live!
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Your site has been published with {sitePages?.length ?? 0} page{(sitePages?.length ?? 0) !== 1 ? 's' : ''}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.navigate({ to: '/' })}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted/10 transition-all"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={() => {
                      setPublished(false)
                      setStep('editor')
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 inline mr-1.5" />
                    Add More Pages
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-2">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Organize & Publish</h2>
                  <p className="text-muted-foreground text-sm mt-1">Reorder your pages, set a homepage, and publish</p>
                </div>

                {/* Pages list */}
                <div className="card-elevated rounded-2xl p-5">
                  {sitePages && sitePages.length > 0 ? (
                    <div className="space-y-2">
                      {sitePages.map((page, index) => (
                        <div
                          key={page._id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            page.isHomePage
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-border/50 bg-background/50'
                          }`}
                        >
                          <div className="shrink-0 text-muted-foreground/40">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate">{page.title}</span>
                              {page.isHomePage && (
                                <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Home className="w-3 h-3" />
                                  Home
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">/{page.slug}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Set as home */}
                            {!page.isHomePage && (
                              <button
                                onClick={() => handleSetHomePage(page._id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                title="Set as homepage"
                              >
                                <Home className="w-4 h-4" />
                              </button>
                            )}
                            {/* Move up */}
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            {/* Move down */}
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sitePages.length - 1}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => handleEditPage(page)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-all"
                              title="Edit page"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDeletePage(page._id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              title="Delete page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No pages yet. Go back and create some pages first.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      resetPageForm()
                      setStep('editor')
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-all border border-border hover:border-foreground/20 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishing || !sitePages || sitePages.length === 0}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    {publishing ? 'Publishing...' : 'Publish Site'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
