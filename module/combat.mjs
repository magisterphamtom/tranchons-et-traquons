/**
 * Système de combat Tranchons & Traquons
 *
 * Règles :
 * - Attaquant : 2D6 + Combat + difficulté_cible ≥ 8 → touche
 * - Double 6 : succès critique → dégâts ×2
 * - Double 1 : échec critique → dégâts reçus ×2
 * - Succès → cible perd PV égaux aux dégâts de l'attaquant
 * - Échec  → attaquant perd PV égaux aux dégâts du monstre
 * - Armure : annule TOUS les dégâts d'une attaque, perd 1 charge
 */
export class TnTCombat {

  /**
   * Résolution d'une attaque complète avec chat et application des dégâts.
   * @param {TnTActor} attaquant
   * @param {TnTActor|null} cible        - null si pas de token ciblé
   */
  static async attaquer(attaquant, cible = null) {
    const combat    = attaquant._getTraitValeur?.("combat") ?? attaquant.system.traits?.combat?.valeur ?? 1;
    const diffCible = cible?.system?.combat_stats?.difficulte ?? 0;
    const seuil     = 8;

    // ── Jet 2D6 ────────────────────────────────────────
    const roll = new Roll("2d6");
    await roll.evaluate();

    const d1 = roll.dice[0].results[0].result;
    const d2 = roll.dice[0].results[1].result;
    const somme      = d1 + d2;
    const total      = somme + combat + diffCible;
    const critiqueOk = (d1 === 6 && d2 === 6);
    const critiqueKo = (d1 === 1 && d2 === 1);
    const succes     = critiqueOk || (!critiqueKo && total >= seuil);

    // ── Calcul des dégâts ──────────────────────────────
    let degatsAttaquant = attaquant.degats ?? 1;
    let degatsDefenseur = cible ? (cible.system.combat_stats?.degats ?? 1) : 0;

    if (critiqueOk) degatsAttaquant *= 2;
    if (critiqueKo) degatsDefenseur *= 2;

    // ── Application des dégâts ─────────────────────────
    let pvCibleApres    = null;
    let pvAttApres      = null;
    let armureUtilisee  = false;

    if (succes && cible) {
      // La cible peut décider d'utiliser son armure (prompt GM/joueur)
      // On applique directement et on laisse le MJ décider via le bouton dans le chat
      const pvActuel = cible.system.sante?.pv?.value ?? cible.pvMax;
      pvCibleApres   = Math.max(0, pvActuel - degatsAttaquant);
      await cible.update({ "system.sante.pv.value": pvCibleApres });

    } else if (!succes && !critiqueKo) {
      // Échec simple : l'attaquant perd les dégâts du monstre
      if (cible) {
        const pvAtt = attaquant.system.sante?.pv?.value ?? attaquant.pvMax;
        pvAttApres  = Math.max(0, pvAtt - degatsDefenseur);
        await attaquant.update({ "system.sante.pv.value": pvAttApres });
      }
    } else if (critiqueKo && cible) {
      // Échec critique : dégâts doublés sur l'attaquant
      const pvAtt = attaquant.system.sante?.pv?.value ?? attaquant.pvMax;
      pvAttApres  = Math.max(0, pvAtt - degatsDefenseur);
      await attaquant.update({ "system.sante.pv.value": pvAttApres });
    }

    // ── Message de chat ────────────────────────────────
    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/tranchons-et-traquons/templates/partials/combat-chat.hbs",
      {
        attaquantName: attaquant.name,
        attaquantImg:  attaquant.img,
        cibleName:     cible?.name ?? null,
        cibleImg:      cible?.img  ?? null,
        d1, d2, somme, combat, diffCible, total, seuil,
        succes, critiqueOk, critiqueKo,
        degatsAttaquant, degatsDefenseur,
        pvCibleApres,
        pvAttApres,
        ciblePvMax:    cible ? (cible.pvMax ?? 10) : null,
        attPvMax:      attaquant.pvMax ?? 10,
        // ID pour le bouton "Utiliser armure"
        cibleId:       cible?.id ?? null,
        attaquantId:   attaquant.id,
        armureCible:   cible?.system?.combat_stats?.armure ?? 0
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: attaquant }),
      content: html,
      rolls:   [roll]
    });

    return { succes, critiqueOk, critiqueKo, degatsAttaquant, roll };
  }

  /**
   * Utiliser l'armure d'un acteur pour annuler des dégâts déjà appliqués.
   * Appelé depuis le bouton dans le message de chat.
   * @param {string} actorId       - celui qui utilise l'armure
   * @param {string} attaquantId   - pour rembourser ses dégâts
   * @param {number} degatsAnnules
   */
  static async utiliserArmure(actorId, attaquantId, degatsAnnules) {
    const acteur    = game.actors.get(actorId);
    const attaquant = game.actors.get(attaquantId);
    if (!acteur) return;

    const armureActuelle = acteur.system.combat_stats?.armure ?? 0;
    if (armureActuelle <= 0) {
      ui.notifications.warn(`${acteur.name} n'a plus de charges d'armure !`);
      return;
    }

    // Annuler les dégâts : remettre les PV
    const pvActuel = acteur.system.sante?.pv?.value ?? 0;
    const pvMax    = acteur.pvMax ?? 10;
    const pvRestores = Math.min(pvMax, pvActuel + degatsAnnules);

    await acteur.update({
      "system.sante.pv.value":       pvRestores,
      "system.combat_stats.armure":  armureActuelle - 1
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: acteur }),
      content: `<div class="tnt-roll-card">
        <p><strong>${acteur.name}</strong> utilise son armure et annule ${degatsAnnules} dégât(s) !
        <br><em>Armure : ${armureActuelle} → ${armureActuelle - 1} charges</em></p>
      </div>`
    });
  }
}
