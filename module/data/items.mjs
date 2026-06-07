const { StringField, NumberField, BooleanField, SchemaField, HTMLField } = foundry.data.fields;

export class AvantageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      score:       new NumberField({ initial: 1, min: 1, max: 5, integer: true }),
      description: new StringField({ initial: "" }),
      utilise:     new BooleanField({ initial: false }),
    };
  }
}

export class FaiblesseData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "" }),
      utilisee:    new BooleanField({ initial: false }),
    };
  }
}

export class DonData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      classe_origine: new StringField({ initial: "guerrier" }),
      effet:          new StringField({ initial: "" }),
      description:    new HTMLField({ initial: "" }),
    };
  }
}

export class ArmeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type:         new StringField({ initial: "melee", choices: ["melee", "distance"] }),
      bonus:        new NumberField({ initial: 0, integer: true }),
      degats_bonus: new NumberField({ initial: 0, integer: true }),
      description:  new StringField({ initial: "" }),
    };
  }
}

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type:           new StringField({ initial: "besace" }),
      bonus:          new NumberField({ initial: 0, integer: true }),
      utilise_partie: new BooleanField({ initial: false }),
      description:    new StringField({ initial: "" }),
    };
  }
}
