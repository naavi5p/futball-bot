# ⚽ Football Card Bot — Discord

Un bot Discord de collection de cartes de joueurs de foot style FIFA !

## 🎮 Commandes

| Commande | Description |
|---|---|
| `$claim` / `$c` | Roll une carte aléatoire (10 rolls / 15 min) |
| `$collection` / `$col` | Voir ta collection |
| `$col @user` | Voir la collection d'un autre joueur |
| `$col [page]` | Naviguer dans ta collection |
| `$card [n]` | Voir le détail d'une carte (ex: `$card 3`) |
| `$rolls` / `$r` | Voir tes rolls restants et la recharge |
| `$top` | Classement des collecteurs |
| `$help` / `$h` | Afficher l'aide |

## ✨ Raretés

| Rareté | Note | Probabilité | Couleur |
|---|---|---|---|
| 🟧 ICON | 98+ | 1% | Orange |
| 🟨 TOTY | 95-97 | 4% | Or |
| 🟥 TOTW | 90-94 | 15% | Rouge |
| 🟦 RARE | 82-89 | 35% | Bleu |
| ⬛ NORMAL | <82 | 45% | Gris |

## 🚀 Installation

### 1. Prérequis
- Node.js 18+ installé
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Créer le bot Discord

1. Va sur https://discord.com/developers/applications
2. Clique **New Application** → donne un nom
3. Va dans **Bot** → clique **Add Bot**
4. Sous **Token** → clique **Reset Token** et copie le token
5. Active les **Privileged Gateway Intents** :
   - ✅ Message Content Intent
6. Va dans **OAuth2 > URL Generator** :
   - Scopes : `bot`
   - Permissions : `Send Messages`, `Read Messages/View Channels`, `Embed Links`, `Use External Emojis`
7. Copie l'URL générée et invite le bot sur ton serveur

### 3. Lancer le bot

```bash
# Cloner / extraire le dossier
cd discord-football-bot

# Installer les dépendances
npm install

# Lancer avec le token
DISCORD_TOKEN=ton_token_ici node index.js

# Ou sur Windows (PowerShell)
$env:DISCORD_TOKEN="ton_token_ici"; node index.js
```

### 4. Avec un fichier .env (recommandé)

Crée un fichier `.env` :
```
DISCORD_TOKEN=ton_token_ici
```

Installe dotenv :
```bash
npm install dotenv
```

Ajoute en première ligne de `index.js` :
```js
require('dotenv').config();
```

## 📁 Structure

```
discord-football-bot/
├── index.js        # Bot principal + commandes
├── players.js      # Base de données des joueurs + système de rareté
├── database.js     # Sauvegarde JSON (rolls, collections)
├── cardEmbed.js    # Formatage des cartes Discord
├── data.json       # Données sauvegardées (créé automatiquement)
└── README.md
```

## ➕ Ajouter des joueurs

Dans `players.js`, ajoute un objet dans le tableau `PLAYERS` :

```js
{
  name: 'Nom du joueur',
  club: 'Club',
  nation: '🇫🇷',        // emoji drapeau
  position: 'ST',        // GK, CB, LB, RB, CDM, CM, CAM, LW, RW, CF, ST
  rating: 88,            // note globale
  pace: 85,
  shooting: 82,
  passing: 78,
  dribbling: 86,
  defending: 40,
  physical: 76,
  rarity: 'RARE',        // ICON, TOTY, TOTW, RARE, NORMAL
  image: '',             // URL image optionnelle
}
```

## 🔧 Personnalisation

Dans `index.js` :
- `ROLLS_MAX` : nombre de rolls max (défaut: 10)
- `ROLLS_COOLDOWN_MS` : durée de recharge en ms (défaut: 15 min)
- `CLAIM_TIMEOUT_MS` : durée pour claim une carte (défaut: 1 min)
- `PREFIX` : préfixe des commandes (défaut: `$`)
