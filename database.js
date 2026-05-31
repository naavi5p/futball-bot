const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { getCardLimit } = require('./players');

const DB_PATH = path.join(__dirname, 'data.json');

const ROLLS_MAX      = 10;
const CLAIMS_MAX     = 2;
const CLAIMS_COOLDOWN = 60 * 60 * 1000;

let data        = { users: {} };
let circulation = {};

// ─── Fenêtre de roll : toutes les heures UTC+1 ───────────────────
// Chaque heure pleine = nouveau créneau (00h→01h, 01h→02h... 23h→00h)
// 10 rolls par créneau, non cumulables

function getCurrentWindow() {
  const now = new Date();
  // Heure Paris (UTC+1 fixe, approximation correcte hors DST)
  const parisHour = (now.getUTCHours() + 1) % 24;
  const dateStr   = now.toISOString().slice(0, 10);
  return `${dateStr}_${parisHour}`;
}

function getNextWindowMs() {
  const now = new Date();
  // Prochaine heure pleine UTC
  const next = new Date(now);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(now.getUTCHours() + 1);
  return next.getTime();
}

function init() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      data.users = raw.users || {};
      circulation = {};
      Object.values(data.users).forEach(u => {
        (u.collection || []).forEach(c => {
          if (!circulation[c.name]) circulation[c.name] = { count: 0, rating: c.rating };
          circulation[c.name].count++;
        });
      });
      const total = Object.values(circulation).reduce((a,b) => a + b.count, 0);
      console.log('💾 DB chargée —', total, 'cartes en circulation.');
    } catch { console.warn('⚠️ DB corrompue, réinitialisée.'); }
  }
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: data.users }, null, 2));
}

function ensureUser(userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      rolls:      { usedWindow: null, count: 0 },
      claims:     { usedWindow: null, count: CLAIMS_MAX },
      collection: [],
      score:      0,
    };
  }
  // Migration claims ancien format (resetAt → usedWindow)
  if (data.users[userId].claims?.resetAt !== undefined) {
    data.users[userId].claims = { usedWindow: null, count: CLAIMS_MAX };
  }
  if (!data.users[userId].claims) {
    data.users[userId].claims = { usedWindow: null, count: CLAIMS_MAX };
  }
  if (data.users[userId].score === undefined) data.users[userId].score = 0;
}

// ─── Rolls par fenêtre ────────────────────────────────────────────
function getRolls(userId) {
  ensureUser(userId);
  const window = getCurrentWindow();
  const r = data.users[userId].rolls;

  if (!window) {
    // Hors fenêtre
    return {
      count: 0,
      inWindow: false,
      currentWindow: null,
      nextWindowMs: getNextWindowMs(),
    };
  }

  // Si c'est une nouvelle fenêtre, reset les rolls
  if (r.usedWindow !== window) {
    r.usedWindow = window;
    r.count = ROLLS_MAX;
    save();
  }

  return {
    count: r.count,
    inWindow: true,
    currentWindow: window,
    nextWindowMs: getNextWindowMs(),
  };
}

function useRoll(userId) {
  ensureUser(userId);
  const window = getCurrentWindow();
  if (!window) return false;

  const r = data.users[userId].rolls;
  if (r.usedWindow !== window) {
    r.usedWindow = window;
    r.count = ROLLS_MAX;
  }
  if (r.count <= 0) return false;
  r.count--;
  save();
  return true;
}

// ─── Claims (2 / heure fixe, même système que les rolls) ─────────
function getClaims(userId) {
  ensureUser(userId);
  const window = getCurrentWindow();
  const c = data.users[userId].claims;

  if (c.usedWindow !== window) {
    c.usedWindow = window;
    c.count = CLAIMS_MAX;
    save();
  }
  return { count: c.count, nextWindowMs: getNextWindowMs() };
}

function useClaim(userId) {
  ensureUser(userId);
  const window = getCurrentWindow();
  const c = data.users[userId].claims;
  if (c.usedWindow !== window) { c.usedWindow = window; c.count = CLAIMS_MAX; }
  if (c.count <= 0) return false;
  c.count--;
  save();
  return true;
}

