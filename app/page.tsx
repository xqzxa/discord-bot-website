'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Bot, Power, Eye, EyeOff, Loader2, Terminal, AlertTriangle } from 'lucide-react'
import { CommandManager } from '@/components/command-manager'

type BotStatus = 'online' | 'idle' | 'dnd' | 'invisible'

type State = {
  connected: boolean
  connecting: boolean
  tag: string | null
  id: string | null
  status: BotStatus
  activityText: string
  guildCount: number
  commandsRun: number
  error: string | null
  warning: string | null
  messageContentEnabled: boolean
  logs: { time: number; text: string }[]
}

const STATUS_OPTIONS: { value: BotStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500' },
  { value: 'idle', label: 'Idle', color: 'bg-amber-500' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  { value: 'invisible', label: 'Invisible', color: 'bg-muted-foreground' },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activity, setActivity] = useState('')
  const [activitySeeded, setActivitySeeded] = useState(false)
  const [savedActivity, setSavedActivity] = useState(false)

  const { data: state, mutate } = useSWR<State>('/api/bot/status', fetcher, {
    refreshInterval: 3000,
  })

  // Seed the activity input from the server value once it first arrives.
  if (!activitySeeded && typeof state?.activityText === 'string') {
    setActivity(state.activityText)
    setActivitySeeded(true)
  }

  const connected = state?.connected ?? false
  const connecting = state?.connecting ?? false

  async function connect() {
    if (!token.trim()) return
    setBusy(true)
    const res = await fetch('/api/bot/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    })
    const data = await res.json()
    mutate(data, false)
    setBusy(false)
  }

  async function disconnect() {
    setBusy(true)
    const res = await fetch('/api/bot/disconnect', { method: 'POST' })
    const data = await res.json()
    mutate(data, false)
    setToken('')
    setBusy(false)
  }

  async function changeStatus(status: BotStatus) {
    const res = await fetch('/api/bot/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, activityText: activity }),
    })
    const data = await res.json()
    mutate(data, false)
  }

  async function saveActivity() {
    const res = await fetch('/api/bot/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: state?.status ?? 'online', activityText: activity }),
    })
    const data = await res.json()
    mutate(data, false)
    setSavedActivity(true)
    setTimeout(() => setSavedActivity(false), 1500)
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === state?.status) ?? STATUS_OPTIONS[0]

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Bot Host</h1>
            <p className="text-sm text-muted-foreground">Run your Discord bot 24/7</p>
          </div>
          <Badge variant={connected ? 'default' : 'secondary'} className="ml-auto gap-1.5">
            <span className={cn('size-2 rounded-full', connected ? currentStatus.color : 'bg-muted-foreground')} />
            {connected ? currentStatus.label : 'Offline'}
          </Badge>
        </div>

        {/* Message Content Intent warning */}
        {connected && state?.warning && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2.5">
            <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-foreground/90 leading-relaxed">{state.warning}</p>
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-amber-500 hover:underline"
              >
                Open Discord Developer Portal →
              </a>
            </div>
          </div>
        )}

        {/* Token / connection card */}
        <Card>
          <CardHeader>
            <CardTitle>{connected ? state?.tag ?? 'Connected' : 'Connect your bot'}</CardTitle>
            <CardDescription>
              {connected
                ? `Watching ${state?.guildCount ?? 0} server(s) · ${state?.commandsRun ?? 0} commands run`
                : 'Paste your bot token and press Enter to bring it online.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!connected ? (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      placeholder="Bot token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') connect()
                      }}
                      className="pr-9"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showToken ? 'Hide token' : 'Show token'}
                    >
                      {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <Button onClick={connect} disabled={busy || connecting || !token.trim()}>
                    {busy || connecting ? <Loader2 className="size-4 animate-spin" /> : 'Enter'}
                  </Button>
                </div>
                {state?.error && (
                  <p className="text-sm text-red-500">{state.error}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your token stays on the server and is never displayed back to you.
                </p>
              </>
            ) : (
              <Button variant="destructive" onClick={disconnect} disabled={busy} className="w-full">
                <Power data-icon="inline-start" />
                Take offline
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status selector */}
        <Card className={cn(!connected && 'opacity-50 pointer-events-none')}>
          <CardHeader>
            <CardTitle className="text-base">Presence status</CardTitle>
            <CardDescription>Pick how your bot appears in Discord.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => changeStatus(opt.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                    state?.status === opt.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span className={cn('size-2.5 rounded-full', opt.color)} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="activity" className="text-sm font-medium">
                Activity message
              </label>
              <div className="flex gap-2">
                <Input
                  id="activity"
                  placeholder="Hosted 24/7"
                  value={activity}
                  maxLength={128}
                  onChange={(e) => setActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveActivity()
                  }}
                />
                <Button variant="outline" onClick={saveActivity}>
                  {savedActivity ? 'Saved' : 'Save'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Shows as “Playing {activity || 'Hosted 24/7'}” under your bot.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Commands + logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="size-4" />
              Built-in commands
            </CardTitle>
            <CardDescription>Type these in any channel your bot can see.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {['!ping', '!help', '!uptime', '!status', '!say'].map((c) => (
                <code key={c} className="rounded bg-muted px-2 py-1 text-xs font-mono">
                  {c}
                </code>
              ))}
            </div>
            {state?.logs && state.logs.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {state.logs.map((l, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-muted-foreground tabular-nums shrink-0">
                        {new Date(l.time).toLocaleTimeString('en-US', { hour12: false })}
                      </span>
                      <span className="text-foreground/80 break-all">{l.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Custom slash commands */}
        <CommandManager />
      </div>
    </main>
  )
}
