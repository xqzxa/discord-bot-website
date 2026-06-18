import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <Badge variant="secondary" className="mb-6 border border-border text-muted-foreground gap-1.5">
          <Zap className="size-3 text-primary" />
          99.99% uptime guarantee
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight mb-6">
          Host your Discord bot{' '}
          <span className="text-primary">24/7</span>{' '}
          without lifting a finger
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed text-balance mb-10 max-w-2xl mx-auto">
          Deploy your bot in seconds. BotNest keeps it online around the clock with automatic restarts, real-time logs, and instant scaling — so you can focus on building.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/dashboard">
              Deploy your bot now
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Free plan available. No credit card required.
        </p>
      </div>

      {/* Terminal mockup */}
      <div className="relative max-w-3xl mx-auto mt-20">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <div className="size-3 rounded-full bg-destructive/60" />
            <div className="size-3 rounded-full bg-warning/60" />
            <div className="size-3 rounded-full bg-online/60" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">botnest — deploy</span>
          </div>
          {/* Terminal content */}
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-muted-foreground">
              <span className="text-primary">$</span> botnest deploy ./my-discord-bot
            </div>
            <div className="mt-2 text-muted-foreground/70">Uploading files... <span className="text-foreground">done</span></div>
            <div className="text-muted-foreground/70">Building container... <span className="text-foreground">done</span></div>
            <div className="text-muted-foreground/70">Starting process... <span className="text-foreground">done</span></div>
            <div className="mt-2 text-online font-semibold">
              ✓ Bot &quot;MyBot#1234&quot; is online and running
            </div>
            <div className="text-muted-foreground/70 text-xs mt-1">
              Uptime: 0s  ·  Region: us-east-1  ·  Plan: Free
            </div>
          </div>
        </div>
        {/* Subtle glow under card */}
        <div className="absolute -bottom-4 left-1/4 right-1/4 h-8 bg-primary/20 blur-xl rounded-full" />
      </div>
    </section>
  )
}
