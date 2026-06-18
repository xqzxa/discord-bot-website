import {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ApplicationCommandOptionType,
  type PresenceStatusData,
  type ChatInputCommandInteraction,
  type ApplicationCommandDataResolvable,
} from 'discord.js'
import { listCommands, type CustomCommand } from '@/lib/db'

export type BotStatus = 'online' | 'idle' | 'dnd' | 'invisible'

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

type BotManager = {
  client: Client | null
  state: BotState
  commands: CustomCommand[]
}

// Persist across hot reloads in dev by stashing on globalThis.
const globalForBot = globalThis as unknown as { __botManager?: BotManager }

const manager: BotManager =
  globalForBot.__botManager ??
  (globalForBot.__botManager = {
    client: null,
    commands: [],
    state: {
      connected: false,
      connecting: false,
      username: null,
      tag: null,
      id: null,
      status: 'online',
      activityText: 'Hosted 24/7',
      startedAt: null,
      guildCount: 0,
      commandsRun: 0,
      ownerId: null,
      error: null,
      warning: null,
      messageContentEnabled: true,
      logs: [],
    },
  })

function log(text: string) {
  manager.state.logs.unshift({ time: Date.now(), text })
  manager.state.logs = manager.state.logs.slice(0, 50)
  console.log('[v0] bot:', text)
}

// Built-in commands. Prefix-based (default "!").
const PREFIX = '!'

function handleCommand(content: string): string | null {
  if (!content.startsWith(PREFIX)) return null
  const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/\s+/)
  switch (cmd.toLowerCase()) {
    case 'ping':
      return 'Pong! 🏓'
    case 'help':
      return [
        '**Built-in commands:**',
        '`!ping` — check if the bot is alive',
        '`!help` — show this message',
        '`!uptime` — how long the bot has been online',
        '`!status` — show the current presence',
        '`!say <text>` — echo your message',
      ].join('\n')
    case 'uptime': {
      if (!manager.state.startedAt) return 'Bot just started.'
      const ms = Date.now() - manager.state.startedAt
      const mins = Math.floor(ms / 60000)
      const secs = Math.floor((ms % 60000) / 1000)
      return `Uptime: ${mins}m ${secs}s`
    }
    case 'status':
      return `Current status: **${manager.state.status}** — ${manager.state.activityText}`
    case 'say':
      return args.length ? args.join(' ') : 'Give me something to say! `!say hello`'
    default:
      return null
  }
}

const STATUS_MAP: Record<BotStatus, PresenceStatusData> = {
  online: 'online',
  idle: 'idle',
  dnd: 'dnd',
  invisible: 'invisible',
}

function applyPresence() {
  if (!manager.client?.user) return
  manager.client.user.setPresence({
    status: STATUS_MAP[manager.state.status],
    activities: manager.state.activityText
      ? [{ name: manager.state.activityText, type: ActivityType.Playing }]
      : [],
  })
}

export function getState(): BotState {
  return manager.state
}

// Discord slash command names must be lowercase, 1-32 chars, no spaces.
export function sanitizeCommandName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}

// Does the command use the {arg}/{args} placeholder? If so we register a text option.
function commandUsesArg(cmd: CustomCommand): boolean {
  return /\{args?\}/i.test(cmd.response) || /\{args?\}/i.test(cmd.embedTitle)
}

