import './styles.css'
import {
  ENDPOINTS, REFRESH_MS, fetchFeed, formatInteger, isTelemetryFresh,
  parseCommunity, parseLeaderboard, parseStatus, relativeTime,
} from './api'
import type { CommunityStats, Leaderboard, NetworkStatus } from './api'
import { hamsterWheel, icon } from './icons'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#overview">Skip to dashboard</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#overview" aria-label="Squeek Pulse home">
        <img src="./favicon.svg" width="36" height="36" alt="" />
        <span>Squeek<span class="brand-light"> Pulse</span></span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        <a class="nav-link is-active" href="#overview">Overview</a>
        <a class="nav-link" href="#leaderboard">Leaderboard</a>
      </nav>
      <a class="chain-link" href="https://squeekchain.com" target="_blank" rel="noopener noreferrer">Squeekchain ${icon('arrow')}</a>
    </div>
  </header>

  <main id="overview" class="page-shell" tabindex="-1">
    <div class="page-heading">
      <div>
        <h1>Network overview<span class="heading-dot">.</span></h1>
        <p class="page-description">The live pulse of a hamster-powered blockchain.</p>
      </div>
      <div class="refresh-controls">
        <label class="auto-control" for="auto-refresh">
          <input id="auto-refresh" type="checkbox" checked />
          <span class="switch-track" aria-hidden="true"><span></span></span>
          <span>Auto-refresh <span class="muted">20s</span></span>
        </label>
        <button class="button button-primary" id="refresh" type="button">${icon('refresh')}<span>Refresh</span></button>
      </div>
    </div>

    <div class="connection-row">
      <span class="connection-state" id="connection"><span class="status-dot" aria-hidden="true"></span><span id="connection-label">Connecting to feeds</span></span>
      <span class="update-caption" id="update-caption">Fetching the latest pulse</span>
    </div>

    <div class="network-notice notice" id="network-notice" hidden>${icon('warning')}<span></span></div>

    <div class="network-grid">
      <section class="panel wheel-panel" id="wheel-panel" aria-labelledby="wheel-title" aria-busy="true">
        <div class="wheel-content">
          <div class="section-label">${icon('wheel')}<h2 id="wheel-title">At the wheel</h2></div>
          <div class="wheel-state" id="wheel-state"><span class="status-dot" aria-hidden="true"></span><span id="state-label">Connecting</span></div>
          <p class="wheel-headline" id="wheel-headline">Finding our hamster</p>
          <div class="rpm-reading"><span class="rpm-value numeric" id="rpm">–</span><span class="unit">RPM</span></div>
          <p class="wheel-description" id="wheel-description">Waiting for a hardware reading.</p>
        </div>
        <div class="wheel-visual" id="wheel-visual">${hamsterWheel}</div>
        <div class="wheel-footer">
          <span class="telemetry-caption">${icon('pulse')}<span id="telemetry-label">Hardware telemetry</span></span>
          <button class="motion-button" id="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion</button>
          <span class="reading-time" id="reading-time">Waiting for data</span>
        </div>
      </section>

      <section class="panel block-panel" aria-labelledby="block-title">
        <div class="panel-heading"><div class="section-label">${icon('blocks')}<h2 id="block-title">Block height</h2></div><span class="subtle-tag">Confirmed</span></div>
        <div class="block-reading"><span class="block-hash" aria-hidden="true">#</span><span class="large-value numeric" id="block-height">–</span></div>
        <p class="muted block-description">Built one revolution at a time.</p>
        <div class="block-progress-label"><span>Next block progress</span><span class="numeric" id="progress-label">–</span></div>
        <progress class="block-progress" id="block-progress" max="100" aria-label="Progress toward the next block"></progress>
        <div class="block-range"><span id="current-block">Awaiting block</span><span id="next-block">Awaiting block</span></div>
        <div class="block-footer">${icon('check')}<span id="confirmation-label">Waiting for settlement data</span></div>
      </section>
    </div>

    <section class="metrics-grid" aria-label="Network and community totals">
      <div class="panel metric-panel"><div class="metric-label">Distance run ${icon('distance')}</div><div class="metric-reading"><span class="metric-value numeric" id="distance">–</span><span class="unit">km</span></div><p class="metric-caption">A little further, every turn</p></div>
      <div class="panel metric-panel"><div class="metric-label">Settled rounds ${icon('check')}</div><div class="metric-reading"><span class="metric-value numeric" id="rounds">–</span></div><p class="metric-caption" id="rounds-caption">Latest confirmed round</p></div>
      <div class="panel metric-panel"><div class="metric-label">Community members ${icon('people')}</div><div class="metric-reading"><span class="metric-value numeric" id="members">–</span></div><p class="metric-caption" id="members-caption">The people behind the paws</p></div>
      <div class="panel metric-panel"><div class="metric-label">Badges earned ${icon('badge')}</div><div class="metric-reading"><span class="metric-value numeric" id="badges">–</span></div><p class="metric-caption" id="badges-caption">Small wins, shared together</p></div>
    </section>

    <div class="notice community-notice" id="community-notice" hidden>${icon('warning')}<span></span></div>

    <div class="community-grid">
      <section class="panel leaderboard-panel" id="leaderboard" aria-labelledby="leaderboard-title" tabindex="-1" aria-busy="true">
        <div class="leaderboard-heading">
          <div><h2 id="leaderboard-title">Community leaderboard</h2><p class="muted">A little friendly competition. A lot of Aura.</p></div>
          <span class="top-ten-tag">${icon('trophy')}Top 10</span>
        </div>
        <div class="leaderboard-message" id="leaderboard-message"><span id="leaderboard-message-text">Loading the community rankings…</span><button class="button button-secondary" id="retry-leaderboard" type="button" hidden>Retry rankings</button></div>
        <div class="table-wrap" id="leaderboard-table-wrap" hidden>
          <table>
            <caption class="sr-only">The top ten community members, ordered by their all-time Aura ranking.</caption>
            <thead><tr><th scope="col" class="rank-column">Rank</th><th scope="col">Member</th><th scope="col" class="badge-column">Badges</th><th scope="col" class="aura-column">Aura</th></tr></thead>
            <tbody id="leaderboard-body"></tbody>
          </table>
        </div>
        <div class="leaderboard-footer"><span id="leaderboard-updated">Awaiting community snapshot</span><button id="data-details" type="button" class="text-button">About the data ${icon('info')}</button></div>
      </section>

      <aside class="journey-panel" aria-labelledby="journey-title">
        <div class="journey-illustration" aria-hidden="true">
          <svg viewBox="0 0 260 100" fill="none"><path d="M22 76h216" stroke="#3d4936" stroke-dasharray="3 6"/><path d="m42 57 24-14 24 14v27L66 98 42 84V57Z" fill="#252e22" stroke="#69795c"/><path d="m42 57 24 14 24-14M66 71v27" stroke="#69795c"/><path d="m100 38 24-14 24 14v27l-24 14-24-14V38Z" fill="#313f29" stroke="#8b9e72"/><path d="m100 38 24 14 24-14m-24 14v27" stroke="#8b9e72"/><path d="m158 19 24-14 24 14v27l-24 14-24-14V19Z" fill="#cc8b57" stroke="#ffbe83"/><path d="m158 19 24 14 24-14m-24 14v27" stroke="#ffbe83"/><path d="m221 15 4-8 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#9eaf86"/></svg>
        </div>
        <h2 id="journey-title">Small paws.<br />Real progress.</h2>
        <p class="journey-intro">A running wheel turns physical movement into progress on Squeekchain.</p>
        <ol class="journey-steps">
          <li><span class="step-number">1</span><div><h3>The hamster runs</h3><p>Hardware measures every turn of the wheel.</p></div></li>
          <li><span class="step-number">2</span><div><h3>The oracle checks</h3><p>Wheel readings are accepted into rounds.</p></div></li>
          <li><span class="step-number">3</span><div><h3>The chain grows</h3><p>Settled work builds toward the next block.</p></div></li>
        </ol>
        <div class="journey-bottom">${icon('leaf')}<span>Powered by paws. Followed by people.</span></div>
      </aside>
    </div>

    <footer class="site-footer"><span class="footer-brand">${icon('pulse')}Squeek Pulse<span class="footer-separator">/</span><span class="muted">Every revolution counts.</span></span><div><span id="footer-refresh">Refreshes every 20 seconds</span><span class="footer-dot" aria-hidden="true">·</span><button class="text-button" id="footer-data-details" type="button">Data sources ${icon('arrow')}</button></div></footer>
  </main>

  <dialog id="data-dialog" aria-labelledby="data-dialog-title">
    <div class="dialog-heading"><h2 id="data-dialog-title">About the data</h2><button type="button" class="icon-button" id="close-dialog" aria-label="Close data details" autofocus>${icon('close')}</button></div>
    <p>Read directly from Squeekchain's public feeds every 20 seconds. Pause auto-refresh to keep the current view, or select Refresh to check now.</p>
    <div class="source-list">
      <div><h3>Wheel & chain</h3><a href="${ENDPOINTS.status}" target="_blank" rel="noopener noreferrer">Status feed ${icon('arrow')}</a><p>Live wheel speed and distance. Blocks use confirmed settlements. Settled rounds shows the highest confirmed round number. Distance follows the hardware counter and can reset.</p><p id="source-status-time" class="source-timestamp">Not yet received</p></div>
      <div><h3>Community totals</h3><a href="${ENDPOINTS.community}" target="_blank" rel="noopener noreferrer">Community stats ${icon('arrow')}</a><p>Member and earned badge counts from the latest community snapshot. Its computation time is shown below.</p><p id="source-community-time" class="source-timestamp">Not yet received</p></div>
      <div><h3>Community rankings</h3><a href="${ENDPOINTS.leaderboard}" target="_blank" rel="noopener noreferrer">Leaderboard feed ${icon('arrow')}</a><p>The first 10 ranked members by all-time Aura. Avatars use member initials. Community snapshots can lag behind the latest fetch.</p><p id="source-leaderboard-time" class="source-timestamp">Not yet received</p></div>
    </div>
    <p class="dialog-note">If a request fails, the last received values stay visible with a warning. A stale hardware reading never appears as live motion.</p>
  </dialog>
  <p class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></p>
