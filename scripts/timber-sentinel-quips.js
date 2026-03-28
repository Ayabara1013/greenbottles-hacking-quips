/**
 * timber-sentinel-quips.js — Greenbottle's Hacking Quips
 *
 * Handles the Timber Sentinel feature: when any chat message contains the text
 * "Timber Sentinel", this class picks a random tree or coral species from its
 * loaded JSON data and posts a flavoured chat message.
 *
 * Data sources (loaded at init from module's /data/ folder):
 *   data/trees.json        — tree species with flavor text
 *   data/coral.json        — coral species with scientific name, type, flavor, fun facts
 *   data/custom-trees.json — optional GM-provided extra trees (merged in if present)
 *   data/custom-coral.json — optional GM-provided extra corals (merged in if present)
 *
 * Display behaviour is controlled by several module settings (registered here):
 *   timberSentinelPool                                    — dropdown: 'trees' | 'coral' | 'both'
 *   timberSentinelSimple / Uppercase / Emphatic           — name formatting options
 *   timberSentinelShowFlavor / ShowScientific / ShowCoralType / ShowFunFacts — coral detail toggles
 *
 * Used by: hacking-quips.js — called from onRenderChatMessage when TimberSentinel.check() returns true.
 */
export class TimberSentinel {
  static MODULE_ID = null;

  // Synchronous dedup: tracks message IDs already handled this session,
  // guarding against the race where renderChatMessage fires again before
  // setFlag() has persisted (which would let handle() run twice).
  static _processedIds = new Set();

  static resourceTypes = {
    trees: { entries: [], icon: 'fa-tree' },
    coral: { entries: [], icon: 'fa-water' }
  };

  static async loadResources(moduleId) {
    this.MODULE_ID = moduleId;
    const modulePath = `modules/${moduleId}`;

    await Promise.all([
      this._loadResourceType('trees', `${modulePath}/data/trees.json`, `${modulePath}/data/custom-trees.json`),
      this._loadResourceType('coral', `${modulePath}/data/coral.json`, `${modulePath}/data/custom-coral.json`)
    ]);
  }

  static async _loadResourceType(typeName, defaultPath, customPath) {
    const type = this.resourceTypes[typeName];
    if (!type) return;

    try {
      const defaultResponse = await fetch(defaultPath);
      if (defaultResponse.ok) {
        const defaultEntries = await defaultResponse.json();
        type.entries = defaultEntries;
        console.log(`Timber Sentinel | Loaded ${defaultEntries.length} default ${typeName}`);
      } else {
        console.warn(`Timber Sentinel | Could not load ${defaultPath}`);
      }

      try {
        const customResponse = await fetch(customPath);
        if (customResponse.ok) {
          const customEntries = await customResponse.json();
          if (Array.isArray(customEntries) && customEntries.length > 0) {
            type.entries = type.entries.concat(customEntries);
            console.log(`Timber Sentinel | Loaded ${customEntries.length} custom ${typeName} (${type.entries.length} total)`);
          }
        }
      } catch (e) {
        // Custom file is optional, silently ignore
      }
    } catch (e) {
      console.error(`Timber Sentinel | Error loading ${typeName} data:`, e);
    }
  }

  static registerSettings(moduleId) {
    // Pool selection dropdown
    game.settings.register(moduleId, 'timberSentinelPool', {
      name: 'Timber Sentinel: Species Pool',
      hint: 'Choose which species pool the Timber Sentinel draws from.',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        trees: 'Trees only',
        coral: 'Coral only',
        both:  'Both (random each time)'
      },
      default: 'trees'
    });

