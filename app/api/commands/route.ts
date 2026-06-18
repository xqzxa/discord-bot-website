import { NextResponse } from 'next/server'
import { listCommands, createCommand, type CommandType } from '@/lib/db'
import { sanitizeCommandName, refreshCommands } from '@/lib/bot-manager'

export function parseCommandBody(body: Record<string, unknown>) {
  const name = sanitizeCommandName(String(body.name ?? ''))
  const description = String(body.description ?? '').slice(0, 100)
  const response = String(body.response ?? '').trim().slice(0, 2000)
  const rawType = String(body.type ?? 'text')
  const type: CommandType = ['text', 'random', 'embed'].includes(rawType)
    ? (rawType as CommandType)
    : 'text'
  const embedTitle = String(body.embedTitle ?? '').slice(0, 256)
  const embedColor = String(body.embedColor ?? '').slice(0, 7)
  return { name, description, response, type, embedTitle, embedColor }
}

export async function GET() {
  try {
    const commands = await listCommands()
    return NextResponse.json({ commands })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load commands' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = parseCommandBody(body)

    if (!input.name) {
      return NextResponse.json(
        { error: 'Command name is required (letters, numbers, - or _).' },
        { status: 400 },
      )
    }
    if (!input.response) {
      return NextResponse.json({ error: 'A response message is required.' }, { status: 400 })
    }

    const command = await createCommand(input)
    // Re-register with Discord so it shows up immediately.
    refreshCommands().catch(() => {})
    return NextResponse.json({ command })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create command'
    const status = /unique|duplicate/i.test(msg) ? 409 : 500
    return NextResponse.json(
      { error: status === 409 ? 'A command with that name already exists.' : msg },
      { status },
    )
  }
}