function buildCommandData(): ApplicationCommandDataResolvable[] {
  return manager.commands.map((c) => {
    const data: ApplicationCommandDataResolvable = {
      name: c.name,
      description: c.description || 'Custom command',
    }
    if (commandUsesArg(c)) {
      ;(data as { options?: unknown }).options = [
        {
          name: 'text',
          description: 'Text passed to the command',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ]
    }
    return data
  })
}

// Load commands from the database and (if connected) push them to Discord as
// real slash commands. Registered PER-GUILD so they appear instantly (global
// commands can take up to an hour to propagate).
export async function refreshCommands(): Promise<void> {
  manager.commands = await listCommands()
  log(`Loaded ${manager.commands.length} custom command(s).`)

  const client = manager.client
  if (!manager.state.connected || !client) return

  const data = buildCommandData()
  const guilds = [...client.guilds.cache.values()]

  try {
    await Promise.all(guilds.map((g) => g.commands.set(data)))
    log(`Registered ${data.length} command(s) across ${guilds.length} server(s) — instant.`)
  } catch (e) {
    log(`Failed to register slash commands: ${e instanceof Error ? e.message : 'unknown'}`)
  }
}

// Replace {placeholders} in a template using the interaction context.
function renderTemplate(template: string, interaction: ChatInputCommandInteraction): string {
  const arg = interaction.options.getString('text') ?? ''
  const now = new Date()
  const map: Record<string, string> = {
    user: interaction.user.username,
    username: interaction.user.username,
    mention: `<@${interaction.user.id}>`,
    userid: interaction.user.id,
    server: interaction.guild?.name ?? 'this server',
    guild: interaction.guild?.name ?? 'this server',
    membercount: String(interaction.guild?.memberCount ?? 0),
    channel: interaction.channel && 'name' in interaction.channel ? `#${interaction.channel.name}` : '',
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    arg,
    args: arg,
  }
  return template.replace(/\{(\w+)\}/g, (full, key: string) => {
    const v = map[key.toLowerCase()]
    return v !== undefined ? v : full
  })
}

function pickRandomLine(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return text
  return lines[Math.floor(Math.random() * lines.length)]
}

function parseColor(hex: string): number | undefined {
  const m = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return undefined
  return parseInt(m, 16)
}

// Build the reply payload for a command given the interaction.
function buildReply(cmd: CustomCommand, interaction: ChatInputCommandInteraction) {
  if (cmd.type === 'embed') {
    const embed = new EmbedBuilder().setDescription(
      renderTemplate(cmd.response, interaction) || '\u200b',
    )
    if (cmd.embedTitle) embed.setTitle(renderTemplate(cmd.embedTitle, interaction))
    const color = parseColor(cmd.embedColor)
    if (color !== undefined) embed.setColor(color)
    return { embeds: [embed] }
  }

  const source = cmd.type === 'random' ? pickRandomLine(cmd.response) : cmd.response
  return { content: renderTemplate(source, interaction) || '\u200b' }
}

function buildClient(withMessageContent: boolean): Client {
  const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  if (withMessageContent) intents.push(GatewayIntentBits.MessageContent)

  const client = new Client({ intents })

  client.once('ready', async () => {
    manager.state.connected = true
    manager.state.connecting = false
    manager.state.username = client.user?.username ?? null
    manager.state.tag = client.user?.tag ?? null
    manager.state.id = client.user?.id ?? null
    manager.state.guildCount = client.guilds.cache.size
    manager.state.startedAt = Date.now()
    manager.state.messageContentEnabled = withMessageContent
    log(`Logged in as ${client.user?.tag}`)

    // Figure out who owns this bot so only they can run commands.
    try {
      const app = await client.application?.fetch()
      const owner = app?.owner
      if (owner) {
        // Owner can be a User or a Team (which has its own ownerId).
        manager.state.ownerId = 'ownerId' in owner ? owner.ownerId : owner.id
        log(`Bot owner identified (${manager.state.ownerId}). Commands are owner-only.`)
      }
    } catch (e) {
      log(`Could not determine bot owner: ${e instanceof Error ? e.message : 'unknown'}`)
    }

    if (!withMessageContent) {
      manager.state.warning =
        'Connected, but the Message Content Intent is OFF. Presence/status works, but text commands like !ping cannot read messages until you enable it in the Developer Portal (Bot → Privileged Gateway Intents).'
      log('Message Content Intent disabled — commands will not receive text.')
    }
    applyPresence()

    // Push any saved custom commands to Discord as slash commands.
    await refreshCommands().catch((e) =>
      log(`Could not load custom commands: ${e instanceof Error ? e.message : 'unknown'}`),
    )
  })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    const cmd = manager.commands.find((c) => c.name === interaction.commandName)
    if (!cmd) return
    manager.state.commandsRun += 1
    log(`Slash command /${interaction.commandName} from ${interaction.user.username}`)
    try {
      await interaction.reply(buildReply(cmd, interaction))
    } catch (e) {
      log(`Failed to reply to /${interaction.commandName}: ${e instanceof Error ? e.message : 'unknown'}`)
    }
  })

  // When the bot joins a new server, push the commands there instantly too.
  client.on('guildCreate', async (guild) => {
    try {
      await guild.commands.set(buildCommandData())
      manager.state.guildCount = client.guilds.cache.size
      log(`Joined ${guild.name} — registered ${manager.commands.length} command(s).`)
    } catch (e) {
      log(`Failed to register commands in ${guild.name}: ${e instanceof Error ? e.message : 'unknown'}`)
    }
  })

  client.on('messageCreate', (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(PREFIX)) return

    // Owner-only: ignore commands from anyone who isn't the bot owner.
    if (manager.state.ownerId && message.author.id !== manager.state.ownerId) {
      log(`Ignored command from non-owner ${message.author.username}: ${message.content}`)
      message
        .reply('Sorry, only the bot owner can use these commands.')
        .catch((e) => log(`Failed to reply: ${e.message}`))
      return
    }

    const reply = handleCommand(message.content)
    if (reply) {
      manager.state.commandsRun += 1
      log(`Command from ${message.author.username}: ${message.content}`)
      message.reply(reply).catch((e) => log(`Failed to reply: ${e.message}`))
    }
  })

  client.on('error', (e) => {
    log(`Client error: ${e.message}`)
  })

  return client
}