    // Display settings (apply to all types)
    game.settings.register(moduleId, 'timberSentinelSimple', {
      name: 'Timber Sentinel: Simple Name',
      hint: 'When enabled, only the species name is shown instead of full flavor text.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'timberSentinelUppercase', {
      name: 'Timber Sentinel: Uppercase',
      hint: 'When enabled, the species name is displayed in uppercase.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'timberSentinelEmphatic', {
      name: 'Timber Sentinel: Emphatic',
      hint: 'When enabled, an exclamation mark is added after the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    // Detail toggles (apply to both trees and coral)
    game.settings.register(moduleId, 'timberSentinelShowFlavor', {
      name: 'Detail: Flavor Text',
      hint: 'When enabled, the flavor sentence is shown. When disabled, only the species name is displayed.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowScientific', {
      name: 'Detail: Scientific Name',
      hint: 'When enabled, the scientific name is shown below the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowCoralType', {
      name: 'Detail: Species Type',
      hint: 'When enabled, the species type (e.g. Deciduous Tree, Hard Coral) is shown.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowFunFacts', {
      name: 'Detail: Fun Facts Button',
      hint: 'When enabled, a clickable button is shown that reveals fun facts about the species.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  static check(message) {
    const flavor = message.flavor?.toLowerCase() || '';
    const content = message.content?.toLowerCase() || '';
    return flavor.includes('timber sentinel') || content.includes('timber sentinel');
  }

  static handle(message) {
    // Only the GM creates the response — prevents duplicate posts when multiple clients are connected
    if (!game.user.isGM) return;

    // Synchronous guard: prevents a second call sneaking through before setFlag() persists
    if (this._processedIds.has(message.id)) return;
    this._processedIds.add(message.id);

    // Persistent guard: prevents re-trigger across reloads / re-renders of old messages
    if (message.getFlag(this.MODULE_ID, 'timberProcessed')) return;

    // Build list of enabled types based on pool setting
    const pool = game.settings.get(this.MODULE_ID, 'timberSentinelPool');
    const enabledTypes = Object.entries(this.resourceTypes)
      .filter(([key, type]) => {
        const inPool = pool === 'both' || pool === key;
        return inPool && type.entries.length > 0;
      });

    if (enabledTypes.length === 0) return;

    // Pick a random type (equal weight per type)
    const [typeName, chosenType] = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

    // Pick a random entry from that type
    const entry = chosenType.entries[Math.floor(Math.random() * chosenType.entries.length)];

    // Read display settings
    const simple = game.settings.get(this.MODULE_ID, 'timberSentinelSimple');
    const uppercase = game.settings.get(this.MODULE_ID, 'timberSentinelUppercase');
    const emphatic = game.settings.get(this.MODULE_ID, 'timberSentinelEmphatic');

    // Format the species name
    let speciesName = entry.name;
    if (uppercase) speciesName = speciesName.toUpperCase();
    if (emphatic) speciesName = speciesName + '!';

    // Build HTML based on type
    let contentHtml;
    if (typeName === 'coral') {
      contentHtml = this._buildCoralHtml(entry, speciesName, simple, uppercase, emphatic, chosenType.icon);
    } else {
      contentHtml = this._buildTreeHtml(entry, speciesName, simple, chosenType.icon);
    }

    // Mark as processed
    message.setFlag(this.MODULE_ID, 'timberProcessed', true);

    // Create the chat message
    const speaker = message.speaker;
    ChatMessage.create({
      content: contentHtml,
      speaker: speaker,
      flags: {
        [this.MODULE_ID]: {
          isTimberQuip: true
        }
      }
    });
  }

  // Shared detail rendering — used by both trees and coral.
  // typeSuffix is the word appended to the type field, e.g. "Tree" → "Deciduous Tree", "Coral" → "Hard Coral".
  // cssExtra is an optional extra CSS class on the wrapper div.
  // icon is the FA icon class string.
  static _buildEntryHtml(entry, speciesName, simple, icon, typeSuffix, cssExtra = '') {
    const showFlavor    = game.settings.get(this.MODULE_ID, 'timberSentinelShowFlavor');
    const showScientific = game.settings.get(this.MODULE_ID, 'timberSentinelShowScientific');
    const showType      = game.settings.get(this.MODULE_ID, 'timberSentinelShowCoralType');
    const showFunFacts  = game.settings.get(this.MODULE_ID, 'timberSentinelShowFunFacts');

    let html = `<div class="timber-sentinel-quip${cssExtra ? ' ' + cssExtra : ''}">`;
    html += `<div class="timber-sentinel-title"><i class="fas ${icon}"></i> ${speciesName}</div>`;

    // Flavor text
    if (!simple && showFlavor) {
      let flavor = entry.flavor;
      if (speciesName !== entry.name) flavor = flavor.replace(entry.name, speciesName);
      html += `<div class="timber-sentinel-flavor">${flavor}</div>`;
    }

    // Detail line (scientific name · type)
    const detailParts = [];
    if (showScientific && entry.scientific_name) {
      detailParts.push(`<span class="timber-sentinel-scientific"><i>${entry.scientific_name}</i></span>`);
    }
    if (showType && entry.type) {
      const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1) + ' ' + typeSuffix;
      detailParts.push(`<span class="timber-sentinel-type-badge">${typeLabel}</span>`);
    }
    if (detailParts.length > 0) {
      html += `<div class="timber-sentinel-details">${detailParts.join(' · ')}</div>`;
    }

    // Fun facts button + hidden panel
    if (showFunFacts && entry.fun_facts && entry.fun_facts.length > 0) {
      const factsHtml = entry.fun_facts.map(f => `<li>${f}</li>`).join('');
      html += `<button class="timber-sentinel-funfact-btn">🌿 Fun Facts</button>`;
      html += `<div class="timber-sentinel-funfact" style="display:none;"><ul>${factsHtml}</ul></div>`;
    }

    html += `</div>`;
    return html;
  }

  static _buildTreeHtml(entry, speciesName, simple, icon) {
    return this._buildEntryHtml(entry, speciesName, simple, icon, 'Tree');
  }

  static _buildCoralHtml(entry, speciesName, simple, uppercase, emphatic, icon) {
    return this._buildEntryHtml(entry, speciesName, simple, icon, 'Coral', 'timber-sentinel-coral');
  }
}
