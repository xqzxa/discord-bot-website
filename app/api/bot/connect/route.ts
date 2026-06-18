import { NextResponse } from 'next/server'
import { connectBot } from '@/lib/bot-manager'

export const runtime = 'nodejs'

function publicState(state: ReturnType<typeof import('@/lib/bot-manager').getState>) {
  // never echo the token back
  const { ...rest } = state
  return rest
}

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({ token: '' }))
  const state = await connectBot(String(token ?? ''))
  return NextResponse.json(publicState(state))
}