`

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}
function text(id: string, value: string): void { get(id).textContent = value }
function hide(id: string, hidden: boolean): void { get(id).hidden = hidden }

interface FeedState<T> { data: T | null; receivedAt: number | null; error: boolean }
const status: FeedState<NetworkStatus> = { data: null, receivedAt: null, error: false }
const community: FeedState<CommunityStats> = { data: null, receivedAt: null, error: false }
const leaderboard: FeedState<Leaderboard> = { data: null, receivedAt: null, error: false }
let refreshing = false
let autoRefresh = true
let motionPaused = false
let nextRefreshAt = Date.now() + REFRESH_MS
let pollTimer: number | undefined
let lastCompletedAt: number | null = null
let lastRankingsSignature = ''

function scheduleRefresh(): void {
  window.clearTimeout(pollTimer)
  nextRefreshAt = Date.now() + REFRESH_MS
  if (autoRefresh) pollTimer = window.setTimeout(() => void refresh(), REFRESH_MS)
}

function sourceTimestamp(id: string, label: string, timestamp: number | null): void {
  text(id, timestamp === null ? `${label}: not provided` : `${label}: ${new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' })}`)
}

function notice(id: string, message: string | null): void {
  hide(id, message === null)
  get(id).querySelector('span')!.textContent = message ?? ''
}

