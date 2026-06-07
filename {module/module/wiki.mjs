/**
 * Wiki Tranchons & Traquons
 * ApplicationV2 — s'ouvre au démarrage + bouton barre de contrôle
 */
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class TnTWiki extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id:       "tnt-wiki",
    classes:  ["tnt", "tnt-wiki"],
    position: { width: 960, height: 740 },
    window:   { resizable: true, title: "📖 Tranchons & Traquons — Wiki" },
    actions: {
      navClick: TnTWiki.#onNavClick
    }
  };

  static PARTS = {
    main: { template: "systems/tranchons-et-traquons/templates/wiki/wiki.hbs" }
  };

  constructor(options = {}) {
    super(options);
    this._section = "accueil";
  }

  /** Singleton */
  static _instance = null;
  static open() {
    if (!TnTWiki._instance) TnTWiki._instance = new TnTWiki();
    TnTWiki._instance.render(true);
  }

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    ctx.section  = this._section;
    ctx.sections = TnTWiki.SECTIONS;
    ctx.data     = TnTWiki.CONTENT[this._section] ?? {};
    ctx.config   = CONFIG.TnT ?? {};
    return ctx;
  }

  _onRender(context, options) {
    // Activer l'entrée de nav courante
    this.element.querySelectorAll(".wiki-nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.section === this._section);
    });
  }

  static async #onNavClick(ev, target) {
    this._section = target.dataset.section;
    await this.render();
  }

  /* ─────────────────────────────────────────────────
     STRUCTURE DE NAVIGATION
  ───────────────────────────────────────────────── */
  static SECTIONS = [
    { id: "accueil",    label: "🏠 Accueil"          },
    { id: "des",        label: "🎲 Les dés"           },
    { id: "traits",     label: "⚔ Traits"             },
    { id: "combat",     label: "🗡 Combat"             },
    { id: "armure",     label: "🛡 Armure"             },
    { id: "avantages",  label: "⭐ Avantages"          },
    { id: "faiblesses", label: "💀 Faiblesses"         },
    { id: "peuples",    label: "🧬 Peuples"            },
    { id: "classes",    label: "🎭 Classes"            },
    { id: "dons",       label: "✨ Dons"               },
    { id: "monstres",   label: "👹 Monstres"           },
    { id: "experience", label: "🏆 Expérience"         },
    { id: "guide_fiche",label: "📋 Guide de la fiche"  },
    { id: "guide_mj",   label: "🎮 Guide du MJ"        },
  ];

  /* ─────────────────────────────────────────────────
     CONTENU DU WIKI
  ───────────────────────────────────────────────── */
  static CONTENT = {

    accueil: {
      titre: "Tranchons & Traquons",
      intro: "Bienvenue dans le monde médiéval-fantastique de T&T. Des règles bancales, des personnages stéréotypés, de l'or et du sang. Rien que vous, votre claymore et 2D6.",
      blocs: [
        { icone: "🎲", titre: "Le principe", texte: "Lancez 2D6, ajoutez votre trait. Si le total est ≥ 8, c'est un succès. Simple." },
        { icone: "⚔", titre: "Votre aventurier", texte: "6 traits, 1 classe, 1 peuple, des avantages, des faiblesses. Et un réflexe qui vous distingue du commun des mortels." },
        { icone: "📖", titre: "Ce wiki", texte: "Retrouvez ici toutes les règles de référence. Utilisez la navigation à gauche." },
      ]
    },

    des: {
      titre: "Lancer les dés",
      regles: [
        { label: "Formule de base", texte: "2D6 + Trait concerné ≥ 8 = Succès" },
        { label: "Seuil", texte: "Toujours 8. Les modificateurs s'appliquent au jet, pas au seuil." },
        { label: "Double 6 ⭐", texte: "Succès critique ! En combat : dégâts × 2. Hors combat : gain d'un avantage niveau 1." },
        { label: "Double 1 ☠", texte: "Échec critique ! En combat : dégâts reçus × 2. Hors combat : nouvelle faiblesse." },
        { label: "Quand lancer ?", texte: "Seulement quand l'échec ET le succès sont tous deux intéressants. Pas de jet pour des actions triviales." },
      ],
      difficultes: [
        { niveau: "Facile",         modificateur: "+2" },
        { niveau: "Moyen",          modificateur: "0"  },
        { niveau: "Difficile",      modificateur: "−2" },
        { niveau: "Très difficile", modificateur: "−4" },
        { niveau: "Improbable",     modificateur: "−6" },
      ]
    },

    traits: {
      titre: "Les six traits",
      intro: "Les traits représentent les capacités de votre aventurier, notés de 0 à 5. Le total ne peut jamais dépasser 20.",
      liste: [
        { nom: "Adresse",    icone: "🤸", desc: "Agilité, discrétion, fouille, pickpocket, tout ce qui demande de la finesse physique." },
        { nom: "Combat",     icone: "⚔",  desc: "Ardeur guerrière et capacité à faire passer son prochain de vie à trépas, arme en main." },
        { nom: "Érudition",  icone: "📚", desc: "Connaissances historiques, langues, magie, sciences. Lire, savoir, comprendre." },
        { nom: "Influence",  icone: "💬", desc: "Séduire, mentir, intimider, impressionner. Toute action sociale passe par là." },
        { nom: "Robustesse", icone: "💪", desc: "Muscles, santé, endurance. Donne aussi des PV supplémentaires (Robustesse + 5)." },
        { nom: "Survie",     icone: "🌲", desc: "S'orienter, chasser, survivre en pleine nature, résister aux conditions extrêmes." },
      ],
      niveaux: [
        { val: 0, label: "Faible" },
        { val: 1, label: "Moyen" },
        { val: 2, label: "Bon" },
        { val: 3, label: "Supérieur" },
        { val: 4, label: "Excellent" },
        { val: 5, label: "Légendaire" },
      ],
      reflexe: {
        titre: "Le Réflexe",
        texte: "Une courte phrase qui définit le comportement instinctif de l'aventurier — ce qu'il fait automatiquement sans réfléchir. Exemples : «Je surveille toujours les arrières», «Je récupère toujours quelque chose sur les morts», «Je me place entre mes compagnons et l'ennemi».",
        usage: "Quand l'aventurier est surpris, assommé ou dans l'incapacité de réfléchir, le MJ peut déclencher son réflexe. Le joueur agit selon cette phrase, sans jet de dés. C'est aussi un formidable outil de roleplay."
      },
      recuperation: {
        titre: "Récupération",
        texte: "Un aventurier récupère 2 PV par jour de repos complet (nuit de sommeil). Un repos court entre deux combats permet de récupérer 1 PV. Ces boutons sont disponibles sous les cases de PV sur la fiche.",
      },
      destin: {
        titre: "Le Destin",
        texte: "Chaque aventurier accumule des points de destin quand un compagnon meurt ou quand il tombe à 0 PV. Chaque point de destin ajoute +1 PV maximum.",
        usage: "À 5 points de destin, le destin du peuple se réalise — l'aventurier quitte l'aventure selon sa nature (un Humain part vivre paisiblement, un Elfe renaît jeune, un Nain part mourir l'arme à la main…). C'est une retraite forcée mais glorieuse."
      }
    },

    combat: {
      titre: "Le combat",
      intro: "Le combat est divisé en rounds. Chaque aventurier réalise une action par round.",
      initiative: "Jet d'Adresse (2D6 + Adresse) en début de combat. Le meilleur résultat agit en premier. Ce joueur décide ensuite de l'ordre pour les autres aventuriers. Les monstres agissent après tous les aventuriers (sauf don spécial).",
      phases: [
        { titre: "1. Initiative", texte: "Jet d'Adresse. Le meilleur résultat agit en premier et choisit l'ordre pour les suivants." },
        { titre: "2. Attaque classique", texte: "2D6 + Combat + Difficulté du monstre ≥ 8. En cas de succès, la cible perd vos dégâts. En cas d'échec, vous perdez les dégâts du monstre." },
        { titre: "3. Attaque indirecte", texte: "Utiliser le décor (faire tomber un lustre, pousser dans le feu…). La difficulté du monstre ne s'applique PAS. Le trait utilisé dépend de l'action." },
        { titre: "4. Résultat", texte: "Succès : la cible perd PV. Échec : vous perdez PV. À 0 PV : mort ou inconscient selon l'importance du combat." },
      ],
      degats: [
        { combat: "1–2", degats: "1" },
        { combat: "3–4", degats: "2" },
        { combat: "5",   degats: "3" },
      ],
      conseil: "Le MJ ne lance JAMAIS les dés. C'est toujours le joueur qui lance, même pour les attaques du monstre (il joue les conséquences d'un échec)."
    },

    armure: {
      titre: "L'armure",
      intro: "L'armure dans T&T ne réduit pas les dégâts — elle les annule entièrement, mais perd une charge à chaque utilisation.",
      regles: [
        { label: "Valeur de base", texte: "Toute armure d'aventurier a une valeur de 2. C'est le nombre d'utilisations par aventure." },
        { label: "Utilisation", texte: "Quand vous êtes touché, vous pouvez choisir d'utiliser votre armure. Vous ignorez TOUS les dégâts de cette attaque." },
        { label: "Charge perdue", texte: "L'armure perd 1 utilisation. Elle ne se répare qu'entre deux aventures." },
        { label: "Armure des monstres", texte: "Certains monstres ont un don Armure (valeur 1, 2 ou 3). Même fonctionnement." },
        { label: "Don Brutal", texte: "Un monstre avec le don Brutal ignore totalement l'armure des aventuriers." },
        { label: "Description libre", texte: "L'armure peut être une cotte de mailles, une dextérité naturelle, la chance, un bouclier… C'est au joueur de décider." },
      ]
    },

    avantages: {
      titre: "Avantages & Faiblesses",
      avantages: {
        intro: "Un avantage représente tout ce qui peut aider l'aventurier : une relation, un objet précieux, un serment, une réputation, un animal fidèle... Ce n'est pas une liste figée — c'est le joueur qui invente son avantage !",
        regles: [
          { label: "Score", texte: "Noté de 1 à 5. Plus le score est élevé, plus l'avantage est important pour l'aventurier." },
          { label: "À la création", texte: "L'aventurier commence avec 1 avantage de score égal à son score en Influence." },
          { label: "Utilisation", texte: "Un avantage peut être utilisé UNE FOIS par partie pour ajouter son score au jet de dés d'un aventurier (le sien ou celui d'un compagnon)." },
          { label: "Maximum", texte: "5 avantages maximum par aventurier. On peut en acquérir de nouveaux en échange des anciens." },
        ],
        exemples: [
          { texte: "Une devise comme «\u00a0Honneur et fidélité\u00a0!»" },
          { texte: "Un cirque itinérant" },
          { texte: "Grugru, mon molosse carnivore" },
          { texte: "L'esprit d'un vieux guerrier lié à mon épée" },
          { texte: "Un serment comme «\u00a0Je vengerai mon père\u00a0!»" },
          { texte: "Mon papa est duc des marches de l'Est" },
          { texte: "Une vieille dette qu'un seigneur me doit" },
          { texte: "Ma réputation de meilleur archer du royaume" },
          { texte: "Un réseau d'informateurs dans les bas-fonds" },
          { texte: "Mon fidèle destrier Tonnerre" },
        ]
      },
      faiblesses: {
        intro: "Les faiblesses sont les défauts de l'aventurier, acquis lors d'échecs ou d'événements dramatiques. Elles n'ont pas de score — elles infligent toujours −4.",
        regles: [
          { label: "Malus fixe", texte: "Une faiblesse utilisée par le MJ inflige toujours −4 au jet concerné. Pas de score, pas de variante." },
          { label: "Acquisition", texte: "On gagne une faiblesse après un échec critique (double 1), ou selon les événements du jeu." },
          { label: "Utilisation par le MJ", texte: "Le MJ peut utiliser une faiblesse UNE FOIS par partie pour désavantager l'aventurier. Il ne doit pas en abuser." },
          { label: "Élimination", texte: "À la fin d'une aventure, on peut retirer 1 avantage ET 1 faiblesse simultanément. Minimum 1 de chaque toujours présent." },
        ],
        exemples: [
          { texte: "Odeur du sang — le guerrier se jette dans la bagarre sans réfléchir" },
          { texte: "Avidité — incapable de résister à l'appât du gain" },
          { texte: "Rustique — mal à l'aise en société" },
          { texte: "Curiosité — toujours envie de savoir ce qu'il y a derrière" },
          { texte: "Fanatisme — convaincu d'avoir raison sur tout" },
          { texte: "Malédiction — quelque chose tourne toujours mal autour de lui" },
          { texte: "Phobie des araignées — panique totale" },
          { texte: "Endetté — doit une grosse somme à un personnage dangereux" },
        ]
      }
    },

    // Section dédiée faiblesses (réutilise les données d'avantages.faiblesses)
    faiblesses: {
      faiblesses: {
        intro: "Les faiblesses sont les défauts de l'aventurier, acquis lors d'échecs ou d'événements dramatiques. Elles n'ont pas de score — elles infligent toujours −4.",
        regles: [
          { label: "Malus fixe", texte: "Une faiblesse utilisée par le MJ inflige toujours −4 au jet concerné. Pas de score, pas de variante." },
          { label: "Acquisition", texte: "On gagne une faiblesse après un échec critique (double 1), ou selon les événements du jeu." },
          { label: "Utilisation par le MJ", texte: "Le MJ peut utiliser une faiblesse UNE FOIS par partie pour désavantager l'aventurier. Il ne doit pas en abuser." },
          { label: "Élimination", texte: "À la fin d'une aventure, on peut retirer 1 avantage ET 1 faiblesse simultanément. Minimum 1 de chaque toujours présent." },
        ],
        exemples: [
          { texte: "Odeur du sang — le guerrier se jette dans la bagarre sans réfléchir" },
          { texte: "Avidité — incapable de résister à l'appât du gain" },
          { texte: "Rustique — mal à l'aise en société" },
          { texte: "Curiosité — toujours envie de savoir ce qu'il y a derrière" },
          { texte: "Fanatisme — convaincu d'avoir raison sur tout" },
          { texte: "Malédiction — quelque chose tourne toujours mal autour de lui" },
          { texte: "Phobie des araignées — panique totale" },
          { texte: "Endetté — doit une grosse somme à un personnage dangereux" },
        ]
      }
    },

    peuples: {
      titre: "Les peuples",
      intro: "12 peuples disponibles. Chacun possède un Don unique et un Destin qui se déclenche à 5 points de destin.",
      destins: "Les points de destin s'accumulent quand un compagnon meurt ou que l'aventurier tombe à 0 PV. Chaque point de destin ajoute +1 PV max.",
      liste: [
        { nom: "Humain",      don: "Main du destin — pioche 2 cartes événement par partie.",            destin: "Fatigue — part vivre paisiblement." },
        { nom: "Elfe",        don: "Immortel — à 0 PV gagne 1 point de destin et se réveille.",        destin: "Tristesse — renaît en jeune elfe." },
        { nom: "Nain",        don: "Corps de pierre — immunisé feu/chaleur + 2 PV supplémentaires.",   destin: "Colère — part mourir l'arme à la main." },
        { nom: "Halfling",    don: "Bonhommie — ne peut être blessé que s'il rate son attaque.",       destin: "Nostalgie — retourne à son village." },
        { nom: "Wolfen",      don: "Sauvagerie — peut faire fuir 1D6 Petits bras.",                   destin: "Régression — sombre dans la démence." },
        { nom: "Kitling",     don: "Boule de poils — survit à toute chute, voit dans la pénombre.",   destin: "Maladresse — mort stupide inévitable." },
        { nom: "Krisling",    don: "Increvable — immunisé poisons/maladies, très flexible.",           destin: "Solitude — s'enfonce sous terre." },
        { nom: "Drakken",     don: "Mémoire collective — accès à une bibliothèque par méditation.",   destin: "Retour — gardien des mines draconiques." },
        { nom: "Taurin",      don: "Force de la nature — lance 3D6 garde 2 pour Robustesse.",         destin: "Ermitage — s'exile dans des ruines." },
        { nom: "Ours",        don: "Bête de guerre — dégâts basés sur Robustesse, pas Combat.",       destin: "Hibernation — s'endort pour toujours." },
        { nom: "Marionnette", don: "Main baladeuse — envoie un membre en reconnaissance.",            destin: "Disparition — se disloque." },
        { nom: "Visage-Miroir",don:"Métamorphose — prend l'apparence de n'importe quel humanoïde.",  destin: "Folie — discussions avec ses amis morts." },
      ]
    },

    classes: {
      titre: "Les classes",
      intro: "6 classes. Chaque groupe doit avoir une classe différente par joueur.",
      liste: [
        { nom: "Guerrier",  trait: "Combat",    aussi: "Gladiateur, Légionnaire, Spadassin",    faiblesse: "Odeur du sang — du mal à éviter les bagarres." },
        { nom: "Magicien",  trait: "Érudition", aussi: "Sorcier, Nécromancien, Illusionniste",  faiblesse: "Malédiction — quelque chose tourne toujours mal autour de lui." },
        { nom: "Marchand",  trait: "Influence", aussi: "Barde, Contrebandier, Colporteur",      faiblesse: "Avidité — incapable de résister à l'appât du gain." },
        { nom: "Rôdeur",    trait: "Survie",    aussi: "Homme des bois, Gardien, Vagabond",     faiblesse: "Rustique — pas à l'aise en société." },
        { nom: "Templier",  trait: "Influence", aussi: "Prêtre, Paladin, Inquisiteur",          faiblesse: "Fanatisme — convaincu d'avoir raison sur tout." },
        { nom: "Voleur",    trait: "Adresse",   aussi: "Cambrioleur, Assassin, Espion",         faiblesse: "Curiosité — toujours envie de savoir ce qu'il y a derrière." },
      ]
    },

    dons: {
      titre: "Les dons",
      intro: "Les dons distinguent les aventuriers du commun des mortels. Max 5 dons par aventurier. On peut apprendre des dons d'autres classes (max autant que sa classe de départ).",
      classes: [
        {
          classe: "Guerrier", icone: "⚔",
          dons: [
            { nom: "Ancien combattant",   desc: "Captiver l'attention d'un auditoire avec ses récits." },
            { nom: "En première ligne",   desc: "+3 points de vie." },
            { nom: "Garde du corps",      desc: "S'interposer pour ses compagnons, utiliser son armure pour eux." },
            { nom: "Le Dieu sous la montagne", desc: "Plus d'armure, mais dégâts = Robustesse." },
            { nom: "Maître d'armes",      desc: "Répartir ses dégâts entre plusieurs adversaires de même difficulté." },
            { nom: "Sang de Troll",       desc: "Récupère 3 PV à la fin de chaque combat." },
          ]
        },
        {
          classe: "Magicien", icone: "🔮",
          dons: [
            { nom: "Colère du Mage",      desc: "Inflige des dégâts magiques à distance en réussissant un jet d'Érudition." },
            { nom: "Dédales de l'Esprit", desc: "Résiste à toute tentative de domination mentale." },
            { nom: "Le Signe",            desc: "Crée une illusion convaincante avec un jet d'Érudition." },
            { nom: "Liens du Sang",       desc: "Soigne (Érudition) PV à un aventurier en contact." },
            { nom: "Passeur d'Âmes",      desc: "Communique avec les morts récents." },
            { nom: "Voile du Vide",       desc: "Devient invisible jusqu'à ce qu'il attaque." },
          ]
        },
        {
          classe: "Marchand", icone: "💰",
          dons: [
            { nom: "Guilde",              desc: "Toujours bien reçu en ville : gîte, couvert et renseignements." },
            { nom: "Dette de sang",       desc: "Un monstre épargné devient son débiteur pour une journée." },
            { nom: "Monnaie de singe",    desc: "Possède toujours l'objet dont quelqu'un a besoin (souvent une copie)." },
            { nom: "Tout s'achète",       desc: "Peut demander n'importe quoi en paiement (âme, souvenir…)." },
            { nom: "Zizanie",             desc: "Rendre un PNJ agressif envers un autre avec un jet d'Influence." },
            { nom: "Premier choix",       desc: "+4 au lieu de +2 quand il utilise sa besace." },
          ]
        },
        {
          classe: "Rôdeur", icone: "🌲",
          dons: [
            { nom: "Baiser de Circé",     desc: "En réussissant un jet d'Influence, une cible se comporte comme un animal." },
            { nom: "Compagnon animal",    desc: "Animal allié = avantage niveau Survie." },
            { nom: "Garou",               desc: "Se transformer en animal (choisi à la création). Utilisable (Survie) fois/jour." },
            { nom: "Maître des animaux",  desc: "Comprendre et commander les animaux. Immunisé aux poisons." },
            { nom: "Maître Garou",        desc: "Choisir deux nouvelles formes animales." },
            { nom: "Seigneur des Plantes",desc: "Commander les esprits végétaux avec un jet de Survie." },
          ]
        },
        {
          classe: "Templier", icone: "✝",
          dons: [
            { nom: "Châtiment",           desc: "En réussissant un jet d'Influence, inflige des dégâts à une créature maléfique." },
            { nom: "Lumière de l'Aube",   desc: "Crée une lumière aveuglante pour les créatures des ténèbres." },
            { nom: "Punir",               desc: "Inflige des dégâts supplémentaires aux monstres corrompus." },
            { nom: "Sacré",               desc: "Immunisé aux maladies et poisons naturels." },
            { nom: "Voix du Ciel",        desc: "Inspirer ses compagnons : +2 à tous leurs jets pendant un round." },
            { nom: "Miracle",             desc: "Une fois par aventure : succès automatique sur n'importe quel jet." },
          ]
        },
        {
          classe: "Voleur", icone: "🗝",
          dons: [
            { nom: "Confidences sur l'oreiller", desc: "Obtenir n'importe quelle info d'une personne après une nuit ensemble." },
            { nom: "Dissimulation",       desc: "Cacher un objet jusqu'à la taille d'une dague, indétectable." },
            { nom: "Doigts de fée",       desc: "Toujours réussir le pickpocket + ouvrir toute serrure non-magique." },
            { nom: "Fourbe",              desc: "Lance 3D6 garde les 2 meilleurs pour les attaques indirectes." },
            { nom: "Mille Visages",       desc: "Se déguiser en n'importe quel humanoïde avec un jet d'Adresse." },
            { nom: "Pipeau infernal",     desc: "Mentir de façon automatiquement crédible. (Influence) fois/partie." },
          ]
        },
      ]
    },

    monstres: {
      titre: "Les monstres",
      intro: "Les monstres sont définis par leur niveau de difficulté, leurs dégâts, leurs PV et leurs dons.",
      niveaux: [
        { nom: "Petit bras",  diff: "0",  degats: "1", pv: "1",  dons: "1",    desc: "Brigands, coupe-jarrets, petite vermine." },
        { nom: "Gros bras",   diff: "−2", degats: "1", pv: "5",  dons: "1–2",  desc: "Soldats entraînés, détrousseurs expérimentés." },
        { nom: "Brutasse",    diff: "−4", degats: "2", pv: "10", dons: "2",    desc: "Adversaire sérieux. Dangereux en groupe." },
        { nom: "Grand chef",  diff: "−6", degats: "3", pv: "15", dons: "3+",   desc: "Le grand méchant. Rarement seul." },
      ],
      dons: [
        { nom: "Armure (1–3)", desc: "Annule une attaque entière. Même règle que les aventuriers." },
        { nom: "Brutal",       desc: "Ignore l'armure des aventuriers." },
        { nom: "Dominer",      desc: "Jet d'Influence de l'aventurier ou obéit aux ordres du monstre." },
        { nom: "Embuscade",    desc: "Au premier round, le monstre n'encaisse pas de dégâts." },
        { nom: "Encerclement", desc: "Plus de monstres que d'aventuriers → −1 PV/round à tous." },
        { nom: "Morsure",      desc: "Une fois mordu, l'aventurier perd 1 PV/round." },
        { nom: "Régénération", desc: "+1 PV à la fin de chaque round." },
        { nom: "Soigner",      desc: "+2 PV à chaque allié à chaque round." },
        { nom: "Terrifiant",   desc: "Jet d'Influence ou fuite. Nouveau jet chaque round." },
      ]
    },

    experience: {
      titre: "Expérience & Progression",
      intro: "À la fin de chaque aventure, chaque joueur choisit UNE des options suivantes.",
      options: [
        { icone: "📈", titre: "Améliorer un trait", texte: "+1 dans un trait de son choix. Le total des traits ne peut pas dépasser 20." },
        { icone: "✨", titre: "Gagner un don", texte: "Apprendre un nouveau don (max 5 dons). Peut être d'une autre classe si son joueur l'accepte. Pas plus de dons étrangers que de dons de sa classe." },
      ],
      fin: "Quand un aventurier atteint 20 en traits et 5 dons, il prend sa retraite. Créez un nouveau héros !",
      avantages: "À la fin d'une partie, on peut retirer 1 avantage et 1 faiblesse. Minimum 1 de chaque toujours présent.",
      destin: "Chaque point de destin gagné ajoute +1 PV max. À 5 points : le destin de votre peuple se réalise.",
      points_aventure: "Les points d'aventure s'obtiennent lors des combats et exploits. Chaque point permet de piocher une carte événement depuis l'onglet Bio de la fiche."
    },

    // ── GUIDE DE LA FICHE ──────────────────────────────
    guide_fiche: {
      titre: "Guide de la fiche de personnage",
      intro: "Tout ce que vous pouvez faire directement depuis la fiche de votre aventurier.",
      sections: [
        {
          titre: "🖼 Portrait",
          texte: "Cliquez sur l'image en haut à gauche pour choisir un portrait. L'image s'ouvre dans le sélecteur de fichiers de Foundry.",
        },
        {
          titre: "🧬 Don et Destin du peuple",
          texte: "Juste sous la ligne Peuple/Âge/Signe, une bande affiche automatiquement le Don de peuple (🎁) et le Destin (💠) correspondant au peuple sélectionné. Elle se met à jour immédiatement quand vous changez de peuple.",
        },
        {
          titre: "⚔ Onglet Traits — Les étoiles",
          texte: "Cliquez sur une étoile pour définir la valeur d'un trait (1 à 5). Recliquez sur la même étoile pour descendre d'un cran. Le total 'X / 20' se met à jour automatiquement. Cliquez sur 🎲 pour ouvrir le dialogue de jet.",
        },
        {
          titre: "🎲 Dialogue de jet",
          texte: "Quand vous cliquez sur 🎲 d'un trait, une fenêtre s'ouvre. Sélectionnez un avantage à utiliser (+score), activez une faiblesse (−4), utilisez un objet de besace (+2), ou choisissez la difficulté. La formule se met à jour en temps réel. Cliquez sur 'Lancer !' pour envoyer le résultat dans le chat.",
        },
        {
          titre: "❤ Points de Vie",
          texte: "Cliquez sur une case rouge pour définir les PV actuels. Les cases s'allument automatiquement. Calculé depuis : Robustesse + 5 (+ 2 pour les Nains + points de destin).",
        },
        {
          titre: "💠 Destin",
          texte: "Cliquez sur un losange pour ajouter un point de destin. Chaque point ajoute +1 PV max. À 5 points : le destin de votre peuple se réalise.",
        },
        {
          titre: "⚔ Bouton Attaquer",
          texte: "Ciblez d'abord un token avec l'outil de ciblage de Foundry (icône cible), puis cliquez 'Attaquer'. Le résultat apparaît dans le chat avec les dégâts appliqués automatiquement.",
        },
        {
          titre: "⭐ Onglet Avantages",
          texte: "Créez ou glissez-déposez des avantages depuis les compendiums. Le cercle ○ indique qu'il est disponible. Cliquez dessus pour le marquer ✓ comme utilisé cette partie.",
        },
        {
          titre: "✨ Onglet Dons — Glisser-déposer",
          texte: "Ouvrez le compendium 'T&T — Dons', puis glissez un don directement sur la fiche. Il s'ajoute automatiquement. Maximum 5 dons. Même chose pour les armes et équipements.",
        },
        {
          titre: "🃏 Onglet Bio — Cartes événement",
          texte: "Chaque point d'aventure permet de piocher une carte parmi les 27. Le bouton 'Piocher' est grisé si vous n'avez plus de points. La carte tirée s'affiche sur votre fiche ET dans le chat. Cliquez sur une miniature pour la sélectionner, puis 'Jouer' pour l'utiliser ou 'Défausser' pour l'écarter.",
        },
        {
          titre: "🎲 Nouvelle partie",
          texte: "Dans l'onglet Dons, le bouton vert 'Nouvelle partie' remet à zéro tous les avantages utilisés, les objets de besace et les cartes de la partie précédente.",
        },
      ]
    },

    // ── GUIDE DU MJ ────────────────────────────────────
    guide_mj: {
      titre: "Guide du Maître",
      intro: "Fonctionnalités spécifiques au Maître du Jeu dans ce système Foundry.",
      sections: [
        {
          titre: "⚡ Initiative",
          texte: "Créez un combat (bouton ⚔ du tracker), ajoutez vos tokens. Le bouton '⚡ Initiative' apparaît en haut du tracker de combat. Cliquez dessus pour que tous les aventuriers lancent 2D6 + Adresse automatiquement. Le résultat s'affiche dans le chat avec l'ordre de jeu. Au démarrage du combat une confirmation automatique est proposée.",
        },
        {
          titre: "👹 Créer un monstre",
          texte: "Créez un acteur de type 'PNJ'. Définissez les traits Combat et Robustesse (les PV se calculent automatiquement). Choisissez la Difficulté : Petit bras (0), Gros bras (−2), Brutasse (−4), Grand chef (−6). Les dégâts se calculent selon le score de Combat.",
        },
        {
          titre: "📦 Compendiums T&T",
          texte: "Trois compendiums sont disponibles : 'T&T — Dons' (36 dons prêts), 'T&T — Monstres' (12 créatures), 'T&T — Aventuriers pré-tirés' (6 personnages). Glissez les monstres sur la scène directement depuis le compendium.",
        },
        {
          titre: "⚔ Combat automatisé",
          texte: "Le joueur cible un token avec l'outil de ciblage, puis clique 'Attaquer'. En cas de succès, les PV de la cible sont réduits automatiquement. En cas d'échec, l'aventurier perd les dégâts du monstre. Un bouton 🛡 apparaît dans le chat pour utiliser l'armure.",
        },
        {
          titre: "💀 Faiblesses",
          texte: "Dans le dialogue de jet d'un joueur, vous pouvez activer une faiblesse de son aventurier (−4). Le joueur voit le malus dans sa formule avant de lancer.",
        },
        {
          titre: "🃏 Cartes événement",
          texte: "Les joueurs piochent leurs cartes en dépensant 1 point d'aventure depuis leur fiche (onglet Bio). Chaque tirage est annoncé dans le chat. Attribuez des points d'aventure manuellement après les combats et exploits.",
        },
        {
          titre: "📖 Wiki des règles",
          texte: "Le wiki s'ouvre automatiquement au lancement pour le MJ. Il est accessible depuis le bouton 'Wiki T&T — Règles' dans l'onglet Journal.",
        },
      ]
    }
  };
}
