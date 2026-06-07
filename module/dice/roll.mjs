/**
 * Utilitaires de jets de dés pour T&T
 * Toujours 2D6 + bonus, seuil de réussite = 8
 */
export class TnTRoll {
  /**
   * Jet simple 2D6 + modificateur
   * @returns {{ roll, succes, total, marge }}
   */
  static async jeter(modificateur = 0) {
    const roll = new Roll(`2d6 + ${modificateur}`);
    await roll.evaluate();
    const total  = roll.total;
    const seuil  = CONFIG.TnT?.SEUIL ?? 8;
    const succes = total >= seuil;
    return { roll, succes, total, marge: total - seuil };
  }

  /**
   * Jet avec avantage : lance 3D6, garde les 2 meilleurs
   */
  static async jeterAvantage(modificateur = 0) {
    const roll = new Roll(`{d6, d6, d6}kh2 + ${modificateur}`);
    await roll.evaluate();
    const total  = roll.total;
    const seuil  = CONFIG.TnT?.SEUIL ?? 8;
    return { roll, succes: total >= seuil, total, marge: total - seuil };
  }

  /**
   * Jet de dégâts (1, 2 ou 3 selon le score de combat)
   */
  static degatsParCombat(combat) {
    if (combat <= 2) return 1;
    if (combat <= 4) return 2;
    return 3;
  }
}
