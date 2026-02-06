import { createFileRoute, Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'
import { ArrowRight, Users, Briefcase, MapPin, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <SignedOut>
        {/* Decorative blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-48 w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-float stagger-3" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-float stagger-5" />
        </div>

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-3">
            <img src="/logo-with-name.svg" alt="Let's Be Friends" className="h-10" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-12">
          <div className="max-w-3xl text-center animate-fade-up" style={{ animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-sm text-primary font-medium mb-8 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <Sparkles className="w-4 h-4" />
              Social Marketplace for Meaningful Connections
            </div>

            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6">
              <span className="text-foreground">Let's Be</span>
              <br />
              <span className="text-gradient-brand">Friends</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Connect with people, discover services, and build friendships
              that matter. Your community, your way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
              <Link to="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                  Join the Community
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-24 grid md:grid-cols-3 gap-5 max-w-4xl w-full">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Social Connections"
              description="Share your world, follow friends, and engage with a community that cares."
              color="primary"
              delay="0.4s"
            />
            <FeatureCard
              icon={<Briefcase className="w-6 h-6" />}
              title="Services Marketplace"
              description="Offer your skills or book talented locals. Photography, tutoring, and more."
              color="secondary"
              delay="0.5s"
            />
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Local Discovery"
              description="Find people and services near you. Location-based, personally curated."
              color="accent"
              delay="0.6s"
            />
          </div>
        </div>

        {/* Footer accent */}
        <div className="h-1 bg-gradient-sunset" />
      </SignedOut>

      <SignedIn>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="animate-bounce-soft">
            <img src="/just-logo-symbol.svg" alt="LBF" className="w-16 h-16 drop-shadow-lg" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back!</h2>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </SignedIn>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'primary' | 'secondary' | 'accent'
  delay: string
}) {
  const colorMap = {
    primary: {
      bg: 'bg-primary/8',
      icon: 'text-primary',
      border: 'hover:border-primary/30',
    },
    secondary: {
      bg: 'bg-secondary/8',
      icon: 'text-secondary',
      border: 'hover:border-secondary/30',
    },
    accent: {
      bg: 'bg-accent/20',
      icon: 'text-accent',
      border: 'hover:border-accent/40',
    },
  }

  const colors = colorMap[color]

  return (
    <div
      className={`card-elevated rounded-2xl p-6 ${colors.border} animate-fade-up`}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 ${colors.icon}`}>
        {icon}
      </div>
      <h3 className="font-heading text-lg font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
