// ═══════════════════════════════════════════════════════════════════
// DESIGN CARTES FIFA — tiers visuels basés sur la rareté du joueur
// ICON = blanc nacré (style cartes légendes FIFA)
// TOTY = bleu doré (style Team of the Year FIFA)
// GOLD_ELITE/GOLD/SILVER/BRONZE = standards
// ═══════════════════════════════════════════════════════════════════

const { createCanvas } = require('@napi-rs/canvas');

const W = 360, H = 520;

// ─── Obtenir le tier visuel selon la rareté ET l'OVR ─────────────
function getCardTier(rating, rarity) {
  if (rarity === 'TOTY')       return 'TOTY';
  if (rarity === 'ICON')       return 'ICON';
  if (rating >= 90) return 'GOLD_ELITE';
  if (rating >= 85) return 'GOLD';
  if (rating >= 80) return 'SILVER_RARE';
  if (rating >= 75) return 'SILVER';
  if (rating >= 70) return 'BRONZE_RARE';
  return 'BRONZE';
}

// ─── Thèmes visuels par tier ─────────────────────────────────────
const TIERS = {
  // ── ICON : Blanc nacré / argent brillant (comme les vraies cartes Icon FIFA) ──
  ICON: {
    cardBg:     ['#e8e8f0', '#f0f0f8', '#ffffff', '#e0e0ee'],
    frameBg:    '#c0c0d0',
    border1:    '#c8c8d8',
    border2:    '#ffffff',
    accentLine: '#c8a830',
    crystals:   false,
    icon:       true,   // design spécial nacré
    nameColor:  '#1a1a2a',
    statLabel:  '#4a4a6a',
    statValue:  '#1a1a2a',
    ovrColor:   '#1a1a2a',
    posColor:   '#4a4a6a',
    shimmer:    ['#d0d0e0', '#e8e8f4', '#ffffff', '#f0f0ff', '#e0e0f0'],
    glow:       'rgba(200,200,255,0.8)',
    labelText:  'ICON',
  },

  // ── TOTY : Bleu foncé avec accents dorés (comme les vraies cartes TOTY) ──
  TOTY: {
    cardBg:     ['#08102a', '#0c1840', '#142260', '#0c1840'],
    frameBg:    '#040810',
    border1:    '#1a3060',
    border2:    '#c8a020',
    accentLine: '#d4b030',
    crystals:   false,
    toty:       true,   // design spécial TOTY
    nameColor:  '#ffffff',
    statLabel:  '#88aadd',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#aaccff',
    shimmer:    ['#08102a', '#0c1840', '#1a2860', '#c8a020', '#0c1840'],
    glow:       'rgba(200,160,30,0.7)',
    labelText:  'TOTY',
  },
  GOLD_ELITE: {
    cardBg:     ['#1a1000', '#2e1e00', '#503000', '#2e1e00'],
    frameBg:    '#0a0800',
    border1:    '#c8900a',
    border2:    '#ffe066',
    accentLine: '#ffe066',
    crystals:   false,
    nameColor:  '#fff8dc',
    statLabel:  '#c8a050',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#ffd060',
    shimmer:    ['#3d2200', '#6b3d00', '#c8860a', '#ffe066', '#c8860a'],
    glow:       'rgba(255,200,50,0.5)',
    labelText:  'GOLD ELITE',
  },
  GOLD: {
    cardBg:     ['#14100a', '#241c0a', '#3a2c10', '#241c0a'],
    frameBg:    '#080600',
    border1:    '#a07820',
    border2:    '#d4a030',
    accentLine: '#d4a030',
    crystals:   false,
    nameColor:  '#fff0c0',
    statLabel:  '#b09040',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#d4a030',
    shimmer:    ['#241c0a', '#4a3818', '#a07820', '#d4b840', '#a07820'],
    glow:       'rgba(200,160,40,0.35)',
    labelText:  'GOLD',
  },
  SILVER_RARE: {
    cardBg:     ['#0c1018', '#141c28', '#1e2c40', '#141c28'],
    frameBg:    '#080c14',
    border1:    '#5080b0',
    border2:    '#80b0e0',
    accentLine: '#80b0e0',
    crystals:   false,
    nameColor:  '#e0eeff',
    statLabel:  '#7090b0',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#80b0d0',
    shimmer:    ['#141c28', '#2a3c54', '#5080b0', '#80b0e0', '#5080b0'],
    glow:       'rgba(80,140,200,0.35)',
    labelText:  'SILVER RARE',
  },
  SILVER: {
    cardBg:     ['#10101c', '#181828', '#242438', '#181828'],
    frameBg:    '#080810',
    border1:    '#5060a0',
    border2:    '#7080c0',
    accentLine: '#7080c0',
    crystals:   false,
    nameColor:  '#d8d8f8',
    statLabel:  '#6878a8',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#7080b8',
    shimmer:    ['#181828', '#282848', '#5060a0', '#7080c0', '#5060a0'],
    glow:       'rgba(80,100,180,0.28)',
    labelText:  'SILVER',
  },
  BRONZE_RARE: {
    cardBg:     ['#140c00', '#201400', '#342000', '#201400'],
    frameBg:    '#0a0600',
    border1:    '#804010',
    border2:    '#c06020',
    accentLine: '#c06020',
    crystals:   false,
    nameColor:  '#f0d8b0',
    statLabel:  '#a07040',
    statValue:  '#ffffff',
    ovrColor:   '#ffffff',
    posColor:   '#c07030',
    shimmer:    ['#201400', '#3c2200', '#804010', '#c06020', '#804010'],
    glow:       'rgba(160,80,20,0.28)',
    labelText:  'BRONZE RARE',
  },
  BRONZE: {
    cardBg:     ['#100c08', '#181208', '#241a0c', '#181208'],
    frameBg:    '#080604',
    border1:    '#604020',
    border2:    '#906040',
    accentLine: '#906040',
    crystals:   false,
    nameColor:  '#e8c8a0',
    statLabel:  '#907060',
    statValue:  '#e8c8a0',
    ovrColor:   '#e8c8a0',
    posColor:   '#906040',
    shimmer:    ['#181208', '#2c1e0c', '#604020', '#906040', '#604020'],
    glow:       'rgba(120,70,30,0.2)',
    labelText:  'BRONZE',
  },
};