function renderStatus(): void {
  const data = status.data
  const fresh = isTelemetryFresh(data) && !status.error
  const known = data !== null
  text('state-label', data?.state === 'UNKNOWN' ? 'Unknown' : (data?.state ?? (status.error ? 'Unavailable' : 'Connecting')))
  get('wheel-state').dataset.state = !fresh ? 'stale' : data?.state.toLowerCase()
  text('wheel-headline', !known ? (status.error ? 'Waiting for the wheel' : 'Finding our hamster') : !fresh ? 'Last known reading' : data.state === 'SPINNING' ? 'Making the rounds' : data.state === 'IDLE' ? 'Taking a breather' : 'Checking the wheel')
  text('rpm', data ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(data.rpm) : '–')
  text('wheel-description', !known ? 'Waiting for a hardware reading.' : !fresh ? 'The hardware reading is not current.' : data.state === 'SPINNING' ? 'Tiny feet. Steady momentum.' : data.state === 'IDLE' ? 'Even little legs need a break.' : 'The feed has no recognized running state.')
  text('telemetry-label', !known ? 'Hardware telemetry' : fresh ? 'Hardware connected' : 'Hardware reading delayed')
  get('wheel-panel').dataset.fresh = String(fresh)
  const spinning = fresh && data?.state === 'SPINNING'
  get('wheel-visual').classList.toggle('is-spinning', spinning && !motionPaused && autoRefresh)
  hide('motion-toggle', !spinning)
  get('motion-toggle').setAttribute('aria-pressed', String(motionPaused))
  text('motion-toggle', motionPaused ? 'Resume motion' : 'Pause motion')
  text('reading-time', data ? `Observed ${relativeTime(data.observedAt).toLowerCase()}` : 'Waiting for data')
  get('reading-time').title = data?.observedAt ? new Date(data.observedAt).toISOString() : ''
  text('block-height', data?.blockHeight !== null && data?.blockHeight !== undefined ? formatInteger(data.blockHeight) : '–')
  text('progress-label', data?.blockProgress !== null && data?.blockProgress !== undefined ? `${data.blockProgress.toFixed(1)}%` : '–')
  const progress = get<HTMLProgressElement>('block-progress')
  if (data?.blockProgress !== null && data?.blockProgress !== undefined) {
    progress.value = data.blockProgress
    progress.setAttribute('aria-valuetext', `${data.blockProgress.toFixed(1)} percent toward the next block`)
  } else {
    progress.removeAttribute('value')
    progress.setAttribute('aria-valuetext', 'Block progress unavailable')
  }
  text('current-block', data?.blockHeight ? `#${formatInteger(data.blockHeight)}` : 'Awaiting block')
  text('next-block', data?.blockHeight ? `#${formatInteger((BigInt(data.blockHeight) + 1n).toString())}` : 'Awaiting block')
  text('confirmation-label', !data ? 'Waiting for settlement data' : status.error ? 'Last received settlement' : data.confirmedAt ? `Confirmed ${relativeTime(data.confirmedAt).toLowerCase()}` : 'Confirmation time not provided')
  text('distance', data ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 3, minimumFractionDigits: 3 }).format(data.distanceKm) : '–')
  text('rounds', data?.settledRound ? formatInteger(data.settledRound) : '–')
  text('rounds-caption', data?.settledRound ? `Through round #${formatInteger(data.settledRound)}` : 'Latest confirmed round')
  notice('network-notice', status.error ? `The status feed couldn't refresh. ${data ? 'Showing the last received values.' : 'Check your connection.'} Select Refresh to try again.` : data && !fresh ? 'The hardware reading is delayed. Showing the last reported state; the feed is checked again on refresh.' : null)
  sourceTimestamp('source-status-time', 'Hardware observed', data?.observedAt ?? null)
}

