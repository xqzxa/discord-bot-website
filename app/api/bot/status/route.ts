import { NextResponse } from 'next/server'
import { getState, setStatus, type BotStatus } from '@/lib/bot-manager'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(getState())
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const status = body.status as BotStatus
  const valid: BotStatus[] = ['online', 'idle', 'dnd', 'invisible']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const state = setStatus(status, body.activityText)
  return NextResponse.json(state)
}
