import { createFileRoute, Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Let&apos;s Be Friends
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A social marketplace platform for connecting people, offering companionship services,
              and building meaningful friendships
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth/sign-up">
                <Button size="lg" variant="secondary">Get Started</Button>
              </Link>
              <Link to="/auth/sign-in">
                <Button size="lg" variant="ghost" className="hover:bg-primary hover:text-primary-foreground">Sign In</Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl">
            <FeatureCard
              icon="🤝"
              title="Social Connections"
              description="Connect with people, share posts, and build meaningful friendships"
            />
            <FeatureCard
              icon="💼"
              title="Services Marketplace"
              description="Offer and discover services from companions to professional services"
            />
            <FeatureCard
              icon="📍"
              title="Location-Based"
              description="Find people and services near you with smart location discovery"
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Link to="/dashboard" className="flex-1 flex items-center justify-center">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </SignedIn>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