function renderCommunity(): void {
  text('members', community.data ? formatInteger(community.data.members) : '–')
  text('badges', community.data ? formatInteger(community.data.badgesEarned) : '–')
  text('members-caption', community.error ? 'Community feed unavailable' : 'The people behind the paws')
  text('badges-caption', community.error ? 'Community feed unavailable' : 'Small wins, shared together')
  notice('community-notice', community.error ? `The community feed couldn't refresh. ${community.data ? 'Showing the last received totals.' : 'Totals will appear when it reconnects.'} Select Refresh to try again.` : null)
  sourceTimestamp('source-community-time', 'Snapshot computed', community.data?.computedAt ?? null)
}

function renderRankings(): void {
  const data = leaderboard.data
  const hasEntries = data !== null && data.entries.length > 0
  hide('leaderboard-table-wrap', !hasEntries)
  hide('leaderboard-message', hasEntries && !leaderboard.error)
  hide('retry-leaderboard', !leaderboard.error)
  text('leaderboard-message-text', leaderboard.error
    ? `Rankings couldn't refresh. ${hasEntries ? 'Showing the last received top 10.' : 'Check your connection and try again.'}`
    : data ? 'No rankings yet. The top 10 will appear here when the community feed publishes them.'
      : 'Loading the community rankings…')
  const signature = JSON.stringify(data?.entries ?? [])
  if (signature !== lastRankingsSignature) {
    const fragment = document.createDocumentFragment()
    for (const leader of data?.entries ?? []) {
      const row = document.createElement('tr')
      row.className = leader.rank <= 3 ? `podium podium-${leader.rank}` : ''
      const rank = document.createElement('td')
      rank.className = 'rank-cell numeric'
      const rankValue = document.createElement('span')
      rankValue.textContent = String(leader.rank).padStart(2, '0')
      rank.append(rankValue)
      const member = document.createElement('td')
      const memberInner = document.createElement('div')
      memberInner.className = 'member-cell'
      const avatar = document.createElement('span')
      avatar.className = `member-avatar avatar-${(leader.rank - 1) % 5}`
      avatar.setAttribute('aria-hidden', 'true')
      avatar.textContent = leader.name.replace(/^@/, '').slice(0, 2).toUpperCase()
      const memberInfo = document.createElement('div')
      memberInfo.className = 'member-info'
      const name = document.createElement(leader.username ? 'a' : 'span')
      name.className = 'member-name'
      name.textContent = leader.name
      if (name instanceof HTMLAnchorElement && leader.username) {
        name.href = `https://x.com/${encodeURIComponent(leader.username)}`
        name.target = '_blank'
        name.rel = 'noopener noreferrer'
        name.setAttribute('aria-label', `${leader.name} on X (opens in a new tab)`)
      }
      memberInfo.append(name)
      if (leader.tier) {
        const tier = document.createElement('span')
        tier.className = 'member-tier'
        tier.textContent = `${leader.tier.charAt(0).toUpperCase()}${leader.tier.slice(1)} member`
        memberInfo.append(tier)
      }
      memberInner.append(avatar, memberInfo)
      member.append(memberInner)
      const badges = document.createElement('td')
      badges.className = 'badges-cell numeric'
      badges.textContent = formatInteger(leader.badges)
      const aura = document.createElement('td')
      aura.className = 'aura-cell numeric'
      aura.textContent = formatInteger(leader.aura)
      row.append(rank, member, badges, aura)
      fragment.append(row)
    }
    get('leaderboard-body').replaceChildren(fragment)
    lastRankingsSignature = signature
  }
  text('leaderboard-updated', data ? `Snapshot ${relativeTime(data.computedAt).toLowerCase()}` : 'Awaiting community snapshot')
  get('leaderboard-updated').title = data?.computedAt ? new Date(data.computedAt).toISOString() : ''
  sourceTimestamp('source-leaderboard-time', 'Snapshot computed', data?.computedAt ?? null)
}

