const { EmbedBuilder } = require('discord.js');
const { getPlayerImage } = require('./images');

const RARITY_CONFIG = {
  // ── Raretés spéciales ──────────────────────────────────────────
  TOTY:            { color: '#1a3aaa', emoji: '🔷', label: 'TOTY',         stars: '✨✨✨✨✨✨' },
  ICON:            { color: '#e8e8ff', emoji: '⬜', label: 'ICON',         stars: '✨✨✨✨✨✨' },
  // ── Raretés standard ───────────────────────────────────────────
  GOLD_ELITE:      { color: '#FFD700', emoji: '🟨', label: 'GOLD ELITE',   stars: '⭐⭐⭐⭐⭐' },
  GOLD_UNCOMMON:   { color: '#FF8C00', emoji: '🟧', label: 'GOLD',         stars: '⭐⭐⭐⭐'  },
  SILVER_RARE:     { color: '#4FC3F7', emoji: '🔵', label: 'SILVER RARE',  stars: '⭐⭐⭐½'  },
  SILVER_UNCOMMON: { color: '#2980B9', emoji: '🟦', label: 'SILVER',       stars: '⭐⭐⭐'   },
  SILVER_COMMON:   { color: '#95A5A6', emoji: '🔘', label: 'SILVER',       stars: '⭐⭐½'   },
  BRONZE_RARE:     { color: '#A0522D', emoji: '🟫', label: 'BRONZE RARE',  stars: '⭐⭐'    },
  BRONZE_UNCOMMON: { color: '#7B4D2A', emoji: '🪵', label: 'BRONZE',       stars: '⭐½'    },
  BRONZE_COMMON:   { color: '#555555', emoji: '⬛', label: 'BRONZE',       stars: '⭐'     },
};

function statLine(label, value) {
  const filled = Math.round(value / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return `\`${bar}\` **${value}** ${label}`;
}

function formatCardEmbed(player, user, detailed = false) {
  const cfg = RARITY_CONFIG[player.rarity] || RARITY_CONFIG.BRONZE_COMMON;
  const img = getPlayerImage(player.name);
  const luckyStr = player.isLucky ? '\n🍀 **LUCKY PULL ×2 !**' : '';

  const embed = new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(`${cfg.emoji} ${player.name} ${player.gender || ''}`)
    .setDescription(
      `${player.nation} **${player.club}**\n` +
      `🏷️ **${player.position}** • ${cfg.label} ${cfg.stars}\n` +
      `💰 **${player.points} pts**${luckyStr}`
    )
    .addFields(
      {
        name: `⭐ OVR ${player.rating}`,
        value: [
          statLine('PAC', player.pace),
          statLine('SHO', player.shooting),
          statLine('PAS', player.passing),
        ].join('\n'),
        inline: true,
      },
      {
        name: '\u200B',
        value: [
          statLine('DRI', player.dribbling),
          statLine('DEF', player.defending),
          statLine('PHY', player.physical),
        ].join('\n'),
        inline: true,
      }
    );

  if (img) embed.setThumbnail(img);

  if (detailed && player.obtainedAt) {
    embed.setFooter({
      text: `Carte de ${user.username} • Obtenue le ${new Date(player.obtainedAt).toLocaleDateString('fr-FR')}`,
      iconURL: user.displayAvatarURL(),
    });
  } else {
    embed.setFooter({
      text: `⏱️ 1 min pour récupérer • ${img ? '📸 Photo dispo' : '🎮 EA FC 25'}`,
      iconURL: user.displayAvatarURL(),
    });
  }

  return embed;
}

module.exports = { formatCardEmbed, RARITY_CONFIG };
