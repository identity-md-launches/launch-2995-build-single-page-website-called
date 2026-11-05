export const ENDPOINTS = {
  status: 'https://api.squeekchain.com/v1/status',
  community: 'https://community.squeekchain.com/v1/community/stats',
  leaderboard: 'https://community.squeekchain.com/v1/community/leaderboard?limit=10',
} as const

export const REFRESH_MS = 20_000
export const REQUEST_TIMEOUT_MS = 12_000

export interface NetworkStatus {
  state: 'SPINNING' | 'IDLE' | 'UNKNOWN'
  rpm: number
  distanceKm: number
  observedAt: number | null
  staleAfterSeconds: number
  freshness: string
  blockHeight: string | null
  blockProgress: number | null
  settledRound: string | null
  oracleState: string | null
  confirmedAt: number | null
}

export interface CommunityStats {
  members: number
  badgesEarned: number
  computedAt: number | null
}

export interface Leader {
  rank: number
  code: string
  name: string
  username: string | null
  aura: number
  badges: number
  tier: string | null
}

export interface Leaderboard {
  entries: Leader[]
  computedAt: number | null
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

function count(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('The feed returned an invalid count.')
  }
  return value
}

function unsigned(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('The feed returned an invalid measurement.')
  }
  return value
}

function integerString(value: unknown): string | null {
  return typeof value === 'string' && /^\d+$/.test(value) ? value : null
}

function timestamp(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseStatus(value: unknown): NetworkStatus {
  const root = record(value)
  const measurement = record(root.measurement)
  const anchor = record(record(root.builder).anchor)
  const progress = integerString(anchor.blockProgress)
  const blockProgress = progress !== null && Number(progress) < 1_000_000_000
    ? Number(progress) / 1_000_000_000 * 100 : null
  return {
    state: measurement.coreStatus === 'SPINNING' || measurement.coreStatus === 'IDLE'
      ? measurement.coreStatus : 'UNKNOWN',
    rpm: unsigned(measurement.rpmMilli) / 1_000,
    distanceKm: unsigned(measurement.distanceMm) / 1_000_000,
    observedAt: timestamp(measurement.observedAt),
    staleAfterSeconds: typeof measurement.staleAfterSeconds === 'number'
      && measurement.staleAfterSeconds > 0 ? measurement.staleAfterSeconds : 120,
    freshness: typeof measurement.freshness === 'string' ? measurement.freshness : 'unknown',
    blockHeight: integerString(anchor.blockHeight),
    blockProgress,
    settledRound: integerString(anchor.settledThroughRound),
    oracleState: typeof record(root.oracle).state === 'string'
      ? record(root.oracle).state as string : null,
    confirmedAt: timestamp(anchor.confirmedAt),
  }
}

export function parseCommunity(value: unknown): CommunityStats {
  const root = record(value)
  return {
    members: count(root.members),
    badgesEarned: count(root.badgesEarned),
    computedAt: timestamp(record(root.snapshot).computedAt),
  }
}

export function parseLeaderboard(value: unknown): Leaderboard {
  const root = record(value)
  if (!Array.isArray(root.entries)) throw new Error('The rankings are not available.')
  const entries = root.entries.map((value): Leader => {
    const entry = record(value)
    const identity = record(entry.identity)
    const username = typeof identity.username === 'string' && identity.username.length > 0
      ? identity.username : null
    const alias = typeof identity.alias === 'string' && identity.alias.trim()
      ? identity.alias : null
    const rank = count(entry.rank)
    if (rank === 0 || typeof entry.code !== 'string' || !entry.code) {
      throw new Error('The feed returned an invalid ranking.')
    }
    return {
      rank,
      code: entry.code,
      name: username ?? alias ?? (typeof identity.name === 'string' && identity.name.trim()
        ? identity.name : entry.code),
      username,
      aura: count(entry.aura),
      badges: count(entry.badges),
      tier: typeof entry.tier === 'string' ? entry.tier : null,
    }
  }).sort((a, b) => a.rank - b.rank).slice(0, 10)
  if (new Set(entries.map(entry => entry.rank)).size !== entries.length) {
    throw new Error('The feed returned duplicate rankings.')
  }
  return { entries, computedAt: timestamp(record(root.snapshot).computedAt) }
}

export async function fetchFeed<T>(url: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })
  if (!response.ok) throw new Error(`The feed responded with HTTP ${response.status}.`)
  return parse(await response.json())
}

export function isTelemetryFresh(data: NetworkStatus | null, now = Date.now()): boolean {
  return data !== null && data.freshness === 'online' && data.observedAt !== null
    && now - data.observedAt <= data.staleAfterSeconds * 1_000
    && now >= data.observedAt - 60_000
}

export function formatInteger(value: string | number): string {
  return new Intl.NumberFormat('en-US').format(typeof value === 'string' ? BigInt(value) : value)
}

export function relativeTime(value: number | null, now = Date.now()): string {
  if (value === null) return 'Not yet received'
  const seconds = Math.max(0, Math.floor((now - value) / 1_000))
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}h ago`
  return `${Math.floor(seconds / 86_400)}d ago`
}
