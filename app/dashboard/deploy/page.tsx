'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Lock,
  Terminal,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Power,
  PowerOff,
} from 'lucide-react'

type BotStatus = 'online' | 'idle' | 'dnd' | 'invisible'

type BotState = {
  connected: boolean
  connecting: boolean
  username: string | null
  tag: string | null
  id: string | null
  status: BotStatus
  activityText: string
  startedAt: number | null
  guildCount: number
  commandsRun: number
  ownerId: string | null
  error: string | null
  warning: string | null
  messageContentEnabled: boolean
  logs: { time: number; text: string }[]
}

export default function DeployPage() {
  const [token, setToken] = useState('')
  const [state, setState] = useState<BotState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status')
      const data = await res.json()
      setState(data)
    } catch {
      // status fetch failing isn't fatal, just skip this poll
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 4000)
    return () => clearInterval(interval)
  }, [refresh])

  async function handleConnect() {
    if (!token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setState(data)
      setToken('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisconnect() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bot/disconnect', { method: 'POST' })
      const data = await res.json()
      setState(data)
    } finally {
      setSubmitting(false)
    }
  }

  const connected = state?.connected ?? false
  const connecting = state?.connecting ?? submitting

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connect your bot</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste your Discord bot token to bring it online. This connects directly to Discord's
          gateway from wherever this app is running.
        </p>
      </div>

      <Separator />

      {!connected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bot token</CardTitle>
            <CardDescription>
              Found in the Discord Developer Portal under your application → Bot → Reset Token.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5" htmlFor="bot-token">
                <Lock className="size-3.5 text-muted-foreground" />
                Discord Bot Token
              </label>
              <input
                id="bot-token"
                type="password"
                placeholder="Paste your bot token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
              <p className="text-xs text-muted-foreground">
                This is sent once to log in and is never stored or echoed back by the API.
              </p>
            </div>

            {state?.error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <Button className="w-full" disabled={!token || connecting} onClick={handleConnect}>
              {connecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  Connecting...
                </>
              ) : (
                <>
                  <Power data-icon="inline-start" />
                  Connect bot
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-online" />
                {state?.tag ?? 'Bot'} is online
              </CardTitle>
              <Badge variant="secondary">{state?.guildCount ?? 0} server(s)</Badge>
            </div>
            <CardDescription>
              Connected and listening. Slash commands sync automatically as you add them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state?.warning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
                <AlertTriangle className="size-4 mt-0.5 shrink-0 text-warning" />
                <span>{state.warning}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{state?.status}</div>
              <div className="text-muted-foreground">Commands run</div>
              <div className="font-medium">{state?.commandsRun ?? 0}</div>
              <div className="text-muted-foreground">Message Content Intent</div>
              <div className="font-medium">{state?.messageContentEnabled ? 'Enabled' : 'Disabled'}</div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Terminal className="size-3.5" />
                Recent activity
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                {(state?.logs ?? []).length === 0 && (
                  <span className="text-muted-foreground">No activity yet.</span>
                )}
                {(state?.logs ?? []).map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3 text-online mt-0.5 shrink-0" />
                    <span className="text-foreground">{l.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full" disabled={connecting} onClick={handleDisconnect}>
              {connecting ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <PowerOff data-icon="inline-start" />
              )}
              Disconnect bot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
