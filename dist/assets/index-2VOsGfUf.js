(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const h of s.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function r(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=r(a);fetch(a.href,s)}})();const v={status:"https://api.squeekchain.com/v1/status",community:"https://community.squeekchain.com/v1/community/stats",leaderboard:"https://community.squeekchain.com/v1/community/leaderboard?limit=10"},q=2e4,z=12e3;function c(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{}}function w(e){if(typeof e!="number"||!Number.isSafeInteger(e)||e<0)throw new Error("The feed returned an invalid count.");return e}function W(e){if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error("The feed returned an invalid measurement.");return e}function H(e){return typeof e=="string"&&/^\d+$/.test(e)?e:null}function L(e){if(typeof e!="string")return null;const t=Date.parse(e);return Number.isFinite(t)?t:null}function J(e){const t=c(e),r=c(t.measurement),i=c(c(t.builder).anchor),a=H(i.blockProgress),s=a!==null&&Number(a)<1e9?Number(a)/1e9*100:null;return{state:r.coreStatus==="SPINNING"||r.coreStatus==="IDLE"?r.coreStatus:"UNKNOWN",rpm:W(r.rpmMilli)/1e3,distanceKm:W(r.distanceMm)/1e6,observedAt:L(r.observedAt),staleAfterSeconds:typeof r.staleAfterSeconds=="number"&&r.staleAfterSeconds>0?r.staleAfterSeconds:120,freshness:typeof r.freshness=="string"?r.freshness:"unknown",blockHeight:H(i.blockHeight),blockProgress:s,settledRound:H(i.settledThroughRound),oracleState:typeof c(t.oracle).state=="string"?c(t.oracle).state:null,confirmedAt:L(i.confirmedAt)}}function Q(e){const t=c(e);return{members:w(t.members),badgesEarned:w(t.badgesEarned),computedAt:L(c(t.snapshot).computedAt)}}function ee(e){const t=c(e);if(!Array.isArray(t.entries))throw new Error("The rankings are not available.");const r=t.entries.map(i=>{const a=c(i),s=c(a.identity),h=typeof s.username=="string"&&s.username.length>0?s.username:null,S=typeof s.alias=="string"&&s.alias.trim()?s.alias:null,k=w(a.rank);if(k===0||typeof a.code!="string"||!a.code)throw new Error("The feed returned an invalid ranking.");return{rank:k,code:a.code,name:h??S??(typeof s.name=="string"&&s.name.trim()?s.name:a.code),username:h,aura:w(a.aura),badges:w(a.badges),tier:typeof a.tier=="string"?a.tier:null}}).sort((i,a)=>i.rank-a.rank).slice(0,10);if(new Set(r.map(i=>i.rank)).size!==r.length)throw new Error("The feed returned duplicate rankings.");return{entries:r,computedAt:L(c(t.snapshot).computedAt)}}async function te(e,t){const r=await fetch(e,{signal:AbortSignal.timeout(z),headers:{Accept:"application/json"},cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error(`The feed responded with HTTP ${r.status}.`);return t(await r.json())}function _(e,t=Date.now()){return e!==null&&e.freshness==="online"&&e.observedAt!==null&&t-e.observedAt<=e.staleAfterSeconds*1e3&&t>=e.observedAt-6e4}function p(e){return new Intl.NumberFormat("en-US").format(typeof e=="string"?BigInt(e):e)}function N(e,t=Date.now()){if(e===null)return"Not yet received";const r=Math.max(0,Math.floor((t-e)/1e3));return r<5?"Just now":r<60?`${r}s ago`:r<3600?`${Math.floor(r/60)}m ago`:r<86400?`${Math.floor(r/3600)}h ago`:`${Math.floor(r/86400)}d ago`}const j={arrow:'<path d="M7 17 17 7M7 7h10v10"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/>',pulse:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',wheel:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5V10m0 4v6.5M3.5 12H10m4 0h6.5M6 6l4.5 4.5m3 3L18 18M6 18l4.5-4.5m3-3L18 6"/>',blocks:'<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm-8 9 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5M12 12v9"/>',distance:'<path d="M5 16.5a3 3 0 1 1 3 3h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h11"/><circle cx="5" cy="16.5" r="1"/><path d="m16 4.5 3 3-3 3"/>',check:'<path d="m8 12 3 3 5-6"/><circle cx="12" cy="12" r="9"/>',people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',badge:'<path d="m12 2 3 2 3.5.5 1 3.5L22 11l-2.5 3-1 3.5-3.5.5-3 2-3-2-3.5-.5-1-3.5L2 11l2.5-3 1-3.5L9 4l3-2Z"/><path d="m9 11 2 2 4-4"/>',trophy:'<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-4 3v-3h8v3"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',warning:'<path d="m12 3 10 17H2L12 3Zm0 6v5m0 3v.01"/>',leaf:'<path d="M20 3c0 11-1 16-8 16a7 7 0 0 1 0-14l8-2ZM4 21 15 10"/>'};function l(e,t=""){return`<svg class="icon ${t}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${j[e]??j.info}</svg>`}const ae=`
<svg class="hamster-art" viewBox="0 0 360 286" fill="none" aria-hidden="true">
  <ellipse cx="184" cy="266" rx="130" ry="8" fill="#101210"/>
  <path d="m181 145-47 115h99l-46-115" fill="#1f2420" stroke="#657064" stroke-width="3" stroke-linejoin="round"/>
  <path d="M126 263h115" stroke="#a3aa9a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="182" cy="129" r="112" fill="#1c221c" stroke="#70796b" stroke-width="3"/>
  <circle cx="182" cy="129" r="101" stroke="#30392d" stroke-width="10"/>
  <g class="wheel-spokes" style="transform-origin:182px 129px">
    <g stroke="#657252" stroke-width="2">
      <path d="M182 29v200M82 129h200m-171-71 142 142m0-142L111 200M144 37l76 184M90 91l184 76M90 167l184-76M144 221l76-184"/>
    </g>
    <circle cx="182" cy="129" r="111" stroke="#ffad74" stroke-width="5" stroke-dasharray="2 17"/>
  </g>
  <circle cx="182" cy="129" r="10" fill="#282e24" stroke="#9aab85" stroke-width="3"/>
  <path d="M113 215c-6-4-10-1-11 5" stroke="#eac4a6" stroke-width="6" stroke-linecap="round"/>
  <g class="hamster-body">
    <path d="M139 219c-16 2-31-5-34-21-5-26 17-47 39-41 15-21 43-17 52 1 16-3 30 6 29 22-1 16-17 33-38 34-15 12-32 11-48 5Z" fill="#d89b64" stroke="#352e25" stroke-width="3"/>
    <path d="M144 163c-13-21 10-37 24-20l4 14" fill="#d89b64" stroke="#352e25" stroke-width="3"/>
    <path d="M151 158c-5-10 4-17 10-9" stroke="#f1c0aa" stroke-width="7" stroke-linecap="round"/>
    <path d="M164 169c12-11 30-7 36 1 17-2 23 7 17 19-8 16-27 23-45 23-14 11-36 9-43-1-7-12 5-32 35-42Z" fill="#f4e1c4"/>
    <path d="M176 205c-7 11-2 17 10 14m-58-11c-4 11 2 16 13 12" fill="#f4e1c4" stroke="#352e25" stroke-width="3" stroke-linecap="round"/>
    <circle class="hamster-eye" cx="192" cy="175" r="4" fill="#292b23"/>
    <circle cx="193" cy="174" r="1" fill="#fff3dd"/>
    <path d="m219 177 7 2-6 5" fill="#c8786c"/>
    <path d="m211 188 4 2 4-3m-10-6 21 6m-21-2 17 9" stroke="#574537" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="197" cy="188" rx="6" ry="3.5" fill="#e9b99e"/>
  </g>
  <g class="motion-marks" stroke="#ffad74" stroke-width="2" stroke-linecap="round">
    <path d="M39 122h14m-22 12h19m9-39 9 4M301 71l10-7m-1 19 14-4"/>
  </g>
  <path d="M300 232v10m-5-5h10M48 208v6m-3-3h6" stroke="#70855d" stroke-width="2" stroke-linecap="round"/>
</svg>`;document.querySelector("#app").innerHTML=`
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
      <a class="chain-link" href="https://squeekchain.com" target="_blank" rel="noopener noreferrer">Squeekchain ${l("arrow")}</a>
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
        <button class="button button-primary" id="refresh" type="button">${l("refresh")}<span>Refresh</span></button>
      </div>
    </div>

    <div class="connection-row">
      <span class="connection-state" id="connection"><span class="status-dot" aria-hidden="true"></span><span id="connection-label">Connecting to feeds</span></span>
      <span class="update-caption" id="update-caption">Fetching the latest pulse</span>
    </div>

    <div class="network-notice notice" id="network-notice" hidden>${l("warning")}<span></span></div>

    <div class="network-grid">
      <section class="panel wheel-panel" id="wheel-panel" aria-labelledby="wheel-title" aria-busy="true">
        <div class="wheel-content">
          <div class="section-label">${l("wheel")}<h2 id="wheel-title">At the wheel</h2></div>
          <div class="wheel-state" id="wheel-state"><span class="status-dot" aria-hidden="true"></span><span id="state-label">Connecting</span></div>
          <p class="wheel-headline" id="wheel-headline">Finding our hamster</p>
          <div class="rpm-reading"><span class="rpm-value numeric" id="rpm">–</span><span class="unit">RPM</span></div>
          <p class="wheel-description" id="wheel-description">Waiting for a hardware reading.</p>
        </div>
        <div class="wheel-visual" id="wheel-visual">${ae}</div>
        <div class="wheel-footer">
          <span class="telemetry-caption">${l("pulse")}<span id="telemetry-label">Hardware telemetry</span></span>
          <button class="motion-button" id="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion</button>
          <span class="reading-time" id="reading-time">Waiting for data</span>
        </div>
      </section>

      <section class="panel block-panel" aria-labelledby="block-title">
        <div class="panel-heading"><div class="section-label">${l("blocks")}<h2 id="block-title">Block height</h2></div><span class="subtle-tag">Confirmed</span></div>
        <div class="block-reading"><span class="block-hash" aria-hidden="true">#</span><span class="large-value numeric" id="block-height">–</span></div>
        <p class="muted block-description">Built one revolution at a time.</p>
        <div class="block-progress-label"><span>Next block progress</span><span class="numeric" id="progress-label">–</span></div>
        <progress class="block-progress" id="block-progress" max="100" aria-label="Progress toward the next block"></progress>
        <div class="block-range"><span id="current-block">Awaiting block</span><span id="next-block">Awaiting block</span></div>
        <div class="block-footer">${l("check")}<span id="confirmation-label">Waiting for settlement data</span></div>
      </section>
    </div>

    <section class="metrics-grid" aria-label="Network and community totals">
      <div class="panel metric-panel"><div class="metric-label">Distance run ${l("distance")}</div><div class="metric-reading"><span class="metric-value numeric" id="distance">–</span><span class="unit">km</span></div><p class="metric-caption">A little further, every turn</p></div>
      <div class="panel metric-panel"><div class="metric-label">Settled rounds ${l("check")}</div><div class="metric-reading"><span class="metric-value numeric" id="rounds">–</span></div><p class="metric-caption" id="rounds-caption">Latest confirmed round</p></div>
      <div class="panel metric-panel"><div class="metric-label">Community members ${l("people")}</div><div class="metric-reading"><span class="metric-value numeric" id="members">–</span></div><p class="metric-caption" id="members-caption">The people behind the paws</p></div>
      <div class="panel metric-panel"><div class="metric-label">Badges earned ${l("badge")}</div><div class="metric-reading"><span class="metric-value numeric" id="badges">–</span></div><p class="metric-caption" id="badges-caption">Small wins, shared together</p></div>
    </section>

    <div class="notice community-notice" id="community-notice" hidden>${l("warning")}<span></span></div>

    <div class="community-grid">
      <section class="panel leaderboard-panel" id="leaderboard" aria-labelledby="leaderboard-title" tabindex="-1" aria-busy="true">
        <div class="leaderboard-heading">
          <div><h2 id="leaderboard-title">Community leaderboard</h2><p class="muted">A little friendly competition. A lot of Aura.</p></div>
          <span class="top-ten-tag">${l("trophy")}Top 10</span>
        </div>
        <div class="leaderboard-message" id="leaderboard-message"><span id="leaderboard-message-text">Loading the community rankings…</span><button class="button button-secondary" id="retry-leaderboard" type="button" hidden>Retry rankings</button></div>
        <div class="table-wrap" id="leaderboard-table-wrap" hidden>
          <table>
            <caption class="sr-only">The top ten community members, ordered by their all-time Aura ranking.</caption>
            <thead><tr><th scope="col" class="rank-column">Rank</th><th scope="col">Member</th><th scope="col" class="badge-column">Badges</th><th scope="col" class="aura-column">Aura</th></tr></thead>
            <tbody id="leaderboard-body"></tbody>
          </table>
        </div>
        <div class="leaderboard-footer"><span id="leaderboard-updated">Awaiting community snapshot</span><button id="data-details" type="button" class="text-button">About the data ${l("info")}</button></div>
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
        <div class="journey-bottom">${l("leaf")}<span>Powered by paws. Followed by people.</span></div>
      </aside>
    </div>

    <footer class="site-footer"><span class="footer-brand">${l("pulse")}Squeek Pulse<span class="footer-separator">/</span><span class="muted">Every revolution counts.</span></span><div><span id="footer-refresh">Refreshes every 20 seconds</span><span class="footer-dot" aria-hidden="true">·</span><button class="text-button" id="footer-data-details" type="button">Data sources ${l("arrow")}</button></div></footer>
  </main>

  <dialog id="data-dialog" aria-labelledby="data-dialog-title">
    <div class="dialog-heading"><h2 id="data-dialog-title">About the data</h2><button type="button" class="icon-button" id="close-dialog" aria-label="Close data details" autofocus>${l("close")}</button></div>
    <p>Read directly from Squeekchain's public feeds every 20 seconds. Pause auto-refresh to keep the current view, or select Refresh to check now.</p>
    <div class="source-list">
      <div><h3>Wheel & chain</h3><a href="${v.status}" target="_blank" rel="noopener noreferrer">Status feed ${l("arrow")}</a><p>Live wheel speed and distance. Blocks use confirmed settlements. Settled rounds shows the highest confirmed round number. Distance follows the hardware counter and can reset.</p><p id="source-status-time" class="source-timestamp">Not yet received</p></div>
      <div><h3>Community totals</h3><a href="${v.community}" target="_blank" rel="noopener noreferrer">Community stats ${l("arrow")}</a><p>Member and earned badge counts from the latest community snapshot. Its computation time is shown below.</p><p id="source-community-time" class="source-timestamp">Not yet received</p></div>
      <div><h3>Community rankings</h3><a href="${v.leaderboard}" target="_blank" rel="noopener noreferrer">Leaderboard feed ${l("arrow")}</a><p>The first 10 ranked members by all-time Aura. Avatars use member initials. Community snapshots can lag behind the latest fetch.</p><p id="source-leaderboard-time" class="source-timestamp">Not yet received</p></div>
    </div>
    <p class="dialog-note">If a request fails, the last received values stay visible with a warning. A stale hardware reading never appears as live motion.</p>
  </dialog>
  <p class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></p>
`;function o(e){return document.getElementById(e)}function n(e,t){o(e).textContent=t}function y(e,t){o(e).hidden=t}const u={data:null,receivedAt:null,error:!1},d={data:null,receivedAt:null,error:!1},b={data:null,receivedAt:null,error:!1};let $=!1,f=!0,A=!1,V=Date.now()+q,O,B=null,Z="";function K(){window.clearTimeout(O),V=Date.now()+q,f&&(O=window.setTimeout(()=>{T()},q))}function U(e,t,r){n(e,r===null?`${t}: not provided`:`${t}: ${new Date(r).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"medium"})}`)}function G(e,t){y(e,t===null),o(e).querySelector("span").textContent=t??""}function C(){const e=u.data,t=_(e)&&!u.error,r=e!==null;n("state-label",e?.state==="UNKNOWN"?"Unknown":e?.state??(u.error?"Unavailable":"Connecting")),o("wheel-state").dataset.state=t?e?.state.toLowerCase():"stale",n("wheel-headline",r?t?e.state==="SPINNING"?"Making the rounds":e.state==="IDLE"?"Taking a breather":"Checking the wheel":"Last known reading":u.error?"Waiting for the wheel":"Finding our hamster"),n("rpm",e?new Intl.NumberFormat("en-US",{minimumFractionDigits:1,maximumFractionDigits:1}).format(e.rpm):"–"),n("wheel-description",r?t?e.state==="SPINNING"?"Tiny feet. Steady momentum.":e.state==="IDLE"?"Even little legs need a break.":"The feed has no recognized running state.":"The hardware reading is not current.":"Waiting for a hardware reading."),n("telemetry-label",r?t?"Hardware connected":"Hardware reading delayed":"Hardware telemetry"),o("wheel-panel").dataset.fresh=String(t);const i=t&&e?.state==="SPINNING";o("wheel-visual").classList.toggle("is-spinning",i&&!A&&f),y("motion-toggle",!i),o("motion-toggle").setAttribute("aria-pressed",String(A)),n("motion-toggle",A?"Resume motion":"Pause motion"),n("reading-time",e?`Observed ${N(e.observedAt).toLowerCase()}`:"Waiting for data"),o("reading-time").title=e?.observedAt?new Date(e.observedAt).toISOString():"",n("block-height",e?.blockHeight!==null&&e?.blockHeight!==void 0?p(e.blockHeight):"–"),n("progress-label",e?.blockProgress!==null&&e?.blockProgress!==void 0?`${e.blockProgress.toFixed(1)}%`:"–");const a=o("block-progress");e?.blockProgress!==null&&e?.blockProgress!==void 0?(a.value=e.blockProgress,a.setAttribute("aria-valuetext",`${e.blockProgress.toFixed(1)} percent toward the next block`)):(a.removeAttribute("value"),a.setAttribute("aria-valuetext","Block progress unavailable")),n("current-block",e?.blockHeight?`#${p(e.blockHeight)}`:"Awaiting block"),n("next-block",e?.blockHeight?`#${p((BigInt(e.blockHeight)+1n).toString())}`:"Awaiting block"),n("confirmation-label",e?u.error?"Last received settlement":e.confirmedAt?`Confirmed ${N(e.confirmedAt).toLowerCase()}`:"Confirmation time not provided":"Waiting for settlement data"),n("distance",e?new Intl.NumberFormat("en-US",{maximumFractionDigits:3,minimumFractionDigits:3}).format(e.distanceKm):"–"),n("rounds",e?.settledRound?p(e.settledRound):"–"),n("rounds-caption",e?.settledRound?`Through round #${p(e.settledRound)}`:"Latest confirmed round"),G("network-notice",u.error?`The status feed couldn't refresh. ${e?"Showing the last received values.":"Check your connection."} Select Refresh to try again.`:e&&!t?"The hardware reading is delayed. Showing the last reported state; the feed is checked again on refresh.":null),U("source-status-time","Hardware observed",e?.observedAt??null)}function re(){n("members",d.data?p(d.data.members):"–"),n("badges",d.data?p(d.data.badgesEarned):"–"),n("members-caption",d.error?"Community feed unavailable":"The people behind the paws"),n("badges-caption",d.error?"Community feed unavailable":"Small wins, shared together"),G("community-notice",d.error?`The community feed couldn't refresh. ${d.data?"Showing the last received totals.":"Totals will appear when it reconnects."} Select Refresh to try again.`:null),U("source-community-time","Snapshot computed",d.data?.computedAt??null)}function X(){const e=b.data,t=e!==null&&e.entries.length>0;y("leaderboard-table-wrap",!t),y("leaderboard-message",t&&!b.error),y("retry-leaderboard",!b.error),n("leaderboard-message-text",b.error?`Rankings couldn't refresh. ${t?"Showing the last received top 10.":"Check your connection and try again."}`:e?"No rankings yet. The top 10 will appear here when the community feed publishes them.":"Loading the community rankings…");const r=JSON.stringify(e?.entries??[]);if(r!==Z){const i=document.createDocumentFragment();for(const a of e?.entries??[]){const s=document.createElement("tr");s.className=a.rank<=3?`podium podium-${a.rank}`:"";const h=document.createElement("td");h.className="rank-cell numeric";const S=document.createElement("span");S.textContent=String(a.rank).padStart(2,"0"),h.append(S);const k=document.createElement("td"),R=document.createElement("div");R.className="member-cell";const M=document.createElement("span");M.className=`member-avatar avatar-${(a.rank-1)%5}`,M.setAttribute("aria-hidden","true"),M.textContent=a.name.replace(/^@/,"").slice(0,2).toUpperCase();const x=document.createElement("div");x.className="member-info";const m=document.createElement(a.username?"a":"span");if(m.className="member-name",m.textContent=a.name,m instanceof HTMLAnchorElement&&a.username&&(m.href=`https://x.com/${encodeURIComponent(a.username)}`,m.target="_blank",m.rel="noopener noreferrer",m.setAttribute("aria-label",`${a.name} on X (opens in a new tab)`)),x.append(m),a.tier){const D=document.createElement("span");D.className="member-tier",D.textContent=`${a.tier.charAt(0).toUpperCase()}${a.tier.slice(1)} member`,x.append(D)}R.append(M,x),k.append(R);const P=document.createElement("td");P.className="badges-cell numeric",P.textContent=p(a.badges);const I=document.createElement("td");I.className="aura-cell numeric",I.textContent=p(a.aura),s.append(h,k,P,I),i.append(s)}o("leaderboard-body").replaceChildren(i),Z=r}n("leaderboard-updated",e?`Snapshot ${N(e.computedAt).toLowerCase()}`:"Awaiting community snapshot"),o("leaderboard-updated").title=e?.computedAt?new Date(e.computedAt).toISOString():"",U("source-leaderboard-time","Snapshot computed",e?.computedAt??null)}function E(){const e=[u,d,b].filter(a=>a.error).length,t=[u,d,b].every(a=>a.receivedAt!==null),r=u.data!==null&&!_(u.data);n("connection-label",f?e===3?"Feeds unavailable":e>0?"Some feeds unavailable":t?r?"Hardware feed delayed":"Live feeds":"Connecting to feeds":"Auto-refresh paused"),o("connection").dataset.state=!f||e>0||r?"warning":t?"live":"loading";const i=Math.max(0,Math.ceil((V-Date.now())/1e3));n("update-caption",$?"Fetching the latest pulse":B===null?"Waiting for the first update":f?`Next refresh in ${i}s`:`Last checked ${N(B).toLowerCase()}`),n("footer-refresh",f?"Refreshes every 20 seconds":"Auto-refresh paused")}async function F(e,t,r){try{e.data=await te(t,r),e.receivedAt=Date.now(),e.error=!1}catch{e.error=!0}}async function T(e=!1){if($)return;$=!0,window.clearTimeout(O);const t=o("refresh");if(t.disabled=!0,t.querySelector("span").textContent="Refreshing",t.classList.add("is-refreshing"),o("wheel-panel").setAttribute("aria-busy","true"),o("leaderboard").setAttribute("aria-busy","true"),o("retry-leaderboard").disabled=!0,E(),await Promise.all([F(u,v.status,J).then(C),F(d,v.community,Q).then(re),F(b,v.leaderboard,ee).then(X)]),$=!1,B=Date.now(),K(),t.disabled=!1,t.querySelector("span").textContent="Refresh",t.classList.remove("is-refreshing"),o("retry-leaderboard").disabled=!1,o("wheel-panel").setAttribute("aria-busy","false"),o("leaderboard").setAttribute("aria-busy","false"),E(),e){const r=[u,d,b].filter(i=>i.error).length;n("announcement",r?`${r} ${r===1?"feed is":"feeds are"} unavailable. Last received values are kept where available. Try Refresh again.`:"Dashboard refreshed. All three feeds responded.")}}o("refresh").addEventListener("click",()=>{n("announcement","Refreshing the dashboard."),T(!0)});o("retry-leaderboard").addEventListener("click",()=>{T(!0)});o("auto-refresh").addEventListener("change",e=>{f=e.currentTarget.checked,K(),E(),C(),n("announcement",f?"Auto-refresh enabled. The dashboard checks every 20 seconds.":"Auto-refresh paused. You can still use Refresh.")});o("motion-toggle").addEventListener("click",()=>{A=!A,C()});const g=o("data-dialog");o("data-details").addEventListener("click",()=>g.showModal());o("footer-data-details").addEventListener("click",()=>g.showModal());o("close-dialog").addEventListener("click",()=>g.close());g.addEventListener("click",e=>{if(e.target===g){const t=g.getBoundingClientRect();(e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)&&g.close()}});function Y(){document.querySelectorAll(".nav-link").forEach(e=>{const t=e.hash===(location.hash==="#leaderboard"?"#leaderboard":"#overview");e.classList.toggle("is-active",t),t?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current")})}window.addEventListener("hashchange",Y);Y();T();window.setInterval(()=>{E(),C(),X()},1e3);