function trunc(s, n) { return s && s.length > n ? s.slice(0,n-1)+'…' : (s||''); }

// ─── Forme de la carte (style FIFA avec découpes en haut) ─────────
function cardPath(ctx, x, y, w, h, r, notch) {
  const n = notch || 12;
  ctx.beginPath();
  // Coin haut-gauche arrondi
  ctx.moveTo(x + r, y);
  // Bord haut avec encoche centrale (style FIFA)
  ctx.lineTo(x + w/2 - n*2, y);
  ctx.lineTo(x + w/2 - n, y - n);
  ctx.lineTo(x + w/2 + n, y - n);
  ctx.lineTo(x + w/2 + n*2, y);
  // Coin haut-droit
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  // Bord droit
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  // Bord bas
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  // Bord gauche
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Fond animé avec cristaux (ICON only) ────────────────────────
function drawCrystals(ctx, x, y, w, h, t) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.clip();

  // Cristaux bleus en arrière-plan
  const crystalPoints = [
    [[0.1,0.1],[0.3,0.35],[0.0,0.5]],
    [[0.25,0.0],[0.55,0.2],[0.35,0.45],[0.1,0.3]],
    [[0.5,0.0],[0.85,0.15],[0.7,0.4],[0.45,0.25]],
    [[0.7,0.05],[1.0,0.2],[0.95,0.45],[0.65,0.35]],
    [[0.0,0.45],[0.2,0.6],[0.1,0.75]],
    [[0.15,0.55],[0.45,0.5],[0.4,0.75],[0.1,0.8]],
    [[0.4,0.45],[0.7,0.5],[0.65,0.7],[0.35,0.72]],
    [[0.65,0.4],[0.95,0.45],[1.0,0.7],[0.7,0.68]],
    [[0.0,0.7],[0.25,0.75],[0.15,0.95]],
    [[0.2,0.72],[0.5,0.7],[0.45,0.92],[0.15,0.98]],
    [[0.45,0.68],[0.75,0.72],[0.7,0.95],[0.4,0.98]],
    [[0.7,0.65],[1.0,0.68],[1.0,0.9]],
  ];

  const blues = ['#0a1560','#0d2080','#1030a0','#1540c0','#1a50d8','#0a1040'];

  crystalPoints.forEach((poly, i) => {
    const shade = blues[i % blues.length];
    ctx.beginPath();
    ctx.moveTo(x + poly[0][0]*w, y + poly[0][1]*h);
    poly.slice(1).forEach(p => ctx.lineTo(x + p[0]*w, y + p[1]*h));
    ctx.closePath();
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.strokeStyle = 'rgba(100,160,255,0.25)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Diagonale dorée brillante (la bande caractéristique)
  const goldGrad = ctx.createLinearGradient(x, y+h*0.2, x+w, y+h*0.7);
  goldGrad.addColorStop(0,   'rgba(150,100,0,0)');
  goldGrad.addColorStop(0.2, 'rgba(200,140,20,0.1)');
  goldGrad.addColorStop(0.4, 'rgba(255,180,40,0.5)');
  goldGrad.addColorStop(0.5, 'rgba(255,210,80,0.7)');
  goldGrad.addColorStop(0.6, 'rgba(255,180,40,0.5)');
  goldGrad.addColorStop(0.8, 'rgba(200,140,20,0.1)');
  goldGrad.addColorStop(1,   'rgba(150,100,0,0)');

  ctx.beginPath();
  ctx.moveTo(x,       y + h*0.25);
  ctx.lineTo(x + w,   y + h*0.55);
  ctx.lineTo(x + w,   y + h*0.70);
  ctx.lineTo(x,       y + h*0.40);
  ctx.closePath();
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // Reflets lumineux
  const glowPoints = [[0.35, 0.42], [0.55, 0.5], [0.75, 0.58]];
  glowPoints.forEach(([gx, gy]) => {
    const rg = ctx.createRadialGradient(x+gx*w, y+gy*h, 0, x+gx*w, y+gy*h, w*0.12);
    rg.addColorStop(0,   'rgba(255,255,200,0.6)');
    rg.addColorStop(0.4, 'rgba(255,200,80,0.2)');
    rg.addColorStop(1,   'rgba(255,200,80,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x+gx*w, y+gy*h, w*0.12, 0, Math.PI*2);
    ctx.fill();
  });

  ctx.restore();
}

// ─── Fond shimmer (pour les autres tiers) ────────────────────────
function drawShimmer(ctx, x, y, w, h, t) {
  const grad = ctx.createLinearGradient(x, y, x+w, y+h);
  t.shimmer.forEach((c,i) => grad.addColorStop(i/(t.shimmer.length-1), c));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();

  // Effet de lumière diagonal subtil
  const shine = ctx.createLinearGradient(x, y, x+w*0.7, y+h*0.7);
  shine.addColorStop(0,   'rgba(255,255,255,0.08)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0.03)');
  shine.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
}

// ─── Fond ICON : blanc nacré avec reflets argentés ───────────────
function drawIconBg(ctx, x, y, w, h) {
  // Base blanche nacrée
  const bg = ctx.createLinearGradient(x, y, x+w, y+h);
  bg.addColorStop(0,   '#e8eaf0');
  bg.addColorStop(0.3, '#f5f5ff');
  bg.addColorStop(0.5, '#ffffff');
  bg.addColorStop(0.7, '#f0f0fa');
  bg.addColorStop(1,   '#e0e2ec');
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fillStyle = bg; ctx.fill();

  // Reflet diagonal argenté
  const shine = ctx.createLinearGradient(x, y, x+w, y+h*0.6);
  shine.addColorStop(0,   'rgba(255,255,255,0.9)');
  shine.addColorStop(0.4, 'rgba(220,220,240,0.4)');
  shine.addColorStop(1,   'rgba(180,180,210,0)');
  ctx.beginPath(); ctx.roundRect(x, y, w*0.7, h*0.6, 14); ctx.fillStyle = shine; ctx.fill();

  // Vague argentée caractéristique des cartes Icon
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.clip();

  // Bande diagonale dorée subtile
  const wave = ctx.createLinearGradient(x, y+h*0.3, x+w, y+h*0.7);
  wave.addColorStop(0,   'rgba(200,160,40,0)');
  wave.addColorStop(0.3, 'rgba(200,160,40,0.08)');
  wave.addColorStop(0.5, 'rgba(220,180,60,0.15)');
  wave.addColorStop(0.7, 'rgba(200,160,40,0.08)');
  wave.addColorStop(1,   'rgba(200,160,40,0)');
  ctx.fillStyle = wave;
  ctx.fillRect(x, y, w, h);

  // Motif de lignes fines argentées (texture Icon)
  ctx.strokeStyle = 'rgba(180,180,220,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i*(w/15), y);
    ctx.lineTo(x, y + i*(h/15));
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Fond TOTY : bleu nuit profond avec étoiles et accents dorés ─
function drawTotyBg(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.clip();

  // Fond bleu nuit profond
  const bg = ctx.createLinearGradient(x, y, x+w, y+h);
  bg.addColorStop(0,   '#060e28');
  bg.addColorStop(0.4, '#0a1640');
  bg.addColorStop(0.7, '#0e1e58');
  bg.addColorStop(1,   '#081030');
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);

  // Étoiles/particules dorées (signature TOTY)
  const stars = [
    [0.15,0.12],[0.82,0.08],[0.45,0.18],[0.92,0.25],[0.08,0.35],
    [0.7,0.15],[0.55,0.28],[0.28,0.22],[0.88,0.42],[0.18,0.55],
    [0.62,0.08],[0.38,0.38],[0.78,0.32],[0.12,0.18],[0.95,0.58],
  ];
  stars.forEach(([sx, sy]) => {
    const r = ctx.createRadialGradient(x+sx*w, y+sy*h, 0, x+sx*w, y+sy*h, 4);
    r.addColorStop(0,   'rgba(220,180,40,0.9)');
    r.addColorStop(0.4, 'rgba(200,150,20,0.4)');
    r.addColorStop(1,   'rgba(200,150,20,0)');
    ctx.fillStyle = r;
    ctx.beginPath(); ctx.arc(x+sx*w, y+sy*h, 4, 0, Math.PI*2); ctx.fill();
  });

  // Bande lumineuse centrale (signature design TOTY)
  const band = ctx.createLinearGradient(x, y+h*0.25, x+w, y+h*0.65);
  band.addColorStop(0,   'rgba(180,130,20,0)');
  band.addColorStop(0.2, 'rgba(200,150,20,0.06)');
  band.addColorStop(0.5, 'rgba(230,180,30,0.14)');
  band.addColorStop(0.8, 'rgba(200,150,20,0.06)');
  band.addColorStop(1,   'rgba(180,130,20,0)');
  ctx.fillStyle = band; ctx.fillRect(x, y, w, h);

  // Halo lumineux en bas
  const halo = ctx.createRadialGradient(x+w/2, y+h*0.85, 0, x+w/2, y+h*0.85, w*0.6);
  halo.addColorStop(0,   'rgba(20,60,160,0.5)');
  halo.addColorStop(0.5, 'rgba(10,30,100,0.2)');
  halo.addColorStop(1,   'rgba(10,20,60,0)');
  ctx.fillStyle = halo; ctx.fillRect(x, y, w, h);

  ctx.restore();
}

async function generateCardImage(player) {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  const tier = getCardTier(player.rating, player.rarity);
  const t    = TIERS[tier] || TIERS.BRONZE;

  const MARGIN = 18;
  const cX = MARGIN, cY = MARGIN + 10;
  const cW = W - MARGIN*2, cH = H - MARGIN*2 - 10;

  // ── Fond global ───────────────────────────────────────────────
  ctx.fillStyle = t.icon ? '#1a1a2a' : '#000000';
  ctx.fillRect(0, 0, W, H);

  // ── Cadre extérieur ───────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = t.glow;
  ctx.shadowBlur  = t.icon || t.toty ? 30 : 20;
  cardPath(ctx, cX-2, cY-2, cW+4, cH+4, 16, 13);
  ctx.fillStyle = t.border2;
  ctx.fill();
  ctx.restore();

  // ── Bordure intérieure ────────────────────────────────────────
  cardPath(ctx, cX, cY, cW, cH, 14, 12);
  ctx.fillStyle = t.border1;
  ctx.fill();

  // ── Corps de la carte ─────────────────────────────────────────
  const innerX = cX+4, innerY = cY+4, innerW = cW-8, innerH = cH-8;

  if (t.icon) {
    drawIconBg(ctx, innerX, innerY, innerW, innerH);
  } else if (t.toty) {
    drawTotyBg(ctx, innerX, innerY, innerW, innerH);
  } else if (t.crystals) {
    drawCrystals(ctx, innerX, innerY, innerW, innerH, t);
  } else {
    drawShimmer(ctx, innerX, innerY, innerW, innerH, t);
  }

  // ── Zone du bas (fond semi-transparent pour les infos) ────────
  const BOTTOM_H = 160;
  const bottomGrad = ctx.createLinearGradient(0, innerY+innerH-BOTTOM_H, 0, innerY+innerH);
  bottomGrad.addColorStop(0,   'rgba(0,0,0,0)');
  bottomGrad.addColorStop(0.3, 'rgba(0,0,0,0.7)');
  bottomGrad.addColorStop(1,   'rgba(0,0,0,0.92)');

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(innerX, innerY, innerW, innerH, 14);
  ctx.clip();
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(innerX, innerY+innerH-BOTTOM_H, innerW, BOTTOM_H);
  ctx.restore();

  // ── OVR + Position (haut gauche) ──────────────────────────────
  const HX = cX + 18, HY = cY + 20;

  ctx.font = 'bold 54px Poppins';
  ctx.fillStyle = t.ovrColor;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(String(player.rating), HX, HY + 48);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 16px Poppins';
  ctx.fillStyle = t.posColor;
  ctx.fillText(player.position || 'CM', HX + 2, HY + 68);

  // ── Drapeau nation (haut droit) ───────────────────────────────
  ctx.font = '36px Noto Color Emoji';
  ctx.textAlign = 'right';
  ctx.fillText(player.nation || '🌍', cX + cW - 14, cY + 46);

  // Genre
  ctx.font = '18px Noto Color Emoji';
  ctx.fillText(player.gender || '', cX + cW - 14, cY + 72);

  // ── Ligne décorative sous le header ──────────────────────────
  const lineY = cY + 82;
  const lineGrad = ctx.createLinearGradient(cX+10, 0, cX+cW-10, 0);
  lineGrad.addColorStop(0,   'rgba(255,255,255,0)');
  lineGrad.addColorStop(0.3, t.accentLine);
  lineGrad.addColorStop(0.7, t.accentLine);
  lineGrad.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.moveTo(cX+10, lineY); ctx.lineTo(cX+cW-10, lineY);
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 1.5; ctx.stroke();

  // ── NOM DU JOUEUR (bas de la zone image) ──────────────────────
  const nameY = innerY + innerH - 92;

  // Ombre portée pour lisibilité
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Poppins';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = t.nameColor;
  ctx.fillText(trunc(player.name, 18), W/2, nameY);
  ctx.shadowBlur = 0;

  // Club (plus petit, dessous)
  ctx.font      = '13px Poppins';
  ctx.fillStyle = t.statLabel;
  ctx.fillText(trunc(player.club, 24), W/2, nameY + 20);

  // ── Points & Lucky ────────────────────────────────────────────
  const ptsY = nameY + 38;
  ctx.font      = 'bold 13px Poppins';
  ctx.fillStyle = t.accentLine;
  const luckyStr = player.isLucky ? ' 🍀 LUCKY ×2' : '';
  ctx.fillText(`💰 ${player.points} pts${luckyStr}`, W/2, ptsY);

  // ── STATS (rangée du bas) ─────────────────────────────────────
  const STATS_Y   = innerY + innerH - 44;
  const statLabels = ['PAC','SHO','PAS','DRI','DEF','PHY'];
  const statValues = [player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical];
  const COL_W = innerW / 6;

  // Fond stats
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(innerX, STATS_Y - 28, innerW, 44);

  // Ligne de séparation
  ctx.beginPath();
  ctx.moveTo(innerX, STATS_Y - 28);
  ctx.lineTo(innerX + innerW, STATS_Y - 28);
  ctx.strokeStyle = t.accentLine;
  ctx.lineWidth   = 1;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  statLabels.forEach((lbl, i) => {
    const sx = innerX + (i + 0.5) * COL_W;

    // Séparateur vertical
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(innerX + i*COL_W, STATS_Y-24);
      ctx.lineTo(innerX + i*COL_W, STATS_Y+12);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Label
    ctx.font      = 'bold 10px Poppins';
    ctx.fillStyle = t.statLabel;
    ctx.textAlign = 'center';
    ctx.fillText(lbl, sx, STATS_Y - 14);

    // Valeur
    ctx.font      = 'bold 18px Poppins';
    ctx.fillStyle = t.statValue;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur  = 4;
    ctx.fillText(String(statValues[i] || 0), sx, STATS_Y + 8);
    ctx.shadowBlur = 0;
  });

  // ── Badge tier (tout en bas) ──────────────────────────────────
  ctx.font      = 'bold 9px Poppins';
  ctx.fillStyle = t.accentLine;
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.7;
  ctx.fillText(t.labelText, W/2, cY+cH-8);
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}

module.exports = { generateCardImage, getCardTier };
