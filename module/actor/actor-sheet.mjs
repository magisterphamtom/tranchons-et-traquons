const { ActorSheetV2 }            = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class TnTActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes:  ["tnt", "sheet", "actor"],
    position: { width: 800, height: 920 },
    window:   { resizable: true },
    form:     { submitOnChange: false, closeOnSubmit: false },
    dragDrop: [{ dropSelector: ".sheet-body" }],
    actions: {
      traitRoll:      TnTActorSheet._onTraitRoll,
      attaquer:       TnTActorSheet._onAttaquer,
      itemCreate:     TnTActorSheet._onItemCreate,
      itemEdit:       TnTActorSheet._onItemEdit,
      itemDelete:     TnTActorSheet._onItemDelete,
      avantageUse:    TnTActorSheet._onAvantageUse,
      pvClick:        TnTActorSheet._onPvClick,
      destinClick:    TnTActorSheet._onDestinClick,
      reposCourt:     TnTActorSheet._onReposCourt,
      reposLong:      TnTActorSheet._onReposLong,
      piocherCarte:   TnTActorSheet._onPiocherCarte,
      utiliserCarte:  TnTActorSheet._onUtiliserCarte,
      defausserCarte: TnTActorSheet._onDefausserCarte,
      voirCarte:      TnTActorSheet._onVoirCarte,
      nouvellePartie: TnTActorSheet._onNouvellePartie,
    }
  };

  static PARTS = {
    aventurier: { template: "systems/tranchons-et-traquons/templates/actor/aventurier-sheet.hbs" },
    pnj:        { template: "systems/tranchons-et-traquons/templates/actor/pnj-sheet.hbs" }
  };

  constructor(options = {}) {
    super(options);
    this._activeTab = "traits";
  }

  get title() {
    const typeLabel = game.i18n.localize(`TYPES.Actor.${this.actor.type}`) ?? this.actor.type;
    return `${this.actor.name} — ${typeLabel}`;
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [this.actor.type];
  }

  /* ── Contexte ─────────────────────────────────── */
  async _prepareContext(options) {
    const ctx    = await super._prepareContext(options);
    const actor  = this.actor;
    const system = actor.system;

    ctx.actor  = actor;
    ctx.system = system;
    ctx.config = CONFIG.TnT ?? {};

    ctx.pvMax       = actor.pvMax       ?? 6;
    ctx.pvValue     = actor.pvValue     ?? ctx.pvMax;
    ctx.degats      = actor.degats      ?? 1;
    ctx.armure      = actor.armure      ?? 2;
    ctx.totalTraits = actor.totalTraits ?? 0;

    ctx.pvRange     = Array.from({ length: ctx.pvMax }, (_, i) => i + 1);
    ctx.destinRange = [1, 2, 3, 4, 5];
    ctx.destinValue = system.sante?.destin?.value ?? 0;

    // toObject() — plain JS sans proxy
    const actorPlain  = actor.toObject(false);
    const traitsPlain = actorPlain?.system?.traits ?? {};
    ctx.traitsListe = Object.entries(CONFIG.TnT?.TRAITS ?? {}).map(([key, cfg]) => ({
      key, label: cfg.label, icon: cfg.icon,
      valeur: traitsPlain[key]?.valeur ?? 0
    }));

    ctx.totalTraits = Object.values(traitsPlain).reduce((s, t) => s + (t?.valeur ?? 0), 0);

    const languesData = system.langues ?? {};
    ctx.langues = Object.entries(CONFIG.TnT?.LANGUES ?? {}).map(([key, label]) => ({
      key, label, valeur: languesData[key] === true
    }));

    ctx.xp             = system.experience      ?? 0;
    ctx.pointsAventure = system.points_aventure ?? 0;

    ctx.avantages   = actor.items.filter(i => i.type === "avantage");
    ctx.faiblesses  = actor.items.filter(i => i.type === "faiblesse");
    ctx.dons        = actor.items.filter(i => i.type === "don");
    ctx.armes       = actor.items.filter(i => i.type === "arme");
    ctx.equipements = actor.items.filter(i => i.type === "equipement");

    ctx.peupleChoices = Object.fromEntries(Object.entries(CONFIG.TnT?.PEUPLES ?? {}).map(([k,v]) => [k,v.label]));
    ctx.classeChoices = Object.fromEntries(Object.entries(CONFIG.TnT?.CLASSES ?? {}).map(([k,v]) => [k,v.label]));
    ctx.signeChoices  = CONFIG.TnT?.SIGNES ?? {};

    ctx.peupleInfo = CONFIG.TnT?.PEUPLES?.[system.biographie?.peuple] ?? null;
    ctx.classeInfo = CONFIG.TnT?.CLASSES?.[system.biographie?.classe] ?? null;

    // Portrait de classe/peuple
    const classe = system.biographie?.classe ?? "";
    const peuple = system.biographie?.peuple ?? "";
    ctx.portraitClasse = CONFIG.TnT?.PORTRAITS_CLASSES?.[classe] ?? null;
    ctx.portraitPeuple = CONFIG.TnT?.PORTRAITS_PEUPLES?.[peuple] ?? null;
    // Priorité : portrait de peuple spécifique si disponible, sinon portrait de classe
    ctx.portraitSecondaire = ctx.portraitPeuple ?? ctx.portraitClasse ?? null;

    ctx.bio = {
      peuple:       system.biographie?.peuple       ?? "humain",
      classe:       system.biographie?.classe       ?? "guerrier",
      age:          system.biographie?.age          ?? "",
      taille:       system.biographie?.taille       ?? "",
      poids:        system.biographie?.poids        ?? "",
      signe:        system.biographie?.signe        ?? "",
      reflexe:      system.biographie?.reflexe      ?? "",
      destin_type:  system.biographie?.destin_type  ?? "",
      description:  system.biographie?.description  ?? "",
      notes:        system.biographie?.notes        ?? "",
      type_monstre: system.biographie?.type_monstre ?? ""
    };

    const { CARTES_EVENEMENT } = await import("../cartes.mjs");
    const mainIds = system.cartes_en_main ?? [];
    ctx.cartesEnMain = mainIds.map(id => CARTES_EVENEMENT.find(c => c.id === id)).filter(Boolean);
    const activeId   = system.carte_active;
    ctx.carteActive  = activeId ? (CARTES_EVENEMENT.find(c => c.id === activeId) ?? null) : null;

    ctx.tabs      = this._getTabs();
    ctx.activeTab = this._activeTab;

    return ctx;
  }

  _getTabs() {
    const defs = [
      { id:"traits",     label:"Traits",    icon:"fas fa-fist-raised" },
      { id:"avantages",  label:"Avantages", icon:"fas fa-star" },
      { id:"dons",       label:"Dons",      icon:"fas fa-magic" },
      { id:"equipement", label:"Besace",    icon:"fas fa-backpack" },
      { id:"biographie", label:"Bio",       icon:"fas fa-scroll" }
    ];
    return defs.map(t => ({ ...t, active: t.id === this._activeTab }));
  }

  /* ── Render ───────────────────────────────────── */
  _onRender(context, options) {
    const html = this.element;

    // Onglets
    html.querySelectorAll(".sheet-tabs .item").forEach(tab => {
      tab.addEventListener("click", ev => {
        ev.preventDefault();
        this._activeTab = ev.currentTarget.dataset.tab;
        html.querySelectorAll(".sheet-tabs .item").forEach(t => t.classList.remove("active"));
        html.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        ev.currentTarget.classList.add("active");
        html.querySelector(`.tab[data-tab="${this._activeTab}"]`)?.classList.add("active");
      });
    });

    html.querySelector(`.sheet-tabs .item[data-tab="${this._activeTab}"]`)?.classList.add("active");
    html.querySelector(`.tab[data-tab="${this._activeTab}"]`)?.classList.add("active");

    // Portrait
    html.querySelector(".profile-img")?.addEventListener("click", () => {
      new foundry.applications.apps.FilePicker.implementation({ type:"image", current:this.actor.img, callback: path => this.actor.update({ img: path }) }).browse();
    });

    // ── Étoiles — attachment différé (DOM pas encore prêt au moment du render) ──
    setTimeout(() => {
      this.element.querySelectorAll(".etoile").forEach(etoile => {
        etoile.addEventListener("click", async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const row    = etoile.closest("[data-trait]");
          if (!row) return;
          const key    = row.dataset.trait;
          const newVal = parseInt(etoile.dataset.val);
          const plain  = this.actor.toObject(false);
          const cur    = plain?.system?.traits?.[key]?.valeur ?? 0;
          const valeur = (newVal === cur) ? Math.max(0, newVal - 1) : newVal;

          row.querySelectorAll(".etoile").forEach(e =>
            e.classList.toggle("active", parseInt(e.dataset.val) <= valeur)
          );
          const niveaux = {0:"Faible",1:"Moyen",2:"Bon",3:"Supérieur",4:"Excellent",5:"Légendaire"};
          const niveauEl = row.querySelector(".trait-niveau");
          if (niveauEl) niveauEl.textContent = niveaux[valeur] ?? valeur;

          await this.actor.update({ [`system.traits.${key}.valeur`]: valeur }, { render: false });

          // Robustesse modifie les PV max
          if (key === "robustesse") TnTActorSheet._rafraichirPV.call(this);

          const totalEl = this.element.querySelector(".total-traits");
          if (totalEl) {
            const cles = ["adresse","combat","erudition","influence","robustesse","survie"];
            const fr = this.actor.toObject(false);
            const total = cles.reduce((s,k) => s + (fr?.system?.traits?.[k]?.valeur ?? 0), 0);
            totalEl.textContent = `Total traits : ${total} / 20`;
            totalEl.classList.toggle("max", total >= 20);
          }
        });
      });
    }, 50);

    // Champs
    html.querySelectorAll("input[data-field], select[data-field], textarea[data-field], input[name], select[name], textarea[name]").forEach(el => {
      el.addEventListener("change", this.#onFieldChange.bind(this));
    });

    // Drag & drop
    const body = html.querySelector(".sheet-body");
    body?.addEventListener("dragover", ev => { ev.preventDefault(); body.classList.add("drag-over"); });
    body?.addEventListener("dragleave", () => body.classList.remove("drag-over"));
    body?.addEventListener("drop", ev => { body.classList.remove("drag-over"); this._onDrop(ev); });
  }

  async #onFieldChange(ev) {
    const el  = ev.currentTarget;
    const key = el.dataset.field ?? el.name;
    if (!key) return;
    const val = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value;
    await this.actor.update({ [key]: val });
  }

  /* ── Drop ─────────────────────────────────────── */
  async _onDrop(event) {
    let data;
    try { data = JSON.parse(event.dataTransfer?.getData("text/plain") ?? "{}"); } catch { return; }
    if (data.type !== "Item") return;
    let item;
    try { item = await fromUuid(data.uuid); } catch { return; }
    if (!item) return;
    const typesAcceptes = ["don","avantage","faiblesse","arme","equipement"];
    if (!typesAcceptes.includes(item.type)) { ui.notifications.warn(`Type "${item.type}" non accepté.`); return; }
    if (item.type === "don"      && this.actor.items.filter(i => i.type === "don").length >= 5)      { ui.notifications.warn("Maximum 5 dons !"); return; }
    if (item.type === "avantage" && this.actor.items.filter(i => i.type === "avantage").length >= 5) { ui.notifications.warn("Maximum 5 avantages !"); return; }
    await Item.create(item.toObject(), { parent: this.actor });
    ui.notifications.info(`✅ ${item.name} ajouté à ${this.actor.name} !`);
  }

  /* ── Actions statiques ────────────────────────── */
  static async _onTraitRoll(ev, target) {
    const key = target.closest("[data-trait]").dataset.trait;
    const { TnTJetDialog } = await import("../jet-dialog.mjs");
    await TnTJetDialog.ouvrir(this.actor, key);
  }

  static async _onAttaquer() { await this.actor.attaquer(); }

  static async _onPvClick(ev, target) {
    const val = parseInt(target.dataset.val);
    target.closest(".pv-boxes")?.querySelectorAll(".pv-box").forEach(b =>
      b.classList.toggle("active", parseInt(b.dataset.val) <= val)
    );
    await this.actor.update({ "system.sante.pv.value": val }, { render: false });
  }

  static async _onDestinClick(ev, target) {
    const val     = parseInt(target.dataset.val);
    const current = this.actor.system.sante?.destin?.value ?? 0;
    const nouveau = (val === current) ? Math.max(0, val - 1) : val;

    // Mise à jour visuelle losanges immédiate
    target.closest(".destin-points")?.querySelectorAll(".destin-point").forEach(p =>
      p.classList.toggle("active", parseInt(p.dataset.val) <= nouveau)
    );

    await this.actor.update({ "system.sante.destin.value": Math.max(0, nouveau) }, { render: false });

    // Recalculer pvMax et mettre à jour visuellement
    TnTActorSheet._rafraichirPV.call(this);
  }

  static _rafraichirPV() {
    const actor  = this.actor;
    const plain  = actor.toObject(false);
    const sys    = plain?.system ?? {};
    const rob    = sys.traits?.robustesse?.valeur ?? 0;
    const peuple = sys.biographie?.peuple ?? "humain";
    const destin = sys.sante?.destin?.value ?? 0;
    const bonusNain = peuple === "nain" ? 2 : 0;
    const pvMax  = rob + 5 + bonusNain + destin;
    const pvVal  = Math.min(sys.sante?.pv?.value ?? pvMax, pvMax);

    // Sauvegarder pvMax silencieusement
    actor.update({ "system.sante.pv.max": pvMax }, { render: false });

    // Mise à jour visuelle SANS re-render — reconstruire les cases si nécessaire
    const sheet = actor.sheet?.element;
    if (!sheet) return;

    const pvBoxesContainer = sheet.querySelector(".pv-boxes");
    if (pvBoxesContainer) {
      // Reconstruire les cases si le nombre a changé
      const actuel = pvBoxesContainer.querySelectorAll(".pv-box").length;
      if (actuel !== pvMax) {
        pvBoxesContainer.innerHTML = "";
        for (let i = 1; i <= pvMax; i++) {
          const box = document.createElement("span");
          box.className = `pv-box${i <= pvVal ? " active" : ""}`;
          box.dataset.action = "pvClick";
          box.dataset.val = i;
          pvBoxesContainer.appendChild(box);
        }
      } else {
        pvBoxesContainer.querySelectorAll(".pv-box").forEach(b =>
          b.classList.toggle("active", parseInt(b.dataset.val) <= pvVal)
        );
      }
    }

    const pvText = sheet.querySelector(".pv-text");
    if (pvText) pvText.textContent = `${pvVal} / ${pvMax}`;
  }

  static async _onItemCreate(ev, target) {
    const type = target.dataset.type;
    const noms = { avantage:"Nouvel Avantage", faiblesse:"Nouvelle Faiblesse", don:"Nouveau Don", arme:"Nouvelle Arme", equipement:"Nouvel Équipement" };
    await Item.create({ name: noms[type] ?? "Item", type }, { parent: this.actor });
  }

  static async _onItemEdit(ev, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    this.actor.items.get(id)?.sheet.render(true);
  }

  static async _onItemDelete(ev, target) {
    const id   = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    const ok = await foundry.applications.api.DialogV2.confirm({ window:{title:"Supprimer"}, content:`<p>Supprimer <strong>${item.name}</strong> ?</p>` });
    if (ok) await item.delete();
  }

  static async _onAvantageUse(ev, target) {
    const id   = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(id);
    if (item) await item.update({ "system.utilise": !item.system.utilise });
  }

  static async _onReposCourt() {
    await TnTActorSheet._appliquerRepos.call(this, 1, "💤 Repos court", "récupère 1 PV");
  }

  static async _onReposLong() {
    await TnTActorSheet._appliquerRepos.call(this, 2, "🌙 Repos long", "récupère 2 PV (nuit complète)");
  }

  static async _appliquerRepos(montant, titre, label) {
    const actor  = this.actor;
    const pvVal  = actor.system.sante?.pv?.value ?? 0;
    const pvMax  = actor.pvMax ?? actor.system.sante?.pv?.max ?? 6;

    if (pvVal >= pvMax) {
      ui.notifications.info(`${actor.name} est déjà à pleine santé !`);
      return;
    }

    const newPv = Math.min(pvVal + montant, pvMax);
    const gain  = newPv - pvVal;

    await actor.update({ "system.sante.pv.value": newPv }, { render: false });

    // Mise à jour visuelle
    const sheet = actor.sheet?.element;
    if (sheet) {
      sheet.querySelectorAll(".pv-box").forEach(b =>
        b.classList.toggle("active", parseInt(b.dataset.val) <= newPv)
      );
      const pvText = sheet.querySelector(".pv-text");
      if (pvText) pvText.textContent = `${newPv} / ${pvMax}`;
    }

    // Message chat
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="tnt-roll-card">
        <div style="font-weight:bold;color:#4a8a4a">${titre}</div>
        <p><strong>${actor.name}</strong> ${label} → <strong>+${gain} PV</strong></p>
        <p style="font-size:0.85em;color:#666">${newPv} / ${pvMax} PV</p>
      </div>`
    });
  }

  static async _onPiocherCarte() {
    const pts = this.actor.system.points_aventure ?? 0;
    if (pts < 1) {
      ui.notifications.warn("Pas assez de points d'aventure ! (1 pt requis)");
      return;
    }
    // Dépenser 1 point avant de piocher
    await this.actor.update({ "system.points_aventure": pts - 1 }, { render: false });
    const { piocherCarte } = await import("../cartes.mjs");
    await piocherCarte(this.actor);
  }

  static async _onUtiliserCarte(ev, target) {
    const { utiliserCarte } = await import("../cartes.mjs");
    await utiliserCarte(this.actor, parseInt(target.dataset.carteId));
  }

  static async _onDefausserCarte(ev, target) {
    const carteId = parseInt(target.dataset.carteId);
    const main    = (this.actor.system.cartes_en_main ?? []).filter(id => id !== carteId);
    await this.actor.update({ "system.cartes_en_main": main, "system.carte_active": main.length > 0 ? main[main.length-1] : null });
  }

  static async _onVoirCarte(ev, target) {
    await this.actor.update({ "system.carte_active": parseInt(target.dataset.carteId) });
  }

  static async _onNouvellePartie() {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window:  { title:"Nouvelle partie" },
      content: `<p>Réinitialiser <strong>${this.actor.name}</strong> ?</p><p><em>Avantages, besace, cartes remis à zéro.</em></p>`
    });
    if (!ok) return;
    for (const item of this.actor.items) {
      if (item.type === "avantage"   && item.system.utilise)        await item.update({ "system.utilise": false });
      if (item.type === "equipement" && item.system.utilise_partie) await item.update({ "system.utilise_partie": false });
    }
    await this.actor.update({ "system.cartes_en_main": [], "system.carte_active": null });
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="tnt-roll-card"><p>🎲 <strong>${this.actor.name}</strong> est prêt pour une nouvelle partie !</p></div>` });
    ui.notifications.info(`✅ ${this.actor.name} réinitialisé !`);
  }
}
