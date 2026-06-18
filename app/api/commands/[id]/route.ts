import { NextResponse } from 'next/server'
import { updateCommand, deleteCommand } from '@/lib/db'
import { refreshCommands } from '@/lib/bot-manager'
import { parseCommandBody } from '../route'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = Number(id)
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: 'Invalid command id.' }, { status: 400 })
    }

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

    const command = await updateCommand(numId, input)
    if (!command) {
      return NextResponse.json({ error: 'Command not found.' }, { status: 404 })
    }
    refreshCommands().catch(() => {})
    return NextResponse.json({ command })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update command'
    const status = /unique|duplicate/i.test(msg) ? 409 : 500
    return NextResponse.json(
      { error: status === 409 ? 'A command with that name already exists.' : msg },
      { status },
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numId = Number(id)
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: 'Invalid command id.' }, { status: 400 })
    }
    const ok = await deleteCommand(numId)
    if (!ok) {
      return NextResponse.json({ error: 'Command not found.' }, { status: 404 })
    }
    refreshCommands().catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to delete command' },
      { status: 500 },
    )
  }
}
