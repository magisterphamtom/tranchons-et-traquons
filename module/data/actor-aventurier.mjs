const { StringField, NumberField, BooleanField, SchemaField, ArrayField, HTMLField } = foundry.data.fields;

export class AventurierData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      biographie: new SchemaField({
        peuple:      new StringField({ initial: "humain" }),
        classe:      new StringField({ initial: "guerrier" }),
        age:         new StringField({ initial: "" }),
        taille:      new StringField({ initial: "" }),
        poids:       new StringField({ initial: "" }),
        sexe:        new StringField({ initial: "" }),
        signe:       new StringField({ initial: "" }),
        description: new HTMLField({ initial: "" }),
        reflexe:     new StringField({ initial: "" }),
        destin_type: new StringField({ initial: "" }),
        notes:       new HTMLField({ initial: "" }),
      }),
      traits: new SchemaField({
        adresse:    new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        combat:     new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        erudition:  new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        influence:  new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        robustesse: new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
        survie:     new SchemaField({ valeur: new NumberField({ initial: 1, min: 0, max: 5, integer: true }) }),
      }),
      sante: new SchemaField({
        pv: new SchemaField({
          value: new NumberField({ initial: 6,  min: 0, integer: true }),
          min:   new NumberField({ initial: 0,  integer: true }),
          max:   new NumberField({ initial: 10, integer: true }),
        }),
        destin: new SchemaField({
          value: new NumberField({ initial: 0, min: 0, max: 5, integer: true }),
          min:   new NumberField({ initial: 0, integer: true }),
          max:   new NumberField({ initial: 5, integer: true }),
        }),
      }),
      combat_stats: new SchemaField({
        armure: new NumberField({ initial: 2, min: 0, integer: true }),
        degats: new NumberField({ initial: 1, min: 0, integer: true }),
      }),
      langues: new SchemaField({
        royaumes:  new BooleanField({ initial: true }),
        rouge:     new BooleanField({ initial: false }),
        feuillu:   new BooleanField({ initial: false }),
        telgesh:   new BooleanField({ initial: false }),
        pierreux:  new BooleanField({ initial: false }),
        kriss:     new BooleanField({ initial: false }),
      }),
      experience:      new NumberField({ initial: 0, min: 0, integer: true }),
      points_aventure: new NumberField({ initial: 0, min: 0, integer: true }),
      carte_active:    new NumberField({ initial: null, nullable: true, integer: true }),
      cartes_en_main:  new ArrayField(new NumberField({ integer: true })),
    };
  }

  prepareDerivedData() {
    const rob    = this.traits?.robustesse?.valeur ?? 0;
    const destin = this.sante?.destin?.value ?? 0;
    const peuple = this.biographie?.peuple ?? "humain";
    this.pvMax      = rob + 5 + (peuple === "nain" ? 2 : 0) + destin;
    this.totalTraits = Object.values(this.traits).reduce((s, t) => s + (t?.valeur ?? 0), 0);
    const c = this.traits?.combat?.valeur ?? 0;
    this.degats = c <= 2 ? 1 : c <= 4 ? 2 : 3;
  }
}
