// ═══════════════════════════════════════════════════════════════════
// GÉNÉRATEUR DE CARTES FIFA — @resvg/resvg-js
// SVG → PNG sans aucune dépendance système
// Fonctionne partout : Railway, Heroku, VPS, etc.
// ═══════════════════════════════════════════════════════════════════

const { Resvg } = require('@resvg/resvg-js');

function getCardTier(rating, rarity) {
  if (rarity === 'TOTY') return 'TOTY';
  if (rarity === 'ICON') return 'ICON';
  if (rating >= 90) return 'GOLD_ELITE';
  if (rating >= 85) return 'GOLD';
  if (rating >= 80) return 'SILVER_RARE';
  if (rating >= 75) return 'SILVER';
  if (rating >= 70) return 'BRONZE_RARE';
  return 'BRONZE';
}

const THEMES = {
  ICON:        { bg1:'#d8daf0', bg2:'#ffffff', bg3:'#e8eaf8', frame:'#c8a030', acc:'#c8a030', txt:'#1a1a2a', sub:'#5a5a8a', lbl:'ICON',        lbg:'#c8a030', ltxt:'#1a1a2a' },
  TOTY:        { bg1:'#060e28', bg2:'#0c1840', bg3:'#142260', frame:'#c8a020', acc:'#d4b030', txt:'#ffffff',  sub:'#88aadd', lbl:'TOTY',        lbg:'#c8a020', ltxt:'#000000' },
  GOLD_ELITE:  { bg1:'#1a1000', bg2:'#3d2200', bg3:'#6e3500', frame:'#ffe066', acc:'#ffe066', txt:'#fff8dc', sub:'#ffd060', lbl:'GOLD ELITE',  lbg:'#ffe066', ltxt:'#3d1c00' },
  GOLD:        { bg1:'#14100a', bg2:'#241c0a', bg3:'#3a2c10', frame:'#d4a030', acc:'#d4a030', txt:'#fff0c0', sub:'#d4a030', lbl:'GOLD',        lbg:'#d4a030', ltxt:'#14100a' },
  SILVER_RARE: { bg1:'#0c1018', bg2:'#141c28', bg3:'#1e2c40', frame:'#80b0e0', acc:'#80b0e0', txt:'#e0eeff', sub:'#80b0d0', lbl:'SILVER RARE', lbg:'#80b0e0', ltxt:'#0c1018' },
  SILVER:      { bg1:'#10101c', bg2:'#181828', bg3:'#242438', frame:'#7080c0', acc:'#7080c0', txt:'#d8d8f8', sub:'#7080b8', lbl:'SILVER',      lbg:'#7080c0', ltxt:'#10101c' },
  BRONZE_RARE: { bg1:'#140c00', bg2:'#201400', bg3:'#342000', frame:'#c06020', acc:'#c06020', txt:'#f0d8b0', sub:'#c07030', lbl:'BRONZE RARE', lbg:'#c06020', ltxt:'#140c00' },
  BRONZE:      { bg1:'#100c08', bg2:'#181208', bg3:'#241a0c', frame:'#906040', acc:'#906040', txt:'#e8c8a0', sub:'#906040', lbl:'BRONZE',      lbg:'#906040', ltxt:'#100c08' },
};

const POS_COLORS = {
  GK:'#f0c030', CB:'#50b8f0', LB:'#50b8f0', RB:'#50b8f0', LWB:'#50b8f0', RWB:'#50b8f0',
  CDM:'#78d878', CM:'#78d878', CAM:'#78d878', LM:'#78d878', RM:'#78d878', DM:'#78d878',
};

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function trunc(s, n) { s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s; }

function bar(x, y, w, h, val, color) {
  const fw = Math.max(2, Math.round(val/99*w));
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="rgba(255,255,255,0.1)"/>
<rect x="${x}" y="${y}" width="${fw}" height="${h}" rx="2" fill="${color}"/>`;
}

function buildSvg(p) {
  const W=380, H=540;
  const tier = getCardTier(p.rating, p.rarity);
  const t = THEMES[tier] || THEMES.BRONZE;
  const pc = POS_COLORS[p.position] || '#f05050';

  const nm = trunc(p.name, 18);
  const cl = trunc(p.club, 24);
  const stats = [
    {l:'PAC',v:p.pace||0},{l:'SHO',v:p.shooting||0},{l:'PAS',v:p.passing||0},
    {l:'DRI',v:p.dribbling||0},{l:'DEF',v:p.defending||0},{l:'PHY',v:p.physical||0},
  ];

  // TOTY stars
  const stars = tier==='TOTY' ? Array.from({length:14},(_,i)=>{
    const x=30+((i*67)%320), y=20+((i*41)%180), r=0.8+((i*13)%12)/10, op=0.3+((i*7)%5)/10;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#d4b030" opacity="${op}"/>`;
  }).join('') : '';

  // ICON diagonal lines
  const iconLines = tier==='ICON' ? Array.from({length:18},(_,i)=>
    `<line x1="${20+i*20}" y1="24" x2="20" y2="${24+i*20}" stroke="rgba(180,180,220,0.06)" stroke-width="1"/>`
  ).join('') : '';

  // Stats rows
  const statsLeft  = stats.slice(0,3);
  const statsRight = stats.slice(3);
  const SY = 438, ROWH = 28, BW = 100;

  const statsHtml = [
    ...statsLeft.map((s,i) => {
      const y = SY + i*ROWH;
      return `<text x="54" y="${y+8}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="16" fill="${t.txt}" text-anchor="end">${s.v}</text>
<text x="58" y="${y+8}" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="${t.sub}">${s.l}</text>
${bar(58, y+11, BW, 5, s.v, t.acc)}`;
    }),
    ...statsRight.map((s,i) => {
      const y = SY + i*ROWH;
      const x = 200;
      return `<text x="${x+14}" y="${y+8}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="16" fill="${t.txt}" text-anchor="end">${s.v}</text>
<text x="${x+18}" y="${y+8}" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="${t.sub}">${s.l}</text>
${bar(x+18, y+11, BW, 5, s.v, t.acc)}`;
    }),
  ].join('\n');

  const luckyOrBrand = p.isLucky
    ? `<text x="${W/2}" y="${H-12}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="13" fill="#FFD700" text-anchor="middle">LUCKY PULL x2 !</text>`
    : `<text x="${W/2}" y="${H-10}" font-family="Arial,sans-serif" font-size="9" fill="rgba(255,255,255,0.2)" text-anchor="middle">EA SPORTS FC 25</text>`;

  // Badge rareté
  const lblW = t.lbl.length*6.5+16;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${t.bg1}"/>
    <stop offset="50%" stop-color="${t.bg2}"/>
    <stop offset="100%" stop-color="${t.bg3}"/>
  </linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="0.6" y2="0.6">
    <stop offset="0%" stop-color="rgba(255,255,255,${tier==='ICON'?'0.5':'0.1'})"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="40%" stop-color="rgba(0,0,0,0.72)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.93)"/>
  </linearGradient>
  <linearGradient id="divline" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="25%" stop-color="${t.acc}"/>
    <stop offset="75%" stop-color="${t.acc}"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
  <clipPath id="card"><rect x="18" y="22" width="${W-36}" height="${H-36}" rx="14"/></clipPath>
