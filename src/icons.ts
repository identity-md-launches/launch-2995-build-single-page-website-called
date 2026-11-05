const paths: Record<string, string> = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/>',
  pulse: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  wheel: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5V10m0 4v6.5M3.5 12H10m4 0h6.5M6 6l4.5 4.5m3 3L18 18M6 18l4.5-4.5m3-3L18 6"/>',
  blocks: '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm-8 9 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5M12 12v9"/>',
  distance: '<path d="M5 16.5a3 3 0 1 1 3 3h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h11"/><circle cx="5" cy="16.5" r="1"/><path d="m16 4.5 3 3-3 3"/>',
  check: '<path d="m8 12 3 3 5-6"/><circle cx="12" cy="12" r="9"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
  badge: '<path d="m12 2 3 2 3.5.5 1 3.5L22 11l-2.5 3-1 3.5-3.5.5-3 2-3-2-3.5-.5-1-3.5L2 11l2.5-3 1-3.5L9 4l3-2Z"/><path d="m9 11 2 2 4-4"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-4 3v-3h8v3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  warning: '<path d="m12 3 10 17H2L12 3Zm0 6v5m0 3v.01"/>',
  leaf: '<path d="M20 3c0 11-1 16-8 16a7 7 0 0 1 0-14l8-2ZM4 21 15 10"/>',
}

export function icon(name: string, className = ''): string {
  return `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.info}</svg>`
}

export const hamsterWheel = `
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
</svg>`
