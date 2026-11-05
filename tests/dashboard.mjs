// Production-export integration checks. All fixture data is confined to this test.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const load = (name, override) => import(override ? pathToFileURL(resolve(override)).href : name)
const { chromium, webkit } = await load('playwright', process.env.SQUEEK_PLAYWRIGHT_MODULE)
const { default: AxeBuilder } = await load('@axe-core/playwright', process.env.SQUEEK_AXE_MODULE)
const output = resolve('test/scratch/validation')
await mkdir(output, { recursive: true })
const results = []
const root = resolve('dist')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }
const localFailures = []
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith('/preview/')) { res.writeHead(404).end(); return }
    const path = decodeURIComponent(url.pathname.slice('/preview/'.length))
    const file = resolve(root, path || 'index.html')
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return }
    const body = await readFile(file)
    res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream')
    res.end(body)
  } catch { localFailures.push(req.url); res.writeHead(404).end() }
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const url = `http://127.0.0.1:${server.address().port}/preview/`
const chosenBrowser = process.env.SQUEEK_TEST_BROWSER === 'webkit' ? webkit : chromium
if (!chosenBrowser) throw new Error('Requested browser is not available in the supplied module.')
const browser = await chosenBrowser.launch({ headless: true })
const report = async (name, run) => {
  await run()
  results.push({ name, passed: true })
  console.log(`PASS ${name}`)
}

const currentTime = Date.now()
const statusFixture = {
  measurement: { coreStatus: 'SPINNING', rpmMilli: 42750, distanceMm: 3351326, freshness: 'online', observedAt: new Date(currentTime).toISOString(), staleAfterSeconds: 120 },
  builder: { anchor: { blockHeight: '366', blockProgress: '425653103', settledThroughRound: '239', confirmedAt: new Date(currentTime - 60_000).toISOString() }, projected: { blockHeight: '999' } },
  oracle: { state: 'accepted' },
}
const communityFixture = { members: 40190, badgesEarned: 73748, snapshot: { computedAt: new Date(currentTime - 30_000).toISOString() } }
const rankingsFixture = { entries: Array.from({ length: 13 }, (_, i) => ({ rank: i + 1, code: `fixture-${i}`, identity: i === 9 ? { kind: 'alias', alias: 'Test alias' } : { kind: 'x', username: `test_member_${i + 1}` }, aura: 6618 - i * 50, badges: 12 - (i % 4), tier: 'gold' })).reverse(), snapshot: { computedAt: new Date(currentTime).toISOString() } }
let payloads = structuredClone({ status: statusFixture, community: communityFixture, leaderboard: rankingsFixture })
let failures = new Set()
let delayStatus = false
let pendingStatusRoute = null
const requests = { status: 0, community: 0, leaderboard: 0 }
const errors = []
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error' && !message.text().includes('status of 503')) errors.push(message.text()) })
await page.clock.install({ time: new Date(currentTime) })
await page.route(/https:\/\/(api|community)\.squeekchain\.com\//, async route => {
  const requestUrl = route.request().url()
  const key = requestUrl.includes('/leaderboard') ? 'leaderboard' : requestUrl.includes('/stats') ? 'community' : 'status'
  requests[key]++
  if (key === 'status' && delayStatus) { pendingStatusRoute = route; return }
  await route.fulfill({ status: failures.has(key) ? 503 : 200, contentType: 'application/json', body: JSON.stringify(payloads[key]) })
})
const content = id => page.locator(`#${id}`).innerText()
const finished = () => page.waitForFunction(() => document.querySelector('#refresh')?.disabled === false && document.querySelector('#wheel-panel')?.getAttribute('aria-busy') === 'false')
const refresh = async () => { await page.getByRole('button', { name: 'Refresh', exact: true }).click(); await finished() }

