# Greenbottle's Hacking Quips

A Foundry VTT module for Pathfinder 2e / Starfinder 2e that adds witty hacking quips, a Timber Sentinel randomizer (trees & coral), a Knives & Daggers encyclopedia, and roll tables for all of the above.

If you are enough of a madlad that you want to support me, [I set up a patreon where you can get access to all the early stuff I'm working on and more!](https://www.patreon.com/cw/GreenbottlesArcanum) < thats a link, you should totally click it \**insert fry futurama money meme*\*

If you want to just support me once, here's a KoFi link! https://ko-fi.com/greenbottle

## Features

### Hacking Quips
- **20 Programming-Related Quips**: Displays random error messages when hacking attempts fail
- **GM Controls**: Adds interactive buttons for GMs to determine success/failure on skill checks without pre-set DCs
- **Automatic Detection**: Triggers on Computers skill checks or any check with "hacking" in the description
- **Player Feedback**: Failed attempts show humorous messages to keep the mood light

### Timber Sentinel
When the Timber Sentinel kineticist ability is used in chat, the module automatically picks a random species and displays it with flavor text.

- **Trees**: 61 tree species (real + fantasy) with evocative flavor text
- **Coral**: 100 coral species with scientific names, type classification, flavor text, and real-world fun facts
- **Type Toggles**: Enable/disable trees and coral independently — when both are on, the module picks a type first (50/50), then a species from that type
- **Coral Details**: Toggle individual detail fields:
  - Flavor text (fantasy-themed description)
  - Scientific name (Latin binomial)
  - Coral type badge (Hard, Soft, Fire, Other)
  - Fun Facts button (click to reveal all fun facts about the species)
- **Display Options**: Simple name only, uppercase, emphatic (exclamation mark)
- **Custom Data**: Drop your own entries into `custom-trees.json` or `custom-coral.json` to add to the pool

### Knives & Daggers
A compendium macro that rolls a random knife or dagger from a curated collection of 25 blades and displays detailed information in chat.

- **Compendium Macro**: Drag "Roll Random Knife/Dagger" from the module's macro compendium to your hotbar
- **Rich Details**: Each entry includes name, pronunciation, category, origin, blade specs, handle material, description, and uses
- **Toggleable Fields**: Show/hide each detail field independently via module settings

### Roll Tables
The module ships with compendium roll tables that are auto-populated on first load:

- **Knives & Daggers Table** (25 entries)
- **Timber Sentinel: Trees Table** (61 entries)
- **Timber Sentinel: Corals Table** (100 entries)

These can be rolled independently, used in other macros, or imported into your world.

## Sample Quips

- "Your exploit crashes with a segmentation fault. Time to debug."
- "Stack overflow! No, not the website – your actual intrusion buffer just exploded."
- "The system returns 'Permission Denied' in 47 different languages simultaneously."
- "You divided by zero. Somewhere, a mathematician is crying, and the firewall is laughing."

## Installation

### Via Foundry Package Manager (Recommended)

1. In Foundry VTT, go to **Add-on Modules**
2. Click **Install Module**
3. Search for "Greenbottle's Hacking Quips"
4. Click **Install**

### Manual Installation

1. In Foundry VTT, go to **Add-on Modules**
2. Click **Install Module**
3. Paste this manifest URL:
```
   https://github.com/Ayabara1013/greenbottles-hacking-quips/releases/latest/download/module.json
```
4. Click **Install**

## Usage

### For GMs

1. Enable the module in your world
2. When a player makes a Computers skill check **without a pre-set DC**, GM adjudication buttons will appear below the roll
3. Click the appropriate result button (Critical Success, Success, Failure, or Critical Failure)
4. If the result is a failure, a random quip will be displayed to the player

### Timber Sentinel

When any chat message contains "Timber Sentinel" (from the kineticist ability), the module automatically posts a follow-up message with a random tree or coral species. Configure which types appear and what details are shown in the module settings.

### Knives & Daggers

1. Open the **Compendium** tab in the sidebar
2. Find **Greenbottle's Macros** under the module's compendiums
3. Drag **"Roll Random Knife/Dagger"** to your macro hotbar
4. Click it to roll a random blade with full details

### Custom Data

You can add your own trees or coral by editing the JSON files in the module's `data/` folder:
- `custom-trees.json` — add entries with `{ "name": "...", "flavor": "..." }`
- `custom-coral.json` — add entries with `{ "name": "...", "scientific_name": "...", "type": "...", "flavor": "...", "fun_facts": [...] }`

### For Players

When your hacking check fails, you'll see a humorous programming-related error message in chat. Don't worry - it's all in good fun!

## Module Settings

| Setting | Description | Default |
|---|---|---|
| **Disable Buttons Instead of Removing** | Grey out buttons after use instead of removing | Off |
| **Hide Success Buttons** | Only show Failure/Critical Failure buttons | Off |
| **Simplified Failure** | Combine Failure and Critical Failure into one button | Off |
| **Timber Sentinel Types: Trees** | Include trees in the Timber Sentinel pool | On |
| **Timber Sentinel Types: Coral** | Include coral in the Timber Sentinel pool | On |
| **Timber Sentinel: Simple Name** | Show only the species name, no flavor text | Off |
| **Timber Sentinel: Uppercase** | Display species name in uppercase | Off |
| **Timber Sentinel: Emphatic** | Add an exclamation mark after the species name | Off |
| **Coral Detail: Flavor Text** | Show fantasy flavor sentence for coral | On |
| **Coral Detail: Scientific Name** | Show Latin binomial for coral | On |
| **Coral Detail: Coral Type** | Show type badge (Hard/Soft/Fire/Other) | On |
| **Coral Detail: Fun Facts Button** | Show clickable fun facts button for coral | On |
| **Knives: Pronunciation** | Show pronunciation guide | On |
| **Knives: Category** | Show category (combat, utility, etc.) | On |
| **Knives: Origin** | Show historical origin | On |
| **Knives: Blade** | Show blade specifications | On |
| **Knives: Handle** | Show handle material | On |
| **Knives: Description** | Show full description | On |
| **Knives: Uses** | Show intended uses | On |

## Requirements

- **Foundry VTT**: Version 13
- **Game System**: Pathfinder 2e
- **Recommended**: Starfinder Anachronism module (for Starfinder 2e content)

## Compatibility

- Foundry VTT v13
- Pathfinder 2e system
- Works with Starfinder 2e via Starfinder Anachronism module

## Credits

**Author**: Doc_ (Greenbottle)
**Repository**: [GitHub](https://github.com/Ayabara1013/greenbottles-hacking-quips)

Special thanks to the Foundry VTT and Pathfinder 2e communities!

## Changelog

### v2.1.0 - Knives, Daggers & Roll Tables
- Added Knives & Daggers randomizer with 25 blades and toggleable detail fields
- Added compendium roll tables for Trees, Corals, and Knives/Daggers
- Added compendium macro: "Roll Random Knife/Dagger"
- Roll tables auto-populate on first GM load

### v2.0.0 - Timber Sentinel: Coral Edition
- Added 100 coral species with scientific names, types, flavor text, and fun facts
- Added coral detail toggles (flavor, scientific name, type badge, fun facts button)
- Clickable fun facts button reveals all facts about the coral species
- Type toggle system: enable/disable trees and coral independently
- 50/50 random type selection when both types are enabled

### v1.1.0 - Settings n' stuff
- Added options for hiding success buttons and merging failure buttons
- The "disable failure button" feature works, but doesn't grey out the button yet
- There MAY be working detection of checks with included DCs

### v1.0.0 - Initial Release
- 20 programming-related quips for failed hacking checks
- GM adjudication controls for skill checks without DCs
- Automatic detection of Computers skill checks