function renderConnection(): void {
  const failures = [status, community, leaderboard].filter(feed => feed.error).length
  const allReceived = [status, community, leaderboard].every(feed => feed.receivedAt !== null)
  const delayed = status.data !== null && !isTelemetryFresh(status.data)
  text('connection-label', !autoRefresh ? 'Auto-refresh paused' : failures === 3 ? 'Feeds unavailable' : failures > 0 ? 'Some feeds unavailable' : !allReceived ? 'Connecting to feeds' : delayed ? 'Hardware feed delayed' : 'Live feeds')
  get('connection').dataset.state = !autoRefresh || failures > 0 || delayed ? 'warning' : allReceived ? 'live' : 'loading'
  const remaining = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1_000))
  text('update-caption', refreshing ? 'Fetching the latest pulse' : lastCompletedAt === null ? 'Waiting for the first update' : !autoRefresh ? `Last checked ${relativeTime(lastCompletedAt).toLowerCase()}` : `Next refresh in ${remaining}s`)
  text('footer-refresh', autoRefresh ? 'Refreshes every 20 seconds' : 'Auto-refresh paused')
}

async function loadFeed<T>(feed: FeedState<T>, url: string, parser: (value: unknown) => T): Promise<void> {
  try {
    feed.data = await fetchFeed(url, parser)
    feed.receivedAt = Date.now()
    feed.error = false
  } catch {
    feed.error = true
  }
}

