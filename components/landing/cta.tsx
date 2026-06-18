import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-4">
          Ready to go live?
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed text-balance mb-10 max-w-xl mx-auto">
          Join thousands of developers who trust BotNest to keep their bots online. Start for free and upgrade as you grow.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Start for free
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
