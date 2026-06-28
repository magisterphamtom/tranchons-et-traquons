import { TnT } from "./config.mjs";

/**
 * Dialogue de jet T&T
 */
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class TnTJetDialog extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes:  ["tnt", "tnt-jet-dialog-app"],
    position: { width: 480, height: "auto" },
    window:   { resizable: false }
  };

  static PARTS = {
    main: { template: "systems/tranchons-et-traquons/templates/dialogs/jet-trait.hbs" }
  };

  constructor(actor, traitKey, options = {}) {
    super(options);
    this._actor    = actor;
    // Normalisation : accepte une clé ("adresse") OU un objet trait ({ key, ... })
    this._traitKey = (traitKey && typeof traitKey === "object")
      ? (traitKey.key ?? traitKey.trait ?? "")
      : String(traitKey ?? "");
    this._modif    = 0;      // difficulté sélectionnée
    this._libre    = 0;      // champ libre
    this._avId     = null;
    this._avBonus  = 0;
    this._faiId    = null;
    this._faiMalus = 0;
    this._besId    = null;
    this._besBonus = 0;
  }

  get title() {
    const label = CONFIG.TnT?.TRAITS?.[this._traitKey]?.label ?? this._traitKey;
    return `Jet — ${label} — ${this._actor.name}`;
  }

  async _prepareContext(options) {
    const actor = this._actor;
    const tk    = this._traitKey;

    // Utiliser TnT importé directement — évite les problèmes de timing CONFIG
    const traitDef   = TnT.TRAITS[tk] ?? {};
    const traitLabel = String(traitDef.label ?? tk);
    const traitIcon  = String(traitDef.icon  ?? "fas fa-dice");

    // Valeur du trait
    let traitValeur = 0;
    if (typeof actor._getTraitValeur === "function") {
      traitValeur = actor._getTraitValeur(tk);
    } else {
      const raw = actor.system?.traits?.[tk];
      traitValeur = raw?.valeur ?? raw?._source?.valeur ?? 0;
    }

    return {
      jetTraitKey:    tk,
      jetTraitLabel:  traitLabel,
      jetTraitIcon:   traitIcon,
      jetTraitValeur: traitValeur,
      avantages:   actor.items.filter(i => i.type === "avantage"),
      faiblesses:  actor.items.filter(i => i.type === "faiblesse"),
      equipements: actor.items.filter(i => i.type === "equipement"),
    };
  }

  _onRender(context, options) {
    const html = this.element;

    // Boutons de difficulté
    html.querySelectorAll(".jet-diff-btn").forEach(btn => {
      btn.addEventListener("click", ev => {
        html.querySelectorAll(".jet-diff-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this._modif = parseInt(btn.dataset.val);
        this._majFormule(html, context);
      });
    });

    // Modificateur libre
    html.querySelector("#jet-modif-libre")?.addEventListener("input", ev => {
      this._libre = parseInt(ev.target.value) || 0;
      this._majFormule(html, context);
    });

    // Avantage
    html.querySelector("#jet-avantage")?.addEventListener("change", ev => {
      const opt = ev.target.selectedOptions[0];
      this._avBonus = parseInt(ev.target.value) || 0;
      this._avId    = opt?.dataset.id ?? null;
      this._majFormule(html, context);
    });

    // Faiblesse
    html.querySelector("#jet-faiblesse")?.addEventListener("change", ev => {
      const opt = ev.target.selectedOptions[0];
      this._faiMalus = parseInt(ev.target.value) || 0;
      this._faiId    = opt?.dataset.id ?? null;
      this._majFormule(html, context);
    });

    // Besace
    html.querySelector("#jet-besace")?.addEventListener("change", ev => {
      const opt = ev.target.selectedOptions[0];
      this._besBonus = parseInt(ev.target.value) || 0;
      this._besId    = opt?.dataset.id ?? null;
      this._majFormule(html, context);
    });

    // Affichage initial
    this._majFormule(html, context);
  }

  _majFormule(html, context) {
    const base  = context.jetTraitValeur ?? 0;
    const total = base + this._modif + this._libre + this._avBonus + this._faiMalus + this._besBonus;
    let formule = `2D6 + ${base}`;
    if (this._avBonus)  formule += ` + ${this._avBonus} (avantage)`;
    if (this._faiMalus) formule += ` ${this._faiMalus} (faiblesse)`;
    if (this._besBonus) formule += ` + ${this._besBonus} (besace)`;
    if (this._modif)    formule += ` ${this._modif > 0 ? '+' : ''}${this._modif} (difficulté)`;
    if (this._libre)    formule += ` ${this._libre > 0 ? '+' : ''}${this._libre} (libre)`;
    const el = html.querySelector("#jet-formule");
    if (el) el.textContent = formule;
  }

  /* ── Lancer le dé ────────────────────────────────── */
  async lancer() {
    const actor    = this._actor;
    const traitKey   = this._traitKey;
    const traitLabel = String(TnT.TRAITS[traitKey]?.label ?? traitKey);
    const valeur     = actor._getTraitValeur?.(traitKey) ?? actor.system.traits?.[traitKey]?.valeur ?? 0;

    const bonusTotal = valeur + this._modif + this._libre + this._avBonus
                       + this._faiMalus + this._besBonus;

    // Jet
    const roll = new Roll(`2d6 + ${bonusTotal}`);
    await roll.evaluate();

    const d1 = roll.dice[0].results[0].result;
    const d2 = roll.dice[0].results[1].result;
    const total   = roll.total;
    const seuil   = 8;
    const succes  = (d1 === 6 && d2 === 6) || (!(d1 === 1 && d2 === 1) && total >= seuil);
    const critiqueOk = d1 === 6 && d2 === 6;
    const critiqueKo = d1 === 1 && d2 === 1;
    const marge   = total - seuil;

    // Marquer avantage utilisé
    if (this._avId && this._avBonus > 0) {
      const av = actor.items.get(this._avId);
      if (av) await av.update({ "system.utilise": true });
    }

    // Marquer besace utilisée
    if (this._besId && this._besBonus > 0) {
      const eq = actor.items.get(this._besId);
      if (eq) await eq.update({ "system.utilise_partie": true });
    }

    // Verdict
    let verdict;
    if (succes) {
      verdict = `<span class="verdict succes-label">✔ Succès${marge >= 4 ? " éclatant !" : ""}</span>`;
    } else {
      verdict = `<span class="verdict echec-label">✘ Échec${marge <= -4 ? " critique !" : ""}</span>`;
    }

    // Dés
    const dieHtml = [d1, d2].map(d => {
      const cls = d === 6 ? "max" : (d === 1 ? "min" : "");
      return `<span class="die die-${d} ${cls}">${d}</span>`;
    }).join("");

    const bonusHtml = bonusTotal ? `<span class="bonus">+ ${bonusTotal}</span>` : "";
    const details   = this._buildDetails();
    const detailsHtml = details ? `<div class="roll-details">${details}</div>` : "";

    // Construction directe du HTML (pas de Handlebars : évite tout souci de rendu)
    const nomActeur = String(actor.name ?? "");
    const nomTrait  = String(traitLabel ?? "");
    const html = `<div class="tnt-roll-card ${succes ? "succes" : "echec"}">
  <div class="roll-header">
    <span class="actor-name">${nomActeur}</span>
    <span class="trait-name">— ${nomTrait}</span>
  </div>
  <div class="roll-dice">
    ${dieHtml}
    ${bonusHtml}
  </div>
  ${detailsHtml}
  <div class="roll-result">
    <span class="total">${total}</span>
    <span class="vs">vs ${seuil}</span>
    ${verdict}
  </div>
</div>`;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: html,
      rolls:   [roll]
    });

    this.close();
    return { roll, succes, total };
  }

  _buildDetails() {
    const parts = [];
    if (this._avBonus)  parts.push(`Avantage +${this._avBonus}`);
    if (this._faiMalus) parts.push(`Faiblesse ${this._faiMalus}`);
    if (this._besBonus) parts.push(`Besace +${this._besBonus}`);
    if (this._modif)    parts.push(`Difficulté ${this._modif > 0 ? '+' : ''}${this._modif}`);
    if (this._libre)    parts.push(`Libre ${this._libre > 0 ? '+' : ''}${this._libre}`);
    return parts.join(" · ");
  }

  /* ── Ouvrir + attendre le résultat ──────────────── */
  static async ouvrir(actor, traitKey) {
    return new Promise((resolve) => {
      const dialog = new TnTJetDialog(actor, traitKey);

      // On surcharge _getFooterButtons pour injecter Lancer / Annuler
      const origRender = dialog._onRender.bind(dialog);
      dialog._onRender = (ctx, opts) => {
        origRender(ctx, opts);
        // Injecter les boutons dans le footer
        const footer = document.createElement("div");
        footer.className = "jet-footer";

        const btnLancer  = document.createElement("button");
        btnLancer.type   = "button";
        btnLancer.className = "tnt-btn-lancer";
        btnLancer.innerHTML = "<i class='fas fa-dice'></i> Lancer !";
        btnLancer.addEventListener("click", async () => {
          const res = await dialog.lancer();
          resolve(res);
        });

        const btnAnnuler  = document.createElement("button");
        btnAnnuler.type   = "button";
        btnAnnuler.className = "tnt-btn-annuler";
        btnAnnuler.innerHTML = "Annuler";
        btnAnnuler.addEventListener("click", () => {
          dialog.close();
          resolve(null);
        });

        footer.appendChild(btnLancer);
        footer.appendChild(btnAnnuler);
        dialog.element.appendChild(footer);
      };

      dialog.render(true);
    });
  }
}
