/**
 * ══════════════════════════════════════════════════════════════
 *  TRANCHONS & TRAQUONS — Installation des Compendiums
 *  Copiez-collez ce script entier dans la console Foundry (F12)
 * ══════════════════════════════════════════════════════════════
 */
(async () => {

  // ── Utilitaire ─────────────────────────────────────────────
  async function creerOuOuvrirPack(nom, label, type) {
    let pack = game.packs.get(`world.${nom}`);
    if (!pack) {
      pack = await CompendiumCollection.createCompendium({
        name: nom, label, type, system: "tranchons-et-traquons", package: "world"
      });
      console.log(`T&T | Compendium créé : ${label}`);
    } else {
      console.log(`T&T | Compendium existant : ${label}`);
    }
    await pack.configure({ locked: false });
    return pack;
  }

  async function ajouterDocs(pack, docs) {
    const existants = await pack.getIndex();
    for (const doc of docs) {
      const deja = existants.find(e => e.name === doc.name);
      if (!deja) {
        await pack.documentClass.create(doc, { pack: pack.collection });
        console.log(`  + ${doc.name}`);
      } else {
        console.log(`  ~ ${doc.name} (déjà présent)`);
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  //  1. COMPENDIUM DONS
  // ══════════════════════════════════════════════════════════
  const packDons = await creerOuOuvrirPack("tnt-dons", "T&T — Dons", "Item");
  await ajouterDocs(packDons, [
    // ── Guerrier ──────────────────────────────────────────
    { name:"Ancien combattant", type:"don", img:"icons/skills/social/trading-contract-deal-shake.webp",
      system:{ classe_origine:"guerrier", description:"Captive l'attention d'un auditoire avec ses récits d'exploits. L'auditoire ne remarque pas ce qui se passe alentour.", effet:"+distraction passive" }},
    { name:"En première ligne", type:"don", img:"icons/magic/defensive/shield-barrier-glowing-triangle-red.webp",
      system:{ classe_origine:"guerrier", description:"+3 points de vie supplémentaires.", effet:"+3 PV max" }},
    { name:"Garde du corps", type:"don", img:"icons/magic/defensive/shield-barrier-deflect-teal.webp",
      system:{ classe_origine:"guerrier", description:"S'interpose entre compagnons et ennemi pour encaisser les dégâts. Peut utiliser son armure pour eux.", effet:"Interposition + transfert dégâts" }},
    { name:"Le Dieu sous la montagne", type:"don", img:"icons/magic/fire/flame-burning-campfire-orange.webp",
      system:{ classe_origine:"guerrier", description:"Plus jamais d'armure, mais dégâts infligés = Robustesse.", effet:"Dégâts = Robustesse, armure interdite" }},
    { name:"Maître d'armes", type:"don", img:"icons/weapons/swords/swords-short.webp",
      system:{ classe_origine:"guerrier", description:"Répartir ses dégâts entre plusieurs adversaires de même difficulté.", effet:"Dégâts multi-cibles" }},
    { name:"Sang de Troll", type:"don", img:"icons/magic/life/heart-cross-strong-green.webp",
      system:{ classe_origine:"guerrier", description:"Récupère 3 PV à la fin de chaque combat.", effet:"Régénération post-combat +3 PV" }},
    // ── Magicien ──────────────────────────────────────────
    { name:"Ami des esprits", type:"don", img:"icons/magic/light/orbs-smoke-pink.webp",
      system:{ classe_origine:"magicien", description:"Jet d'Érudition pour communiquer avec l'esprit d'un lieu ou d'un objet.", effet:"Communication spirituelle" }},
    { name:"Carnaval des illusions", type:"don", img:"icons/magic/light/light-rays-pattern-purple.webp",
      system:{ classe_origine:"magicien", description:"Illusions visuelles et sonores. Jet d'Influence. Nécessite concentration.", effet:"Illusions (concentration)" }},
    { name:"Colère du mage", type:"don", img:"icons/magic/fire/explosion-fireball-medium-purple.webp",
      system:{ classe_origine:"magicien", description:"Jet d'Érudition vs difficulté. 1) 1 dégât/1 cible 2) 1 dégât/1D6 cibles 3) 1D6 dégâts/1 cible. Résultat 6 sur options 2-3 = perd 3 PV.", effet:"Attaque magique (jet Érudition)" }},
    { name:"Maître des nuées", type:"don", img:"icons/magic/water/wind-weather-cloud.webp",
      system:{ classe_origine:"magicien", description:"Invoquer brouillard, pluie, neige ou vent. Concentration totale requise.", effet:"Contrôle météo (concentration)" }},
    { name:"Serviteurs", type:"don", img:"icons/creatures/magical/construct-bone-undead.webp",
      system:{ classe_origine:"magicien", description:"Invoquer (Érudition) serviteurs pour 1 jour ou 1 nuit. Tâches simples, ne combattent pas. Disparaissent si un autre sort est lancé.", effet:"(Érudition) serviteurs temporaires" }},
    { name:"Téléportation", type:"don", img:"icons/magic/movement/portal-door-blue.webp",
      system:{ classe_origine:"magicien", description:"Téléportation vers un pentacle préparé. Jet d'Érudition. -2 par personne supplémentaire. Échec = perd 3 PV.", effet:"Téléportation (pentacle requis)" }},
    // ── Marchand ──────────────────────────────────────────
    { name:"Guilde", type:"don", img:"icons/environment/settlement/tavern.webp",
      system:{ classe_origine:"marchand", description:"Toujours bien reçu en ville : gîte, couvert et renseignements.", effet:"Hospitalité garantie partout" }},
    { name:"Dette de sang", type:"don", img:"icons/magic/holy/prayer-hands-glowing-yellow.webp",
      system:{ classe_origine:"marchand", description:"Tout monstre épargné devient son débiteur pour une journée.", effet:"Monstre épargné = allié 1 jour" }},
    { name:"Monnaie de singe", type:"don", img:"icons/commodities/treasure/chest-worn-brown.webp",
      system:{ classe_origine:"marchand", description:"Possède toujours l'objet requis (souvent une copie découverte le lendemain). Ne fonctionne pas sur les aventuriers.", effet:"Objet requis toujours dispo (copie)" }},
    { name:"Tout s'achète", type:"don", img:"icons/skills/social/intimidation-impressing.webp",
      system:{ classe_origine:"marchand", description:"Peut demander n'importe quoi en paiement : âme, souvenir, talent. Doit honorer sa part.", effet:"Paiement en abstraits" }},
    { name:"Zizanie", type:"don", img:"icons/skills/social/wave-halt-red.webp",
      system:{ classe_origine:"marchand", description:"Jet d'Influence pour rendre un PNJ agressif envers un autre.", effet:"Conflit PNJ vs PNJ (jet Influence)" }},
    { name:"Premier choix", type:"don", img:"icons/commodities/treasure/figurine-idol-yellow.webp",
      system:{ classe_origine:"marchand", description:"Quand il utilise un objet de sa besace, +4 au lieu de +2.", effet:"Besace +4 au lieu de +2" }},
    // ── Rôdeur ────────────────────────────────────────────
    { name:"Baiser de Circé", type:"don", img:"icons/magic/nature/wolf-paw-print-teal-purple.webp",
      system:{ classe_origine:"rodeur", description:"Jet d'Influence : la cible se comporte comme un animal.", effet:"Régression animale (jet Influence)" }},
    { name:"Compagnon animal", type:"don", img:"icons/creatures/mammals/wolf-shadow-black.webp",
      system:{ classe_origine:"rodeur", description:"Animal allié = avantage de niveau égal au score de Survie.", effet:"Animal = avantage niveau Survie" }},
    { name:"Garou", type:"don", img:"icons/creatures/mammals/wolf-pack-howl-moon.webp",
      system:{ classe_origine:"rodeur", description:"Métamorphose en animal choisi à la création. Durée illimitée, peut parler. Utilisable (Survie) fois/jour.", effet:"Métamorphose (Survie fois/jour)" }},
    { name:"Maître des animaux", type:"don", img:"icons/magic/nature/leopard-paw-yellow.webp",
      system:{ classe_origine:"rodeur", description:"Commander (Survie) animaux. Immunisé aux venins et poisons.", effet:"Contrôle animaux + immunité poison" }},
    { name:"Maître Garou", type:"don", img:"icons/creatures/mammals/lion-prowling-gold.webp",
      system:{ classe_origine:"rodeur", description:"Choisir deux nouvelles formes animales pour le don Garou.", effet:"+2 formes animales" }},
    { name:"Seigneur des Plantes", type:"don", img:"icons/magic/nature/tree-animated-strike.webp",
      system:{ classe_origine:"rodeur", description:"Jet de Survie pour commander les esprits végétaux.", effet:"Contrôle végétal (jet Survie)" }},
    // ── Templier ──────────────────────────────────────────
    { name:"Guérisseur", type:"don", img:"icons/magic/life/cross-area-circle-white-green.webp",
      system:{ classe_origine:"templier", description:"Toucher un blessé = tous ses PV restaurés OU une faiblesse physique retirée. Une fois par cible. (Influence) fois/partie.", effet:"Guérison totale (Influence fois/partie)" }},
    { name:"Jugement", type:"don", img:"icons/magic/holy/chalice-glowing-gold.webp",
      system:{ classe_origine:"templier", description:"Le suspect touche une arme. S'il ment, l'arme le brûle automatiquement.", effet:"Détection mensonge infaillible" }},
    { name:"Messe", type:"don", img:"icons/magic/holy/shire-leaf-cross-staff-yellow.webp",
      system:{ classe_origine:"templier", description:"Sermon devant une assemblée = soutien de toute la communauté.", effet:"Soutien communautaire (sermon)" }},
    { name:"Par l'Unique !", type:"don", img:"icons/magic/holy/angel-wings-gray.webp",
      system:{ classe_origine:"templier", description:"Jet d'Influence pour forcer un être surnaturel à quitter ce monde.", effet:"Exorcisme (jet Influence)" }},
    { name:"Punir", type:"don", img:"icons/magic/holy/prayer-hands-glowing-yellow.webp",
      system:{ classe_origine:"templier", description:"Inflige des dégâts aux créatures immunisées aux armes normales.", effet:"Dégâts aux créatures immunisées" }},
    { name:"Serment", type:"don", img:"icons/magic/holy/barrier-shield-winged-cross.webp",
      system:{ classe_origine:"templier", description:"Serment sanctifié = mort immédiate si rompu (le templier compris).", effet:"Serment mortel" }},
    // ── Voleur ────────────────────────────────────────────
    { name:"Confidences sur l'oreiller", type:"don", img:"icons/magic/control/silhouette-fall-pink.webp",
      system:{ classe_origine:"voleur", description:"Obtenir n'importe quelle information après une nuit avec la cible.", effet:"Information garantie (séduction)" }},
    { name:"Dissimulation", type:"don", img:"icons/magic/control/debuff-chains-shackles-purple.webp",
      system:{ classe_origine:"voleur", description:"Cacher un objet jusqu'à la taille d'une dague, indétectable.", effet:"Objet caché indétectable" }},
    { name:"Doigts de fée", type:"don", img:"icons/skills/trades/lock-picks-brown.webp",
      system:{ classe_origine:"voleur", description:"Pickpocket toujours réussi + toute serrure non-magique ouverte.", effet:"Pickpocket et serrures auto-réussis" }},
    { name:"Fourbe", type:"don", img:"icons/skills/social/theft-pickpocket-gold-red.webp",
      system:{ classe_origine:"voleur", description:"Pour les attaques indirectes : lance 3D6 et garde les 2 meilleurs.", effet:"3D6 gardez 2 (attaque indirecte)" }},
    { name:"Mille Visages", type:"don", img:"icons/magic/control/debuff-hypnotic-swirl.webp",
      system:{ classe_origine:"voleur", description:"Jet d'Adresse : se déguiser en n'importe quel humanoïde.", effet:"Déguisement parfait (jet Adresse)" }},
    { name:"Pipeau infernal", type:"don", img:"icons/magic/control/mouth-smile-deception-purple.webp",
      system:{ classe_origine:"voleur", description:"Mensonge automatiquement cru. Inutile contre un ennemi actif. (Influence) fois/partie.", effet:"Mensonge irrésistible" }},
  ]);

  // ══════════════════════════════════════════════════════════
  //  2. COMPENDIUM MONSTRES
  // ══════════════════════════════════════════════════════════
  const packMonstres = await creerOuOuvrirPack("tnt-monstres", "T&T — Monstres", "Actor");
  await ajouterDocs(packMonstres, [
    { name:"Sangrelin (Petit bras)", type:"pnj", img:"icons/creatures/humanoids/goblin-horned-fangs-green.webp",
      system:{ biographie:{peuple:"sangrelin",type_monstre:"Humanoïde",description:"Petit bras agité, dangereux en nombre. Armée de rebelles."},
               traits:{combat:{valeur:1},robustesse:{valeur:1}}, sante:{pv:{value:1,min:0,max:1}},
               combat_stats:{armure:0,degats:1,difficulte:0} }},
    { name:"Brigand (Gros bras)", type:"pnj", img:"icons/creatures/humanoids/humanoid-shadow-dark.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Humanoïde",description:"Détrousseur expérimenté."},
               traits:{combat:{valeur:2},robustesse:{valeur:2}}, sante:{pv:{value:5,min:0,max:5}},
               combat_stats:{armure:0,degats:1,difficulte:-2} }},
    { name:"Soldat (Gros bras)", type:"pnj", img:"icons/creatures/humanoids/knight-purple.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Humanoïde",description:"Soldat régulier. Don Armure (1)."},
               traits:{combat:{valeur:2},robustesse:{valeur:2}}, sante:{pv:{value:5,min:0,max:5}},
               combat_stats:{armure:1,degats:1,difficulte:-2} }},
    { name:"Troll (Brutasse)", type:"pnj", img:"icons/creatures/magical/construct-iron-stomping.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Monstre",description:"Soleil = pierre. Régénère 1 PV/round. Don Régénération."},
               traits:{combat:{valeur:3},robustesse:{valeur:3}}, sante:{pv:{value:10,min:0,max:10}},
               combat_stats:{armure:0,degats:2,difficulte:-4} }},
    { name:"Golem de pierre (Brutasse)", type:"pnj", img:"icons/creatures/magical/construct-iron-stomping.webp",
      system:{ biographie:{peuple:"marionnette",type_monstre:"Construit",description:"Armure (3). Don Brutal : ignore l'armure des aventuriers."},
               traits:{combat:{valeur:3},robustesse:{valeur:4}}, sante:{pv:{value:10,min:0,max:10}},
               combat_stats:{armure:3,degats:2,difficulte:-4} }},
    { name:"Sorcier inquiétant (Brutasse)", type:"pnj", img:"icons/magic/symbols/rune-sigil-black-purple.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Humanoïde",description:"Dons Dominer et Soigner. Ne se déplace jamais sans garde."},
               traits:{combat:{valeur:2},robustesse:{valeur:2}}, sante:{pv:{value:10,min:0,max:10}},
               combat_stats:{armure:0,degats:2,difficulte:-4} }},
    { name:"Chevalier noir (Grand chef)", type:"pnj", img:"icons/creatures/humanoids/knight-armored-horned.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Humanoïde",description:"Armure (3). Don Brutal. Terrifiant. Chef des légions infernales."},
               traits:{combat:{valeur:5},robustesse:{valeur:4}}, sante:{pv:{value:15,min:0,max:15}},
               combat_stats:{armure:3,degats:3,difficulte:-6} }},
    { name:"Dragon ancien (Grand chef)", type:"pnj", img:"icons/creatures/reptiles/serpent-horned-green.webp",
      system:{ biographie:{peuple:"drakken",type_monstre:"Monstre",description:"Immunité feu et armes normales. Armure (3). Don Terrifiant."},
               traits:{combat:{valeur:5},robustesse:{valeur:5}}, sante:{pv:{value:15,min:0,max:15}},
               combat_stats:{armure:3,degats:3,difficulte:-6} }},
    { name:"Nécromancien (Grand chef)", type:"pnj", img:"icons/magic/death/skull-horned-worn-brown.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Humanoïde",description:"Dons Dominer, Soigner, Fuite. Armure magique (2)."},
               traits:{combat:{valeur:3},robustesse:{valeur:3}}, sante:{pv:{value:15,min:0,max:15}},
               combat_stats:{armure:2,degats:3,difficulte:-6} }},
    { name:"Loup (Prédateur)", type:"pnj", img:"icons/creatures/mammals/wolf-running-white.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Animal",description:"En meute. Don Morsure."},
               traits:{combat:{valeur:2},robustesse:{valeur:1}}, sante:{pv:{value:5,min:0,max:5}},
               combat_stats:{armure:0,degats:1,difficulte:-2} }},
    { name:"Serpent venimeux", type:"pnj", img:"icons/creatures/reptiles/serpent-coiled-blue.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Animal",description:"Don Poison : blessures ne guérissent pas sans magie."},
               traits:{combat:{valeur:1},robustesse:{valeur:1}}, sante:{pv:{value:1,min:0,max:1}},
               combat_stats:{armure:0,degats:1,difficulte:0} }},
    { name:"Mort-vivant guerrier", type:"pnj", img:"icons/creatures/undead/skeleton-armored-sword-shield.webp",
      system:{ biographie:{peuple:"humain",type_monstre:"Mort-vivant",description:"Immunisé armes normales. Sensible feu/magie. Armure (1)."},
               traits:{combat:{valeur:2},robustesse:{valeur:2}}, sante:{pv:{value:5,min:0,max:5}},
               combat_stats:{armure:1,degats:1,difficulte:-2} }},
  ]);

  // ══════════════════════════════════════════════════════════
  //  3. COMPENDIUM AVENTURIERS PRÉ-TIRÉS
  // ══════════════════════════════════════════════════════════
  const packAvt = await creerOuOuvrirPack("tnt-aventuriers", "T&T — Aventuriers pré-tirés", "Actor");
  await ajouterDocs(packAvt, [
    { name:"Helios — Guerrier Taurin", type:"aventurier", img:"icons/creatures/mammals/bull-horns-rage-brown.webp",
      system:{ biographie:{peuple:"taurin",classe:"guerrier",age:"28",reflexe:"Je me place entre mes compagnons et l'ennemi",signe:"loup_gris",destin_type:"Fatigue",description:"Vétéran des guerres du nord, cicatrices partout."},
               traits:{adresse:{valeur:1},combat:{valeur:4},erudition:{valeur:1},influence:{valeur:2},robustesse:{valeur:3},survie:{valeur:1}},
               sante:{pv:{value:8,min:0,max:8},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:2},
               langues:{royaumes:true,rouge:false,feuillu:false,telgesh:false,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
    { name:"Sivara — Magicienne Elfe", type:"aventurier", img:"icons/magic/symbols/rune-sigil-purple.webp",
      system:{ biographie:{peuple:"elfe",classe:"magicien",age:"300",reflexe:"Je note toujours les runes que je croise",signe:"dragon_noir",destin_type:"Tristesse",description:"Elfes née le jour de la grande éclipse. Marque : yeux vairons."},
               traits:{adresse:{valeur:2},combat:{valeur:1},erudition:{valeur:4},influence:{valeur:2},robustesse:{valeur:1},survie:{valeur:2}},
               sante:{pv:{value:6,min:0,max:6},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:1},
               langues:{royaumes:true,rouge:false,feuillu:true,telgesh:true,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
    { name:"Irma — Marchande Humaine", type:"aventurier", img:"icons/commodities/treasure/chest-wooden-tied-white.webp",
      system:{ biographie:{peuple:"humain",classe:"marchand",age:"32",reflexe:"Je récupère toujours quelque chose sur les morts",signe:"lamantin",destin_type:"Fatigue",description:"Tenancière de taverne reconvertie en aventurière. Connaît tout le monde."},
               traits:{adresse:{valeur:2},combat:{valeur:1},erudition:{valeur:2},influence:{valeur:4},robustesse:{valeur:1},survie:{valeur:2}},
               sante:{pv:{value:6,min:0,max:6},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:1},
               langues:{royaumes:true,rouge:true,feuillu:false,telgesh:false,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
    { name:"Arak — Rôdeur Wolfen", type:"aventurier", img:"icons/creatures/mammals/wolf-shadow-black.webp",
      system:{ biographie:{peuple:"wolfen",classe:"rodeur",age:"22",reflexe:"Je repère les sorties avant d'entrer",signe:"roi_cornu",destin_type:"Régression",description:"Chasseur solitaire. Son passage laisse une odeur de forêt et de sang."},
               traits:{adresse:{valeur:2},combat:{valeur:2},erudition:{valeur:1},influence:{valeur:1},robustesse:{valeur:2},survie:{valeur:4}},
               sante:{pv:{value:7,min:0,max:7},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:2},
               langues:{royaumes:true,rouge:false,feuillu:false,telgesh:false,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
    { name:"Thibaut — Templier Humain", type:"aventurier", img:"icons/magic/holy/barrier-shield-winged-cross.webp",
      system:{ biographie:{peuple:"humain",classe:"templier",age:"30",reflexe:"Je ne me sépare jamais de mon épée",signe:"lames",destin_type:"Fatigue",description:"Chevalier de l'Unique. Vœux de chasteté et de pauvreté — qu'il honore (à peu près)."},
               traits:{adresse:{valeur:1},combat:{valeur:3},erudition:{valeur:1},influence:{valeur:4},robustesse:{valeur:2},survie:{valeur:1}},
               sante:{pv:{value:7,min:0,max:7},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:2},
               langues:{royaumes:true,rouge:false,feuillu:false,telgesh:true,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
    { name:"Civette — Voleuse Kitling", type:"aventurier", img:"icons/creatures/mammals/cat-shadow-black.webp",
      system:{ biographie:{peuple:"kitling",classe:"voleur",age:"18",reflexe:"Je surveille toujours les arrières",signe:"crapaud_buffle",destin_type:"Maladresse",description:"Petite chatte aux sept vies. Dit toujours qu'elle était ailleurs."},
               traits:{adresse:{valeur:4},combat:{valeur:2},erudition:{valeur:1},influence:{valeur:2},robustesse:{valeur:1},survie:{valeur:2}},
               sante:{pv:{value:6,min:0,max:6},destin:{value:0,min:0,max:5}},
               combat_stats:{armure:2,degats:2},
               langues:{royaumes:true,rouge:false,feuillu:false,telgesh:false,pierreux:false,kriss:false},
               experience:0,points_aventure:0 }},
  ]);

  // ── Verrouiller les compendiums ─────────────────────────
  await packDons.configure({ locked: true });
  await packMonstres.configure({ locked: true });
  await packAvt.configure({ locked: true });

  ui.notifications.info("✅ T&T | Compendiums installés avec succès !");
  console.log("T&T | ══ Installation terminée ══");
})();
