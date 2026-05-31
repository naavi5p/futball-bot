const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const db = require('./database');
const { getRandomPlayer } = require('./players');
const { formatCardEmbed, RARITY_CONFIG } = require('./cardEmbed');
const { generateCardImage } = require('./cardImage');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const PREFIX = '$';
const CLAIM_TIMEOUT_MS = 60 * 1000; // 1 minute pour récupérer une carte

const activeRolls = new Map();

// ─── Fourchette de points selon l'OVR ────────────────────────────
function getPointsRange(ovr) {
  if (ovr >= 95) return '500–1000 pts';
  if (ovr >= 90) return '250–500 pts';
  if (ovr >= 85) return '100–250 pts';
  if (ovr >= 80) return '75–100 pts';
  if (ovr >= 75) return '50–75 pts';
  if (ovr >= 70) return '10–50 pts';
  return '1–10 pts';
}

client.once('clientReady', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  console.log(`📦 ${require('./players').PLAYERS.length} cartes chargées`);
  db.init();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmd = args[0].toLowerCase();

  if (['claim','c','roll','r'].includes(cmd))        await handleClaim(message);
  else if (['collection','col','inv'].includes(cmd)) await handleCollection(message, args);
  else if (['rolls','stock'].includes(cmd))          await handleRolls(message);
  else if (cmd === 'card')                           await handleViewCard(message, args);
  else if (['top','leaderboard','lb'].includes(cmd)) await handleLeaderboard(message, args);
  else if (['score','points','pts'].includes(cmd))   await handleScore(message, args);
  else if (['help','h','aide'].includes(cmd))        await handleHelp(message);
  else if (cmd === 'stats')                          await handleStats(message);
  else if (cmd === 'search')                         await handleSearch(message, args);
  else if (cmd === 'view')                           await handleView(message, args);
  else if (cmd === 'give')                           await handleGive(message, args);
  else if (cmd === 'trade')                          await handleTrade(message, args);
  else if (cmd === 'accept')                         await handleAccept(message);
  else if (cmd === 'decline')                        await handleDecline(message);
});

// ─── $claim / $roll ───────────────────────────────────────────────────────────
async function handleClaim(message) {
  const userId    = message.author.id;
  const userRolls = db.getRolls(userId);

  // Hors fenêtre (ne devrait plus arriver car c'est toutes les heures)
  if (!userRolls.inWindow) {
    const nextMs = userRolls.nextWindowMs - Date.now();
    const nextM  = Math.ceil(nextMs / 60000);
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('⏰ Attends la prochaine heure !')
        .setDescription(`Les 10 rolls se rechargent à chaque heure pleine.\nProchain créneau dans **${nextM} min**.`)
      ]
    });
  }

  // Plus de rolls ce créneau
  if (userRolls.count <= 0) {
    const nextMs = userRolls.nextWindowMs - Date.now();
    const nextM  = Math.ceil(nextMs / 60000);
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#FF8800')
        .setTitle('❌ Plus de rolls cette heure !')
        .setDescription(`Tu as utilisé tes **${db.ROLLS_MAX} rolls**.\nProchain rechargement dans **${nextM} min**.`)
      ]
    });
  }

  // Générer la carte en excluant les joueurs qui ont atteint leur limite
  const excluded = db.getExcludedPlayers();
  const player = getRandomPlayer(excluded);
  db.useRoll(userId);
  const newRolls = db.getRolls(userId);
  const claims   = db.getClaims(userId);

  // Image de la carte
  let attachment = null;
  try {
    const imgBuf = await generateCardImage(player);
    attachment = new AttachmentBuilder(imgBuf, { name: 'card.png' });
  } catch (e) {
    console.error('Erreur image:', e.message);
  }

  const embed = formatCardEmbed(player, message.author);
  if (attachment) embed.setImage('attachment://card.png');

  const luckyLabel = player.isLucky ? '🍀 LUCKY ! ' : '';
  const btn = new ButtonBuilder()
    .setCustomId(`claim_${message.id}`)
    .setLabel(`⚽ ${luckyLabel}Récupérer (${player.points} pts)`)
    .setStyle(player.isLucky ? ButtonStyle.Primary : ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(btn);

  const payload = {
    content: `🎴 **Roll de ${message.author.username}** • 🎲 ${newRolls.count}/${db.ROLLS_MAX} rolls • ⚽ ${claims.count}/${db.CLAIMS_MAX} claims`,
    embeds: [embed],
    components: [row],
  };
  if (attachment) payload.files = [attachment];

  const msg = await message.channel.send(payload);

  const timeout = setTimeout(async () => {
    if (activeRolls.has(msg.id)) {
      activeRolls.delete(msg.id);
      const expRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`exp_${msg.id}`).setLabel('⏰ Expiré').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );
      await msg.edit({ components: [expRow] }).catch(() => {});
    }
  }, CLAIM_TIMEOUT_MS);

  activeRolls.set(msg.id, { player, claimedBy: null, timeout, rollerId: userId });
}

