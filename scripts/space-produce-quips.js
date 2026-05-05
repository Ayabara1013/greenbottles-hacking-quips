/**
 * space-produce-quips.js — Greenbottle's Hacking Quips
 *
 * Handles the Stellar Harvest feature: when any chat message contains the text
 * "Stellar Harvest", this class picks a random space fruit or vegetable from its
 * loaded JSON data and posts a flavoured chat message.
 *
 * Data sources (loaded at init from module's /data/ folder):
 *   data/space-produce.json        — all entries; split into fruits/vegetables by produce_type
 *   data/custom-space-produce.json — optional GM-provided extra entries (merged in if present)
 *
 * Each entry schema:
 *   name           — display name
 *   scientific_name — fictional scientific name
 *   produce_type   — "fruit" | "vegetable" (determines resource pool)
 *   taxonomy       — human-readable type label, e.g. "Berry", "Root Vegetable"
 *   origin         — planet, moon, or station of origin
 *   flavor         — flavour text for chat display
 *   fun_facts      — array of fun fact strings
 *
 * Display behaviour is controlled by module settings (registered here):
 *   stellarHarvestPool                                    — dropdown: 'fruits' | 'vegetables' | 'both'
 *   stellarHarvestSimple / Uppercase / Emphatic           — name formatting options
 *   stellarHarvestShowFlavor / ShowScientific / ShowTaxonomy / ShowOrigin / ShowFunFacts
 *
 * Trigger: any chat message whose content or flavor contains "stellar harvest" (case-insensitive).
 *
 * Used by: hacking-quips.js — called from onRenderChatMessage when SpaceProduce.check() returns true.
 */
export class SpaceProduce {
  static MODULE_ID = null;

  // Synchronous dedup: tracks message IDs already handled this session,
  // guarding against the race where renderChatMessage fires again before
  // setFlag() has persisted.
  static _processedIds = new Set();

  static resourceTypes = {
    fruits:     { entries: [], icon: 'fa-apple-alt' },
    vegetables: { entries: [], icon: 'fa-seedling' }
  };

  static async loadResources(moduleId) {
    this.MODULE_ID = moduleId;
    const modulePath = `modules/${moduleId}`;

    try {
      const response = await fetch(`${modulePath}/data/space-produce.json`);
      if (response.ok) {
        const allEntries = await response.json();
        this.resourceTypes.fruits.entries     = allEntries.filter(e => e.produce_type === 'fruit');
        this.resourceTypes.vegetables.entries = allEntries.filter(e => e.produce_type === 'vegetable');
        console.log(
          `Stellar Harvest | Loaded ${this.resourceTypes.fruits.entries.length} fruits, ` +
          `${this.resourceTypes.vegetables.entries.length} vegetables`
        );
      } else {
        console.warn(`Stellar Harvest | Could not load space-produce.json`);
      }

      try {
        const customResponse = await fetch(`${modulePath}/data/custom-space-produce.json`);
        if (customResponse.ok) {
          const customEntries = await customResponse.json();
          if (Array.isArray(customEntries) && customEntries.length > 0) {
            const customFruits = customEntries.filter(e => e.produce_type === 'fruit');
            const customVeg    = customEntries.filter(e => e.produce_type === 'vegetable');
            this.resourceTypes.fruits.entries     = this.resourceTypes.fruits.entries.concat(customFruits);
            this.resourceTypes.vegetables.entries = this.resourceTypes.vegetables.entries.concat(customVeg);
            console.log(
              `Stellar Harvest | Loaded ${customEntries.length} custom entries ` +
              `(${this.resourceTypes.fruits.entries.length} fruits, ` +
              `${this.resourceTypes.vegetables.entries.length} vegetables total)`
            );
          }
        }
      } catch (e) {
        // Custom file is optional — silently ignore
      }
    } catch (e) {
      console.error('Stellar Harvest | Error loading produce data:', e);
    }
  }

  static registerSettings(moduleId) {
    // Pool selection dropdown
    game.settings.register(moduleId, 'stellarHarvestPool', {
      name: 'Stellar Harvest: Produce Pool',
      hint: 'Choose which produce pool Stellar Harvest draws from.',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        fruits:     'Fruits only',
        vegetables: 'Vegetables only',
        both:       'Both (random each time)'
      },
      default: 'both'
    });

