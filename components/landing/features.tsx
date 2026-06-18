import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Zap,
  RefreshCw,
  ScrollText,
  Globe,
  ShieldCheck,
  BarChart2,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'One-click deploy',
    description:
      'Upload your bot files or connect a GitHub repo. Your bot goes live in under 30 seconds with zero configuration.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-restart on crash',
    description:
      'BotNest monitors your process continuously. If it ever crashes, it restarts instantly so your community never notices.',
  },
  {
    icon: ScrollText,
    title: 'Real-time logs',
    description:
      'Stream live console output directly in your browser. Filter by level, search keywords, and download archives.',
  },
  {
    icon: Globe,
    title: 'Global regions',
    description:
      'Deploy to US, EU, or APAC data centers. Lower latency means faster command responses for your Discord server.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description:
      'Environment variables are encrypted at rest. Isolated containers ensure your bot runs in its own sandbox.',
  },
  {
    icon: BarChart2,
    title: 'Uptime analytics',
    description:
      'Track CPU, memory, and uptime history across all your bots. Get alerts before problems become outages.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-4">
            Everything your bot needs to stay online
          </h2>
          <p className="text-muted-foreground text-lg text-balance max-w-2xl mx-auto leading-relaxed">
            From instant deployment to continuous monitoring, BotNest handles the infrastructure so you can ship features.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="size-10 rounded-lg bg-brand-muted flex items-center justify-center mb-3">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