// ─── Exemplaires limités ──────────────────────────────────────────
function getExcludedPlayers() {
  const excluded = new Set();
  Object.entries(circulation).forEach(([name, info]) => {
    if (info.count >= getCardLimit(info.rating)) excluded.add(name);
  });
  return excluded;
}

function getCardCirculation(playerName, rating) {
  const info = circulation[playerName];
  return { current: info ? info.count : 0, max: getCardLimit(rating) };
}

// ─── Collection & Score ──────────────────────────────────────────
function addCard(userId, player) {
  ensureUser(userId);
  const cardId = `${player.name.replace(/\W+/g,'_')}_${Date.now()}_${randomUUID().slice(0,6)}`;
  const card = { ...player, cardId, obtainedAt: Date.now() };
  data.users[userId].collection.push(card);
  data.users[userId].score = (data.users[userId].score || 0) + (player.points || 0);
  if (!circulation[player.name]) circulation[player.name] = { count: 0, rating: player.rating };
  circulation[player.name].count++;
  save();
  return card;
}

function getCollection(userId) {
  ensureUser(userId);
  return data.users[userId].collection;
}

function getCardById(userId, cardId) {
  return getCollection(userId).find(c => c.cardId === cardId);
}

// ─── Give ────────────────────────────────────────────────────────
function giveCard(fromId, toId, cardId) {
  ensureUser(fromId); ensureUser(toId);
  const fromCol = data.users[fromId].collection;
  const idx = fromCol.findIndex(c => c.cardId === cardId);
  if (idx === -1) return { ok: false, reason: 'Carte introuvable dans ta collection.' };
  const card = fromCol.splice(idx, 1)[0];
  data.users[fromId].score = Math.max(0, (data.users[fromId].score || 0) - (card.points || 0));
  data.users[toId].collection.push({ ...card, obtainedAt: Date.now() });
  data.users[toId].score = (data.users[toId].score || 0) + (card.points || 0);
  save();
  return { ok: true, card };
}

// ─── Trade ───────────────────────────────────────────────────────
function tradeCards(fromId, fromCardId, toId, toCardId) {
  ensureUser(fromId); ensureUser(toId);
  const fromCol = data.users[fromId].collection;
  const toCol   = data.users[toId].collection;
  const fromIdx = fromCol.findIndex(c => c.cardId === fromCardId);
  const toIdx   = toCol.findIndex(c => c.cardId === toCardId);
  if (fromIdx === -1) return { ok: false, reason: 'Ta carte est introuvable.' };
  if (toIdx   === -1) return { ok: false, reason: 'La carte de ton partenaire est introuvable.' };
  const fromCard = fromCol.splice(fromIdx, 1)[0];
  const toCard   = toCol.splice(toIdx, 1)[0];
  data.users[fromId].score = Math.max(0, (data.users[fromId].score||0) - (fromCard.points||0) + (toCard.points||0));
  data.users[toId].score   = Math.max(0, (data.users[toId].score||0)   - (toCard.points||0) + (fromCard.points||0));
  fromCol.push({ ...toCard,   obtainedAt: Date.now() });
  toCol.push(  { ...fromCard, obtainedAt: Date.now() });
  save();
  return { ok: true, fromCard, toCard };
}

// ─── Score & Leaderboard ─────────────────────────────────────────
function getScore(userId) {
  ensureUser(userId); return data.users[userId].score || 0;
}

function getLeaderboard(byCards = false) {
  return Object.entries(data.users)
    .map(([userId, u]) => ({ userId, count: u.collection.length, score: u.score || 0 }))
    .filter(u => u.count > 0)
    .sort(byCards ? (a,b) => b.count-a.count||b.score-a.score : (a,b) => b.score-a.score||b.count-a.count)
    .slice(0, 10);
}

module.exports = {
  init, save,
  getRolls, useRoll,
  getClaims, useClaim,
  addCard, getCollection, getCardById,
  giveCard, tradeCards,
  getScore, getLeaderboard,
  getExcludedPlayers, getCardCirculation,
  getCurrentWindow, getNextWindowMs,
  ROLLS_MAX, CLAIMS_MAX,
};
