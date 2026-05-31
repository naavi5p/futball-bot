// ═══════════════════════════════════════════════════════════════════
// GÉNÉRATEUR DE CARTES FIFA — Puppeteer + HTML/CSS
// Fonctionne sur Railway et tous serveurs Linux
// ═══════════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

let browserInstance = null;

function findChromium() {
  // Cherche chromium installé par Nix ou le système
  const candidates = [
    process.env.CHROMIUM_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/nix/var/nix/profiles/default/bin/chromium',
  ];
  for (const p of candidates) {
    if (!p) continue;
    try {
      execSync(`test -f "${p}"`, { stdio:'ignore' });
      return p;
    } catch {}
  }
  // Cherche dans PATH
  try {
    return execSync('which chromium || which chromium-browser || which google-chrome', {encoding:'utf8'}).trim().split('\n')[0];
  } catch {}
  return null;
}

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    const execPath = findChromium();
    if (!execPath) throw new Error('Chromium introuvable sur le système');
    browserInstance = await puppeteer.launch({
      executablePath: execPath,
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--headless'],
      headless: true,
    });
  }
  return browserInstance;
}

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

function buildHtml(p) {
  const T = {
    ICON:        { bg:'linear-gradient(135deg,#d8daf0,#ffffff,#e0e2f0)', bord:'#c8a030', txt:'#1a1a2a', sub:'#5a5a8a', lbl:'ICON',        lbg:'#c8a030', ltxt:'#1a1a2a', shimmer:'0.55' },
    TOTY:        { bg:'linear-gradient(135deg,#060e28,#0c1840,#142260)', bord:'#c8a020', txt:'#ffffff',  sub:'#88aadd', lbl:'TOTY',        lbg:'#c8a020', ltxt:'#000000', shimmer:'0.1'  },
    GOLD_ELITE:  { bg:'linear-gradient(135deg,#1a1000,#3d2200,#6e3500)', bord:'#ffe066', txt:'#fff8dc', sub:'#ffd060', lbl:'GOLD ELITE',  lbg:'#ffe066', ltxt:'#3d1c00', shimmer:'0.1'  },
    GOLD:        { bg:'linear-gradient(135deg,#14100a,#241c0a,#3a2c10)', bord:'#d4a030', txt:'#fff0c0', sub:'#d4a030', lbl:'GOLD',        lbg:'#d4a030', ltxt:'#14100a', shimmer:'0.08' },
    SILVER_RARE: { bg:'linear-gradient(135deg,#0c1018,#141c28,#1e2c40)', bord:'#80b0e0', txt:'#e0eeff', sub:'#80b0d0', lbl:'SILVER RARE', lbg:'#80b0e0', ltxt:'#0c1018', shimmer:'0.08' },
    SILVER:      { bg:'linear-gradient(135deg,#10101c,#181828,#242438)', bord:'#7080c0', txt:'#d8d8f8', sub:'#7080b8', lbl:'SILVER',      lbg:'#7080c0', ltxt:'#10101c', shimmer:'0.07' },
    BRONZE_RARE: { bg:'linear-gradient(135deg,#140c00,#201400,#342000)', bord:'#c06020', txt:'#f0d8b0', sub:'#c07030', lbl:'BRONZE RARE', lbg:'#c06020', ltxt:'#140c00', shimmer:'0.07' },
    BRONZE:      { bg:'linear-gradient(135deg,#100c08,#181208,#241a0c)', bord:'#906040', txt:'#e8c8a0', sub:'#906040', lbl:'BRONZE',      lbg:'#906040', ltxt:'#100c08', shimmer:'0.06' },
  };

  const tier = getCardTier(p.rating, p.rarity);
  const t = T[tier] || T.BRONZE;

  const posColors = {
    GK:'#f0c030', CB:'#50b8f0', LB:'#50b8f0', RB:'#50b8f0', LWB:'#50b8f0', RWB:'#50b8f0',
    CDM:'#78d878', CM:'#78d878', CAM:'#78d878', LM:'#78d878', RM:'#78d878', DM:'#78d878',
  };
  const pc = posColors[p.position] || '#f05050';

  const stats = [
    {l:'PAC',v:p.pace||0},{l:'SHO',v:p.shooting||0},{l:'PAS',v:p.passing||0},
    {l:'DRI',v:p.dribbling||0},{l:'DEF',v:p.defending||0},{l:'PHY',v:p.physical||0},
  ];

  const nm = (p.name||'').length > 18 ? (p.name||'').slice(0,17)+'…' : (p.name||'');
  const cl = (p.club||'').length > 22 ? (p.club||'').slice(0,21)+'…' : (p.club||'');

  const stars = tier === 'TOTY' ? Array.from({length:16}, () => {
    const x=Math.random()*100, y=Math.random()*55, s=0.5+Math.random()*2, op=0.4+Math.random()*0.5;
    return `<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:#d4b030;opacity:${op}"></div>`;
  }).join('') : '';

  const iconLines = tier === 'ICON'
    ? `<div style="position:absolute;inset:0;background:repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(180,180,220,0.06) 8px,rgba(180,180,220,0.06) 9px)"></div>`
    : '';

  const statsHtml = stats.map(s =>
    `<div class="s">
      <span class="sv">${s.v}</span>
      <span class="sl">${s.l}</span>
      <div class="sb"><div class="sf" style="width:${Math.round(s.v/99*100)}%"></div></div>
    </div>`
  ).join('');

  const bottom = p.isLucky
    ? `<div class="lucky">🍀 LUCKY PULL × 2 !</div>`
    : `<div class="ea">EA SPORTS FC 25</div>`;

  return `<html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:340px;height:500px;background:#050505;display:flex;align-items:center;justify-content:center;font-family:"Arial Black",Arial,sans-serif}
.c{width:318px;height:478px;border-radius:16px;position:relative;overflow:hidden;background:${t.bg};box-shadow:0 0 28px ${t.bord},0 0 55px rgba(0,0,0,0.9);border:2.5px solid ${t.bord}}
.sh{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,${t.shimmer}) 0%,transparent 52%);pointer-events:none}
.ov{position:absolute;top:13px;left:15px;font-size:50px;font-weight:900;color:${t.txt};line-height:1;text-shadow:0 2px 10px rgba(0,0,0,0.8)}
.ps{position:absolute;top:68px;left:18px;font-size:12px;font-weight:700;color:${pc};font-family:Arial,sans-serif}
.fl{position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:44px;line-height:1}
.ge{position:absolute;top:10px;right:12px;font-size:20px}
.d1{position:absolute;top:82px;left:14px;right:14px;height:1.5px;background:linear-gradient(90deg,transparent,${t.bord} 25%,${t.bord} 75%,transparent);opacity:0.65}
.av{position:absolute;top:92px;left:50%;transform:translateX(-50%);width:165px;height:165px;border-radius:50%;background:rgba(0,0,0,0.22);border:1px solid ${t.bord};opacity:0.38;display:flex;align-items:center;justify-content:center;font-size:72px}
.fd{position:absolute;bottom:0;left:0;right:0;height:235px;background:linear-gradient(to bottom,transparent,rgba(0,0,0,0.78) 35%,rgba(0,0,0,0.94))}
.in{position:absolute;bottom:114px;left:0;right:0;text-align:center}
.nm{font-size:20px;font-weight:900;color:${t.txt};text-shadow:0 2px 8px rgba(0,0,0,0.9);font-family:"Arial Black",Arial,sans-serif}
.cl{font-size:10px;color:${t.sub};margin-top:2px;font-family:Arial,sans-serif}
.bg{display:inline-block;margin-top:5px;padding:2px 10px;border-radius:4px;background:${t.lbg};color:${t.ltxt};font-size:9px;font-weight:700;font-family:Arial,sans-serif}
.pt{font-size:12px;font-weight:700;color:${t.bord};margin-top:4px;font-family:Arial,sans-serif}
.d2{position:absolute;bottom:88px;left:14px;right:14px;height:1px;background:${t.bord};opacity:0.3}
.st{position:absolute;bottom:12px;left:10px;right:10px;display:grid;grid-template-columns:1fr 1fr;gap:3px 5px}
.s{display:flex;align-items:center;gap:4px}
.sv{font-size:15px;font-weight:900;color:${t.txt};min-width:20px;text-align:right;font-family:"Arial Black",Arial,sans-serif}
.sl{font-size:8px;font-weight:700;color:${t.sub};min-width:18px;font-family:Arial,sans-serif}
.sb{flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden}
.sf{height:100%;border-radius:3px;background:${t.bord}}
.lucky{position:absolute;bottom:9px;left:0;right:0;text-align:center;font-size:12px;font-weight:900;color:#FFD700;font-family:Arial,sans-serif}
.ea{position:absolute;bottom:5px;left:0;right:0;text-align:center;font-size:8px;color:rgba(255,255,255,0.18);font-family:Arial,sans-serif}
</style></head><body><div class="c">
  ${iconLines}
  <div style="position:absolute;inset:0;overflow:hidden">${stars}</div>
  <div class="sh"></div>
  <div class="ov">${p.rating}</div>
  <div class="ps">${p.position||'CM'}</div>
  <div class="fl">${p.nation||'🌍'}</div>
  <div class="ge">${p.gender||''}</div>
  <div class="d1"></div>
  <div class="av">⚽</div>
  <div class="fd"></div>
  <div class="in">
    <div class="nm">${nm}</div>
    <div class="cl">${cl}</div>
    <div><span class="bg">${t.lbl}</span></div>
    <div class="pt">💰 ${p.points||0} pts${p.isLucky?' 🍀':''}</div>
  </div>
  <div class="d2"></div>
  <div class="st">${statsHtml}</div>
  ${bottom}
</div></body></html>`;
}

async function generateCardImage(player) {
  const browser = await getBrowser();
  const page    = await browser.newPage();
  try {
    await page.setViewport({ width:340, height:500, deviceScaleFactor:2 });
    await page.setContent(buildHtml(player), { waitUntil:'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200));
    const buf = await page.screenshot({ type:'png' });
    return buf;
  } finally {
    await page.close();
  }
}

module.exports = { generateCardImage, getCardTier };
