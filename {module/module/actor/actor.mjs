/**
 * Classe Actor pour Tranchons & Traquons
 *
 * IMPORTANT — Foundry V13 :
 * system est un DataModel en lecture seule dans prepareDerivedData.
 * Les valeurs calculées sont stockées sur `this` (pas sur system).
 */
export class TnTActor extends Actor {

  /** Configuration par défaut du token */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    // Token par défaut : barre PV visible, nom affiché, disposition hostile/ami selon type
    const tokenUpdates = {
      "bar1.attribute": "sante.pv",
      "displayBars":    CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      "displayName":    CONST.TOKEN_DISPLAY_MODES.HOVER,
      "actorLink":      this.type === "aventurier",
      "disposition":    this.type === "aventurier"
                          ? CONST.TOKEN_DISPOSITIONS.FRIENDLY
                          : CONST.TOKEN_DISPOSITIONS.HOSTILE,
    };
    this.updateSource({ prototypeToken: tokenUpdates });
  }

  prepareDerivedData() {
    if (this.type === "aventurier") this._prepareAventurierData();
    else if (this.type === "pnj")   this._preparePnjData();
  }

  _getTraitValeur(traitKey) {
    // toObject() retourne un plain JS object sans proxy ni DataModel
    try {
      const plain = this.toObject(false);
      return plain?.system?.traits?.[traitKey]?.valeur ?? 0;
    } catch {
      const raw = this.system.traits?.[traitKey];
      if (!raw) return 0;
      return raw._source?.valeur ?? raw.valeur ?? 0;
    }
  }

  _prepareAventurierData() {
    const sys        = this.system;
    const robustesse = this._getTraitValeur("robustesse");
    const combat     = this._getTraitValeur("combat");
    const peuple     = sys.biographie?.peuple ?? "humain";

    const bonusPeuple = (peuple === "nain") ? 2 : 0;
    const bonusDestin = sys.sante?.destin?.value ?? 0;

    this.pvMax   = robustesse + 5 + bonusPeuple + bonusDestin;
    this.pvValue = Math.min(sys.sante?.pv?.value ?? this.pvMax, this.pvMax);

    const traitDegats = (peuple === "ours") ? robustesse : combat;
    this.degats  = traitDegats <= 2 ? 1 : traitDegats <= 4 ? 2 : 3;
    this.armure  = 2;

    // Total traits : sommer les 6 clés connues
    const cles = ["adresse","combat","erudition","influence","robustesse","survie"];
    this.totalTraits = cles.reduce((s, k) => s + this._getTraitValeur(k), 0);
  }

  _preparePnjData() {
    const sys    = this.system;
    const rob    = this._getTraitValeur("robustesse");
    const combat = this._getTraitValeur("combat");

    this.pvMax   = rob + 5;
    this.pvValue = Math.min(sys.sante?.pv?.value ?? this.pvMax, this.pvMax);
    this.degats  = combat <= 2 ? 1 : combat <= 4 ? 2 : 3;
    this.armure  = sys.combat_stats?.armure ?? 0;
  }

  /* -------------------------------------------------- */
  /*  Jets de dés                                       */
  /* -------------------------------------------------- */

  async lancerTrait(traitKey, options = {}) {
    const traitLabel = CONFIG.TnT?.TRAITS?.[traitKey]?.label ?? traitKey;
    const valeur     = this._getTraitValeur(traitKey);
    const bonus      = options.bonus ?? 0;

    const roll = new Roll(`2d6 + ${valeur} + ${bonus}`);
    await roll.evaluate();

    const total  = roll.total;
    const seuil  = CONFIG.TnT?.SEUIL ?? 8;
    const succes = total >= seuil;
    const marge  = total - seuil;

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/tranchons-et-traquons/templates/partials/roll-chat.hbs",
      {
        actorName: this.name, traitLabel, valeur, bonus,
        total, succes, marge, seuil,
        dice: roll.dice[0].results.map(r => r.result)
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: html,
      rolls:   [roll]
    });

    return { roll, succes, total };
  }

  async attaquer() {
    // Récupérer la cible depuis les tokens ciblés ou sélectionnés
    let cible = null;
    const cibles = game.user.targets;
    if (cibles.size > 0) {
      cible = cibles.first()?.actor ?? null;
    }

    // Import dynamique pour éviter les dépendances circulaires
    const { TnTCombat } = await import("../combat.mjs");
    return TnTCombat.attaquer(this, cible);
  }
}