</defs>

<!-- Fond noir -->
<rect width="${W}" height="${H}" fill="#050505"/>

<!-- Glow frame -->
<rect x="15" y="19" width="${W-30}" height="${H-30}" rx="16" fill="${t.frame}" opacity="0.4"/>

<!-- Carte body -->
<rect x="18" y="22" width="${W-36}" height="${H-36}" rx="14" fill="url(#bg)"/>

<!-- Lignes ICON -->
<g clip-path="url(#card)">${iconLines}</g>

<!-- Étoiles TOTY -->
<g clip-path="url(#card)">${stars}</g>

<!-- Shimmer -->
<rect x="18" y="22" width="${(W-36)*0.65}" height="${(H-36)*0.65}" rx="14" fill="url(#shine)" clip-path="url(#card)"/>

<!-- Bordure -->
<rect x="18" y="22" width="${W-36}" height="${H-36}" rx="14" fill="none" stroke="${t.frame}" stroke-width="2.5" opacity="0.85"/>

<!-- ── HEADER ── -->
<!-- OVR -->
<text x="52" y="80" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="52" fill="${t.txt}" text-anchor="middle">${p.rating}</text>
<!-- Position -->
<text x="52" y="100" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="${pc}" text-anchor="middle">${esc(p.position||'CM')}</text>
<!-- Drapeau + genre -->
<text x="${W/2}" y="82" font-family="serif" font-size="46" text-anchor="middle">${esc(p.nation||'')}</text>
<text x="${W-22}" y="56" font-family="serif" font-size="20" text-anchor="middle">${esc(p.gender||'')}</text>

<!-- Divider 1 -->
<rect x="22" y="108" width="${W-44}" height="1.5" fill="url(#divline)" opacity="0.65"/>

<!-- Avatar zone -->
<circle cx="${W/2}" cy="230" r="90" fill="rgba(0,0,0,0.22)" clip-path="url(#card)"/>
<circle cx="${W/2}" cy="230" r="88" fill="none" stroke="${t.acc}" stroke-width="1" opacity="0.35" clip-path="url(#card)"/>
<!-- Silhouette stylisée -->
<g clip-path="url(#card)" opacity="0.35" fill="${t.acc}">
  <circle cx="${W/2}" cy="198" r="22"/>
  <ellipse cx="${W/2}" cy="255" rx="30" ry="40"/>
  <ellipse cx="${W/2-12}" cy="298" rx="9" ry="20" transform="rotate(-4,${W/2-12},298)"/>
  <ellipse cx="${W/2+12}" cy="298" rx="9" ry="20" transform="rotate(4,${W/2+12},298)"/>
</g>

<!-- Fade bas -->
<rect x="18" y="310" width="${W-36}" height="210" fill="url(#fade)" clip-path="url(#card)"/>

<!-- ── INFOS ── -->
<text x="${W/2}" y="374" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${nm.length>14?19:22}" fill="${t.txt}" text-anchor="middle">${esc(nm)}</text>
<text x="${W/2}" y="393" font-family="Arial,sans-serif" font-size="11" fill="${t.sub}" text-anchor="middle">${esc(cl)}</text>

<!-- Badge rareté -->
<rect x="${W/2-lblW/2}" y="400" width="${lblW}" height="17" rx="4" fill="${t.lbg}"/>
<text x="${W/2}" y="412" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="${t.ltxt}" text-anchor="middle">${t.lbl}</text>

<!-- Points -->
<text x="${W/2}" y="432" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="${t.acc}" text-anchor="middle">&#x1F4B0; ${p.points||0} pts${p.isLucky?' &#x1F340;':''}</text>

<!-- Divider 2 -->
<rect x="22" y="436" width="${W-44}" height="1" fill="${t.acc}" opacity="0.3"/>

<!-- ── STATS ── -->
${statsHtml}

<!-- Bottom -->
${luckyOrBrand}
</svg>`;
}

async function generateCardImage(player) {
  const svg = buildSvg(player);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 760 }, // 2x pour qualité
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

module.exports = { generateCardImage, getCardTier };
