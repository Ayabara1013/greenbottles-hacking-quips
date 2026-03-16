export class CompendiumPopulator {
  static MODULE_ID = 'greenbottles-hacking-quips';

  static async populate() {
    if (!game.user.isGM) return;

    await this._populateKnivesDaggersTable();
    await this._populateTreesTable();
    await this._populateCoralsTable();
    await this._populateMacros();
  }

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
            category: knife.category,
            origin: knife.origin,
            blade: knife.blade,
            handle: knife.handle,
            description: knife.description,
            uses: knife.uses
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
            flavor: tree.flavor
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
            type: coral.type,
            flavor: coral.flavor,
            fun_facts: coral.fun_facts
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

  static async _populateMacros() {
    await this._populateIfEmpty('macros', async (pack) => {
      const macroCommand = `// Roll Random Knife/Dagger - Greenbottle's Hacking Quips
(async () => {
  const MODULE_ID = 'greenbottles-hacking-quips';
  const pack = game.packs.get(MODULE_ID + '.knives-daggers-table');
  if (!pack) {
    ui.notifications.error("Knives & Daggers compendium not found!");
    return;
  }

  const documents = await pack.getDocuments();
  const table = documents[0];
  if (!table) {
    ui.notifications.error("Knives & Daggers roll table not found!");
    return;
  }

  const roll = await table.roll();
  const result = roll.results[0];
  const flags = result.flags?.[MODULE_ID] || {};

  const name = result.text;
  const s = (key) => game.settings.get(MODULE_ID, key);

  let html = '<div class="knife-dagger-result">';
  html += '<h3><i class="fas fa-khanda"></i> ' + name + '</h3>';

  if (s('knivesShowPronunciation') && flags.pronunciation) {
    html += '<div class="knife-pronunciation">' + flags.pronunciation + '</div>';
  }
  if (s('knivesShowDescription') && flags.description) {
    html += '<div class="knife-description">' + flags.description + '</div>';
  }

  const details = [];
  if (s('knivesShowCategory') && flags.category) details.push('<div><strong>Category:</strong> ' + flags.category + '</div>');
  if (s('knivesShowOrigin') && flags.origin) details.push('<div><strong>Origin:</strong> ' + flags.origin + '</div>');
  if (s('knivesShowBlade') && flags.blade) details.push('<div><strong>Blade:</strong> ' + flags.blade + '</div>');
  if (s('knivesShowHandle') && flags.handle) details.push('<div><strong>Handle:</strong> ' + flags.handle + '</div>');
  if (s('knivesShowUses') && flags.uses) details.push('<div><strong>Uses:</strong> ' + flags.uses + '</div>');

  if (details.length > 0) {
    html += '<div class="knife-details">' + details.join('') + '</div>';
  }

  html += '</div>';

  ChatMessage.create({
    content: html,
    speaker: ChatMessage.getSpeaker()
  });
})();`;

      await Macro.create({
        name: 'Roll Random Knife/Dagger',
        type: 'script',
        command: macroCommand
      }, { pack: `${this.MODULE_ID}.macros` });

      console.log(`${this.MODULE_ID} | Populated macros compendium`);
    });
  }
}