// ─── Bouton ───────────────────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const { customId, user, message } = interaction;

  if (customId.startsWith('claim_')) {
    const roll = activeRolls.get(message.id);
    if (!roll) return interaction.reply({ content: '⏰ Carte expirée !', ephemeral: true });
    if (roll.claimedBy) return interaction.reply({ content: `❌ Déjà récupérée par <@${roll.claimedBy}> !`, ephemeral: true });

    // Vérif claims
    const claims = db.getClaims(user.id);
    if (claims.count <= 0) {
      const m = Math.ceil((claims.nextWindowMs - Date.now()) / 60000);
      return interaction.reply({
        content: `🚫 Tu as déjà récupéré **${db.CLAIMS_MAX} cartes** cette heure. Recharge dans **${m} min**.`,
        ephemeral: true
      });
    }

    roll.claimedBy = user.id;
    clearTimeout(roll.timeout);
    activeRolls.delete(message.id);

    db.useClaim(user.id);
    db.addCard(user.id, roll.player);

    const newClaims = db.getClaims(user.id);
    const totalPts  = db.getScore(user.id);
    const luckyMsg  = roll.player.isLucky ? '\n🍀 **LUCKY PULL ×2 !**' : '';

    const claimedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('done').setLabel(`✅ Récupérée par ${user.username}`).setStyle(ButtonStyle.Secondary).setDisabled(true)
    );
    await message.edit({ components: [claimedRow] });

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(roll.player.isLucky ? '#FFD700' : '#00FF88')
        .setTitle(roll.player.isLucky ? '🍀 LUCKY PULL !' : '🎉 Carte récupérée !')
        .setDescription(
          `<@${user.id}> a récupéré **${roll.player.name}** !${luckyMsg}\n` +
          `💰 **+${roll.player.points} pts** → Total : **${totalPts} pts**\n` +
          `⚽ Il te reste **${newClaims.count}/${db.CLAIMS_MAX}** claim${newClaims.count > 1 ? 's' : ''} cette heure.`
        )
      ]
    });
  }
});

// ─── $rolls ───────────────────────────────────────────────────────────────────
async function handleRolls(message) {
  const userId    = message.author.id;
  const userRolls = db.getRolls(userId);
  const claims    = db.getClaims(userId);

  const nextMs   = userRolls.nextWindowMs - Date.now();
  const nextM    = Math.ceil(nextMs / 60000);
  const claimNextMs = claims.nextWindowMs - Date.now();
  const cm = Math.ceil(claimNextMs / 60000);

  const count    = userRolls.count || 0;
  const rollBar  = '█'.repeat(count) + '░'.repeat(db.ROLLS_MAX - count);
  const claimBar = '█'.repeat(claims.count) + '░'.repeat(db.CLAIMS_MAX - claims.count);

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('📊 Tes compteurs')
      .addFields(
        { name: `🎲 Rolls (${db.ROLLS_MAX} / heure)`, value: `\`${rollBar}\` **${count}/${db.ROLLS_MAX}**\n${count < db.ROLLS_MAX ? `Recharge dans **${nextM} min**` : '✅ Pleins !'}`, inline: false },
        { name: `⚽ Claims (${db.CLAIMS_MAX} / heure)`, value: `\`${claimBar}\` **${claims.count}/${db.CLAIMS_MAX}**\n${claims.count < db.CLAIMS_MAX ? `Recharge dans **${cm} min**` : '✅ Pleins !'}`, inline: false },
      )
      .setFooter({ text: '10 rolls et 2 claims par heure pleine — se rechargent en même temps' })
    ]
  });
}

