'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slash, Plus, Pencil, Trash2, Loader2, X, MessageSquare, Shuffle, LayoutPanelTop } from 'lucide-react'

type CommandType = 'text' | 'random' | 'embed'

type CustomCommand = {
  id: number
  name: string
  description: string
  response: string
  type: CommandType
  embedTitle: string
  embedColor: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const EMPTY = {
  name: '',
  description: '',
  response: '',
  type: 'text' as CommandType,
  embedTitle: '',
  embedColor: '#5865F2',
}

const TYPE_META: Record<CommandType, { label: string; icon: typeof MessageSquare; hint: string }> = {
  text: { label: 'Text', icon: MessageSquare, hint: 'Replies with a message. Supports placeholders.' },
  random: { label: 'Random', icon: Shuffle, hint: 'Put one option per line — the bot picks one at random.' },
  embed: { label: 'Embed', icon: LayoutPanelTop, hint: 'Replies with a rich embed card with a title and color.' },
}

const PLACEHOLDERS = [
  '{user}', '{mention}', '{server}', '{membercount}', '{channel}', '{date}', '{time}', '{arg}',
]

export function CommandManager() {
  const { data, mutate, isLoading } = useSWR<{ commands: CustomCommand[] }>(
    '/api/commands',
    fetcher,
  )
  const commands = data?.commands ?? []

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function startCreate() {
    setEditingId(null)
    setForm(EMPTY)
    setError(null)
    setOpen(true)
  }

  function startEdit(cmd: CustomCommand) {
    setEditingId(cmd.id)
    setForm({
      name: cmd.name,
      description: cmd.description,
      response: cmd.response,
      type: cmd.type,
      embedTitle: cmd.embedTitle,
      embedColor: cmd.embedColor || '#5865F2',
    })
    setError(null)
    setOpen(true)
  }

  function cancel() {
    setOpen(false)
    setForm(EMPTY)
    setEditingId(null)
    setError(null)
  }

  function insertPlaceholder(ph: string) {
    setForm((f) => ({ ...f, response: `${f.response}${ph}` }))
  }

  async function save() {
    setBusy(true)
    setError(null)
    const url = editingId ? `/api/commands/${editingId}` : '/api/commands'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setBusy(false)
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      return
    }
    await mutate()
    cancel()
  }

  async function remove(id: number) {
    await fetch(`/api/commands/${id}`, { method: 'DELETE' })
    await mutate()
  }

  const responseLabel =
    form.type === 'random' ? 'Options (one per line)' : form.type === 'embed' ? 'Embed body' : 'Response message'
  const responsePlaceholder =
    form.type === 'random'
      ? 'Heads\nTails'
      : form.type === 'embed'
        ? 'Welcome to {server}, {mention}!'
        : 'Hello {user}! 👋'

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-base flex items-center gap-2">
            <Slash className="size-4" />
            Custom slash commands
          </CardTitle>
          <CardDescription>
            Registered per-server so they appear instantly. Supports placeholders, random picks, and embeds.
          </CardDescription>
        </div>
        {!open && (
          <Button size="sm" variant="outline" onClick={startCreate}>
            <Plus data-icon="inline-start" />
            New
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {open && (
          <div className="rounded-lg border border-border p-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {editingId ? 'Edit command' : 'New command'}
              </span>
              <button
                onClick={cancel}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cancel"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Command type</span>
              <ToggleGroup
                value={[form.type]}
                onValueChange={(v) => {
                  const next = v[0]
                  if (next) setForm((f) => ({ ...f, type: next as CommandType }))
                }}
                className="justify-start gap-2"
              >
                {(Object.keys(TYPE_META) as CommandType[]).map((t) => {
                  const Icon = TYPE_META[t].icon
                  return (
                    <ToggleGroupItem key={t} value={t} className="gap-1.5 px-3" aria-label={TYPE_META[t].label}>
                      <Icon className="size-4" />
                      {TYPE_META[t].label}
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
              <p className="text-[11px] text-muted-foreground">{TYPE_META[form.type].hint}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cmd-name" className="text-xs font-medium text-muted-foreground">
                  Command name
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-mono text-sm">/</span>
                  <Input
                    id="cmd-name"
                    placeholder="hello"
                    value={form.name}
                    maxLength={32}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cmd-desc" className="text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <Input
                  id="cmd-desc"
                  placeholder="Say hello back"
                  value={form.description}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {form.type === 'embed' && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cmd-embed-title" className="text-xs font-medium text-muted-foreground">
                    Embed title
                  </label>
                  <Input
                    id="cmd-embed-title"
                    placeholder="Welcome!"
                    value={form.embedTitle}
                    maxLength={256}
                    onChange={(e) => setForm((f) => ({ ...f, embedTitle: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cmd-embed-color" className="text-xs font-medium text-muted-foreground">
                    Color
                  </label>
                  <input
                    id="cmd-embed-color"
                    type="color"
                    value={form.embedColor}
                    onChange={(e) => setForm((f) => ({ ...f, embedColor: e.target.value }))}
                    className="h-9 w-16 cursor-pointer rounded-md border border-border bg-background p-1"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cmd-resp" className="text-xs font-medium text-muted-foreground">
                {responseLabel}
              </label>
              <Textarea
                id="cmd-resp"
                placeholder={responsePlaceholder}
                value={form.response}
                maxLength={2000}
                rows={form.type === 'random' ? 4 : 3}
                onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => insertPlaceholder(ph)}
                    className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={save} disabled={busy} className="flex-1">
                {busy ? <Loader2 className="size-4 animate-spin" /> : editingId ? 'Save changes' : 'Add command'}
              </Button>
              <Button variant="outline" onClick={cancel} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-2">Loading commands…</p>
        ) : commands.length === 0 && !open ? (
          <p className="text-sm text-muted-foreground py-2">
            No custom commands yet. Click “New” to create one.
          </p>
        ) : (
          commands.length > 0 && (
            <div className="flex flex-col gap-2">
              {open && <Separator />}
              {commands.map((cmd) => {
                const Icon = TYPE_META[cmd.type].icon
                return (
                  <div
                    key={cmd.id}
                    className="flex items-start gap-2 rounded-lg border border-border p-2.5"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-foreground">/{cmd.name}</code>
                        <Badge variant="secondary" className="gap-1 text-[10px] py-0">
                          <Icon className="size-3" />
                          {TYPE_META[cmd.type].label}
                        </Badge>
                      </div>
                      {cmd.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {cmd.description}
                        </span>
                      )}
                      <span className="text-xs text-foreground/70 line-clamp-2">{cmd.response}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(cmd)} aria-label="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(cmd.id)} aria-label="Delete">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
