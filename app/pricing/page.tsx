'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LandingNav } from '@/components/landing/nav'
import { Footer } from '@/components/landing/footer'
import { Check, Minus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    description: 'For hobbyists getting started.',
    highlight: false,
    cta: 'Get started free',
    features: [
      { label: '1 bot', included: true },
      { label: '50 MB RAM per bot', included: true },
      { label: 'US East region only', included: true },
      { label: 'Community support', included: true },
      { label: '99.5% uptime SLA', included: true },
      { label: 'Custom domain', included: false },
      { label: 'Priority support', included: false },
      { label: 'Log retention (7 days)', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 9,
    yearly: 7,
    description: 'For serious bot developers.',
    highlight: true,
    badge: 'Most popular',
    cta: 'Start Pro trial',
    features: [
      { label: '10 bots', included: true },
      { label: '256 MB RAM per bot', included: true },
      { label: 'All 3 regions', included: true },
      { label: 'Priority email support', included: true },
      { label: '99.9% uptime SLA', included: true },
      { label: 'Custom domain', included: true },
      { label: 'Priority support', included: true },
      { label: 'Log retention (30 days)', included: true },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 29,
    yearly: 24,
    description: 'For large servers and teams.',
    highlight: false,
    cta: 'Contact sales',
    features: [
      { label: 'Unlimited bots', included: true },
      { label: '1 GB RAM per bot', included: true },
      { label: 'All 3 regions', included: true },
      { label: 'Dedicated support channel', included: true },
      { label: '99.99% uptime SLA', included: true },
      { label: 'Custom domain', included: true },
      { label: 'Priority support', included: true },
      { label: 'Log retention (90 days)', included: true },
    ],
  },
]

const faq = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan requires no credit card. You only need to add a payment method when upgrading to a paid plan.',
  },
  {
    q: 'What happens if my bot crashes?',
    a: 'BotNest automatically restarts your bot process within seconds of a crash on all plans. You will also be notified via the dashboard.',
  },
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades at the end of your billing cycle.',
  },
  {
    q: 'What languages are supported?',
    a: 'We currently support Node.js 18/20, Python 3.11, and Deno 1.x. More runtimes are in progress.',
  },
]

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed text-balance max-w-xl mx-auto mb-8">
              Start free. Scale as your bot grows. No hidden fees.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-muted rounded-full px-2 py-1.5">
              <button
                onClick={() => setYearly(false)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                  !yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  yearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Yearly
                <Badge variant="secondary" className="text-xs px-1.5 py-0 text-primary">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col transition-colors relative',
                  plan.highlight
                    ? 'border-primary bg-card ring-1 ring-primary/30'
                    : 'border-border'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{plan.description}</CardDescription>
                  <div className="mt-3 flex items-baseline gap-1">
                    {plan.monthly === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold tabular-nums">
                          ${yearly ? plan.yearly : plan.monthly}
                        </span>
                        <span className="text-muted-foreground text-sm">/mo</span>
                      </>
                    )}
                  </div>
                  {yearly && plan.monthly > 0 && (
                    <p className="text-xs text-muted-foreground">Billed annually at ${plan.yearly * 12}/yr</p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        {f.included ? (
                          <Check className="size-4 text-primary shrink-0" />
                        ) : (
                          <Minus className="size-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={f.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/dashboard">
                      {plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Enterprise banner */}
          <Card className="mb-16 border-border">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Enterprise</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Custom SLAs, dedicated infrastructure, SSO, and SLA-backed support for large-scale operations.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="mailto:enterprise@botnest.app">Contact sales</Link>
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-8">Frequently asked questions</h2>
            <div className="space-y-0">
              {faq.map((item, i) => (
                <div key={i}>
                  <div className="py-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                  {i < faq.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