// ─── $collection ──────────────────────────────────────────────────────────────
async function handleCollection(message, args) {
  let target = message.mentions.users.first() || message.author;
  const cards = db.getCollection(target.id);

  if (!cards.length) {
    return message.reply({
      embeds: [new EmbedBuilder().setColor('#888').setTitle(`📁 Collection de ${target.username}`)
        .setDescription('Aucune carte ! Utilise **$claim** pour en obtenir.')]
    });
  }

  cards.sort((a,b) => b.rating - a.rating);
  const PER_PAGE = 10;
  const pageArg = args.find(a => /^\d+$/.test(a));
  const page = Math.max(1, parseInt(pageArg) || 1);
  const totalPages = Math.ceil(cards.length / PER_PAGE);
  const pageCards = cards.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPts = db.getScore(target.id);

  const cardList = pageCards.map((c, i) => {
    const cfg = RARITY_CONFIG[c.rarity] || RARITY_CONFIG.BRONZE_COMMON;
    return `${(page-1)*PER_PAGE+i+1}. ${cfg.emoji} **${c.name}** ${c.gender} — ${c.position} — ${c.club}\n⭐ ${c.rating} | 💰 ${c.points} pts`;
  }).join('\n\n');

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#2980B9')
      .setTitle(`📁 Collection de ${target.username}`)
      .setDescription(cardList)
      .addFields({ name: '📊 Total', value: `${cards.length} cartes • **${totalPts} pts**`, inline: false })
      .setFooter({ text: `Page ${page}/${totalPages} • $col [page]` })
      .setThumbnail(target.displayAvatarURL())
    ]
  });
}

// ─── $card [n] ────────────────────────────────────────────────────────────────
async function handleViewCard(message, args) {
  const target = message.mentions.users.first() || message.author;
  const numArg = args.find(a => /^\d+$/.test(a));
  if (!numArg) return message.reply('Usage : `$card [numéro]`');

  const cards = db.getCollection(target.id).sort((a,b) => b.rating - a.rating);
  const idx = parseInt(numArg) - 1;
  if (idx < 0 || idx >= cards.length) return message.reply(`❌ Carte introuvable. Tu as ${cards.length} cartes.`);

  const card = cards[idx];
  let attachment = null;
  try {
    const imgBuf = await generateCardImage(card);
    attachment = new AttachmentBuilder(imgBuf, { name: 'card.png' });
  } catch(e) {}
  const embed = formatCardEmbed(card, target, true);
  if (attachment) embed.setImage('attachment://card.png');
  const payload = { embeds: [embed] };
  if (attachment) payload.files = [attachment];
  message.reply(payload);
}

// ─── $score ───────────────────────────────────────────────────────────────────
async function handleScore(message, args) {
  const target = message.mentions.users.first() || message.author;
  const score  = db.getScore(target.id);
  const cards  = db.getCollection(target.id);
  const best   = [...cards].sort((a,b) => b.rating - a.rating)[0];
  const cfg    = best ? RARITY_CONFIG[best.rarity] : null;

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`💰 Score de ${target.username}`)
      .addFields(
        { name: '🏆 Points totaux', value: `**${score.toLocaleString()} pts**`, inline: true },
        { name: '🃏 Cartes',        value: `**${cards.length}**`, inline: true },
        { name: '⭐ Meilleure carte', value: best ? `${cfg?.emoji} **${best.name}** (${best.rating} OVR • ${best.points} pts)` : 'Aucune', inline: false }
      )
      .setThumbnail(target.displayAvatarURL())
    ]
  });
}

