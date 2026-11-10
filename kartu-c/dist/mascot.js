// Original SVG character for Flash Brains. No external images or animation runtime.
export function brandMark() {
  return `<svg class="brand-symbol" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M9 21Q9 8 22 8h16q13 0 13 13v22q0 9-9 9H18q-9 0-9-9Z" fill="#58cc46"/><path d="M16 22q0-9 9-9h14" stroke="#a5ef81" stroke-width="5" stroke-linecap="round"/><path d="m24 25-7 6 7 6m12-12 7 6-7 6" stroke="#24522a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 43q3 3 6 0" stroke="#24522a" stroke-width="3" stroke-linecap="round"/></svg>`;
}
export function byteMascot(mood='idle',className='') {
  const mouth=mood==='celebrate'
    ? '<path d="M102 127q18 23 36 0Z" fill="#342b57"/><path d="M111 139q10-7 19 0" fill="#ff91b4"/>'
    : mood==='thinking'
      ? '<path d="M110 133q12 5 22-2" fill="none" stroke="#342b57" stroke-width="5" stroke-linecap="round"/>'
      : '<path d="M104 128q16 16 32 0" fill="none" stroke="#342b57" stroke-width="5" stroke-linecap="round"/>';
  return `<svg class="byte-mascot byte-${mood} ${className}" viewBox="0 0 240 240" fill="none" aria-hidden="true">
    <ellipse class="byte-shadow" cx="120" cy="216" rx="66" ry="10" fill="#c7c4e5" opacity=".5"/>
    <g class="byte-body">
      <path class="byte-arm byte-arm-left" d="M68 128q-28-14-31 4-2 11 25 23" fill="#a88aef" stroke="#7962c4" stroke-width="4" stroke-linecap="round"/>
      <path class="byte-arm byte-arm-right" d="M176 126q24-25 29-7 3 13-24 30" fill="#a88aef" stroke="#7962c4" stroke-width="4" stroke-linecap="round"/>
      <path d="M84 190v13q-1 10-19 8-9-1-5-9l9-15m88 3v13q1 10 19 8 9-1 5-9l-9-15" fill="#8d73d4" stroke="#7962c4" stroke-width="4" stroke-linejoin="round"/>
      <path d="M64 82q0-29 29-32l20-3 13 1 24 2q30 3 30 32v76q0 40-40 40h-40q-39 0-39-39Z" fill="#a88aef" stroke="#7962c4" stroke-width="4"/>
      <path d="M73 76q1-17 18-18l22-3" stroke="#c5adff" stroke-width="7" stroke-linecap="round"/>
      <path d="m114 49 3-17q2-10 11-6l8 5-9 18" fill="#8b73d3" stroke="#7962c4" stroke-width="4"/>
      <ellipse cx="120" cy="165" rx="36" ry="23" fill="#d6c6ff"/>
      <g class="byte-eyes"><rect x="80" y="80" width="31" height="39" rx="15.5" fill="white"/><rect x="130" y="80" width="31" height="39" rx="15.5" fill="white"/><ellipse class="byte-pupil" cx="99" cy="102" rx="7" ry="10" fill="#342b57"/><ellipse class="byte-pupil" cx="142" cy="102" rx="7" ry="10" fill="#342b57"/><circle cx="101" cy="98" r="2.5" fill="white"/><circle cx="144" cy="98" r="2.5" fill="white"/></g>
      <ellipse cx="80" cy="125" rx="10" ry="5" fill="#f7a1bf"/><ellipse cx="160" cy="125" rx="10" ry="5" fill="#f7a1bf"/>
      ${mouth}
      <path d="m111 156-9 9 9 9m18-18 9 9-9 9" stroke="#7962c4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <path class="byte-spark byte-spark-one" d="m193 50 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#ffc84d"/>
    <path class="byte-spark byte-spark-two" d="m42 77 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#62c9fa"/>
  </svg>`;
}
