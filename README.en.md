# Tranchons & Traquons — Foundry VTT System

![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-V13-orange)
![License](https://img.shields.io/badge/License-CC--BY--NC%202.0-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)

A Foundry VTT game system for **Tranchons & Traquons** by Kobayashi. Requires Foundry VTT V13+.

> 🇫🇷 French README available: [README.md](README.md)

---

## 📦 Installation

### Option 1 — Manual ZIP
1. Download the latest release ZIP
2. Extract to `Data/systems/tranchons-et-traquons/`
3. Restart Foundry VTT
4. Create a world using the **Tranchons & Traquons** system

### Option 2 — Manifest URL
In Foundry VTT → Game Systems → Install System, paste:
```
https://raw.githubusercontent.com/magisterphamtom/tranchons-et-traquons/main/system.json
```

---

## 🎲 Features

### Character Sheets
- **Adventurer Sheet** — 5 tabs: Traits, Advantages, Gifts, Pack, Bio
- **NPC/Monster Sheet** — difficulty levels (Weakling / Tough / Bruiser / Boss)
- **Interactive stars** — click to set trait values (1 to 5)
- **Class key trait** highlighted with a golden border
- **Hit Points** — clickable boxes with auto-calculation (Toughness + 5 + Destiny)
- **Destiny** — clickable diamonds, each point adds +1 max HP
- **Rest buttons** — Short (+1 HP) and Long (+2 HP)
- **Race gift & destiny** displayed in the header

### Dice Rolling
- **Advanced roll dialog** — advantage, weakness, pack item, difficulty selection
- Real-time formula update: `2D6 + trait ± modifiers ≥ 8`
- Double 6: **Critical ×2** — Double 1: **Critical failure KO**

### Combat
- **Automated combat** — token targeting, auto damage calculation
- **Armor** — chat button to cancel one hit
- **Initiative** — button in the combat tracker (2D6 + Agility)
- Detailed results in chat

### Content
- **Integrated wiki** — 14 rule sections + Player guide + GM guide
- **27 illustrated event cards** with official artwork
- **Adventure points** — 1 point = 1 card drawn
- **Compendiums** — console script to install 36 gifts, 12 monsters, 6 pre-made adventurers

### Character Creation
- **Guided assistant** in 5 steps, accessible from the sidebar
- **Wild Youth** method — 4 table rolls + 5 free points
- Automatic sheet creation with class advantage and weakness

### Other
- **Colored token health bar** (green → orange → red)
- **Drag & drop** from compendiums (max 5 gifts / 5 advantages)
- **New session button** — resets advantages, pack, cards
- Clickable class portrait in the sheet

---

## 🏗 Technical Architecture

```
tranchons-et-traquons/
├── tranchons.mjs          # Main entry point
├── system.json            # Foundry manifest
├── template.json          # Empty (full DataModel migration)
├── module/
│   ├── data/              # V13 DataModels (TypeDataModel)
│   │   ├── actor-aventurier.mjs
│   │   ├── actor-pnj.mjs
│   │   └── items.mjs
│   ├── actor/             # Actor + ActorSheet (ApplicationV2)
│   ├── item/              # Item + ItemSheet
│   ├── combat.mjs         # Combat system
│   ├── initiative.mjs     # T&T initiative
│   ├── jet-dialog.mjs     # Roll dialog
│   ├── wiki.mjs           # Rules wiki
│   ├── creation.mjs       # Character creation assistant
│   ├── cartes.mjs         # Event cards
│   └── config.mjs         # Configuration (CONFIG.TnT)
├── templates/             # Handlebars templates
├── css/                   # Stylesheets
├── assets/                # Images (cards, portraits)
└── lang/fr.json           # French localization
```

**Requires Foundry VTT V13+** — uses:
- `TypeDataModel` with `defineSchema()` (no more `template.json`)
- `HandlebarsApplicationMixin(ActorSheetV2 / ApplicationV2)`
- `foundry.documents.collections.*` (non-deprecated APIs)
- `renderChatMessageHTML` (V13 hook)

---

## 📜 About the Game

Tranchons & Traquons is a tabletop RPG by Kobayashi, freely available under **CC-BY-NC 2.0**.

- [Download the official PDF](https://www.drivethrurpg.com/product/186985)
- [Kobayashi's website](https://www.latribuerrante.fr)

---

## 🤝 Contributing

Contributions are welcome! To report a bug or suggest a feature:
1. Open an issue on GitHub
2. Describe the problem or desired feature
3. If possible, include a screenshot or console error message

---

## 📄 License

This Foundry VTT system is distributed under the **MIT License**.
Tranchons & Traquons game and illustrations are property of Kobayashi, under **CC-BY-NC 2.0**.
