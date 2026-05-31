// ═══════════════════════════════════════════════════════════════════
// CROQUIS JOUEURS — poses différentes par position
// Style : silhouette FIFA en trait épais, expressif
// ═══════════════════════════════════════════════════════════════════

function drawSketch(ctx, cx, cy, position, color = 'rgba(255,255,255,0.85)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pos = position?.toUpperCase() || 'CM';

  if (['GK'].includes(pos)) {
    drawGoalkeeper(ctx, cx, cy);
  } else if (['CB','LB','RB','LWB','RWB'].includes(pos)) {
    drawDefender(ctx, cx, cy);
  } else if (['CDM','CM','CAM','LM','RM','DM'].includes(pos)) {
    drawMidfielder(ctx, cx, cy);
  } else {
    // ST, CF, LW, RW, SS, LS, RS
    drawStriker(ctx, cx, cy);
  }

  ctx.restore();
}

// ── Attaquant : frappe de balle, jambe levée ──────────────────────
function drawStriker(ctx, cx, cy) {
  const s = 1.15; // scale
  ctx.lineWidth = 4.5;

  // Tête
  ctx.beginPath();
  ctx.arc(cx, cy - 68*s, 16*s, 0, Math.PI*2);
  ctx.fill();

  // Corps penché en avant
  // Torse
  ctx.beginPath();
  ctx.moveTo(cx, cy - 52*s);
  ctx.bezierCurveTo(cx - 8*s, cy - 30*s, cx - 5*s, cy - 10*s, cx + 10*s, cy + 5*s);
  ctx.stroke();

  // Bras gauche tendu (équilibre)
  ctx.beginPath();
  ctx.moveTo(cx - 5*s, cy - 42*s);
  ctx.bezierCurveTo(cx - 28*s, cy - 38*s, cx - 38*s, cy - 28*s, cx - 42*s, cy - 15*s);
  ctx.stroke();

  // Bras droit vers le bas
  ctx.beginPath();
  ctx.moveTo(cx - 2*s, cy - 40*s);
  ctx.bezierCurveTo(cx + 18*s, cy - 35*s, cx + 22*s, cy - 20*s, cx + 18*s, cy - 5*s);
  ctx.stroke();

  // Jambe de support (gauche, pliée)
  ctx.beginPath();
  ctx.moveTo(cx + 10*s, cy + 5*s);
  ctx.bezierCurveTo(cx + 5*s, cy + 22*s, cx - 2*s, cy + 35*s, cx - 8*s, cy + 55*s);
  ctx.stroke();
  // Pied
  ctx.beginPath();
  ctx.moveTo(cx - 8*s, cy + 55*s);
  ctx.lineTo(cx - 22*s, cy + 58*s);
  ctx.stroke();

  // Jambe de frappe (droite, levée et pliée)
  ctx.beginPath();
  ctx.moveTo(cx + 10*s, cy + 5*s);
  ctx.bezierCurveTo(cx + 28*s, cy + 15*s, cx + 38*s, cy + 25*s, cx + 35*s, cy + 42*s);
  ctx.stroke();
  // Bas de jambe plié vers l'arrière
  ctx.beginPath();
  ctx.moveTo(cx + 35*s, cy + 42*s);
  ctx.bezierCurveTo(cx + 40*s, cy + 28*s, cx + 42*s, cy + 18*s, cx + 38*s, cy + 8*s);
  ctx.stroke();

  // Ballon
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx + 48*s, cy - 5*s, 11*s, 0, Math.PI*2);
  ctx.stroke();
  // Motif ballon
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx + 48*s, cy - 5*s, 5*s, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 48*s, cy - 16*s);
  ctx.lineTo(cx + 48*s, cy + 6*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 37*s, cy - 5*s);
  ctx.lineTo(cx + 59*s, cy - 5*s);
  ctx.stroke();
}

// ── Milieu : dribble, corps de profil ────────────────────────────
function drawMidfielder(ctx, cx, cy) {
  const s = 1.15;
  ctx.lineWidth = 4.5;

  // Tête, légèrement penchée
  ctx.beginPath();
  ctx.arc(cx - 5*s, cy - 68*s, 16*s, 0, Math.PI*2);
  ctx.fill();

  // Torse
  ctx.beginPath();
  ctx.moveTo(cx - 5*s, cy - 52*s);
  ctx.bezierCurveTo(cx - 12*s, cy - 30*s, cx - 8*s, cy - 10*s, cx, cy + 5*s);
  ctx.stroke();

  // Bras gauche vers le ballon
  ctx.beginPath();
  ctx.moveTo(cx - 8*s, cy - 42*s);
  ctx.bezierCurveTo(cx - 25*s, cy - 30*s, cx - 32*s, cy - 12*s, cx - 28*s, cy + 2*s);
  ctx.stroke();

  // Bras droit
  ctx.beginPath();
  ctx.moveTo(cx - 3*s, cy - 40*s);
  ctx.bezierCurveTo(cx + 20*s, cy - 38*s, cx + 28*s, cy - 28*s, cx + 22*s, cy - 15*s);
  ctx.stroke();

  // Jambe gauche fléchie (contrôle)
  ctx.beginPath();
  ctx.moveTo(cx, cy + 5*s);
  ctx.bezierCurveTo(cx - 8*s, cy + 22*s, cx - 12*s, cy + 38*s, cx - 18*s, cy + 55*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 18*s, cy + 55*s);
  ctx.lineTo(cx - 32*s, cy + 57*s);
  ctx.stroke();

  // Jambe droite
  ctx.beginPath();
  ctx.moveTo(cx, cy + 5*s);
  ctx.bezierCurveTo(cx + 15*s, cy + 20*s, cx + 18*s, cy + 38*s, cx + 12*s, cy + 55*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 12*s, cy + 55*s);
  ctx.lineTo(cx + 25*s, cy + 57*s);
  ctx.stroke();

  // Ballon près du pied gauche
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx - 36*s, cy + 50*s, 10*s, 0, Math.PI*2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 36*s, cy + 50*s, 4.5*s, 0, Math.PI*2);
  ctx.stroke();
}