// ─── $top ─────────────────────────────────────────────────────────────────────
async function handleLeaderboard(message, args) {
  const mode = args[1]?.toLowerCase();

  // $top best — top 50 des cartes les plus précieuses de toute la base du bot
  if (mode === 'best' || mode === 'meilleurs' || mode === 'meilleures') {
    const { PLAYERS, getCardLimit } = require('./players');

    // Calculer la valeur max possible pour chaque joueur unique
    const unique = [];
    const seen = new Set();
    for (const p of PLAYERS) {
      if (seen.has(p.name)) continue;
      seen.add(p.name);
      // Points max dans sa tranche (sans lucky)
      const ovr = p.rating;
      let maxPts;
      if      (ovr >= 95) maxPts = 1000;
      else if (ovr >= 90) maxPts = 500;
      else if (ovr >= 85) maxPts = 250;
      else if (ovr >= 80) maxPts = 100;
      else if (ovr >= 75) maxPts = 75;
      else if (ovr >= 70) maxPts = 50;
      else                maxPts = 10;
      unique.push({ ...p, maxPts });
    }

    unique.sort((a, b) => b.rating - a.rating || b.maxPts - a.maxPts);
    const top50 = unique.slice(0, 50);

    const pageArg   = args[2];
    const page      = Math.max(1, parseInt(pageArg) || 1);
    const PER_PAGE  = 10;
    const totalPages = Math.ceil(top50.length / PER_PAGE);
    const pageCards  = top50.slice((page-1)*PER_PAGE, page*PER_PAGE);

    // Récupérer la circulation pour savoir si la carte est dispo ou prise
    const fs = require('fs'), path = require('path');
    const dbPath = path.join(__dirname, 'data.json');
    let circulation = {};
    if (fs.existsSync(dbPath)) {
      const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      Object.values(raw.users || {}).forEach(u =>
        (u.collection || []).forEach(c => {
          circulation[c.name] = (circulation[c.name] || 0) + 1;
        })
      );
    }

    const lines = pageCards.map((p, i) => {
      const rank     = (page-1)*PER_PAGE + i + 1;
      const medal    = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
      const cfg      = RARITY_CONFIG[p.rarity] || {};
      const inCirc   = circulation[p.name] || 0;
      const limit    = getCardLimit(p.rating);
      const availStr = inCirc >= limit ? '🔴 Épuisée' : inCirc > 0 ? `🟡 ${inCirc}/${limit} claimées` : `🟢 Disponible (0/${limit})`;
      return `${medal} ${cfg.emoji} **${p.name}** ${p.gender} — ⭐${p.rating} — jusqu'à 💰**${p.maxPts} pts**\n　${p.position} • ${p.club} ${p.nation} • ${availStr}`;
    });

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('💎 Top 50 des Cartes les Plus Précieuses du Bot')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Page ${page}/${totalPages} • $top best [page] | 🟢 dispo • 🟡 partielle • 🔴 épuisée` })
      ]
    });
  }
  if (mode === 'cartes' || mode === 'cards') {
    const fs = require('fs'), path = require('path');
    const dbPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dbPath)) return message.reply('Aucune carte en circulation pour l\'instant !');

    const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const allCards = [];

    for (const [userId, userData] of Object.entries(raw.users || {})) {
      for (const card of (userData.collection || [])) {
        allCards.push({ ...card, ownerId: userId });
      }
    }

    if (!allCards.length) return message.reply('Aucune carte en circulation pour l\'instant !');

    // Trier par OVR puis par points
    allCards.sort((a, b) => b.rating - a.rating || b.points - a.points);
    const top50 = allCards.slice(0, 50);

    // Pagination — 10 par page
    const pageArg = args[2];
    const page    = Math.max(1, parseInt(pageArg) || 1);
    const PER_PAGE = 10;
    const totalPages = Math.ceil(top50.length / PER_PAGE);
    const pageCards  = top50.slice((page-1)*PER_PAGE, page*PER_PAGE);

    const lines = await Promise.all(pageCards.map(async (c, i) => {
      let username = `<@${c.ownerId}>`;
      try { const u = await client.users.fetch(c.ownerId); username = u.username; } catch {}
      const rank = (page-1)*PER_PAGE + i + 1;
      const cfg  = RARITY_CONFIG[c.rarity] || {};
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
      return `${medal} ${cfg.emoji} **${c.name}** ${c.gender} — ⭐${c.rating} — 💰${c.points} pts\n　👤 ${username} • ${c.position} • ${c.club}`;
    }));

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Top 50 des Meilleures Cartes')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Page ${page}/${totalPages} • $top cartes [page] | $top pour le classement joueurs` })
      ]
    });
  }

  // $top — classement joueurs par points (défaut)
  const byScore = args[1]?.toLowerCase() === 'score' || !mode || mode === 'pts';
  const top = db.getLeaderboard(!byScore);
  const medals = ['🥇','🥈','🥉'];

  const lines = await Promise.all(top.map(async (entry, i) => {
    let username = `<@${entry.userId}>`;
    try { const u = await client.users.fetch(entry.userId); username = u.username; } catch {}
    const medal = medals[i] || `**${i+1}.**`;
    return `${medal} **${username}** — **${entry.score.toLocaleString()} pts** | ${entry.count} cartes`;
  }));

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💰 Top Collecteurs (par points)')
      .setDescription(lines.join('\n') || 'Personne n\'a encore de cartes !')
      .setFooter({ text: '$top • $top cartes pour les meilleures cartes du serveur' })
    ]
  });
}

