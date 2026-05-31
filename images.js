// ═══════════════════════════════════════════════════════════════════
// MAP D'IMAGES — URLs Wikimedia Commons (licence libre CC-BY-SA)
// Couvre les ~200 joueurs les plus connus (GOLD + top SILVER)
// Pour les autres : pas d'image (comme Mudae pour les persos rares)
// ═══════════════════════════════════════════════════════════════════

// Format: 'Nom exact du joueur dans players.js' : 'URL image'
// Toutes les URLs pointent vers upload.wikimedia.org (domaine public)

const PLAYER_IMAGES = {
  // ── GOLD ELITE ──────────────────────────────────────────────────
  'Kylian Mbappé':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Kylian_Mbapp%C3%A9_2018.jpg/400px-Kylian_Mbapp%C3%A9_2018.jpg',
  'Rodri':               'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Rodri_-_Manchester_City_vs_Arsenal%2C_25_April_2023.jpg/400px-Rodri_-_Manchester_City_vs_Arsenal%2C_25_April_2023.jpg',
  'Erling Haaland':      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Erling_Haaland%2C_2023_%28cropped%29.jpg/400px-Erling_Haaland%2C_2023_%28cropped%29.jpg',
  'Aitana Bonmatí':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Aitana_Bonmat%C3%AD_2023_%28cropped%29.jpg/400px-Aitana_Bonmat%C3%AD_2023_%28cropped%29.jpg',

  // ── GOLD RARE ────────────────────────────────────────────────────
  'Jude Bellingham':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Jude_Bellingham%2C_2021_%28cropped%29.jpg/400px-Jude_Bellingham%2C_2021_%28cropped%29.jpg',
  'Vini Jr.':            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Vin%C3%ADcius_J%C3%BAnior_2023.jpg/400px-Vin%C3%ADcius_J%C3%BAnior_2023.jpg',
  'Kevin De Bruyne':     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Kevin_De_Bruyne_2022_%28cropped%29.jpg/400px-Kevin_De_Bruyne_2022_%28cropped%29.jpg',
  'Harry Kane':          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Harry_Kane%2C_Euro_2020_%28cropped%29.jpg/400px-Harry_Kane%2C_Euro_2020_%28cropped%29.jpg',
  'Alexia Putellas':     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Alexia_Putellas_2023.jpg/400px-Alexia_Putellas_2023.jpg',
  'Caroline Graham Hansen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Caroline_Graham_Hansen_%28cropped%29.jpg/400px-Caroline_Graham_Hansen_%28cropped%29.jpg',
  'Sam Kerr':            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Sam_Kerr_2023_%28cropped%29.jpg/400px-Sam_Kerr_2023_%28cropped%29.jpg',
  'Martin Ødegaard':     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Martin_%C3%98degaard_2022_%28cropped%29.jpg/400px-Martin_%C3%98degaard_2022_%28cropped%29.jpg',
  'Lautaro Martínez':    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Lautaro_Mart%C3%ADnez_2022_%28cropped%29.jpg/400px-Lautaro_Mart%C3%ADnez_2022_%28cropped%29.jpg',
  'Virgil van Dijk':     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Virgil_van_Dijk_2022_%28cropped%29.jpg/400px-Virgil_van_Dijk_2022_%28cropped%29.jpg',
  'Mohamed Salah':       'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Mohamed_Salah_2022_%28cropped%29.jpg/400px-Mohamed_Salah_2022_%28cropped%29.jpg',
  'Lionel Messi':        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/400px-Lionel_Messi_20180626.jpg',
  'Phil Foden':          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Phil_Foden_2022_%28cropped%29.jpg/400px-Phil_Foden_2022_%28cropped%29.jpg',
  'Antoine Griezmann':   'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Antoine_Griezmann_2022_%28cropped%29.jpg/400px-Antoine_Griezmann_2022_%28cropped%29.jpg',
  'Rubén Días':          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Rub%C3%A9n_Dias_2022.jpg/400px-Rub%C3%A9n_Dias_2022.jpg',
  'Robert Lewandowski':  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Robert_Lewandowski%2C_FC_Bayern_M%C3%BCnchen_%28by_Sven_Mandel%2C_2019-11-09%29_02_%28cropped%29.jpg/400px-Robert_Lewandowski%2C_FC_Bayern_M%C3%BCnchen_%28by_Sven_Mandel%2C_2019-11-09%29_02_%28cropped%29.jpg',
  'Federico Valverde':   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Federico_Valverde_2022_%28cropped%29.jpg/400px-Federico_Valverde_2022_%28cropped%29.jpg',
  'Bernardo Silva':      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bernardo_Silva_2022_%28cropped%29.jpg/400px-Bernardo_Silva_2022_%28cropped%29.jpg',
  'Florian Wirtz':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Florian_Wirtz_2023_%28cropped%29.jpg/400px-Florian_Wirtz_2023_%28cropped%29.jpg',
  'António Rüdiger':     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Antonio_R%C3%BCdiger_2022_%28cropped%29.jpg/400px-Antonio_R%C3%BCdiger_2022_%28cropped%29.jpg',
  'Ada Hegerberg':       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Ada_Hegerberg_2022_%28cropped%29.jpg/400px-Ada_Hegerberg_2022_%28cropped%29.jpg',
  'Sophia Smith':        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sophia_Smith_%28cropped%29.jpg/400px-Sophia_Smith_%28cropped%29.jpg',
  'Mapi León':           'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mapi_Le%C3%B3n_2022_%28cropped%29.jpg/400px-Mapi_Le%C3%B3n_2022_%28cropped%29.jpg',
  'Marie Katoto':        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Marie-Antoinette_Katoto_%28cropped%29.jpg/400px-Marie-Antoinette_Katoto_%28cropped%29.jpg',
  'Debinha':             'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Debinha_2023_%28cropped%29.jpg/400px-Debinha_2023_%28cropped%29.jpg',
  'Kadidiatou Diani':    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Kadidiatou_Diani_%28cropped%29.jpg/400px-Kadidiatou_Diani_%28cropped%29.jpg',

  // ── GOLD UNCOMMON ────────────────────────────────────────────────
  'William Saliba':      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/William_Saliba_2023_%28cropped%29.jpg/400px-William_Saliba_2023_%28cropped%29.jpg',
  'Victor Osimhen':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Victor_Osimhen_2023_%28cropped%29.jpg/400px-Victor_Osimhen_2023_%28cropped%29.jpg',
  'Jamal Musiala':       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jamal_Musiala_2023_%28cropped%29.jpg/400px-Jamal_Musiala_2023_%28cropped%29.jpg',
  'Bukayo Saka':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bukayo_Saka_2023_%28cropped%29.jpg/400px-Bukayo_Saka_2023_%28cropped%29.jpg',
  'Paulo Dybala':        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Paulo_Dybala_2022_%28cropped%29.jpg/400px-Paulo_Dybala_2022_%28cropped%29.jpg',
  'Théo Hernández':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Theo_Hernandez_2021_%28cropped%29.jpg/400px-Theo_Hernandez_2021_%28cropped%29.jpg',
  'Neymar Jr':           'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Neymar_2022_%28cropped%29.jpg/400px-Neymar_2022_%28cropped%29.jpg',
  'Declan Rice':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Declan_Rice_2023_%28cropped%29.jpg/400px-Declan_Rice_2023_%28cropped%29.jpg',
  'Frenkie de Jong':     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Frenkie_de_Jong_2023_%28cropped%29.jpg/400px-Frenkie_de_Jong_2023_%28cropped%29.jpg',
  'Bruno Fernandes':     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Bruno_Fernandes_2023_%28cropped%29.jpg/400px-Bruno_Fernandes_2023_%28cropped%29.jpg',
  'Heung-min Son':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Son_Heung-min_2019_%28cropped%29.jpg/400px-Son_Heung-min_2019_%28cropped%29.jpg',
  'Marquinhos':          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Marquinhos_2022_%28cropped%29.jpg/400px-Marquinhos_2022_%28cropped%29.jpg',
  'Nicolo Barella':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Nicolò_Barella_2022_%28cropped%29.jpg/400px-Nicol%C3%B2_Barella_2022_%28cropped%29.jpg',
  'Ilkay Gündogan':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ilkay_Gundogan_%28cropped%29.jpg/400px-Ilkay_Gundogan_%28cropped%29.jpg',
  'Cristiano Ronaldo':   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/400px-Cristiano_Ronaldo_2018.jpg',
  'Rodrygo':             'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Rodrygo_2023_%28cropped%29.jpg/400px-Rodrygo_2023_%28cropped%29.jpg',
  'Rafael Leão':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rafael_Le%C3%A3o_2023_%28cropped%29.jpg/400px-Rafael_Le%C3%A3o_2023_%28cropped%29.jpg',
  'Alejandro Grimaldo':  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Alejandro_Grimaldo_2023_%28cropped%29.jpg/400px-Alejandro_Grimaldo_2023_%28cropped%29.jpg',
  'Luka Modrić':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Luka_Modri%C4%87_2019_%28cropped%29.jpg/400px-Luka_Modri%C4%87_2019_%28cropped%29.jpg',
  'Ousmane Dembélé':     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ousmane_Demb%C3%A9l%C3%A9_2022_%28cropped%29.jpg/400px-Ousmane_Demb%C3%A9l%C3%A9_2022_%28cropped%29.jpg',
  'Pedri':               'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pedri_2022_%28cropped%29.jpg/400px-Pedri_2022_%28cropped%29.jpg',
  'Karim Benzema':       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Karim_Benzema_2018.jpg/400px-Karim_Benzema_2018.jpg',
  'Joshua Kimmich':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Joshua_Kimmich_2022_%28cropped%29.jpg/400px-Joshua_Kimmich_2022_%28cropped%29.jpg',
  'Cole Palmer':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Cole_Palmer_2023_%28cropped%29.jpg/400px-Cole_Palmer_2023_%28cropped%29.jpg',
  'Lamine Yamal':        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Lamine_Yamal_%28cropped%29.jpg/400px-Lamine_Yamal_%28cropped%29.jpg',
  'Khvicha Kvaratskhelia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Khvicha_Kvaratskhelia_2023_%28cropped%29.jpg/400px-Khvicha_Kvaratskhelia_2023_%28cropped%29.jpg',
  'Nico Williams':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nico_Williams_2024_%28cropped%29.jpg/400px-Nico_Williams_2024_%28cropped%29.jpg',
  'Xavi Simons':         'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Xavi_Simons_2023_%28cropped%29.jpg/400px-Xavi_Simons_2023_%28cropped%29.jpg',
  'Keira Walsh':         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Keira_Walsh_2023_%28cropped%29.jpg/400px-Keira_Walsh_2023_%28cropped%29.jpg',
  'Vivianne Miedema':    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Vivianne_Miedema_2023_%28cropped%29.jpg/400px-Vivianne_Miedema_2023_%28cropped%29.jpg',
  'Lena Oberdorf':       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lena_Oberdorf_2023_%28cropped%29.jpg/400px-Lena_Oberdorf_2023_%28cropped%29.jpg',
  'Alexandra Popp':      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Alexandra_Popp_2022_%28cropped%29.jpg/400px-Alexandra_Popp_2022_%28cropped%29.jpg',
  'Mallory Swanson':     'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Mallory_Swanson_2023_%28cropped%29.jpg/400px-Mallory_Swanson_2023_%28cropped%29.jpg',
  'Lauren James':        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Lauren_James_2023_%28cropped%29.jpg/400px-Lauren_James_2023_%28cropped%29.jpg',
  'Lauren Hemp':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Lauren_Hemp_2023_%28cropped%29.jpg/400px-Lauren_Hemp_2023_%28cropped%29.jpg',
  'Lea Schüller':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Lea_Sch%C3%BCller_2023_%28cropped%29.jpg/400px-Lea_Sch%C3%BCller_2023_%28cropped%29.jpg',

  // ── SILVER RARE ──────────────────────────────────────────────────
  'Gavi':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gavi_2022_%28cropped%29.jpg/400px-Gavi_2022_%28cropped%29.jpg',
  'Dominik Szoboszlai':  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Dominik_Szoboszlai_2023_%28cropped%29.jpg/400px-Dominik_Szoboszlai_2023_%28cropped%29.jpg',
  'Kai Havertz':         'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Kai_Havertz_2023_%28cropped%29.jpg/400px-Kai_Havertz_2023_%28cropped%29.jpg',
  'Jonathan David':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Jonathan_David_2023_%28cropped%29.jpg/400px-Jonathan_David_2023_%28cropped%29.jpg',
  'Luis Díaz':           'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Luis_D%C3%ADaz_2023_%28cropped%29.jpg/400px-Luis_D%C3%ADaz_2023_%28cropped%29.jpg',
  'Michael Olise':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Michael_Olise_2023_%28cropped%29.jpg/400px-Michael_Olise_2023_%28cropped%29.jpg',
  'Rasmus Højlund':      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Rasmus_H%C3%B8jlund_2023_%28cropped%29.jpg/400px-Rasmus_H%C3%B8jlund_2023_%28cropped%29.jpg',
  'Marcus Rashford':     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Marcus_Rashford_2022_%28cropped%29.jpg/400px-Marcus_Rashford_2022_%28cropped%29.jpg',
  'Kaoru Mitoma':        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Kaoru_Mitoma_2023_%28cropped%29.jpg/400px-Kaoru_Mitoma_2023_%28cropped%29.jpg',

  // ── ICONS ────────────────────────────────────────────────────────
  'Ronaldo R9':          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Ronaldo_Fenomeno_2011_%28cropped%29.jpg/400px-Ronaldo_Fenomeno_2011_%28cropped%29.jpg',
  'Pelé':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Edson_Arantes_do_Nascimento_-_Pel%C3%A9_crop.jpg/400px-Edson_Arantes_do_Nascimento_-_Pel%C3%A9_crop.jpg',
  'Maradona':            'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_vs_Inglaterra_2.jpg/400px-Maradona-Mundial_86_vs_Inglaterra_2.jpg',
  'Zidane':              'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg/400px-Zinedine_Zidane_by_Tasnim_03.jpg',
  'Ronaldinho':          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ronaldinho_2018.jpg/400px-Ronaldinho_2018.jpg',
  'Thierry Henry':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Thierry_Henry_2012.jpg/400px-Thierry_Henry_2012.jpg',
  'Johan Cruyff':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Johan_Cruyff_1974_%28cropped%29.jpg/400px-Johan_Cruyff_1974_%28cropped%29.jpg',
  'Marta':               'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Marta_Vieira_da_Silva_%28cropped%29.jpg/400px-Marta_Vieira_da_Silva_%28cropped%29.jpg',
  'Mia Hamm':            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mia_Hamm_2012_%28cropped%29.jpg/400px-Mia_Hamm_2012_%28cropped%29.jpg',
};

/**
 * Retourne l'URL d'image d'un joueur, ou null si pas disponible.
 * Le bot Discord (tournant chez l'utilisateur) peut accéder à ces URLs,
 * même si l'environnement de build ne peut pas les télécharger.
 */
function getPlayerImage(playerName) {
  return PLAYER_IMAGES[playerName] || null;
}

module.exports = { getPlayerImage, PLAYER_IMAGES };