    // Name formatting
    game.settings.register(moduleId, 'stellarHarvestSimple', {
      name: 'Stellar Harvest: Simple Name',
      hint: 'When enabled, only the species name is shown instead of full flavor text.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'stellarHarvestUppercase', {
      name: 'Stellar Harvest: Uppercase',
      hint: 'When enabled, the species name is displayed in uppercase.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'stellarHarvestEmphatic', {
      name: 'Stellar Harvest: Emphatic',
      hint: 'When enabled, an exclamation mark is added after the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    // Detail toggles
    game.settings.register(moduleId, 'stellarHarvestShowFlavor', {
      name: 'Stellar Harvest Detail: Flavor Text',
      hint: 'Show the flavor sentence for the selected produce.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'stellarHarvestShowScientific', {
      name: 'Stellar Harvest Detail: Scientific Name',
      hint: 'Show the scientific name below the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'stellarHarvestShowTaxonomy', {
      name: 'Stellar Harvest Detail: Taxonomy',
      hint: 'Show the taxonomy type (e.g. Berry, Root Vegetable).',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'stellarHarvestShowOrigin', {
      name: 'Stellar Harvest Detail: Origin',
      hint: 'Show the planet, moon, or station of origin.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'stellarHarvestShowFunFacts', {
      name: 'Stellar Harvest Detail: Fun Facts Button',
      hint: 'Show a clickable button that reveals fun facts about the produce.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  static check(message) {
    const flavor  = message.flavor?.toLowerCase() || '';
    const content = message.content?.toLowerCase() || '';
    return flavor.includes('stellar harvest') || content.includes('stellar harvest');
  }

  static handle(message) {
    // Only the GM creates the response — prevents duplicate posts from multiple connected clients
    if (!game.user.isGM) return;

    // Synchronous guard: prevents a second call sneaking through before setFlag() persists
    if (this._processedIds.has(message.id)) return;
    this._processedIds.add(message.id);

    // Persistent guard: prevents re-trigger across reloads / re-renders of old messages
    if (message.getFlag(this.MODULE_ID, 'stellarHarvestProcessed')) return;

    // Build list of enabled pools based on setting
    const pool = game.settings.get(this.MODULE_ID, 'stellarHarvestPool');
    const enabledTypes = Object.entries(this.resourceTypes)
      .filter(([key, type]) => {
        const inPool = pool === 'both' || pool === key;
        return inPool && type.entries.length > 0;
      });

    if (enabledTypes.length === 0) return;

    // Pick a random pool (equal weight per type), then a random entry within it
    const [, chosenType] = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    const entry = chosenType.entries[Math.floor(Math.random() * chosenType.entries.length)];

    // Format the name
    const simple   = game.settings.get(this.MODULE_ID, 'stellarHarvestSimple');
    const uppercase = game.settings.get(this.MODULE_ID, 'stellarHarvestUppercase');
    const emphatic  = game.settings.get(this.MODULE_ID, 'stellarHarvestEmphatic');

    let speciesName = entry.name;
    if (uppercase) speciesName = speciesName.toUpperCase();
    if (emphatic)  speciesName = speciesName + '!';

    const contentHtml = this._buildEntryHtml(entry, speciesName, simple, chosenType.icon);

    // Mark as processed
    message.setFlag(this.MODULE_ID, 'stellarHarvestProcessed', true);

    // Create the chat message
    ChatMessage.create({
      content: contentHtml,
      speaker: message.speaker,
      flags: {
        [this.MODULE_ID]: {
          isStellarHarvestQuip: true
        }
      }
    });
  }

  static _buildEntryHtml(entry, speciesName, simple, icon) {
    const showFlavor     = game.settings.get(this.MODULE_ID, 'stellarHarvestShowFlavor');
    const showScientific = game.settings.get(this.MODULE_ID, 'stellarHarvestShowScientific');
    const showTaxonomy   = game.settings.get(this.MODULE_ID, 'stellarHarvestShowTaxonomy');
    const showOrigin     = game.settings.get(this.MODULE_ID, 'stellarHarvestShowOrigin');
    const showFunFacts   = game.settings.get(this.MODULE_ID, 'stellarHarvestShowFunFacts');

    let html = `<div class="stellar-harvest-quip">`;
    html += `<div class="stellar-harvest-title"><i class="fas ${icon}"></i> ${speciesName}</div>`;

    // Flavor text
    if (!simple && showFlavor && entry.flavor) {
      let flavor = entry.flavor;
      if (speciesName !== entry.name) flavor = flavor.replace(entry.name, speciesName);
      html += `<div class="stellar-harvest-flavor">${flavor}</div>`;
    }

    // Detail line: scientific name · taxonomy · origin
    const detailParts = [];
    if (showScientific && entry.scientific_name) {
      detailParts.push(`<span class="stellar-harvest-scientific"><i>${entry.scientific_name}</i></span>`);
    }
    if (showTaxonomy && entry.taxonomy) {
      detailParts.push(`<span class="stellar-harvest-type-badge">${entry.taxonomy}</span>`);
    }
    if (showOrigin && entry.origin) {
      detailParts.push(`<span class="stellar-harvest-origin"><i class="fas fa-globe"></i> ${entry.origin}</span>`);
    }
    if (detailParts.length > 0) {
      html += `<div class="stellar-harvest-details">${detailParts.join(' · ')}</div>`;
    }

    // Fun facts button + hidden panel
    if (showFunFacts && entry.fun_facts && entry.fun_facts.length > 0) {
      const factsHtml = entry.fun_facts.map(f => `<li>${f}</li>`).join('');
      html += `<button class="stellar-harvest-funfact-btn">🌌 Fun Facts</button>`;
      html += `<div class="stellar-harvest-funfact" style="display:none;"><ul>${factsHtml}</ul></div>`;
    }

    html += `</div>`;
    return html;
  }
}