async function refresh(manual = false): Promise<void> {
  if (refreshing) return
  refreshing = true
  window.clearTimeout(pollTimer)
  const button = get<HTMLButtonElement>('refresh')
  button.disabled = true
  button.querySelector('span')!.textContent = 'Refreshing'
  button.classList.add('is-refreshing')
  get('wheel-panel').setAttribute('aria-busy', 'true')
  get('leaderboard').setAttribute('aria-busy', 'true')
  get<HTMLButtonElement>('retry-leaderboard').disabled = true
  renderConnection()
  await Promise.all([
    loadFeed(status, ENDPOINTS.status, parseStatus).then(renderStatus),
    loadFeed(community, ENDPOINTS.community, parseCommunity).then(renderCommunity),
    loadFeed(leaderboard, ENDPOINTS.leaderboard, parseLeaderboard).then(renderRankings),
  ])
  refreshing = false
  lastCompletedAt = Date.now()
  scheduleRefresh()
  button.disabled = false
  button.querySelector('span')!.textContent = 'Refresh'
  button.classList.remove('is-refreshing')
  get<HTMLButtonElement>('retry-leaderboard').disabled = false
  get('wheel-panel').setAttribute('aria-busy', 'false')
  get('leaderboard').setAttribute('aria-busy', 'false')
  renderConnection()
  if (manual) {
    const failures = [status, community, leaderboard].filter(feed => feed.error).length
    text('announcement', failures ? `${failures} ${failures === 1 ? 'feed is' : 'feeds are'} unavailable. Last received values are kept where available. Try Refresh again.` : 'Dashboard refreshed. All three feeds responded.')
  }
}

get('refresh').addEventListener('click', () => { text('announcement', 'Refreshing the dashboard.'); void refresh(true) })
get('retry-leaderboard').addEventListener('click', () => void refresh(true))
get<HTMLInputElement>('auto-refresh').addEventListener('change', event => {
  autoRefresh = (event.currentTarget as HTMLInputElement).checked
  scheduleRefresh()
  renderConnection()
  renderStatus()
  text('announcement', autoRefresh ? 'Auto-refresh enabled. The dashboard checks every 20 seconds.' : 'Auto-refresh paused. You can still use Refresh.')
})
get('motion-toggle').addEventListener('click', () => { motionPaused = !motionPaused; renderStatus() })

const dialog = get<HTMLDialogElement>('data-dialog')
get('data-details').addEventListener('click', () => dialog.showModal())
get('footer-data-details').addEventListener('click', () => dialog.showModal())
get('close-dialog').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close()
  }
})

function updateNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach(link => {
    const active = link.hash === (location.hash === '#leaderboard' ? '#leaderboard' : '#overview')
    link.classList.toggle('is-active', active)
    if (active) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}
window.addEventListener('hashchange', updateNavigation)
updateNavigation()
void refresh()
window.setInterval(() => {
  renderConnection()
  renderStatus()
  renderRankings()
}, 1_000)
