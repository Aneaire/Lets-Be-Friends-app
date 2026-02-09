import { Crown, Zap, Sparkles } from 'lucide-react'

interface PageBuilderProgressProps {
  plan: string
  currentCount: number
  maxPages: number
}

const planIcons: Record<string, typeof Crown> = {
  lite: Zap,
  medium: Sparkles,
  premium: Crown,
}

export function PageBuilderProgress({ plan, currentCount, maxPages }: PageBuilderProgressProps) {
  const Icon = planIcons[plan] ?? Zap
  const percentage = Math.min((currentCount / maxPages) * 100, 100)

  return (
    <div className="card-elevated rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-foreground capitalize">{plan} Plan</span>
          <span className="text-sm font-medium text-muted-foreground">
            {currentCount} / {maxPages} pages
          </span>
        </div>
        <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
