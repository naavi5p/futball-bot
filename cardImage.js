// ═══════════════════════════════════════════════════════════════════
// GÉNÉRATEUR DE CARTES FIFA — SVG + Sharp
// Compatible Linux/Railway sans dépendances natives complexes
// ═══════════════════════════════════════════════════════════════════

const sharp = require('sharp');

const W = 380, H = 540;

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
  ICON:        { bg1:'#d8daf0', bg2:'#ffffff', bg3:'#e8eaf8', frame:'#c0c8e0', accent:'#c8a030', text:'#1a1a2a', sub:'#4a4a7a', label:'ICON',        statBg:'rgba(0,0,0,0.08)' },
  TOTY:        { bg1:'#060e28', bg2:'#0c1840', bg3:'#142260', frame:'#c8a020', accent:'#d4b030', text:'#ffffff',  sub:'#88aadd', label:'TOTY',        statBg:'rgba(0,0,0,0.4)'  },
  GOLD_ELITE:  { bg1:'#1a1000', bg2:'#3d2200', bg3:'#6e3500', frame:'#ffe066', accent:'#ffe066', text:'#fff8dc', sub:'#ffd060', label:'GOLD ELITE',  statBg:'rgba(0,0,0,0.35)' },
  GOLD:        { bg1:'#14100a', bg2:'#241c0a', bg3:'#3a2c10', frame:'#d4a030', accent:'#d4a030', text:'#fff0c0', sub:'#d4a030', label:'GOLD',        statBg:'rgba(0,0,0,0.35)' },
  SILVER_RARE: { bg1:'#0c1018', bg2:'#141c28', bg3:'#1e2c40', frame:'#80b0e0', accent:'#80b0e0', text:'#e0eeff', sub:'#80b0d0', label:'SILVER RARE', statBg:'rgba(0,0,0,0.35)' },
  SILVER:      { bg1:'#10101c', bg2:'#181828', bg3:'#242438', frame:'#7080c0', accent:'#7080c0', text:'#d8d8f8', sub:'#7080b8', label:'SILVER',      statBg:'rgba(0,0,0,0.35)' },
  BRONZE_RARE: { bg1:'#140c00', bg2:'#201400', bg3:'#342000', frame:'#c06020', accent:'#c06020', text:'#f0d8b0', sub:'#c07030', label:'BRONZE RARE', statBg:'rgba(0,0,0,0.35)' },
  BRONZE:      { bg1:'#100c08', bg2:'#181208', bg3:'#241a0c', frame:'#906040', accent:'#906040', text:'#e8c8a0', sub:'#906040', label:'BRONZE',      statBg:'rgba(0,0,0,0.35)' },
};

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function statBar(val, accent) {
  const pct = Math.round((val/99)*100);
  return `<rect x="0" y="0" width="110" height="7" rx="3" fill="rgba(255,255,255,0.1)"/>
<rect x="0" y="0" width="${pct*1.1}" height="7" rx="3" fill="${accent}"/>`;
}

function trunc(s, n) { return s && s.length > n ? s.slice(0,n-1)+'…' : (s||''); }

function posColor(pos) {
  if (['GK'].includes(pos)) return '#f0c030';
  if (['CB','LB','RB','LWB','RWB'].includes(pos)) return '#50b8f0';
  if (['CDM','CM','CAM','LM','RM','DM'].includes(pos)) return '#78d878';
  return '#f05050';
}

