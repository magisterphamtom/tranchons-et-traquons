/**
 * Fiche Item T&T — hérite de ItemSheetV2 (Foundry V13 natif)
 */
const { ItemSheetV2 }             = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class TnTItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes:  ["tnt", "sheet", "item"],
    position: { width: 440, height: "auto" },
    window:   { resizable: true },
    form:     { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    main: { template: "systems/tranchons-et-traquons/templates/item/item-sheet.hbs" }
  };

  get title() {
    const typeLabel = game.i18n.localize(`TYPES.Item.${this.item.type}`) ?? this.item.type;
    return `${this.item.name} — ${typeLabel}`;
  }

  async _prepareContext(options) {
    const ctx  = await super._prepareContext(options);
    ctx.item   = this.item;
    ctx.system = this.item.system;
    ctx.config = CONFIG.TnT ?? {};
    ctx.classeChoices = Object.fromEntries(
      Object.entries(CONFIG.TnT?.CLASSES ?? {}).map(([k, v]) => [k, v.label])
    );
    return ctx;
  }

  _onRender(context, options) {
    const html = this.element;

    // Portrait cliquable
    html.querySelector(".item-img")?.addEventListener("click", () => {
      new FilePicker({
        type: "image",
        current: this.item.img,
        callback: path => this.item.update({ img: path })
      }).browse();
    });

    // Score avantage : clic sur les cercles
    html.querySelectorAll(".score-option").forEach(opt => {
      // Marquer actif au chargement selon la valeur actuelle
      const radio = opt.querySelector("input");
      if (radio && parseInt(radio.value) === (this.item.system.score ?? 0)) {
        opt.classList.add("active");
      }

      opt.addEventListener("click", async () => {
        const val = parseInt(opt.querySelector("input").value);
        // Mise à jour visuelle immédiate
        html.querySelectorAll(".score-option").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        await this.item.update({ "system.score": val });
      });
    });

    // Champs texte/select
    html.querySelectorAll("input:not([type=radio]), select, textarea").forEach(el => {
      el.addEventListener("change", async ev => {
        const key = ev.currentTarget.name;
        if (!key) return;
        const val = ev.currentTarget.type === "number"
          ? Number(ev.currentTarget.value)
          : ev.currentTarget.value;
        await this.item.update({ [key]: val });
      });
    });
  }
}