// ─── $stats ───────────────────────────────────────────────────────────────────
async function handleStats(message) {
  const { PLAYERS } = require('./players');
  const rc = {}, gc = {'♂️':0,'♀️':0};
  PLAYERS.forEach(p => { rc[p.rarity]=(rc[p.rarity]||0)+1; gc[p.gender]=(gc[p.gender]||0)+1; });

  const lines = Object.entries(RARITY_CONFIG).map(([key, cfg]) => {
    const count = rc[key] || 0;
    const pct = ((count/PLAYERS.length)*100).toFixed(1);
    return `${cfg.emoji} **${cfg.label}** — ${count} cartes (${pct}%) — ${cfg.stars}`;
  }).join('\n');

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#2980B9')
      .setTitle('📊 Stats de la base')
      .setDescription(`**${PLAYERS.length.toLocaleString()} cartes** • ♂️ ${gc['♂️'].toLocaleString()} hommes • ♀️ ${gc['♀️'].toLocaleString()} femmes`)
      .addFields({ name: '📦 Raretés', value: lines })
    ]
  });
}

// ─── $search ──────────────────────────────────────────────────────────────────
async function handleSearch(message, args) {
  if (args.length < 2) return message.reply('Usage: `$search Mbappé`');
  const query = args.slice(1).join(' ').toLowerCase();
  const { PLAYERS } = require('./players');
  const results = PLAYERS.filter(p => p.name.toLowerCase().includes(query)).slice(0, 8);
  if (!results.length) return message.reply(`❌ Aucun joueur trouvé pour "${args.slice(1).join(' ')}"`);

  const lines = results.map(p => {
    const cfg  = RARITY_CONFIG[p.rarity] || {};
    const circ = db.getCardCirculation(p.name, p.rating);
    const circStr = `${circ.current}/${circ.max} exemplaires`;
    return `${cfg.emoji} **${p.name}** ${p.gender} — ${p.position} — ${p.club} ${p.nation}\n⭐ ${p.rating} | 💰 ${getPointsRange(p.rating)} | 🃏 ${circStr}`;
  }).join('\n\n');

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#2980B9')
      .setTitle(`🔍 "${args.slice(1).join(' ')}"`)
      .setDescription(lines)
      .setFooter({ text: `${results.length} résultat(s)` })
    ]
  });
}

