const { StringField, NumberField, SchemaField, HTMLField } = foundry.data.fields;

export class PnjData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      biographie: new SchemaField({
        type_monstre: new StringField({ initial: "" }),
        description:  new HTMLField({ initial: "" }),
        notes:        new HTMLField({ initial: "" }),
      }),
      traits: new SchemaField({
        combat:     new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        robustesse: new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
      }),
      sante: new SchemaField({
        pv: new SchemaField({
          value: new NumberField({ initial: 5, min: 0, integer: true }),
          min:   new NumberField({ initial: 0, integer: true }),
          max:   new NumberField({ initial: 10, integer: true }),
        }),
      }),
      combat_stats: new SchemaField({
        armure:       new NumberField({ initial: 0, min: 0, integer: true }),
        degats:       new NumberField({ initial: 1, min: 0, integer: true }),
        difficulte:   new NumberField({ initial: 0, integer: true }),
        malus_armure: new NumberField({ initial: 0, integer: true }),
      }),
    };
  }

  prepareDerivedData() {
    const rob = this.traits?.robustesse?.valeur ?? 0;
    this.pvMax  = rob + 5;
    const c = this.traits?.combat?.valeur ?? 0;
    this.degats = c <= 2 ? 1 : c <= 4 ? 2 : 3;
    this.totalTraits = (this.traits?.combat?.valeur ?? 0) + (this.traits?.robustesse?.valeur ?? 0);
  }
}
