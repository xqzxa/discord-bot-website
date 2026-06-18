'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Download, RefreshCw, Terminal, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogLevel = 'all' | 'info' | 'warn' | 'error'

const allLogs = [
  { ts: '2024-06-18 14:31:05', level: 'info' as const, bot: 'ModBot', msg: 'Connected to Discord gateway' },
  { ts: '2024-06-18 14:31:06', level: 'info' as const, bot: 'ModBot', msg: 'Ready! Logged in as ModBot#4512' },
  { ts: '2024-06-18 14:33:11', level: 'info' as const, bot: 'ModBot', msg: 'Received command: /ban from user SomeDev#0001' },
  { ts: '2024-06-18 14:33:11', level: 'info' as const, bot: 'ModBot', msg: 'Banned user BadActor#9999 from guild 1129304839' },
  { ts: '2024-06-18 14:45:02', level: 'warn' as const, bot: 'MusicBot', msg: 'Queue length exceeded 50 tracks — skipping oldest' },
  { ts: '2024-06-18 14:45:03', level: 'info' as const, bot: 'MusicBot', msg: 'Now playing: Rick Astley — Never Gonna Give You Up' },
  { ts: '2024-06-18 15:00:00', level: 'info' as const, bot: 'ModBot', msg: 'Heartbeat ACK received (latency: 42ms)' },
  { ts: '2024-06-18 15:10:22', level: 'error' as const, bot: 'MusicBot', msg: 'Failed to connect to voice channel: Missing Permission' },
  { ts: '2024-06-18 15:10:23', level: 'warn' as const, bot: 'MusicBot', msg: 'Retrying voice connection in 5s...' },
  { ts: '2024-06-18 15:10:28', level: 'info' as const, bot: 'MusicBot', msg: 'Voice connection re-established' },
  { ts: '2024-06-18 15:22:44', level: 'info' as const, bot: 'ModBot', msg: 'Auto-muted user Spammer#2281 for repeated messages' },
  { ts: '2024-06-18 15:30:00', level: 'info' as const, bot: 'ModBot', msg: 'Heartbeat ACK received (latency: 38ms)' },
]

const levelConfig = {
  info: { color: 'text-primary', bg: 'bg-primary/10', label: 'INFO' },
  warn: { color: 'text-warning', bg: 'bg-warning/10', label: 'WARN' },
  error: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'ERR' },
}

export default function LogsPage() {
  const [level, setLevel] = useState<LogLevel>('all')
  const [selectedBot, setSelectedBot] = useState<string>('all')

  const bots = ['all', ...Array.from(new Set(allLogs.map((l) => l.bot)))]

  const filtered = allLogs.filter((log) => {
    if (level !== 'all' && log.level !== level) return false
    if (selectedBot !== 'all' && log.bot !== selectedBot) return false
    return true
  }).reverse()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time console output from all your bots.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download data-icon="inline-start" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md border border-border bg-muted p-1 gap-1">
          {(['all', 'info', 'warn', 'error'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-colors capitalize',
                level === l
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {bots.map((bot) => (
            <button
              key={bot}
              onClick={() => setSelectedBot(bot)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                selectedBot === bot
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {bot === 'all' ? 'All bots' : bot}
            </button>
          ))}
        </div>
      </div>

      {/* Log terminal */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center gap-2">
          <Terminal className="size-4 text-primary" />
          <CardTitle className="text-sm font-medium">
            {filtered.length} entries
          </CardTitle>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-online">
            <Circle className="size-2 fill-online" />
            Live
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg bg-muted/30 border border-border overflow-auto max-h-[500px]">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium w-44">Timestamp</th>
                  <th className="text-left px-2 py-2 text-muted-foreground font-medium w-16">Level</th>
                  <th className="text-left px-2 py-2 text-muted-foreground font-medium w-24">Bot</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const cfg = levelConfig[log.level]
                  return (
                    <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{log.ts}</td>
                      <td className="px-2 py-2">
                        <span className={cn('px-1.5 py-0.5 rounded text-xs font-bold', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 font-mono">{log.bot}</Badge>
                      </td>
                      <td className="px-4 py-2 text-foreground">{log.msg}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No logs match the current filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