// ─── $view [nom] ──────────────────────────────────────────────────────────────
// Cherche un joueur et affiche combien valent ses cartes + qui les possède
async function handleView(message, args) {
  if (args.length < 2) return message.reply('Usage : `$view Messi`');

  const query = args.slice(1).join(' ').toLowerCase();
  const { PLAYERS } = require('./players');

  // Chercher dans la base de joueurs
  const matches = PLAYERS.filter(p => p.name.toLowerCase().includes(query)).slice(0, 5);
  if (!matches.length) return message.reply(`❌ Aucun joueur trouvé pour "${args.slice(1).join(' ')}"`);

  const lines = [];

  for (const p of matches) {
    const circ    = db.getCardCirculation(p.name, p.rating);
    const cfg     = RARITY_CONFIG[p.rarity] || {};

    // Calcul de la fourchette de points pour ce joueur
    const ovr = p.rating;
    let minPts, maxPts;
    if      (ovr >= 95) { minPts = 500;  maxPts = 1000; }
    else if (ovr >= 90) { minPts = 250;  maxPts = 500;  }
    else if (ovr >= 85) { minPts = 100;  maxPts = 250;  }
    else if (ovr >= 80) { minPts = 75;   maxPts = 100;  }
    else if (ovr >= 75) { minPts = 50;   maxPts = 75;   }
    else if (ovr >= 70) { minPts = 10;   maxPts = 50;   }
    else                { minPts = 1;    maxPts = 10;   }

    // Chercher qui possède cette carte
    const owners = [];
    const allUsers = Object.entries(require('./database').getLeaderboard ? {} : {});
    // On parcourt directement la DB
    const fs = require('fs'), path = require('path');
    const dbPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dbPath)) {
      const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      for (const [userId, userData] of Object.entries(raw.users || {})) {
        const cards = (userData.collection || []).filter(c => c.name === p.name);
        if (cards.length) {
          let username = `<@${userId}>`;
          try { const u = await client.users.fetch(userId); username = u.username; } catch {}
          cards.forEach(c => owners.push(`${username} (${c.points} pts)`));
        }
      }
    }

    const ownerStr = owners.length
      ? owners.join(', ')
      : `*Personne — ${circ.max - circ.current} exemplaire(s) disponible(s)*`;

    lines.push(
      `${cfg.emoji} **${p.name}** ${p.gender} • ${p.position} • ${p.club} ${p.nation}\n` +
      `⭐ OVR **${p.rating}** • 💰 **${minPts}–${maxPts} pts** • 🃏 ${circ.current}/${circ.max} claimées\n` +
      `👤 ${ownerStr}`
    );
  }

  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`🔍 Résultats pour "${args.slice(1).join(' ')}"`)
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: 'La valeur exacte varie légèrement selon la chance au moment du claim' })
    ]
  });
}

// ─── $help ────────────────────────────────────────────────────────────────────
async function handleHelp(message) {
  message.reply({
    embeds: [new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('⚽ Football Card Bot — Aide')
      .setDescription('Collecte des cartes parmi **15 270 joueurs** FC25 !')
      .addFields(
        { name: '🎲 `$claim` / `$c`',       value: '**10 rolls / heure** — roll une carte aléatoire', inline: false },
        { name: '⚽ Récupérer une carte',    value: 'Clique le bouton sous la carte — **max 2 par heure**', inline: false },
        { name: '📊 `$rolls`',               value: 'Voir tes rolls et claims restants', inline: false },
        { name: '📁 `$collection` / `$col`', value: 'Voir ta collection (ou `$col @user`)', inline: false },
        { name: '🃏 `$card [n]`',            value: 'Voir une carte en détail (ex: `$card 3`)', inline: false },
        { name: '💰 `$score`',               value: 'Ton score en points', inline: false },
        { name: '🏆 `$top`',                 value: 'Classement joueurs par points\n`$top cartes` → top 50 cartes en circulation\n`$top best` → top 50 cartes les plus précieuses du bot (🟢dispo / 🟡partielle / 🔴épuisée)', inline: false },
        { name: '👁️ `$view [nom]`',           value: 'Voir la valeur d\'une carte + qui la possède (ex: `$view Messi`)', inline: false },
        { name: '🔍 `$search [nom]`',         value: 'Chercher un joueur dans la base', inline: false },
        { name: '🎁 `$give @user [n°]`',             value: 'Donner une carte à quelqu\'un', inline: false },
        { name: '🔄 `$trade @user [ton n°] [son n°]`', value: 'Proposer un échange de cartes', inline: false },
        { name: '✅ `$accept` / ❌ `$decline`',         value: 'Accepter ou refuser un échange', inline: false },
      )
      .addFields({ name: '💰 Points par OVR', value:
        '⬜ ICON (92-99) → **500–1000 pts** • 1 exemplaire au monde\n' +
        '🔷 TOTY (94-97) → **500–1000 pts** • ultra rare\n' +
        '🟨 GOLD ELITE (90-91) → **250–500 pts**\n' +
        '🟧 GOLD (85-89) → **100–250 pts**\n' +
        '🔵 SILVER RARE (80-84) → **75–100 pts**\n' +
        '🟦 SILVER (75-79) → **50–75 pts**\n' +
        '🟫 BRONZE RARE (70-74) → **10–50 pts**\n' +
        '⬛ BRONZE (<70) → **1–10 pts**'
      })
      .setFooter({ text: '🍀 3% de chance de Lucky Pull ×2 !' })
    ]
  });
}

