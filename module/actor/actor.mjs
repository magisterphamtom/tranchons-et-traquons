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
    // Normalisation : accepte une clé ("adresse") OU un objet trait ({ key, label, ... })
    const tk = (traitKey && typeof traitKey === "object")
      ? (traitKey.key ?? traitKey.trait ?? "")
      : String(traitKey ?? "");
    const traitLabel = String(CONFIG.TnT?.TRAITS?.[tk]?.label ?? tk);
    const valeur     = this._getTraitValeur(tk);
    const bonus      = options.bonus ?? 0;
    const roll = new Roll(`2d6 + ${valeur} + ${bonus}`);
    await roll.evaluate();
    const total  = roll.total;
    const seuil  = CONFIG.TnT?.SEUIL ?? 8;
    const succes = total >= seuil;
    const marge  = total - seuil;
    const dice   = roll.dice[0].results.map(r => r.result);

    const dieHtml = dice.map(d => {
      const cls = d === 6 ? "max" : (d === 1 ? "min" : "");
      return `<span class="die die-${d} ${cls}">${d}</span>`;
    }).join("");
    const bonusHtml = valeur ? `<span class="bonus">+ ${valeur}</span>` : "";
    const verdict = succes
      ? `<span class="verdict succes-label">✔ Succès${marge >= 4 ? " éclatant !" : ""}</span>`
      : `<span class="verdict echec-label">✘ Échec${marge <= -4 ? " critique !" : ""}</span>`;

    const html = `<div class="tnt-roll-card ${succes ? "succes" : "echec"}">
  <div class="roll-header">
    <span class="actor-name">${String(this.name ?? "")}</span>
    <span class="trait-name">— ${String(traitLabel ?? "")}</span>
  </div>
  <div class="roll-dice">
    ${dieHtml}
    ${bonusHtml}
  </div>
  <div class="roll-result">
    <span class="total">${total}</span>
    <span class="vs">vs ${seuil}</span>
    ${verdict}
  </div>
</div>`;
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