async function generateCardImage(player) {
  const tier = getCardTier(player.rating, player.rarity);
  const t = THEMES[tier] || THEMES.BRONZE;
  const isIcon = tier === 'ICON';
  const isToty = tier === 'TOTY';

  const name  = trunc(player.name, 20);
  const club  = trunc(player.club, 26);
  const ptsLabel = player.isLucky ? `${player.points} pts 🍀` : `${player.points} pts`;
  const pc = posColor(player.position || 'CM');
  const rgb = hex2rgb(t.frame);

  // Stats
  const stats = [
    { l:'PAC', v: player.pace      || 0 },
    { l:'SHO', v: player.shooting  || 0 },
    { l:'PAS', v: player.passing   || 0 },
    { l:'DRI', v: player.dribbling || 0 },
    { l:'DEF', v: player.defending || 0 },
    { l:'PHY', v: player.physical  || 0 },
  ];

  // Générer les étoiles TOTY / fond spécial
  const totyStars = isToty ? Array.from({length:15}, (_,i) => {
    const x = 20 + Math.random()*340, y = 20 + Math.random()*280;
    const r = 1 + Math.random()*2;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#d4b030" opacity="${0.3+Math.random()*0.6}"/>`;
  }).join('') : '';

  // Fond ICON nacré avec lignes diagonales
  const iconLines = isIcon ? Array.from({length:12}, (_,i) =>
    `<line x1="${i*30}" y1="0" x2="0" y2="${i*30}" stroke="rgba(180,180,220,0.1)" stroke-width="1"/>`
  ).join('') : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg1}"/>
      <stop offset="50%" stop-color="${t.bg2}"/>
      <stop offset="100%" stop-color="${t.bg3}"/>
    </linearGradient>
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="70%" y2="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,${isIcon?'0.5':'0.12'})"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="bottomfade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="40%" stop-color="rgba(0,0,0,0.7)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.92)"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.5"/>
    </filter>
    <clipPath id="card"><rect x="20" y="24" width="340" height="492" rx="14"/></clipPath>
  </defs>

  <!-- Fond global -->
  <rect width="${W}" height="${H}" fill="${isIcon ? '#1a1a2a' : '#000'}"/>

  <!-- Cadre externe avec glow -->
  <rect x="16" y="20" width="348" height="500" rx="16"
    fill="${t.frame}" filter="url(#glow)" opacity="0.6"/>

  <!-- Corps carte -->
  <rect x="20" y="24" width="340" height="492" rx="14" fill="url(#bg)"/>

  <!-- Fond spécial ICON (lignes diagonales) -->
  <g clip-path="url(#card)">${iconLines}</g>

  <!-- Étoiles TOTY -->
  <g clip-path="url(#card)">${totyStars}</g>

  <!-- Shimmer overlay -->
  <rect x="20" y="24" width="240" height="340" rx="14" fill="url(#shimmer)" clip-path="url(#card)"/>

  <!-- Bordure intérieure -->
  <rect x="20" y="24" width="340" height="492" rx="14"
    fill="none" stroke="${t.frame}" stroke-width="2.5" opacity="0.8"/>

  <!-- ── HEADER ── -->
  <!-- OVR -->
  <text x="52" y="82" font-family="Arial Black, sans-serif" font-weight="900"
    font-size="52" fill="${t.text}" text-anchor="middle"
    filter="url(#shadow)">${player.rating}</text>

  <!-- Position -->
  <text x="52" y="102" font-family="Arial, sans-serif" font-weight="700"
    font-size="14" fill="${pc}" text-anchor="middle">${player.position || 'CM'}</text>

  <!-- Drapeau nation (grand, centré) -->
  <text x="190" y="86" font-family="Noto Color Emoji, sans-serif"
    font-size="50" text-anchor="middle">${player.nation || '🌍'}</text>

  <!-- Genre -->
  <text x="348" y="58" font-family="Noto Color Emoji, sans-serif"
    font-size="20" text-anchor="middle">${player.gender || ''}</text>

  <!-- Ligne décorative -->
  <line x1="36" y1="112" x2="344" y2="112"
    stroke="${t.accent}" stroke-width="1.5" opacity="0.6"/>

  <!-- ── ZONE IMAGE (silhouette géométrique) ── -->
  <!-- Cercle de fond -->
  <circle cx="190" cy="230" r="90" fill="rgba(0,0,0,0.25)" clip-path="url(#card)"/>
  <circle cx="190" cy="230" r="88" fill="none" stroke="${t.accent}"
    stroke-width="1" opacity="0.3" clip-path="url(#card)"/>

  <!-- Silhouette joueur stylisée -->
  <g clip-path="url(#card)" opacity="0.75" fill="${isIcon ? 'rgba(30,30,80,0.6)' : 'rgba(0,0,0,0.35)'}">
    <!-- Corps -->
    <ellipse cx="190" cy="255" rx="32" ry="42"/>
    <!-- Tête -->
    <circle cx="190" cy="195" r="22"/>
    <!-- Jambes -->
    <ellipse cx="178" cy="300" rx="10" ry="22" transform="rotate(-5,178,300)"/>
    <ellipse cx="202" cy="300" rx="10" ry="22" transform="rotate(5,202,300)"/>
  </g>
  <!-- Silhouette contour -->
  <g clip-path="url(#card)" opacity="0.55" fill="none"
    stroke="${t.accent}" stroke-width="1.5">
    <circle cx="190" cy="195" r="22"/>
    <ellipse cx="190" cy="255" rx="32" ry="42"/>
    <ellipse cx="178" cy="300" rx="10" ry="22" transform="rotate(-5,178,300)"/>
    <ellipse cx="202" cy="300" rx="10" ry="22" transform="rotate(5,202,300)"/>
  </g>
  <!-- Ballon -->
  <circle cx="222" cy="295" r="13" fill="rgba(255,255,255,0.15)"
    stroke="${t.accent}" stroke-width="1.5" clip-path="url(#card)"/>
  <line x1="222" y1="282" x2="222" y2="308" stroke="${t.accent}"
    stroke-width="0.8" opacity="0.5" clip-path="url(#card)"/>
  <line x1="209" y1="295" x2="235" y2="295" stroke="${t.accent}"
    stroke-width="0.8" opacity="0.5" clip-path="url(#card)"/>

  <!-- ── ZONE INFOS (bas de carte) ── -->
  <rect x="20" y="330" width="340" height="186" fill="url(#bottomfade)" clip-path="url(#card)"/>

  <!-- Nom joueur -->
  <text x="190" y="372" font-family="Arial Black, sans-serif" font-weight="900"
    font-size="${name.length > 14 ? '20' : '24'}" fill="${t.text}"
    text-anchor="middle" filter="url(#shadow)">${name}</text>

  <!-- Club -->
  <text x="190" y="392" font-family="Arial, sans-serif" font-size="12"
    fill="${t.sub}" text-anchor="middle">${club}</text>

  <!-- Badge rareté + points -->
  <rect x="${190 - (t.label.length*4+20)/2}" y="399"
    width="${t.label.length*4+20}" height="18" rx="4" fill="${t.accent}" opacity="0.9"/>
  <text x="190" y="412" font-family="Arial, sans-serif" font-weight="700"
    font-size="9" fill="${isIcon ? '#1a1a2a' : '#000'}" text-anchor="middle">${t.label}</text>

  <text x="190" y="430" font-family="Arial, sans-serif" font-weight="700"
    font-size="13" fill="${t.accent}" text-anchor="middle">💰 ${ptsLabel}</text>

  <!-- ── STATS (2 colonnes) ── -->
  <!-- Ligne séparatrice stats -->
  <line x1="36" y1="438" x2="344" y2="438"
    stroke="${t.accent}" stroke-width="1" opacity="0.3"/>

  ${stats.map((s, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const sx = col === 0 ? 36 : 200;
    const sy = 455 + row * 26;
    return `
    <!-- Stat ${s.l} -->
    <text x="${sx+28}" y="${sy+7}" font-family="Arial Black, sans-serif"
      font-weight="900" font-size="17" fill="${t.text}" text-anchor="right">${s.v}</text>
    <text x="${sx+35}" y="${sy+7}" font-family="Arial, sans-serif"
      font-weight="700" font-size="10" fill="${t.sub}">${s.l}</text>
    <g transform="translate(${sx+35}, ${sy+11})">${statBar(s.v, t.accent)}</g>`;
  }).join('')}

  ${player.isLucky ? `
  <!-- Lucky pull banner -->
  <text x="190" y="${H-14}" font-family="Arial Black, sans-serif" font-weight="900"
    font-size="13" fill="#FFD700" text-anchor="middle"
    filter="url(#glow)">🍀 LUCKY PULL × 2 !</text>` : `
  <!-- EA FC 25 -->
  <text x="190" y="${H-8}" font-family="Arial, sans-serif" font-size="9"
    fill="rgba(255,255,255,0.2)" text-anchor="middle">EA SPORTS FC 25</text>`}

</svg>`;

  // Convertir SVG → PNG via Sharp
  const buf = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return buf;
}

module.exports = { generateCardImage, getCardTier };
