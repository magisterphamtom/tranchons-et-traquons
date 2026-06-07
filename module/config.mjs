/**
 * Données de référence pour Tranchons & Traquons
 */
export const TnT = {

  // ─── Peuples ────────────────────────────────────────
  PEUPLES: {
    humain:      { label: "Humain",      don: "Main du destin",    destin: "Fatigue" },
    elfe:        { label: "Elfe",        don: "Immortel",          destin: "Tristesse" },
    nain:        { label: "Nain",        don: "Corps de pierre",   destin: "Colère", pvBonus: 2 },
    halfling:    { label: "Halfling",    don: "Bonhommie",         destin: "Nostalgie" },
    wolfen:      { label: "Wolfen",      don: "Meute",             destin: "Errance" },
    kitling:     { label: "Kitling",     don: "Boule de poils",    destin: "Maladresse" },
    krisling:    { label: "Krisling",    don: "Increvable",        destin: "Solitude" },
    drakken:     { label: "Drakken",     don: "Mémoire collective",destin: "Retour" },
    taurin:      { label: "Taurin",      don: "Force primale",     destin: "Fureur" },
    ours:        { label: "Ours",        don: "Bête de guerre",    destin: "Hibernation" },
    marionnette: { label: "Marionnette", don: "Main baladeuse",    destin: "Disparition" },
    sangrelin:   { label: "Sangrelin",   don: "Nuée",              destin: "Révolte" }
  },

  // ─── Classes ─────────────────────────────────────────
  CLASSES: {
    guerrier:  { label: "Guerrier",  traitCle: "combat",    aussi: "Berserker, Chevalier, Mercenaire" },
    magicien:  { label: "Magicien",  traitCle: "erudition", aussi: "Sorcier, Nécromancien, Illusionniste" },
    marchand:  { label: "Marchand",  traitCle: "influence", aussi: "Négociant, Banquier, Contrebandier" },
    rodeur:    { label: "Rôdeur",    traitCle: "survie",    aussi: "Chasseur, Forestier, Druide" },
    templier:  { label: "Templier",  traitCle: "influence", aussi: "Prêtre, Paladin, Inquisiteur" },
    voleur:    { label: "Voleur",    traitCle: "adresse",   aussi: "Assassin, Espion, Acrobate" }
  },

  // ─── Traits ──────────────────────────────────────────
  TRAITS: {
    adresse:    { label: "Adresse",    icon: "fas fa-hand-sparkles" },
    combat:     { label: "Combat",     icon: "fas fa-sword" },
    erudition:  { label: "Érudition",  icon: "fas fa-book" },
    influence:  { label: "Influence",  icon: "fas fa-comments" },
    robustesse: { label: "Robustesse", icon: "fas fa-heart" },
    survie:     { label: "Survie",     icon: "fas fa-tree" }
  },

  // ─── Niveaux de trait ────────────────────────────────
  NIVEAUX_TRAIT: {
    0: "Faible",
    1: "Moyen",
    2: "Bon",
    3: "Supérieur",
    4: "Excellent",
    5: "Légendaire"
  },

  // ─── Portraits de classes ────────────────────────────
  PORTRAITS_CLASSES: {
    guerrier:  "systems/tranchons-et-traquons/assets/GUERRIER.webp",
    magicien:  "systems/tranchons-et-traquons/assets/MAGICIEN.webp",
    marchand:  "systems/tranchons-et-traquons/assets/MARCHAND.webp",
    rodeur:    "systems/tranchons-et-traquons/assets/RODEUR.webp",
    templier:  "systems/tranchons-et-traquons/assets/TEMPLIER.webp",
    voleur:    "systems/tranchons-et-traquons/assets/VOLEUR.webp",
  },

  // ─── Portraits de peuples ────────────────────────────
  PORTRAITS_PEUPLES: {
    kitling:   "systems/tranchons-et-traquons/assets/KITLING.webp",
    krisling:  "systems/tranchons-et-traquons/assets/KRISLING.webp",
    ours:      "systems/tranchons-et-traquons/assets/OURS.webp",
    taurin:    "systems/tranchons-et-traquons/assets/TAURIN.webp",
  },

  // ─── Langues ─────────────────────────────────────────
  LANGUES: {
    royaumes: "Langue des Royaumes (Prime)",
    rouge:    "Rouge (Sangrelin)",
    feuillu:  "Feuillu (Elfe)",
    telgesh:  "Telgesh (Antique)",
    pierreux: "Pierreux (Nain)",
    kriss:    "Kriss (Krisling)"
  },

  // ─── Signes astrologiques ────────────────────────────
  SIGNES: {
    crapaud_buffle: "Le Crapaud-buffle (Chance)",
    licorne:        "La Licorne (Amour)",
    dragon_noir:    "Le Dragon noir (Sagesse)",
    forteresse:     "La Forteresse (Protection)",
    lames:          "Les Lames (Justice)",
    dame_blanche:   "La Dame blanche (Tempérance)",
    loup_gris:      "Le Loup gris (Domination)",
    furie:          "La Furie (Agressivité)",
    roi_cornu:      "Le Roi cornu (Résistance)",
    trois_soeurs:   "Les Trois sœurs (Pitié)",
    lamantin:       "Le Lamantin (Sérénité)"
  }
};
