/**
 * compendium-populator.js — Greenbottle's Hacking Quips
 *
 * Populates the module's compendium packs on first load (GM only).
 * Roll tables use _populateIfEmpty (skip if the pack has any entries).
 * Macros use _createMacroIfMissing (skip per-macro by name, so new macros
 * can be added to an already-populated pack across module updates).
 *
 * Packs populated:
 *   knives-daggers-table    — RollTable from data/knives_and_daggers.json
 *   trees-table             — RollTable from data/trees.json
 *   corals-table            — RollTable from data/coral.json
 *   space-fruits-table      — RollTable from data/space-produce.json (fruits only)
 *   space-vegetables-table  — RollTable from data/space-produce.json (vegetables only)
 *   macros                  — Roll Random Knife/Dagger, Roll Random Tree,
 *                             Roll Random Coral, Roll Random Space Fruit,
 *                             Roll Random Space Vegetable
 *
 * Called from: hacking-quips.js on the 'ready' hook.
 */
export class CompendiumPopulator {
  static MODULE_ID = 'greenbottles-hacking-quips';

  static async populate() {
    if (!game.user.isGM) return;

    await this._populateKnivesDaggersTable();
    await this._populateTreesTable();
    await this._populateCoralsTable();
    await this._populateSpaceFruitsTable();
    await this._populateSpaceVegetablesTable();
    await this._populateMacros();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  static async _populateIfEmpty(packKey, createFn) {
    const pack = game.packs.get(`${this.MODULE_ID}.${packKey}`);
    if (!pack) return;

    const index = await pack.getIndex();
    if (index.size > 0) return;

    await pack.configure({ locked: false });
    try {
      await createFn(pack);
    } finally {
      await pack.configure({ locked: true });
    }
  }

  // Creates a macro only if no macro with that name already exists in the pack.
  // This lets us add new macros across updates without wiping existing ones.
  static async _createMacroIfMissing(pack, name, command) {
    const index = await pack.getIndex();
    if (index.some(e => e.name === name)) return;
    await Macro.create(
      { name, type: 'script', command },
      { pack: `${this.MODULE_ID}.macros` }
    );
    console.log(`${this.MODULE_ID} | Created macro: ${name}`);
  }

  // ---------------------------------------------------------------------------
  // Roll tables
  // ---------------------------------------------------------------------------

  static async _populateKnivesDaggersTable() {
    await this._populateIfEmpty('knives-daggers-table', async (pack) => {
      const response = await fetch(`modules/${this.MODULE_ID}/data/knives_and_daggers.json`);
      const knives = await response.json();

      const results = knives.map((knife, i) => ({
        type: CONST.TABLE_RESULT_TYPES.TEXT,
        text: knife.name,
        range: [i + 1, i + 1],
        weight: 1,
        drawn: false,
        flags: {
          [this.MODULE_ID]: {
            pronunciation: knife.pronunciation,
            category:      knife.category,
            origin:        knife.origin,
            blade:         knife.blade,
            handle:        knife.handle,
            description:   knife.description,
            uses:          knife.uses
          }
        }
      }));

      await RollTable.create({
        name: 'Knives & Daggers',
        formula: `1d${knives.length}`,
        replacement: true,
        displayRoll: true,
        results: results
      }, { pack: `${this.MODULE_ID}.knives-daggers-table` });

      console.log(`${this.MODULE_ID} | Populated Knives & Daggers table with ${knives.length} entries`);
    });
  }

  static async _populateTreesTable() {
    await this._populateIfEmpty('trees-table', async (pack) => {
      const response = await fetch(`modules/${this.MODULE_ID}/data/trees.json`);
      const trees = await response.json();

      const results = trees.map((tree, i) => ({
        type: CONST.TABLE_RESULT_TYPES.TEXT,
        text: tree.name,
        range: [i + 1, i + 1],
        weight: 1,
        drawn: false,
        flags: {
          [this.MODULE_ID]: {
            scientific_name: tree.scientific_name,
            type:            tree.type,
            flavor:          tree.flavor,
            fun_facts:       tree.fun_facts
          }
        }
      }));

      await RollTable.create({
        name: 'Timber Sentinel: Trees',
        formula: `1d${trees.length}`,
        replacement: true,
        displayRoll: true,
        results: results
      }, { pack: `${this.MODULE_ID}.trees-table` });

      console.log(`${this.MODULE_ID} | Populated Trees table with ${trees.length} entries`);
    });
  }

  static async _populateCoralsTable() {
    await this._populateIfEmpty('corals-table', async (pack) => {
      const response = await fetch(`modules/${this.MODULE_ID}/data/coral.json`);
      const corals = await response.json();

      const results = corals.map((coral, i) => ({
        type: CONST.TABLE_RESULT_TYPES.TEXT,
        text: coral.name,
        range: [i + 1, i + 1],
        weight: 1,
        drawn: false,
        flags: {
          [this.MODULE_ID]: {
            scientific_name: coral.scientific_name,
            type:            coral.type,
            flavor:          coral.flavor,
            fun_facts:       coral.fun_facts
          }
        }
      }));

      await RollTable.create({
        name: 'Timber Sentinel: Corals',
        formula: `1d${corals.length}`,
        replacement: true,
        displayRoll: true,
        results: results
      }, { pack: `${this.MODULE_ID}.corals-table` });

      console.log(`${this.MODULE_ID} | Populated Corals table with ${corals.length} entries`);
    });
  }

  static async _populateSpaceFruitsTable() {
    await this._populateIfEmpty('space-fruits-table', async (pack) => {
      const response = await fetch(`modules/${this.MODULE_ID}/data/space-produce.json`);
      const allEntries = await response.json();
      const fruits = allEntries.filter(e => e.produce_type === 'fruit');

      const results = fruits.map((entry, i) => ({
        type: CONST.TABLE_RESULT_TYPES.TEXT,
        text: entry.name,
        range: [i + 1, i + 1],
        weight: 1,
        drawn: false,
        flags: {
          [this.MODULE_ID]: {
            scientific_name: entry.scientific_name,
            taxonomy:        entry.taxonomy,
            origin:          entry.origin,
            flavor:          entry.flavor,
            fun_facts:       entry.fun_facts
          }
        }
      }));

      await RollTable.create({
        name: 'Stellar Harvest: Space Fruits',
        formula: `1d${fruits.length}`,
        replacement: true,
        displayRoll: true,
        results: results
      }, { pack: `${this.MODULE_ID}.space-fruits-table` });

      console.log(`${this.MODULE_ID} | Populated Space Fruits table with ${fruits.length} entries`);
    });
  }

  static async _populateSpaceVegetablesTable() {
    await this._populateIfEmpty('space-vegetables-table', async (pack) => {
      const response = await fetch(`modules/${this.MODULE_ID}/data/space-produce.json`);
      const allEntries = await response.json();
      const vegetables = allEntries.filter(e => e.produce_type === 'vegetable');

      const results = vegetables.map((entry, i) => ({
        type: CONST.TABLE_RESULT_TYPES.TEXT,
        text: entry.name,
        range: [i + 1, i + 1],
        weight: 1,
        drawn: false,
        flags: {
          [this.MODULE_ID]: {
            scientific_name: entry.scientific_name,
            taxonomy:        entry.taxonomy,
            origin:          entry.origin,
            flavor:          entry.flavor,
            fun_facts:       entry.fun_facts
          }
        }
      }));

      await RollTable.create({
        name: 'Stellar Harvest: Space Vegetables',
        formula: `1d${vegetables.length}`,
        replacement: true,
        displayRoll: true,
        results: results
      }, { pack: `${this.MODULE_ID}.space-vegetables-table` });

      console.log(`${this.MODULE_ID} | Populated Space Vegetables table with ${vegetables.length} entries`);
    });
  }

  // ---------------------------------------------------------------------------
  // Macros
  // ---------------------------------------------------------------------------

  static async _populateMacros() {
    const pack = game.packs.get(`${this.MODULE_ID}.macros`);
    if (!pack) return;

    await pack.configure({ locked: false });
    try {
      await this._createMacroIfMissing(pack, 'Roll Random Knife/Dagger', `\
// Roll Random Knife/Dagger — Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.knives-daggers-table');
  if (!pack) { ui.notifications.error("Knives & Daggers compendium not found!"); return; }
  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) { ui.notifications.error("Knives & Daggers roll table not found!"); return; }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};
  const name = result.text;
  const s = (key) => game.settings.get(MODULE_ID, key);

  let html = '<div class="knife-dagger-result">';
  html += '<h3><i class="fas fa-khanda"></i> ' + name + '</h3>';

  if (s('knivesShowPronunciation') && flags.pronunciation)
    html += '<div class="knife-pronunciation">' + flags.pronunciation + '</div>';
  if (s('knivesShowDescription') && flags.description)
    html += '<div class="knife-description">' + flags.description + '</div>';

  const details = [];
  if (s('knivesShowCategory') && flags.category) details.push('<div><strong>Category:</strong> ' + flags.category + '</div>');
  if (s('knivesShowOrigin')   && flags.origin)   details.push('<div><strong>Origin:</strong> '   + flags.origin   + '</div>');
  if (s('knivesShowBlade')    && flags.blade)     details.push('<div><strong>Blade:</strong> '    + flags.blade    + '</div>');
  if (s('knivesShowHandle')   && flags.handle)    details.push('<div><strong>Handle:</strong> '   + flags.handle   + '</div>');
  if (s('knivesShowUses')     && flags.uses)      details.push('<div><strong>Uses:</strong> '     + flags.uses     + '</div>');
  if (details.length > 0) html += '<div class="knife-details">' + details.join('') + '</div>';

  html += '</div>';
  ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker() });
})();`);

      await this._createMacroIfMissing(pack, 'Roll Random Tree', `\
// Roll Random Tree — Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.trees-table');
  if (!pack) { ui.notifications.error("Trees compendium not found!"); return; }
  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) { ui.notifications.error("Trees roll table not found!"); return; }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};
  const s = (key) => game.settings.get(MODULE_ID, key);

  let name = result.text;
  if (s('timberSentinelUppercase')) name = name.toUpperCase();
  if (s('timberSentinelEmphatic'))  name = name + '!';

  let html = '<div class="timber-sentinel-quip">';
  html += '<div class="timber-sentinel-title"><i class="fas fa-tree"></i> ' + name + '</div>';

  if (!s('timberSentinelSimple') && s('timberSentinelShowFlavor') && flags.flavor)
    html += '<div class="timber-sentinel-flavor">' + flags.flavor + '</div>';

  const parts = [];
  if (s('timberSentinelShowScientific') && flags.scientific_name)
    parts.push('<span class="timber-sentinel-scientific"><i>' + flags.scientific_name + '</i></span>');
  if (s('timberSentinelShowCoralType') && flags.type) {
    const label = flags.type.charAt(0).toUpperCase() + flags.type.slice(1) + ' Tree';
    parts.push('<span class="timber-sentinel-type-badge">' + label + '</span>');
  }
  if (parts.length > 0)
    html += '<div class="timber-sentinel-details">' + parts.join(' · ') + '</div>';

  if (s('timberSentinelShowFunFacts') && flags.fun_facts && flags.fun_facts.length > 0) {
    const factsHtml = flags.fun_facts.map(f => '<li>' + f + '</li>').join('');
    html += '<button class="timber-sentinel-funfact-btn">🌿 Fun Facts</button>';
    html += '<div class="timber-sentinel-funfact" style="display:none;"><ul>' + factsHtml + '</ul></div>';
  }

  html += '</div>';
  ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker() });
})();`);

      await this._createMacroIfMissing(pack, 'Roll Random Coral', `\
// Roll Random Coral — Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.corals-table');
  if (!pack) { ui.notifications.error("Corals compendium not found!"); return; }
  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) { ui.notifications.error("Corals roll table not found!"); return; }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};
  const s = (key) => game.settings.get(MODULE_ID, key);

  let name = result.text;
  if (s('timberSentinelUppercase')) name = name.toUpperCase();
  if (s('timberSentinelEmphatic'))  name = name + '!';

  let html = '<div class="timber-sentinel-quip timber-sentinel-coral">';
  html += '<div class="timber-sentinel-title"><i class="fas fa-water"></i> ' + name + '</div>';

  if (!s('timberSentinelSimple') && s('timberSentinelShowFlavor') && flags.flavor)
    html += '<div class="timber-sentinel-flavor">' + flags.flavor + '</div>';

  const parts = [];
  if (s('timberSentinelShowScientific') && flags.scientific_name)
    parts.push('<span class="timber-sentinel-scientific"><i>' + flags.scientific_name + '</i></span>');
  if (s('timberSentinelShowCoralType') && flags.type) {
    const label = flags.type.charAt(0).toUpperCase() + flags.type.slice(1) + ' Coral';
    parts.push('<span class="timber-sentinel-type-badge">' + label + '</span>');
  }
  if (parts.length > 0)
    html += '<div class="timber-sentinel-details">' + parts.join(' · ') + '</div>';

  if (s('timberSentinelShowFunFacts') && flags.fun_facts && flags.fun_facts.length > 0) {
    const factsHtml = flags.fun_facts.map(f => '<li>' + f + '</li>').join('');
    html += '<button class="timber-sentinel-funfact-btn">🌿 Fun Facts</button>';
    html += '<div class="timber-sentinel-funfact" style="display:none;"><ul>' + factsHtml + '</ul></div>';
  }

  html += '</div>';
  ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker() });
})();`);

      await this._createMacroIfMissing(pack, 'Roll Random Space Fruit', `\
// Roll Random Space Fruit — Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.space-fruits-table');
  if (!pack) { ui.notifications.error("Space Fruits compendium not found!"); return; }
  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) { ui.notifications.error("Space Fruits roll table not found!"); return; }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};
  const s = (key) => game.settings.get(MODULE_ID, key);

  let name = result.text;
  if (s('stellarHarvestUppercase')) name = name.toUpperCase();
  if (s('stellarHarvestEmphatic'))  name = name + '!';

  let html = '<div class="stellar-harvest-quip">';
  html += '<div class="stellar-harvest-title"><i class="fas fa-apple-alt"></i> ' + name + '</div>';

  if (!s('stellarHarvestSimple') && s('stellarHarvestShowFlavor') && flags.flavor)
    html += '<div class="stellar-harvest-flavor">' + flags.flavor + '</div>';

  const parts = [];
  if (s('stellarHarvestShowScientific') && flags.scientific_name)
    parts.push('<span class="stellar-harvest-scientific"><i>' + flags.scientific_name + '</i></span>');
  if (s('stellarHarvestShowTaxonomy') && flags.taxonomy)
    parts.push('<span class="stellar-harvest-type-badge">' + flags.taxonomy + '</span>');
  if (s('stellarHarvestShowOrigin') && flags.origin)
    parts.push('<span class="stellar-harvest-origin"><i class="fas fa-globe"></i> ' + flags.origin + '</span>');
  if (parts.length > 0)
    html += '<div class="stellar-harvest-details">' + parts.join(' · ') + '</div>';

  if (s('stellarHarvestShowFunFacts') && flags.fun_facts && flags.fun_facts.length > 0) {
    const factsHtml = flags.fun_facts.map(f => '<li>' + f + '</li>').join('');
    html += '<button class="stellar-harvest-funfact-btn">🌌 Fun Facts</button>';
    html += '<div class="stellar-harvest-funfact" style="display:none;"><ul>' + factsHtml + '</ul></div>';
  }

  html += '</div>';
  ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker() });
})();`);

      await this._createMacroIfMissing(pack, 'Roll Random Space Vegetable', `\
// Roll Random Space Vegetable — Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.space-vegetables-table');
  if (!pack) { ui.notifications.error("Space Vegetables compendium not found!"); return; }
  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) { ui.notifications.error("Space Vegetables roll table not found!"); return; }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};
  const s = (key) => game.settings.get(MODULE_ID, key);

  let name = result.text;
  if (s('stellarHarvestUppercase')) name = name.toUpperCase();
  if (s('stellarHarvestEmphatic'))  name = name + '!';

  let html = '<div class="stellar-harvest-quip">';
  html += '<div class="stellar-harvest-title"><i class="fas fa-seedling"></i> ' + name + '</div>';

  if (!s('stellarHarvestSimple') && s('stellarHarvestShowFlavor') && flags.flavor)
    html += '<div class="stellar-harvest-flavor">' + flags.flavor + '</div>';

  const parts = [];
  if (s('stellarHarvestShowScientific') && flags.scientific_name)
    parts.push('<span class="stellar-harvest-scientific"><i>' + flags.scientific_name + '</i></span>');
  if (s('stellarHarvestShowTaxonomy') && flags.taxonomy)
    parts.push('<span class="stellar-harvest-type-badge">' + flags.taxonomy + '</span>');
  if (s('stellarHarvestShowOrigin') && flags.origin)
    parts.push('<span class="stellar-harvest-origin"><i class="fas fa-globe"></i> ' + flags.origin + '</span>');
  if (parts.length > 0)
    html += '<div class="stellar-harvest-details">' + parts.join(' · ') + '</div>';

  if (s('stellarHarvestShowFunFacts') && flags.fun_facts && flags.fun_facts.length > 0) {
    const factsHtml = flags.fun_facts.map(f => '<li>' + f + '</li>').join('');
    html += '<button class="stellar-harvest-funfact-btn">🌌 Fun Facts</button>';
    html += '<div class="stellar-harvest-funfact" style="display:none;"><ul>' + factsHtml + '</ul></div>';
  }

  html += '</div>';
  ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker() });
})();`);

    } finally {
      await pack.configure({ locked: true });
    }
  }
}
