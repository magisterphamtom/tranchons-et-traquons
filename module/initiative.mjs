/**
 * Système d'initiative T&T
 * Règle : jet d'Adresse (2D6 + Adresse), meilleur résultat passe en premier
 * Le joueur gagnant décide ensuite de l'ordre pour les autres aventuriers
 */

export class TnTInitiative {

  /**
   * Lance l'initiative pour tous les combattants du combat actif
   */
  static async lancerInitiative() {
    if (!game.combat) {
      ui.notifications.warn("Aucun combat actif ! Créez un combat depuis la barre d'outils.");
      return;
    }

    const combat = game.combat;
    const combattants = combat.combatants.contents;

    if (combattants.length === 0) {
      ui.notifications.warn("Aucun combattant dans le combat actif.");
      return;
    }

    const resultats = [];

    for (const combattant of combattants) {
      const actor = combattant.actor;
      if (!actor) continue;

      let adresse = 0;
      if (actor.type === "aventurier") {
        const plain = actor.toObject(false);
        adresse = plain?.system?.traits?.adresse?.valeur ?? 0;
      }
      // Les PNJ/monstres n'ont pas d'adresse — initiative fixe à 0

      const roll = new Roll("2d6 + @adresse", { adresse });
      await roll.evaluate();

      const d1 = roll.dice[0].results[0].result;
      const d2 = roll.dice[0].results[1].result;

      resultats.push({
        combattant,
        actor,
        nom:       actor.name,
        adresse,
        total:     roll.total,
        d1, d2,
        roll,
        isAventurier: actor.type === "aventurier"
      });

      // Mettre à jour l'initiative dans le tracker Foundry
      await combat.setInitiative(combattant.id, roll.total);
    }

    // Trier par initiative décroissante
    resultats.sort((a, b) => b.total - a.total);

    // Message de chat récapitulatif
    const lignes = resultats.map((r, i) => `
      <div class="init-ligne ${r.isAventurier ? 'aventurier' : 'monstre'}">
        <span class="init-rang">${i + 1}.</span>
        <span class="init-nom">${r.nom}</span>
        <span class="init-detail">${r.d1} + ${r.d2}${r.adresse > 0 ? ` + ${r.adresse} (Adresse)` : ''}</span>
        <span class="init-total">= <strong>${r.total}</strong></span>
      </div>
    `).join("");

    const gagnant = resultats[0];
    const msgContent = `
      <div class="tnt-init-chat">
        <div class="init-titre">⚔ Initiative — Ordre de combat</div>
        ${lignes}
        ${gagnant.isAventurier
          ? `<div class="init-conseil">🏆 <strong>${gagnant.nom}</strong> agit en premier et décide de l'ordre pour les autres aventuriers !</div>`
          : `<div class="init-conseil monstre">⚠ Les monstres agissent en premier ce round !</div>`
        }
      </div>
    `;

    await ChatMessage.create({
      content: msgContent,
      rolls:   resultats.map(r => r.roll)
    });

    ui.notifications.info(`Initiative lancée ! ${gagnant.nom} commence.`);
    return resultats;
  }
}