// ─── $give @user [numéro de carte] ───────────────────────────────────────────
async function handleGive(message, args) {
  const target = message.mentions.users.first();
  const numArg = args.find(a => /^\d+$/.test(a));

  if (!target) return message.reply('Usage : `$give @utilisateur [numéro de carte]`');
  if (target.id === message.author.id) return message.reply('❌ Tu peux pas te donner une carte à toi-même !');
  if (target.bot) return message.reply('❌ Les bots ne collectionnent pas les cartes !');
  if (!numArg) return message.reply('Usage : `$give @utilisateur [numéro de carte]`\nTrouve le numéro avec `$collection`');

  const cards = db.getCollection(message.author.id).sort((a,b) => b.rating - a.rating);
  const idx = parseInt(numArg) - 1;
  if (idx < 0 || idx >= cards.length) return message.reply(`❌ Carte introuvable. Tu as ${cards.length} cartes.`);

  const card = cards[idx];
  const cfg  = RARITY_CONFIG[card.rarity] || {};

  // Confirmation
  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`give_yes_${message.id}`).setLabel('✅ Confirmer').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`give_no_${message.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Danger),
  );

  const confirmMsg = await message.reply({
    embeds: [new EmbedBuilder()
      .setColor(cfg.color || '#888')
      .setTitle('📦 Confirmer le don ?')
      .setDescription(`Tu vas donner **${card.name}** ${card.gender} à <@${target.id}>\n${cfg.emoji} ${card.rarity} • ⭐ ${card.rating} • 💰 ${card.points} pts\n\n⚠️ Cette action est irréversible !`)
    ],
    components: [confirmRow],
  });

  // Attendre la confirmation (30s)
  const filter = i => i.user.id === message.author.id && i.customId.startsWith(`give_`);
  try {
    const interaction = await confirmMsg.awaitMessageComponent({ filter, time: 30000 });
    if (interaction.customId === `give_yes_${message.id}`) {
      const result = db.giveCard(message.author.id, target.id, card.cardId);
      if (!result.ok) return interaction.update({ content: `❌ ${result.reason}`, embeds: [], components: [] });
      await interaction.update({
        embeds: [new EmbedBuilder()
          .setColor('#00FF88')
          .setTitle('🎁 Don effectué !')
          .setDescription(`<@${message.author.id}> a donné **${card.name}** ${card.gender} à <@${target.id}> !\n${cfg.emoji} ${card.rarity} • ⭐ ${card.rating} • 💰 ${card.points} pts`)
        ],
        components: [],
      });
    } else {
      await interaction.update({ content: '❌ Don annulé.', embeds: [], components: [] });
    }
  } catch {
    await confirmMsg.edit({ content: '⏰ Temps écoulé, don annulé.', embeds: [], components: [] });
  }
}

// ─── Trades en attente ────────────────────────────────────────────────────────
const pendingTrades = new Map(); // targetId → { fromId, fromCard, toCardIdx, expiresAt, msgId }

// ─── $trade @user [ma carte n°] [sa carte n°] ────────────────────────────────
async function handleTrade(message, args) {
  const target  = message.mentions.users.first();
  const numbers = args.filter(a => /^\d+$/.test(a));

  if (!target) return message.reply('Usage : `$trade @utilisateur [n° ta carte] [n° sa carte]`');
  if (target.id === message.author.id) return message.reply('❌ Tu peux pas trader avec toi-même !');
  if (target.bot) return message.reply('❌ Les bots ne tradent pas !');
  if (numbers.length < 2) return message.reply('Usage : `$trade @utilisateur [n° ta carte] [n° sa carte]`\nExemple : `$trade @Bob 3 7`');

  const myCards   = db.getCollection(message.author.id).sort((a,b) => b.rating - a.rating);
  const theirCards= db.getCollection(target.id).sort((a,b) => b.rating - a.rating);

  const myIdx    = parseInt(numbers[0]) - 1;
  const theirIdx = parseInt(numbers[1]) - 1;

  if (myIdx < 0 || myIdx >= myCards.length)       return message.reply(`❌ Ta carte n°${numbers[0]} est introuvable.`);
  if (theirIdx < 0 || theirIdx >= theirCards.length) return message.reply(`❌ La carte n°${numbers[1]} de <@${target.id}> est introuvable.`);

  const myCard    = myCards[myIdx];
  const theirCard = theirCards[theirIdx];
  const myCfg     = RARITY_CONFIG[myCard.rarity]    || {};
  const theirCfg  = RARITY_CONFIG[theirCard.rarity] || {};

  // Annuler un trade existant de cet user
  if (pendingTrades.has(target.id)) pendingTrades.delete(target.id);

  pendingTrades.set(target.id, {
    fromId:      message.author.id,
    fromCardId:  myCard.cardId,
    toCardId:    theirCard.cardId,
    expiresAt:   Date.now() + 120000, // 2 minutes
  });

  const tradeMsg = await message.channel.send({
    content: `<@${target.id}> — tu as une proposition d'échange !`,
    embeds: [new EmbedBuilder()
      .setColor('#FF8C00')
      .setTitle('🔄 Proposition d\'échange')
      .setDescription(`<@${message.author.id}> veut échanger avec toi !`)
      .addFields(
        { name: `📤 Il/Elle te donne`, value: `${myCfg.emoji} **${myCard.name}** ${myCard.gender}\n${myCard.position} • ⭐ ${myCard.rating} • 💰 ${myCard.points} pts`, inline: true },
        { name: `📥 Il/Elle veut`,     value: `${theirCfg.emoji} **${theirCard.name}** ${theirCard.gender}\n${theirCard.position} • ⭐ ${theirCard.rating} • 💰 ${theirCard.points} pts`, inline: true },
      )
      .setFooter({ text: 'Réponds avec $accept ou $decline dans les 2 minutes' })
    ],
  });

  // Auto-expiration
  setTimeout(async () => {
    if (pendingTrades.get(target.id)?.fromId === message.author.id) {
      pendingTrades.delete(target.id);
      await tradeMsg.edit({ content: '⏰ Proposition d\'échange expirée.', embeds: [], components: [] }).catch(() => {});
    }
  }, 120000);
}

