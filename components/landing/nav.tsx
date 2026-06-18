'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground tracking-tight">BotNest</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">Get started free</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn('md:hidden border-t border-border bg-background', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-1 px-4 py-4">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setOpen(false)}>Docs</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
            <Button variant="outline" size="sm" asChild><Link href="/dashboard">Log in</Link></Button>
            <Button size="sm" asChild><Link href="/dashboard">Get started free</Link></Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
