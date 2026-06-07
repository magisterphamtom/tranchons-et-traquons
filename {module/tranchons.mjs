/**
 * Tranchons & Traquons — Système Foundry VTT v13
 * Jeu de Kobayashi, sous licence CC-BY-NC 2.0
 */

import { TnTActor }       from "./module/actor/actor.mjs";
import { TnTActorSheet }  from "./module/actor/actor-sheet.mjs";
import { TnTItem }        from "./module/item/item.mjs";
import { TnTItemSheet }   from "./module/item/item-sheet.mjs";
import { TnTRoll }        from "./module/dice/roll.mjs";
import { TnTCombat }      from "./module/combat.mjs";
import { TnTWiki }        from "./module/wiki.mjs";
import { TnTJetDialog }   from "./module/jet-dialog.mjs";
import { TnTInitiative }  from "./module/initiative.mjs";
import { TnTCreation }   from "./module/creation.mjs";
import { piocherCarte, utiliserCarte, CARTES_EVENEMENT } from "./module/cartes.mjs";
import { TnT }            from "./module/config.mjs";

/* -------------------------------------------------- */
/*  Initialisation                                     */
/* -------------------------------------------------- */
Hooks.once("init", () => {
  console.log("T&T | Initialisation de Tranchons & Traquons");

  // Stocker la config dans le namespace global
  game.tnt = { TnTActor, TnTItem, TnTRoll, TnTCombat, TnTWiki, TnTJetDialog, TnTInitiative, TnTCreation, piocherCarte, utiliserCarte, CARTES_EVENEMENT, config: TnT };

  // ── Initiative : formule 2D6 + Adresse ─────────────
  CONFIG.Combat.initiative = {
    formula: "2d6 + @traits.adresse.valeur",
    decimals: 0
  };

  // Constantes de configuration
  CONFIG.TnT = TnT;

  // Enregistrer les classes Document
  CONFIG.Actor.documentClass = TnTActor;
  CONFIG.Item.documentClass  = TnTItem;

  // ActorSheetV2 et ItemSheetV2 s'enregistrent normalement
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("tranchons-et-traquons", TnTActorSheet, {
    types:       ["aventurier", "pnj"],
    makeDefault: true,
    label:       "T&T | Fiche Personnage"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("tranchons-et-traquons", TnTItemSheet, {
    makeDefault: true,
    label:       "T&T | Fiche Item"
  });

  // ── Barre de santé token ───────────────────────────
  // Pointer la barre 1 vers system.sante.pv pour tous les types
  CONFIG.Actor.trackableAttributes = {
    aventurier: {
      bar: ["sante.pv"],
      value: ["sante.destin.value", "experience", "combat_stats.armure"]
    },
    pnj: {
      bar: ["sante.pv"],
      value: ["combat_stats.armure", "combat_stats.difficulte"]
    }
  };

  // Helpers Handlebars
  _registerHandlebarsHelpers();

  // Précharger les templates
  preloadHandlebarsTemplates();
});

/* -------------------------------------------------- */
/*  Ready                                             */
/* -------------------------------------------------- */
Hooks.once("ready", () => {
  console.log("T&T | Système prêt !");

  // Ouvrir le wiki au démarrage (seulement pour le MJ)
  if (game.user.isGM) {
    setTimeout(() => TnTWiki.open(), 800);
  }
});

/* ── Barre de token par défaut ────────────────────── */
Hooks.on("preCreateToken", (tokenDoc, data, options, userId) => {
  // Si pas encore configuré, pointer la barre 1 sur les PV
  if (!data.bar1?.attribute) {
    tokenDoc.updateSource({
      "bar1.attribute": "sante.pv",
      "displayBars":    CONST.TOKEN_DISPLAY_MODES.ALWAYS
    });
  }
});

/* ── Rendu personnalisé de la barre de PV ─────────── */
Hooks.on("drawToken", (token) => {
  _styliserBarreToken(token);
});

Hooks.on("refreshToken", (token) => {
  _styliserBarreToken(token);
});

function _styliserBarreToken(token) {
  try {
    const bar = token.bars?.bar1;
    if (!bar) return;

    const actor = token.actor;
    if (!actor) return;

    const pvVal  = actor.pvValue ?? actor.system.sante?.pv?.value ?? 0;
    const pvMax  = actor.pvMax   ?? actor.system.sante?.pv?.max   ?? 1;
    const pct    = Math.max(0, Math.min(1, pvVal / pvMax));

    // Couleur selon les PV : vert → orange → rouge
    let couleur;
    if (pct > 0.6)      couleur = 0x4caf50;  // vert
    else if (pct > 0.3) couleur = 0xff9800;  // orange
    else                couleur = 0xf44336;  // rouge

    // Redessiner la barre avec notre couleur
    bar.clear();

    // Fond sombre
    bar.beginFill(0x000000, 0.5);
    bar.drawRect(0, 0, bar.width || 100, bar.height || 8);
    bar.endFill();

    // Barre de vie
    bar.beginFill(couleur, 0.9);
    bar.drawRect(0, 0, (bar.width || 100) * pct, bar.height || 8);
    bar.endFill();

    // Bordure or T&T
    bar.lineStyle(1, 0xc9943c, 0.8);
    bar.drawRect(0, 0, bar.width || 100, bar.height || 8);
    bar.lineStyle(0);
  } catch(e) {
    // Silencieux — le token n'est peut-être pas encore prêt
  }
}

/* ── Bouton Wiki dans la sidebar droite (onglet Journal) ── */
Hooks.on("renderJournalDirectory", (_app, html) => {
  const el = html instanceof HTMLElement ? html : html[0];
  if (!el) return;
  if (el.querySelector("#tnt-wiki-btn")) return;

  const btn = document.createElement("button");
  btn.id = "tnt-wiki-btn";
  btn.type = "button";
  btn.innerHTML = `<i class="fas fa-book-open"></i> Wiki T&T — Règles`;
  btn.style.cssText = `
    width: 100%;
    margin: 6px 0 2px 0;
    padding: 6px 10px;
    background: linear-gradient(135deg, #3a2410, #5c3d1e);
    color: #e8c97a;
    border: 1px solid #c9943c;
    border-radius: 4px;
    cursor: pointer;
    font-family: "Palatino Linotype", Georgia, serif;
    font-size: 0.85em;
    font-weight: bold;
    letter-spacing: 0.04em;
    text-align: left;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "linear-gradient(135deg, #5c3d1e, #8b5e2e)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "linear-gradient(135deg, #3a2410, #5c3d1e)";
  });

  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    TnTWiki.open();
  });

  // Insérer en bas du header de la sidebar journal
  const footer = el.querySelector(".directory-footer")
                ?? el.querySelector(".directory-header")
                ?? el;
  footer.appendChild(btn);
});

/* ── Bouton Création de personnage dans la sidebar Actors ── */
Hooks.on("renderActorDirectory", (_app, html) => {
  const el = html instanceof HTMLElement ? html : html[0];
  if (!el) return;
  if (el.querySelector("#tnt-creation-btn")) return;

  const btn = document.createElement("button");
  btn.id = "tnt-creation-btn";
  btn.type = "button";
  btn.innerHTML = `<i class="fas fa-user-plus"></i> Créer un aventurier T&T`;
  btn.style.cssText = `
    width: 100%;
    margin: 6px 0 2px 0;
    padding: 6px 10px;
    background: linear-gradient(135deg, #1a3a1a, #2a5a2a);
    color: #a8d8a8;
    border: 1px solid #4a8a4a;
    border-radius: 4px;
    cursor: pointer;
    font-family: "Palatino Linotype", Georgia, serif;
    font-size: 0.85em;
    font-weight: bold;
    letter-spacing: 0.04em;
    text-align: left;
  `;
  btn.addEventListener("mouseenter", () => {
    btn.style.background = "linear-gradient(135deg, #2a5a2a, #3a6a3a)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "linear-gradient(135deg, #1a3a1a, #2a5a2a)";
  });
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    TnTCreation.ouvrir();
  });

  const footer = el.querySelector(".directory-footer")
              ?? el.querySelector(".directory-header")
              ?? el;
  footer.appendChild(btn);
});

/* ── Délégation clic bouton armure dans le chat ───── */
Hooks.on("renderChatMessage", (_msg, html) => {
  // En V13, html peut être un HTMLElement ou un objet jQuery-like
  const el = html instanceof HTMLElement ? html : html[0] ?? html;
  if (!el?.querySelectorAll) return;
  el.querySelectorAll(".tnt-btn-armure").forEach(btn => {
    btn.addEventListener("click", async ev => {
      ev.preventDefault();
      const { actorId, attaquantId, degats } = ev.currentTarget.dataset;
      await TnTCombat.utiliserArmure(actorId, attaquantId, parseInt(degats));
    });
  });
});

/* -------------------------------------------------- */
/*  Helpers Handlebars                                */
/* -------------------------------------------------- */
function _registerHandlebarsHelpers() {

  // Affiche des étoiles selon le score du trait (1-5)
  Handlebars.registerHelper("traitEtoiles", (valeur) => {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span class="etoile ${i <= valeur ? "active" : ""}" data-val="${i}">★</span>`;
    }
    return new Handlebars.SafeString(html);
  });

  // Label lisible du niveau de trait
  Handlebars.registerHelper("traitLabel", (valeur) => {
    const labels = { 0:"Faible", 1:"Moyen", 2:"Bon", 3:"Supérieur", 4:"Excellent", 5:"Légendaire" };
    return labels[valeur] ?? valeur;
  });

  // Calcule les dégâts selon le score de combat
  Handlebars.registerHelper("degatsParCombat", (combat) => {
    if (combat <= 2) return 1;
    if (combat <= 4) return 2;
    return 3;
  });

  // Pourcentage PV pour la barre
  Handlebars.registerHelper("pv_pct", (val, max) => Math.round((val / Math.max(1, max)) * 100));

  // Arithmétique simple
  Handlebars.registerHelper("gt",  (a, b) => a >  b);
  Handlebars.registerHelper("lt",  (a, b) => a <  b);
  Handlebars.registerHelper("add", (a, b) => a +  b);
  Handlebars.registerHelper("sub", (a, b) => a -  b);
  Handlebars.registerHelper("eq",  (a, b) => a === b);

  // array(...args) → construit un tableau depuis les arguments
  Handlebars.registerHelper("array", (...args) => {
    args.pop(); // retire le hash Handlebars
    return args;
  });

  // Vérifie l'égalité
  Handlebars.registerHelper("eq", (a, b) => a === b);

  // Comparaisons
  Handlebars.registerHelper("lte", (a, b) => a <= b);
  Handlebars.registerHelper("gte", (a, b) => a >= b);

  // range(start, end) → [start, start+1, ..., end-1]
  Handlebars.registerHelper("range", (start, end) => {
    const arr = [];
    for (let i = start; i < end; i++) arr.push(i);
    return arr;
  });

  // Label des points de destin
  Handlebars.registerHelper("destins", (valeur) => {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<span class="destin-point ${i <= valeur ? "active" : ""}">◆</span>`;
    }
    return new Handlebars.SafeString(html);
  });
}

/* -------------------------------------------------- */
/*  Préchargement templates                           */
/* -------------------------------------------------- */
async function preloadHandlebarsTemplates() {
  const paths = [
    "systems/tranchons-et-traquons/templates/actor/aventurier-sheet.hbs",
    "systems/tranchons-et-traquons/templates/actor/pnj-sheet.hbs",
    "systems/tranchons-et-traquons/templates/partials/roll-chat.hbs",
    "systems/tranchons-et-traquons/templates/partials/combat-chat.hbs",
    "systems/tranchons-et-traquons/templates/item/item-sheet.hbs",
    "systems/tranchons-et-traquons/templates/wiki/wiki.hbs",
    "systems/tranchons-et-traquons/templates/dialogs/jet-trait.hbs",
    "systems/tranchons-et-traquons/templates/creation/creation.hbs"
  ];
  return foundry.applications.handlebars.loadTemplates(paths);
}

/* ── Initiative T&T ────────────────────────────────── */
Hooks.on("renderCombatTracker", (app, html, data) => {
  if (!game.user.isGM) return;
  // Ajouter un bouton Initiative en haut du tracker
  const header = html.querySelector(".combat-tracker-header, .directory-header");
  if (!header || html.querySelector(".tnt-init-btn")) return;
  const btn = document.createElement("button");
  btn.className = "tnt-init-btn";
  btn.title = "T&T — Initiative (2D6 + Adresse)";
  btn.innerHTML = "<i class='fas fa-bolt'></i> Initiative";
  btn.style.cssText = "width:100%;margin:4px 0;padding:4px;background:linear-gradient(135deg,#3a2410,#2c1810);color:#c9943c;border:1px solid #c9943c;border-radius:4px;cursor:pointer;font-family:inherit;font-size:0.85em;";
  btn.addEventListener("click", () => TnTInitiative.lancerInitiative());
  header.after(btn);
});

Hooks.on("combatStart", async (combat) => {
  if (!game.user.isGM) return;
  const ok = await foundry.applications.api.DialogV2.confirm({
    window:  { title: "Initiative T&T" },
    content: "<p>Lancer l'initiative pour tous les combattants ?</p><p><em>2D6 + Adresse — le meilleur résultat agit en premier.</em></p>"
  });
  if (ok) await TnTInitiative.lancerInitiative();
});
