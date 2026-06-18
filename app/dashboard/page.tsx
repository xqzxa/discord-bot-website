'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import {
  Bot,
  Activity,
  Hash,
  Terminal,
  ArrowRight,
} from 'lucide-react'

type BotState = {
  connected: boolean
  connecting: boolean
  username: string | null
  tag: string | null
  status: string
  guildCount: number
  commandsRun: number
  warning: string | null
  error: string | null
}

export default function DashboardPage() {
  const [state, setState] = useState<BotState | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status')
      setState(await res.json())
    } catch {
      // ignore — poll will retry
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  const connected = state?.connected ?? false

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {connected ? `${state?.tag} is online.` : 'Your bot is not connected yet.'}
          </p>
        </div>
        {!connected && (
          <Button asChild>
            <Link href="/dashboard/deploy">
              <Bot data-icon="inline-start" />
              Connect bot
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Activity className="size-3.5" />
              Status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${connected ? 'text-online' : 'text-muted-foreground'}`}>
              {connected ? 'Online' : 'Offline'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Hash className="size-3.5" />
              Servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{state?.guildCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Terminal className="size-3.5" />
              Commands run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{state?.commandsRun ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {!connected && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm">Get your bot online</h3>
              <p className="text-muted-foreground text-xs mt-1">
                Paste your Discord bot token to connect and start using slash commands.
              </p>
            </div>
            <Button size="sm" asChild className="shrink-0">
              <Link href="/dashboard/deploy">
                Connect now
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
