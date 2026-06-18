import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const links = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Developers: ['Documentation', 'API Reference', 'CLI', 'Status'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="size-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">BotNest</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The easiest way to host your Discord bot 24/7.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BotNest. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for Discord bot developers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