try {
  await page.goto(url)
  await finished()
  await report('Production export works at a hosting subpath; all live-field conversions and confirmed block selection', async () => {
    assert.equal(await content('rpm'), '42.8')
    assert.equal(await content('distance'), '3.351')
    assert.equal(await content('block-height'), '366')
    assert.equal(await content('progress-label'), '42.6%')
    assert.equal(await content('rounds'), '239')
    assert.equal(await content('members'), '40,190')
    assert.equal(await content('badges'), '73,748')
    assert(Math.abs(await page.locator('#block-progress').evaluate(el => el.value) - 42.5653103) < 0.000001)
    assert.equal(await page.locator('tbody tr').count(), 10)
    assert.match(await page.locator('tbody tr').first().innerText(), /test_member_1/)
    assert.match(await page.locator('tbody tr').last().innerText(), /Test alias/)
    assert.equal(await page.locator('#wheel-visual').evaluate(el => el.classList.contains('is-spinning')), true)
    assert.equal(await page.locator('a.member-name').first().getAttribute('href'), 'https://x.com/test_member_1')
    assert.equal(await page.locator('#leaderboard-body').getAttribute('aria-live'), null)
    assert.equal(await page.evaluate(() => document.fonts.check('500 16px Manrope')), true)
  })

  await report('Manual refresh reloads all feeds and updates IDLE without animation', async () => {
    payloads.status.measurement.coreStatus = 'IDLE'
    payloads.status.measurement.rpmMilli = 0
    payloads.community.members = 40200
    const before = { ...requests }
    await refresh()
    assert.equal(await content('state-label'), 'IDLE')
    assert.equal(await content('rpm'), '0.0')
    assert.equal(await content('members'), '40,200')
    assert.equal(await page.locator('#wheel-visual').evaluate(el => el.classList.contains('is-spinning')), false)
    for (const key of Object.keys(requests)) assert.equal(requests[key], before[key] + 1)
  })

  await report('Auto-refresh runs at 20 seconds; pause freezes fetches, manual refresh still works, resume restarts cadence', async () => {
    let before = { ...requests }
    await page.clock.runFor(19_000)
    assert.deepEqual(requests, before)
    await page.clock.runFor(1_100)
    await finished()
    for (const key of Object.keys(requests)) assert.equal(requests[key], before[key] + 1)
    await page.getByLabel('Auto-refresh 20s').uncheck()
    before = { ...requests }
    await page.clock.runFor(45_000)
    assert.deepEqual(requests, before)
    assert.equal(await content('connection-label'), 'Auto-refresh paused')
    await refresh()
    assert.equal(requests.status, before.status + 1)
    await page.getByLabel('Auto-refresh 20s').check()
    before = { ...requests }
    await page.clock.runFor(20_100)
    await finished()
    assert.equal(requests.status, before.status + 1)
  })

  await report('Partial outage retains last known values, lets other feeds update, and recovers on retry', async () => {
    failures = new Set(['status', 'leaderboard'])
    payloads.community.badgesEarned = 74000
    const oldRpm = await content('rpm')
    await refresh()
    assert.equal(await content('rpm'), oldRpm)
    assert.equal(await content('badges'), '74,000')
    assert.equal(await page.locator('#network-notice').isVisible(), true)
    assert.equal(await page.locator('tbody tr').count(), 10)
    assert.equal(await page.getByRole('button', { name: 'Retry rankings' }).isVisible(), true)
    assert.equal(await content('connection-label'), 'Some feeds unavailable')
    failures.clear()
    await page.getByRole('button', { name: 'Retry rankings' }).click()
    await finished()
    assert.equal(await page.locator('#network-notice').isVisible(), false)
    assert.equal(await page.getByRole('button', { name: 'Retry rankings' }).isVisible(), false)
  })

  await report('Empty rankings and malformed measurements show honest, recoverable states', async () => {
    payloads.leaderboard.entries = []
    payloads.status.measurement.rpmMilli = -1
    await refresh()
    assert.match(await content('leaderboard-message-text'), /No rankings yet/)
    assert.equal(await page.locator('table').isVisible(), false)
    assert.equal(await page.locator('#network-notice').isVisible(), true)
    payloads = structuredClone({ status: statusFixture, community: communityFixture, leaderboard: rankingsFixture })
    await refresh()
    assert.equal(await page.locator('tbody tr').count(), 10)
  })

  await report('Stale and unknown hardware states never animate; pause motion and reduced motion work', async () => {
    payloads.status.measurement.observedAt = new Date(currentTime - 600_000).toISOString()
    await refresh()
    assert.equal(await content('wheel-headline'), 'Last known reading')
    assert.equal(await page.locator('#wheel-visual').evaluate(el => el.classList.contains('is-spinning')), false)
    payloads.status.measurement.observedAt = new Date(currentTime + 90_000).toISOString()
    payloads.status.measurement.coreStatus = 'UNRECOGNIZED'
    await refresh()
    assert.equal(await content('state-label'), 'Unknown')
    payloads.status.measurement.coreStatus = 'SPINNING'
    await refresh()
    await page.getByRole('button', { name: 'Pause motion' }).click()
    assert.equal(await page.locator('#wheel-visual').evaluate(el => el.classList.contains('is-spinning')), false)
    await page.getByRole('button', { name: 'Resume motion' }).click()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.wheel-spokes')).animationName === 'none')
    await page.clock.runFor(200)
    assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length), 0)
    assert.equal(await page.locator('#refresh').evaluate(el => getComputedStyle(el).transitionDuration), '0s')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  await report('Navigation, native dialog keyboard dismissal, focus restoration, and keyboard controls', async () => {
    await page.getByRole('link', { name: 'Leaderboard', exact: true }).click()
    assert.equal(new URL(page.url()).hash, '#leaderboard')
    await page.waitForFunction(() => document.querySelector('a.nav-link[href="#leaderboard"]').getAttribute('aria-current') === 'location')
    assert.equal(await page.getByRole('link', { name: 'Leaderboard', exact: true }).getAttribute('aria-current'), 'location')
    await page.getByRole('button', { name: 'About the data' }).click()
    assert.equal(await page.getByRole('dialog').isVisible(), true)
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'close-dialog')
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim().startsWith('Status feed')), true)
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('dialog').isVisible(), false)
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'data-details')
    await page.getByRole('link', { name: 'Overview', exact: true }).click()
    await page.locator('#auto-refresh').focus()
    await page.keyboard.press('Space')
    assert.equal(await page.getByLabel('Auto-refresh 20s').isChecked(), false)
    await page.keyboard.press('Space')
    assert.equal(await page.getByLabel('Auto-refresh 20s').isChecked(), true)
    await page.locator('#refresh').focus()
    await page.screenshot({ path: `${output}/keyboard-focus.png` })
  })

  await report('Long and untrusted identity text remains text; values and usernames stay visible', async () => {
    payloads.leaderboard.entries[12].identity = { kind: 'alias', alias: '<img src=x onerror=alert(1)> LongCommunityMemberNameThatMustWrapWithoutClipping' }
    payloads.status.builder.anchor.blockHeight = '123456789012345678901234567890'
    await refresh()
    assert.equal(await page.locator('tbody img').count(), 0)
    assert.match(await page.locator('tbody tr').first().innerText(), /<img src=x onerror=alert\(1\)>/)
    assert.equal(await content('block-height'), '123,456,789,012,345,678,901,234,567,890')
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag:el.tagName, class:el.className?.baseVal ?? el.className, id:el.id, right:el.getBoundingClientRect().right })).slice(0,10))
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `long-content overflow at ${width}: ${JSON.stringify(overflow)}`)
    }
    payloads = structuredClone({ status: statusFixture, community: communityFixture, leaderboard: rankingsFixture })
    payloads.status.measurement.observedAt = new Date(currentTime + 90_000).toISOString()
    await refresh()
  })

  await report('Primary action, responsive layout, and automated accessibility at 320, 390, 768, 1024, and 1440', async () => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 })
      await page.evaluate(() => scrollTo(0, 0))
      const geometry = await page.evaluate(() => {
        const action = document.querySelector('#refresh').getBoundingClientRect()
        const wheel = document.querySelector('#wheel-panel').getBoundingClientRect()
        return { overflow: document.documentElement.scrollWidth > innerWidth, actionBottom: action.bottom, wheelTop: wheel.top, height: innerHeight }
      })
      assert.equal(geometry.overflow, false, `overflow at ${width}`)
      assert(geometry.actionBottom < geometry.height)
      assert(geometry.wheelTop < geometry.height)
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      await writeFile(`${output}/axe-${width}.json`, JSON.stringify(audit.violations, null, 2))
      assert.deepEqual(audit.violations.map(v => `${v.id}: ${v.description}`), [], `axe violations at ${width}`)
      await page.screenshot({ path: `${output}/${width}-full.png`, fullPage: true })
      if (width === 390) await page.screenshot({ path: `${output}/390-first.png` })
    }
    await page.getByRole('button', { name: 'About the data' }).click()
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    assert.deepEqual(audit.violations.map(v => v.id), [], 'dialog axe violations')
    await page.screenshot({ path: `${output}/data-dialog.png` })
    await page.keyboard.press('Escape')
  })

  await report('200% text enlargement and RTL reflow preserve content and controls', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '32px' })
    await page.evaluate(() => scrollTo(0,0))
    await page.screenshot({ path: `${output}/text-200.png`, fullPage: true })
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ class:el.className?.baseVal ?? el.className, id:el.id, right:el.getBoundingClientRect().right })).slice(0,20))
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, JSON.stringify(overflow))
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; document.documentElement.dir = 'rtl' })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: `${output}/rtl.png`, fullPage: true })
    await page.evaluate(() => { document.documentElement.dir = 'ltr' })
  })

  await report('Slow request prevents overlapping refresh; timeout exits loading and allows recovery', async () => {
    delayStatus = true
    const before = requests.status
    await page.getByRole('button', { name: 'Refresh', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('#refresh').disabled)
    assert.equal(requests.status, before + 1)
    await page.clock.runFor(21_000)
    await finished()
    assert.equal(await page.locator('#network-notice').isVisible(), true)
    assert.equal(requests.status, before + 1)
    await pendingStatusRoute?.abort().catch(() => {})
    delayStatus = false
    await refresh()
    assert.equal(await page.locator('#network-notice').isVisible(), false)
  })

  await report('Initial total outage, community-only failure, empty-source recovery, no local resource failures', async () => {
    const failurePage = await context.newPage()
    await failurePage.route(/https:\/\/(api|community)\.squeekchain\.com\//, route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
    await failurePage.goto(url)
    await failurePage.waitForFunction(() => document.querySelector('#refresh')?.disabled === false)
    assert.equal(await failurePage.locator('#connection-label').innerText(), 'Feeds unavailable')
    for (const id of ['rpm', 'members', 'badges', 'rounds', 'distance', 'block-height']) assert.equal(await failurePage.locator(`#${id}`).innerText(), '–')
    assert.equal(await failurePage.locator('#leaderboard-table-wrap').isVisible(), false)
    await failurePage.screenshot({ path: `${output}/initial-outage.png`, fullPage: true })
    await failurePage.close()
    failures = new Set(['community'])
    await refresh()
    assert.equal(await page.locator('#community-notice').isVisible(), true)
    failures.clear()
    await refresh()
    assert.equal(await page.locator('#community-notice').isVisible(), false)
    assert.deepEqual(localFailures, [])
    assert.deepEqual(errors, [])
  })
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ browser: process.env.SQUEEK_TEST_BROWSER ?? 'chromium', results, localFailures, errors }, null, 2))
  await context.close()
  await browser.close()
  await new Promise(done => server.close(done))
}
console.log(`${results.length} integration groups passed.`)