function isDisallowedIntents(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /disallowed intents/i.test(msg)
}

export async function connectBot(token: string): Promise<BotState> {
  if (manager.state.connected || manager.state.connecting) return manager.state
  if (!token || token.length < 20) {
    manager.state.error = 'That does not look like a valid bot token.'
    return manager.state
  }

  manager.state.connecting = true
  manager.state.error = null
  manager.state.warning = null

  // Tear down any leftover client (from a reconnect or dev hot-reload) so we
  // never end up with two clients both listening for messages.
  if (manager.client) {
    manager.client.removeAllListeners()
    await manager.client.destroy().catch(() => {})
    manager.client = null
  }

  // First attempt: full intents (includes privileged Message Content).
  let client = buildClient(true)
  try {
    await client.login(token)
    manager.client = client
    return manager.state
  } catch (e) {
    if (isDisallowedIntents(e)) {
      // The privileged intent is not enabled in the portal. Retry without it
      // so presence/status still works. Fully tear down the first client first
      // (await + removeAllListeners) so it can't also reply to commands.
      log('Disallowed intents — retrying without Message Content Intent.')
      client.removeAllListeners()
      await client.destroy().catch(() => {})
      client = buildClient(false)
      try {
        await client.login(token)
        manager.client = client
        return manager.state
      } catch (e2) {
        manager.state.connecting = false
        manager.state.connected = false
        manager.state.error =
          e2 instanceof Error ? e2.message : 'Failed to log in. Check your token.'
        log(`Login failed: ${manager.state.error}`)
        client.removeAllListeners()
        client.destroy().catch(() => {})
        return manager.state
      }
    }

    manager.state.connecting = false
    manager.state.connected = false
    manager.state.error =
      e instanceof Error ? e.message : 'Failed to log in. Check your token.'
    log(`Login failed: ${manager.state.error}`)
    client.removeAllListeners()
    client.destroy().catch(() => {})
    return manager.state
  }
}

export async function disconnectBot(): Promise<BotState> {
  if (manager.client) {
    manager.client.removeAllListeners()
    await manager.client.destroy().catch(() => {})
    manager.client = null
  }
  manager.state.connected = false
  manager.state.connecting = false
  manager.state.username = null
  manager.state.tag = null
  manager.state.id = null
  manager.state.startedAt = null
  manager.state.guildCount = 0
  manager.state.ownerId = null
  manager.state.warning = null
  manager.state.error = null
  log('Bot disconnected.')
  return manager.state
}

export function setStatus(status: BotStatus, activityText?: string): BotState {
  manager.state.status = status
  if (typeof activityText === 'string') manager.state.activityText = activityText
  applyPresence()
  log(`Status set to ${status}${activityText ? ` — ${activityText}` : ''}`)
  return manager.state
}
