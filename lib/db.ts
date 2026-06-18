import { Pool } from 'pg'

export type CommandType = 'text' | 'random' | 'embed'

export type CustomCommand = {
  id: number
  name: string
  description: string
  response: string
  type: CommandType
  embedTitle: string
  embedColor: string
  createdAt: string
}

export type CommandInput = {
  name: string
  description: string
  response: string
  type: CommandType
  embedTitle: string
  embedColor: string
}

const globalForDb = globalThis as unknown as { __pgPool?: Pool }

export const pool =
  globalForDb.__pgPool ??
  (globalForDb.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
  }))

let schemaReady: Promise<void> | null = null

// Lazily create / migrate the table the first time the DB is touched.
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS custom_commands (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          response TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`,
      )
      // Additive migrations — safe to run repeatedly.
      await pool.query(
        `ALTER TABLE custom_commands ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text'`,
      )
      await pool.query(
        `ALTER TABLE custom_commands ADD COLUMN IF NOT EXISTS embed_title TEXT NOT NULL DEFAULT ''`,
      )
      await pool.query(
        `ALTER TABLE custom_commands ADD COLUMN IF NOT EXISTS embed_color TEXT NOT NULL DEFAULT ''`,
      )
    })().catch((e) => {
      // Reset so a later call can retry if the first attempt failed.
      schemaReady = null
      throw e
    })
  }
  return schemaReady
}

function rowToCommand(row: {
  id: number
  name: string
  description: string
  response: string
  type: string
  embed_title: string
  embed_color: string
  created_at: Date | string
}): CustomCommand {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    response: row.response,
    type: (row.type as CommandType) ?? 'text',
    embedTitle: row.embed_title ?? '',
    embedColor: row.embed_color ?? '',
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }
}

const SELECT_COLS = `id, name, description, response, type, embed_title, embed_color, created_at`

export async function listCommands(): Promise<CustomCommand[]> {
  await ensureSchema()
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS} FROM custom_commands ORDER BY name ASC`,
  )
  return rows.map(rowToCommand)
}

export async function createCommand(input: CommandInput): Promise<CustomCommand> {
  await ensureSchema()
  const { rows } = await pool.query(
    `INSERT INTO custom_commands (name, description, response, type, embed_title, embed_color)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SELECT_COLS}`,
    [input.name, input.description, input.response, input.type, input.embedTitle, input.embedColor],
  )
  return rowToCommand(rows[0])
}

export async function updateCommand(
  id: number,
  input: CommandInput,
): Promise<CustomCommand | null> {
  await ensureSchema()
  const { rows } = await pool.query(
    `UPDATE custom_commands
     SET name = $2, description = $3, response = $4, type = $5, embed_title = $6, embed_color = $7
     WHERE id = $1
     RETURNING ${SELECT_COLS}`,
    [id, input.name, input.description, input.response, input.type, input.embedTitle, input.embedColor],
  )
  return rows[0] ? rowToCommand(rows[0]) : null
}

export async function deleteCommand(id: number): Promise<boolean> {
  await ensureSchema()
  const { rowCount } = await pool.query(
    `DELETE FROM custom_commands WHERE id = $1`,
    [id],
  )
  return (rowCount ?? 0) > 0
}
