# Tranchons & Traquons — Système Foundry VTT

![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-V13-orange)
![Licence](https://img.shields.io/badge/Licence-CC--BY--NC%202.0-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)

Système de jeu de rôle pour **Tranchons & Traquons** de Kobayashi, implémenté pour Foundry VTT V13+.

---

## 📦 Installation

### Méthode 1 — ZIP manuel
1. Téléchargez le ZIP de la dernière release
2. Décompressez dans `Data/systems/tranchons-et-traquons/`
3. Redémarrez Foundry VTT
4. Créez un monde en sélectionnant le système **Tranchons & Traquons**

### Méthode 2 — URL de manifest
Dans Foundry VTT → Systèmes → Installer un système, collez l'URL :
```
https://raw.githubusercontent.com/magisterphamtom/tranchons-et-traquons/main/system.json
```

---

## 🎲 Fonctionnalités

### Fiches de personnage
- **Fiche Aventurier** — 5 onglets : Traits, Avantages, Dons, Besace, Bio
- **Fiche PNJ/Monstre** — avec niveaux de difficulté (Petit bras / Gros bras / Brutasse / Grand chef)
- **Étoiles interactives** — cliquez pour définir la valeur de chaque trait (1 à 5)
- **Trait clé de classe** mis en évidence avec bordure dorée
- **Points de Vie** — cases cliquables avec recalcul automatique (Robustesse + 5 + Destin)
- **Destin** — losanges cliquables, chaque point ajoute +1 PV max
- **Boutons de repos** — Court (+1 PV) et Long (+2 PV)
- **Don et Destin du peuple** affichés dans l'en-tête

### Système de jets
- **Dialogue de jet avancé** — sélection d'avantage, faiblesse, besace, difficulté
- Formule mise à jour en temps réel : `2D6 + trait ± modificateurs ≥ 8`
- Double 6 : **Critique ×2** — Double 1 : **Échec critique KO**

### Combat
- **Combat automatisé** — ciblage token, dégâts calculés automatiquement
- **Armure** — bouton dans le chat pour annuler une attaque
- **Initiative** — bouton dans le tracker de combat (2D6 + Adresse)
- Résultats détaillés dans le chat

### Contenu
- **Wiki intégré** — 14 sections de règles + Guide joueur + Guide MJ
- **27 cartes événement** illustrées avec les illustrations officielles
- **Points d'aventure** — 1 point = 1 carte piochée
- **Compendiums** — script console pour installer 36 dons, 12 monstres, 6 aventuriers pré-tirés

### Création de personnage
- **Assistant guidé** en 5 étapes accessible depuis la sidebar
- Méthode **Folle Jeunesse** — 4 jets de tables + 5 points libres
- Création automatique de la fiche avec avantage et faiblesse de classe

### Autres
- **Barre de santé token** colorée (vert → orange → rouge)
- **Drag & drop** depuis les compendiums (limite 5 dons / 5 avantages)
- **Bouton Nouvelle partie** — remet à zéro avantages, besace, cartes
- **Portraits de classe** cliquables dans la fiche

---

## 🏗 Architecture technique

```
tranchons-et-traquons/
├── tranchons.mjs          # Point d'entrée principal
├── system.json            # Manifeste Foundry
├── template.json          # Vide (migration DataModels complète)
├── module/
│   ├── data/              # DataModels V13 (TypeDataModel)
│   │   ├── actor-aventurier.mjs
│   │   ├── actor-pnj.mjs
│   │   └── items.mjs
│   ├── actor/             # Actor + ActorSheet (ApplicationV2)
│   ├── item/              # Item + ItemSheet
│   ├── combat.mjs         # Système de combat
│   ├── initiative.mjs     # Initiative T&T
│   ├── jet-dialog.mjs     # Dialogue de jet
│   ├── wiki.mjs           # Wiki des règles
│   ├── creation.mjs       # Assistant de création
│   ├── cartes.mjs         # Cartes événement
│   └── config.mjs         # Configuration (CONFIG.TnT)
├── templates/             # Templates Handlebars
├── css/                   # Styles
├── assets/                # Images (cartes, portraits)
└── lang/fr.json           # Localisation française
```

**Compatible Foundry VTT V13+** — utilise :
- `TypeDataModel` avec `defineSchema()` (plus de `template.json`)
- `HandlebarsApplicationMixin(ActorSheetV2 / ApplicationV2)`
- `foundry.documents.collections.*` (APIs non dépréciées)
- `renderChatMessageHTML` (hook V13)

---

## 📜 Règles du jeu

Tranchons & Traquons est un jeu de Kobayashi, disponible gratuitement sous licence **CC-BY-NC 2.0**.

- [Télécharger le PDF officiel](https://www.drivethrurpg.com/product/186985)
- [Site de Kobayashi](https://www.latribuerrante.fr)

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour signaler un bug ou proposer une amélioration :
1. Ouvrez une issue sur GitHub
2. Décrivez le problème ou la fonctionnalité souhaitée
3. Si possible, joignez une capture d'écran ou le message d'erreur console

---

## 📄 Licence

Ce système Foundry VTT est distribué sous licence **MIT**.
Le jeu Tranchons & Traquons et ses illustrations sont propriété de Kobayashi, sous licence **CC-BY-NC 2.0**.
