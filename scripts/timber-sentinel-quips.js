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
 *   timberSentinelEnableTrees / timberSentinelEnableCoral — toggle each pool on/off
 *   timberSentinelSimple / Uppercase / Emphatic           — name formatting options
 *   timberSentinelShowFlavor / ShowScientific / ShowCoralType / ShowFunFacts — coral detail toggles
 *
 * Used by: hacking-quips.js — called from onRenderChatMessage when TimberSentinel.check() returns true.
 */
export class TimberSentinel {
  static MODULE_ID = null;

  static resourceTypes = {
    trees: { entries: [], icon: 'fa-tree', settingKey: 'timberSentinelEnableTrees' },
    coral: { entries: [], icon: 'fa-water', settingKey: 'timberSentinelEnableCoral' }
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
    // Type toggles
    game.settings.register(moduleId, 'timberSentinelEnableTrees', {
      name: 'Timber Sentinel Types: Trees',
      hint: 'When enabled, trees are included in the Timber Sentinel pool.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelEnableCoral', {
      name: 'Timber Sentinel Types: Coral',
      hint: 'When enabled, coral species are included in the Timber Sentinel pool.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
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

    // Coral detail toggles
    game.settings.register(moduleId, 'timberSentinelShowFlavor', {
      name: 'Coral Detail: Flavor Text',
      hint: 'When enabled, a fantasy-themed flavor sentence is shown for coral. When disabled, only the common name is displayed.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowScientific', {
      name: 'Coral Detail: Scientific Name',
      hint: 'When enabled, the scientific name is shown below the coral name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowCoralType', {
      name: 'Coral Detail: Coral Type',
      hint: 'When enabled, the coral type (hard, soft, fire, other) is shown.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'timberSentinelShowFunFacts', {
      name: 'Coral Detail: Fun Facts Button',
      hint: 'When enabled, a clickable button is shown that reveals fun facts about the coral.',
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

    // Prevent duplicate triggers on re-render
    if (message.getFlag(this.MODULE_ID, 'timberProcessed')) return;

    // Build list of enabled types with entries
    const enabledTypes = Object.entries(this.resourceTypes)
      .filter(([key, type]) => {
        const enabled = game.settings.get(this.MODULE_ID, type.settingKey);
        return enabled && type.entries.length > 0;
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

  static _buildTreeHtml(entry, speciesName, simple, icon) {
    let displayText;
    if (simple) {
      displayText = speciesName;
    } else {
      displayText = entry.flavor;
      if (speciesName !== entry.name) {
        displayText = displayText.replace(entry.name, speciesName);
      }
    }
    return `<div class="timber-sentinel-quip"><i class="fas ${icon}"></i> <em>${displayText}</em></div>`;
  }

  static _buildCoralHtml(entry, speciesName, simple, uppercase, emphatic, icon) {
    const showFlavor = game.settings.get(this.MODULE_ID, 'timberSentinelShowFlavor');
    const showScientific = game.settings.get(this.MODULE_ID, 'timberSentinelShowScientific');
    const showCoralType = game.settings.get(this.MODULE_ID, 'timberSentinelShowCoralType');
    const showFunFacts = game.settings.get(this.MODULE_ID, 'timberSentinelShowFunFacts');

    // Main text: flavor or just species name
    let mainText;
    if (simple || !showFlavor) {
      mainText = speciesName;
    } else {
      let flavor = entry.flavor;
      if (speciesName !== entry.name) {
        flavor = flavor.replace(entry.name, speciesName);
      }
      mainText = flavor;
    }

    let html = `<div class="timber-sentinel-quip timber-sentinel-coral">`;
    html += `<i class="fas ${icon}"></i> <em>${mainText}</em>`;

    // Detail line (scientific name + type)
    const detailParts = [];
    if (showScientific && entry.scientific_name) {
      detailParts.push(`<span class="timber-sentinel-scientific"><i>${entry.scientific_name}</i></span>`);
    }
    if (showCoralType && entry.type) {
      const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1) + ' Coral';
      detailParts.push(`<span class="timber-sentinel-type-badge">${typeLabel}</span>`);
    }
    if (detailParts.length > 0) {
      html += `<div class="timber-sentinel-details">${detailParts.join(' · ')}</div>`;
    }

    // Fun facts button + hidden panel
    if (showFunFacts && entry.fun_facts && entry.fun_facts.length > 0) {
      const factsHtml = entry.fun_facts.map(f => `<li>${f}</li>`).join('');
      html += `<button class="timber-sentinel-funfact-btn">🐚 Fun Facts</button>`;
      html += `<div class="timber-sentinel-funfact" style="display:none;"><ul>${factsHtml}</ul></div>`;
    }

    html += `</div>`;
    return html;
  }
}