// ─── $accept ─────────────────────────────────────────────────────────────────
async function handleAccept(message) {
  const trade = pendingTrades.get(message.author.id);
  if (!trade) return message.reply('❌ Tu n\'as aucune proposition d\'échange en attente.');
  if (Date.now() > trade.expiresAt) {
    pendingTrades.delete(message.author.id);
    return message.reply('⏰ La proposition a expiré.');
  }

  pendingTrades.delete(message.author.id);
  const result = db.tradeCards(trade.fromId, trade.fromCardId, message.author.id, trade.toCardId);
  if (!result.ok) return message.reply(`❌ ${result.reason}`);

  const fromCfg = RARITY_CONFIG[result.fromCard.rarity] || {};
  const toCfg   = RARITY_CONFIG[result.toCard.rarity]   || {};

  message.channel.send({
    embeds: [new EmbedBuilder()
      .setColor('#00FF88')
      .setTitle('🔄 Échange effectué !')
      .addFields(
        { name: `<@${trade.fromId}> reçoit`,       value: `${toCfg.emoji} **${result.toCard.name}** ${result.toCard.gender} • ⭐ ${result.toCard.rating} • 💰 ${result.toCard.points} pts`,     inline: true },
        { name: `<@${message.author.id}> reçoit`,  value: `${fromCfg.emoji} **${result.fromCard.name}** ${result.fromCard.gender} • ⭐ ${result.fromCard.rating} • 💰 ${result.fromCard.points} pts`, inline: true },
      )
    ],
  });
}

// ─── $decline ────────────────────────────────────────────────────────────────
async function handleDecline(message) {
  const trade = pendingTrades.get(message.author.id);
  if (!trade) return message.reply('❌ Tu n\'as aucune proposition d\'échange en attente.');
  pendingTrades.delete(message.author.id);
  message.reply(`❌ Échange refusé. <@${trade.fromId}> a été notifié.`);
  message.channel.send(`<@${trade.fromId}> — <@${message.author.id}> a refusé ton échange.`);
}

client.login(process.env.DISCORD_TOKEN);
