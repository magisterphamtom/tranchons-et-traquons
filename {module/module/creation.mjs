/**
 * Assistant de Création de Personnage T&T
 * Méthode : Folle Jeunesse (4 jets de tables + 5 points libres)
 */
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

// Tables de la Folle Jeunesse (page 16 du livre)
const TABLES_JEUNESSE = {
  pays: {
    label: "Mon pays se trouve…",
    resultats: [
      { min:1, max:2, texte:"Au nord",           bonus:{ robustesse:1, survie:1 } },
      { min:3, max:4, texte:"Au sud",             bonus:{ influence:1, survie:1 } },
      { min:5, max:6, texte:"Sous un climat doux",bonus:{ adresse:1, erudition:1 } },
    ]
  },
  origine: {
    label: "Je viens…",
    resultats: [
      { min:1, max:2, texte:"D'un clan barbare",  bonus:{ robustesse:1, survie:1 } },
      { min:3, max:4, texte:"D'un village isolé", bonus:{ robustesse:1, adresse:1 } },
      { min:5, max:6, texte:"D'une ville",        bonus:{ influence:1, adresse:1 } },
    ]
  },
  pere: {
    label: "Mon père était…",
    resultats: [
      { min:1, max:2, texte:"Pauvre",             bonus:{ survie:1, adresse:1 } },
      { min:3, max:4, texte:"Un homme libre",     bonus:{ erudition:1, choix:1 } },
      { min:5, max:6, texte:"Noble ou aisé",      bonus:{ influence:1, choix:1 } },
    ]
  },
  education: {
    label: "J'ai reçu…",
    resultats: [
      { min:1, max:2, texte:"Une éducation martiale",   bonus:{ combat:1, robustesse:1 } },
      { min:3, max:4, texte:"Une éducation religieuse", bonus:{ influence:1, erudition:1 } },
      { min:5, max:6, texte:"Une éducation pratique",   bonus:{ adresse:1, survie:1 } },
    ]
  }
};

export class TnTCreation extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id:       "tnt-creation",
    classes:  ["tnt", "tnt-creation-app"],
    position: { width: 640, height: "auto" },
    window:   { title: "🎲 Créer un aventurier T&T", resizable: false }
  };

  static PARTS = {
    main: { template: "systems/tranchons-et-traquons/templates/creation/creation.hbs" }
  };

  constructor(options = {}) {
    super(options);
    this._etape = 1; // 1=peuple, 2=classe, 3=traits, 4=details, 5=recap
    this._data  = {
      nom: "", peuple: "humain", classe: "guerrier",
      traits: { adresse:0, combat:0, erudition:0, influence:0, robustesse:0, survie:0 },
      traitsBonus: {},
      jeunesse: { pays:null, origine:null, pere:null, education:null },
      pointsLibres: 5,
      choixLibres: 0,
      avantageNom: "", avantageScore: 1,
      faiblesseNom: "", reflexe: "",
      signe: "", age: ""
    };
  }

  get title() { return "🎲 Créer un aventurier T&T"; }

  async _prepareContext(options) {
    const TnT = CONFIG.TnT ?? {};
    return {
      etape:      this._etape,
      data:       this._data,
      peuples:    TnT.PEUPLES ?? {},
      classes:    TnT.CLASSES ?? {},
      traits:     TnT.TRAITS  ?? {},
      signes:     TnT.SIGNES  ?? {},
      tables:     TABLES_JEUNESSE,
      totalTraits: Object.values(this._data.traits).reduce((s,v) => s+v, 0),
      pvMax: (this._data.traits.robustesse || 0) + 5
        + (this._data.peuple === "nain" ? 2 : 0),
      jeunesseAffichage: Object.fromEntries(
        Object.entries(TABLES_JEUNESSE).map(([key]) => {
          const res = this._data.jeunesse[key];
          return [key, res ? { done: true, de: res.de, texte: res.texte } : { done: false }];
        })
      ),
      peupleLabel: (TnT.PEUPLES ?? {})[this._data.peuple]?.label ?? this._data.peuple,
      classeLabel: (TnT.CLASSES ?? {})[this._data.classe]?.label ?? this._data.classe,
    };
  }

  _onRender(context, options) {
    const html = this.element;

    // Clic sur cartes peuple/classe
    html.querySelectorAll("[data-key][data-value]").forEach(carte => {
      carte.addEventListener("click", () => {
        const key = carte.dataset.key;
        const val = carte.dataset.value;
        this._data[key] = val;
        // Mettre à jour score avantage = influence si peuple change
        if (key === "peuple") {
          // recalculer si les bonus de tables changent avec le peuple (ici non, mais bon)
        }
        this.render();
      });
    });

    // Navigation étapes
    html.querySelectorAll("[data-etape]").forEach(btn => {
      btn.addEventListener("click", ev => {
        const e = parseInt(ev.currentTarget.dataset.etape);
        this._etape = e;
        this.render();
      });
    });

    // Champs texte/select
    html.querySelectorAll("input[data-key], select[data-key], textarea[data-key]").forEach(el => {
      el.addEventListener("change", ev => {
        const key = ev.currentTarget.dataset.key;
        const val = ev.currentTarget.type === "number"
          ? parseInt(ev.currentTarget.value) || 0
          : ev.currentTarget.value;
        this._setNested(key, val);
        this.render();
      });
      el.addEventListener("input", ev => {
        const key = ev.currentTarget.dataset.key;
        if (ev.currentTarget.tagName === "TEXTAREA" || ev.currentTarget.type === "text") {
          this._setNested(key, ev.currentTarget.value);
        }
      });
    });

    // Boutons jets de tables
    html.querySelectorAll("[data-roll-table]").forEach(btn => {
      btn.addEventListener("click", async ev => {
        const table = ev.currentTarget.dataset.rollTable;
        await this._lancerTable(table);
      });
    });

    // Boutons +/- traits libres
    html.querySelectorAll("[data-trait-plus]").forEach(btn => {
      btn.addEventListener("click", ev => {
        const trait = ev.currentTarget.dataset.traitPlus;
        if (this._data.pointsLibres > 0 && this._data.traits[trait] < 5) {
          this._data.traits[trait]++;
          this._data.pointsLibres--;
          this.render();
        }
      });
    });

    html.querySelectorAll("[data-trait-moins]").forEach(btn => {
      btn.addEventListener("click", ev => {
        const trait = ev.currentTarget.dataset.traitMoins;
        const bonus = this._data.traitsBonus[trait] ?? 0;
        if (this._data.traits[trait] > bonus) {
          this._data.traits[trait]--;
          this._data.pointsLibres++;
          this.render();
        }
      });
    });

    // Choix libres (père noble/libre)
    html.querySelectorAll("[data-choix-trait]").forEach(btn => {
      btn.addEventListener("click", ev => {
        if (this._data.choixLibres > 0) {
          const trait = ev.currentTarget.dataset.choixTrait;
          if (this._data.traits[trait] < 5) {
            this._data.traits[trait]++;
            this._data.choixLibres--;
            this.render();
          }
        }
      });
    });

    // Bouton créer le personnage
    html.querySelector("[data-action='creer']")?.addEventListener("click", async () => {
      await this._creerPersonnage();
    });
  }

  _setNested(key, val) {
    const parts = key.split(".");
    let obj = this._data;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
  }

  async _lancerTable(nomTable) {
    const table  = TABLES_JEUNESSE[nomTable];
    if (!table) return;
    const roll = new Roll("1d6");
    await roll.evaluate();
    const r   = roll.total;
    const res = table.resultats.find(t => r >= t.min && r <= t.max);
    if (!res) return;

    this._data.jeunesse[nomTable] = { texte: res.texte, de: r, bonus: res.bonus };

    // Recalculer tous les traits depuis les bonus des tables
    this._recalculerTraitsBonus();

    await ChatMessage.create({
      content: `<div style="font-family:serif;padding:6px;border:1px solid #c9943c;border-radius:4px;background:#f5e6c8">
        <b>${table.label}</b> → [${r}] <em>${res.texte}</em><br>
        <small>Bonus : ${Object.entries(res.bonus).map(([k,v]) => `+${v} ${k}`).join(", ")}</small>
      </div>`
    });
    this.render();
  }

  _recalculerTraitsBonus() {
    // Remettre à zéro les bonus
    const bonus = { adresse:0, combat:0, erudition:0, influence:0, robustesse:0, survie:0 };
    this._data.choixLibres = 0;

    for (const res of Object.values(this._data.jeunesse)) {
      if (!res?.bonus) continue;
      for (const [trait, val] of Object.entries(res.bonus)) {
        if (trait === "choix") { this._data.choixLibres += val; }
        else { bonus[trait] = (bonus[trait] ?? 0) + val; }
      }
    }
    this._data.traitsBonus = { ...bonus };

    // Recalculer les traits (bonus + points libres déjà dépensés)
    const pointsDependus = { adresse:0, combat:0, erudition:0, influence:0, robustesse:0, survie:0 };
    for (const [t, v] of Object.entries(this._data.traits)) {
      const ancienBonus = this._data.traitsBonus[t] ?? 0;
      pointsDependus[t] = Math.max(0, v - ancienBonus);
    }
    // Mettre à jour les traits avec les nouveaux bonus
    for (const t of Object.keys(bonus)) {
      this._data.traits[t] = Math.max(1, bonus[t] + pointsDependus[t]);
    }
  }

  async _creerPersonnage() {
    const d  = this._data;
    const nom = d.nom || "Nouvel aventurier";

    // Créer l'acteur Foundry
    const traits = {};
    for (const [k, v] of Object.entries(d.traits)) {
      traits[k] = { valeur: Math.max(0, Math.min(5, v)) };
    }

    const pvMax = (traits.robustesse?.valeur ?? 0) + 5 + (d.peuple === "nain" ? 2 : 0);

    const actorData = {
      name: nom,
      type: "aventurier",
      system: {
        biographie: {
          peuple: d.peuple, classe: d.classe,
          signe: d.signe, age: d.age, reflexe: d.reflexe
        },
        traits,
        sante: { pv: { value: pvMax, min: 0, max: pvMax }, destin: { value: 0 } },
        experience: 0, points_aventure: 0,
        langues: this._languesDepart(d.peuple)
      }
    };

    const actor = await Actor.create(actorData);

    // Ajouter l'avantage de départ
    if (d.avantageNom) {
      await Item.create({
        name: d.avantageNom, type: "avantage",
        system: { score: d.avantageScore, description: "Avantage de départ", utilise: false }
      }, { parent: actor });
    }

    // Ajouter la faiblesse de classe
    const TnT = CONFIG.TnT ?? {};
    const classeInfo = TnT.CLASSES?.[d.classe];
    if (classeInfo) {
      const nomFaiblesse = d.faiblesseNom || `${classeInfo.label} — faiblesse de classe`;
      await Item.create({
        name: nomFaiblesse, type: "faiblesse",
        system: { description: "Faiblesse de classe" }
      }, { parent: actor });
    }

    // Ouvrir la fiche
    actor.sheet.render(true);
    this.close();

    ui.notifications.info(`✅ ${nom} est prêt à l'aventure !`);
    await ChatMessage.create({
      content: `<div style="font-family:serif;text-align:center;padding:10px;border:2px solid #c9943c;border-radius:6px;background:#f5e6c8">
        <div style="font-size:1.2em;font-weight:bold;color:#3a2410">⚔ Nouvel aventurier !</div>
        <p><strong>${nom}</strong> — ${classeInfo?.label ?? d.classe} ${TnT.PEUPLES?.[d.peuple]?.label ?? d.peuple}</p>
        <p style="font-size:0.85em;color:#666">PV : ${pvMax} · Traits : ${Object.values(d.traits).reduce((s,v)=>s+v,0)}/20</p>
      </div>`
    });
  }

  _languesDepart(peuple) {
    const map = {
      elfe: { royaumes:true, feuillu:true },
      nain: { royaumes:false, pierreux:true },
      krisling: { royaumes:false, kriss:true },
      wolfen: { royaumes:true },
      taurin: { royaumes:true },
      kitling: { royaumes:true },
    };
    return { royaumes:true, rouge:false, feuillu:false, telgesh:false, pierreux:false, kriss:false, ...(map[peuple] ?? {}) };
  }

  static ouvrir() {
    const existing = Object.values(ui.windows).find(w => w instanceof TnTCreation);
    if (existing) { existing.bringToFront(); return; }
    new TnTCreation().render(true);
  }
}