// ── Défenseur : position de tacle/interception ───────────────────
function drawDefender(ctx, cx, cy) {
  const s = 1.15;
  ctx.lineWidth = 4.5;

  // Tête
  ctx.beginPath();
  ctx.arc(cx + 5*s, cy - 68*s, 16*s, 0, Math.PI*2);
  ctx.fill();

  // Torse droit, imposant
  ctx.beginPath();
  ctx.moveTo(cx + 5*s, cy - 52*s);
  ctx.bezierCurveTo(cx, cy - 30*s, cx - 2*s, cy - 10*s, cx - 5*s, cy + 5*s);
  ctx.stroke();

  // Bras gauche tendu (bloque)
  ctx.beginPath();
  ctx.moveTo(cx + 2*s, cy - 42*s);
  ctx.bezierCurveTo(cx - 15*s, cy - 50*s, cx - 32*s, cy - 48*s, cx - 42*s, cy - 38*s);
  ctx.stroke();

  // Bras droit
  ctx.beginPath();
  ctx.moveTo(cx + 8*s, cy - 40*s);
  ctx.bezierCurveTo(cx + 28*s, cy - 42*s, cx + 38*s, cy - 35*s, cx + 32*s, cy - 20*s);
  ctx.stroke();

  // Jambe gauche en tacle (allongée)
  ctx.beginPath();
  ctx.moveTo(cx - 5*s, cy + 5*s);
  ctx.bezierCurveTo(cx - 18*s, cy + 25*s, cx - 32*s, cy + 40*s, cx - 48*s, cy + 52*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 48*s, cy + 52*s);
  ctx.lineTo(cx - 62*s, cy + 50*s);
  ctx.stroke();

  // Jambe droite pliée (appui)
  ctx.beginPath();
  ctx.moveTo(cx - 5*s, cy + 5*s);
  ctx.bezierCurveTo(cx + 10*s, cy + 22*s, cx + 15*s, cy + 38*s, cx + 8*s, cy + 55*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 8*s, cy + 55*s);
  ctx.lineTo(cx + 20*s, cy + 58*s);
  ctx.stroke();
}

// ── Gardien : plongeon ────────────────────────────────────────────
function drawGoalkeeper(ctx, cx, cy) {
  const s = 1.1;
  ctx.lineWidth = 4.5;

  // Tête penchée (plongeon)
  ctx.beginPath();
  ctx.arc(cx - 30*s, cy - 45*s, 16*s, 0, Math.PI*2);
  ctx.fill();

  // Corps horizontal (plongeon)
  ctx.beginPath();
  ctx.moveTo(cx - 15*s, cy - 35*s);
  ctx.bezierCurveTo(cx + 5*s, cy - 20*s, cx + 20*s, cy - 5*s, cx + 30*s, cy + 15*s);
  ctx.stroke();

  // Bras gauche tendu vers le haut (attrape)
  ctx.beginPath();
  ctx.moveTo(cx - 18*s, cy - 38*s);
  ctx.bezierCurveTo(cx - 32*s, cy - 55*s, cx - 42*s, cy - 65*s, cx - 48*s, cy - 72*s);
  ctx.stroke();
  // Gant
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx - 50*s, cy - 75*s, 10*s, 0, Math.PI*2);
  ctx.stroke();

  // Bras droit vers le bas
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10*s, cy - 30*s);
  ctx.bezierCurveTo(cx + 5*s, cy - 10*s, cx + 18*s, cy + 2*s, cx + 22*s, cy + 18*s);
  ctx.stroke();

  // Jambes (écarquillées, dynamisme)
  ctx.beginPath();
  ctx.moveTo(cx + 28*s, cy + 15*s);
  ctx.bezierCurveTo(cx + 38*s, cy + 30*s, cx + 45*s, cy + 42*s, cx + 42*s, cy + 58*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 28*s, cy + 15*s);
  ctx.bezierCurveTo(cx + 15*s, cy + 35*s, cx + 5*s, cy + 48*s, cx - 5*s, cy + 58*s);
  ctx.stroke();

  // Ballon (qu'il essaie d'attraper)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx - 38*s, cy - 58*s, 12*s, 0, Math.PI*2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 38*s, cy - 58*s, 5*s, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 38*s, cy - 70*s);
  ctx.lineTo(cx - 38*s, cy - 46*s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 50*s, cy - 58*s);
  ctx.lineTo(cx - 26*s, cy - 58*s);
  ctx.stroke();
}

module.exports = { drawSketch };
