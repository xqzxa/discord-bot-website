import { NextResponse } from 'next/server'
import { disconnectBot } from '@/lib/bot-manager'

export const runtime = 'nodejs'

export async function POST() {
  const state = await disconnectBot()
  return NextResponse.json(state)
}
