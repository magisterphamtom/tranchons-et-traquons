/**
 * Classe Actor pour Tranchons & Traquons — V13 DataModels
 * prepareDerivedData est maintenant dans les DataModels (actor-aventurier.mjs / actor-pnj.mjs)
 */
export class TnTActor extends Actor {

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    this.updateSource({
      prototypeToken: {
        "bar1.attribute": "sante.pv",
        "displayBars":    CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        "displayName":    CONST.TOKEN_DISPLAY_MODES.HOVER,
        "actorLink":      this.type === "aventurier",
        "disposition":    this.type === "aventurier"
                            ? CONST.TOKEN_DISPOSITIONS.FRIENDLY
                            : CONST.TOKEN_DISPOSITIONS.HOSTILE,
      }
    });
  }

  // Raccourci pour lire la valeur d'un trait (compatible DataModel)
  _getTraitValeur(traitKey) {
    try {
      const plain = this.toObject(false);
      return plain?.system?.traits?.[traitKey]?.valeur ?? 0;
    } catch {
      return this.system?.traits?.[traitKey]?.valeur ?? 0;
    }
  }

  // Valeurs dérivées exposées sur l'acteur (lues depuis le DataModel)
  get pvMax()      { return this.system?.pvMax      ?? (this.system?.sante?.pv?.max ?? 6); }
  get pvValue()    { return Math.min(this.system?.sante?.pv?.value ?? this.pvMax, this.pvMax); }
  get totalTraits(){ return this.system?.totalTraits ?? 0; }
  get degats()     { return this.system?.degats      ?? 1; }
  get armure()     {
    if (this.type === "pnj") return this.system?.combat_stats?.armure ?? 0;
    return this.system?.combat_stats?.armure ?? 2;
  }

  async lancerTrait(traitKey, options = {}) {
    const traitLabel = CONFIG.TnT?.TRAITS?.[traitKey]?.label ?? traitKey;
    const valeur     = this._getTraitValeur(traitKey);
    const bonus      = options.bonus ?? 0;
    const roll = new Roll(`2d6 + ${valeur} + ${bonus}`);
    await roll.evaluate();
    const total  = roll.total;
    const seuil  = CONFIG.TnT?.SEUIL ?? 8;
    const succes = total >= seuil;
    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/tranchons-et-traquons/templates/partials/roll-chat.hbs",
      { actorName: this.name, traitLabel, valeur, bonus, total, succes,
        marge: total - seuil, seuil, dice: roll.dice[0].results.map(r => r.result) }
    );
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content: html, rolls: [roll] });
    return { roll, succes, total };
  }

  async attaquer() {
    let cible = null;
    const cibles = game.user.targets;
    if (cibles.size > 0) cible = cibles.first()?.actor ?? null;
    const { TnTCombat } = await import("../combat.mjs");
    return TnTCombat.attaquer(this, cible);
  }
}
