/**
 * bug-report-quips.js — Greenbottle's Hacking Quips
 *
 * Handles the Bug Report feature: when any chat message contains the text
 * "Bug Report", this class picks a random insect or arthropod from its
 * loaded JSON data and posts a flavoured chat message.
 *
 * Data sources (loaded at init from module's /data/ folder):
 *   data/bugs.json        — 100 insect and arthropod entries
 *   data/custom-bugs.json — optional GM-provided extra entries (merged in if present)
 *
 * Each entry schema:
 *   name         — display name
 *   scientific_name — Latin name
 *   bug_type     — category (beetle, moth, butterfly, ant, bee, wasp, fly, bug,
 *                  spider, arachnid, dragonfly, mantis, grasshopper, cricket,
 *                  phasmatid, myriapod, cockroach, other)
 *   origin       — geographic origin
 *   flavor       — flavour text for chat display
 *   fun_facts    — array of fun fact strings
 *
 * Display behaviour is controlled by module settings (registered here):
 *   bugReportSimple / Uppercase / Emphatic        — name formatting options
 *   bugReportShowFlavor / ShowScientific / ShowType / ShowOrigin / ShowFunFacts
 *
 * Trigger: any chat message whose content or flavor contains "bug report" (case-insensitive).
 *
 * Used by: hacking-quips.js — called from onRenderChatMessage when BugReport.check() returns true.
 */
export class BugReport {
  static MODULE_ID = null;

  // Synchronous dedup: guards against the race where renderChatMessage fires
  // again before setFlag() has persisted.
  static _processedIds = new Set();

  static entries = [];

  static async loadResources(moduleId) {
    this.MODULE_ID = moduleId;
    const modulePath = `modules/${moduleId}`;

    try {
      const response = await fetch(`${modulePath}/data/bugs.json`);
      if (response.ok) {
        this.entries = await response.json();
        console.log(`Bug Report | Loaded ${this.entries.length} bugs`);
      } else {
        console.warn(`Bug Report | Could not load bugs.json`);
      }

      try {
        const customResponse = await fetch(`${modulePath}/data/custom-bugs.json`);
        if (customResponse.ok) {
          const customEntries = await customResponse.json();
          if (Array.isArray(customEntries) && customEntries.length > 0) {
            this.entries = this.entries.concat(customEntries);
            console.log(`Bug Report | Loaded ${customEntries.length} custom bugs (${this.entries.length} total)`);
          }
        }
      } catch (e) {
        // Custom file is optional — silently ignore
      }
    } catch (e) {
      console.error('Bug Report | Error loading bug data:', e);
    }
  }

  static registerSettings(moduleId) {
    // Name formatting
    game.settings.register(moduleId, 'bugReportSimple', {
      name: 'Bug Report: Simple Name',
      hint: 'When enabled, only the species name is shown instead of full flavour text.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'bugReportUppercase', {
      name: 'Bug Report: Uppercase',
      hint: 'When enabled, the species name is displayed in uppercase.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(moduleId, 'bugReportEmphatic', {
      name: 'Bug Report: Emphatic',
      hint: 'When enabled, an exclamation mark is added after the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    // Detail toggles
    game.settings.register(moduleId, 'bugReportShowFlavor', {
      name: 'Bug Report Detail: Flavour Text',
      hint: 'Show the flavour sentence for the selected species.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'bugReportShowScientific', {
      name: 'Bug Report Detail: Scientific Name',
      hint: 'Show the scientific name below the species name.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'bugReportShowType', {
      name: 'Bug Report Detail: Type',
      hint: 'Show the bug type (e.g. Beetle, Spider, Dragonfly).',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'bugReportShowOrigin', {
      name: 'Bug Report Detail: Origin',
      hint: 'Show the geographic origin of the species.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(moduleId, 'bugReportShowFunFacts', {
      name: 'Bug Report Detail: Fun Facts Button',
      hint: 'Show a clickable button that reveals fun facts about the species.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  static check(message) {
    const flavor  = message.flavor?.toLowerCase() || '';
    const content = message.content?.toLowerCase() || '';
    return flavor.includes('bug report') || content.includes('bug report');
  }

  static handle(message) {
    if (!game.user.isGM) return;

    if (this._processedIds.has(message.id)) return;
    this._processedIds.add(message.id);

    if (message.getFlag(this.MODULE_ID, 'bugReportProcessed')) return;

    if (this.entries.length === 0) return;

    const entry = this.entries[Math.floor(Math.random() * this.entries.length)];

    const simple    = game.settings.get(this.MODULE_ID, 'bugReportSimple');
    const uppercase = game.settings.get(this.MODULE_ID, 'bugReportUppercase');
    const emphatic  = game.settings.get(this.MODULE_ID, 'bugReportEmphatic');

    let speciesName = entry.name;
    if (uppercase) speciesName = speciesName.toUpperCase();
    if (emphatic)  speciesName = speciesName + '!';

    const contentHtml = this._buildEntryHtml(entry, speciesName, simple);

    message.setFlag(this.MODULE_ID, 'bugReportProcessed', true);

    ChatMessage.create({
      content: contentHtml,
      speaker: message.speaker,
      flags: {
        [this.MODULE_ID]: {
          isBugReportQuip: true
        }
      }
    });
  }

  static _buildEntryHtml(entry, speciesName, simple) {
    const showFlavor     = game.settings.get(this.MODULE_ID, 'bugReportShowFlavor');
    const showScientific = game.settings.get(this.MODULE_ID, 'bugReportShowScientific');
    const showType       = game.settings.get(this.MODULE_ID, 'bugReportShowType');
    const showOrigin     = game.settings.get(this.MODULE_ID, 'bugReportShowOrigin');
    const showFunFacts   = game.settings.get(this.MODULE_ID, 'bugReportShowFunFacts');

    const typeIcon = this._typeIcon(entry.bug_type);

    let html = `<div class="bug-report-quip">`;
    html += `<div class="bug-report-title"><i class="fas ${typeIcon}"></i> ${speciesName}</div>`;

    if (!simple && showFlavor && entry.flavor) {
      let flavor = entry.flavor;
      if (speciesName !== entry.name) flavor = flavor.replace(entry.name, speciesName);
      html += `<div class="bug-report-flavor">${flavor}</div>`;
    }

    const detailParts = [];
    if (showScientific && entry.scientific_name) {
      detailParts.push(`<span class="bug-report-scientific"><i>${entry.scientific_name}</i></span>`);
    }
    if (showType && entry.bug_type) {
      const typeLabel = entry.bug_type.charAt(0).toUpperCase() + entry.bug_type.slice(1);
      detailParts.push(`<span class="bug-report-type-badge">${typeLabel}</span>`);
    }
    if (showOrigin && entry.origin) {
      detailParts.push(`<span class="bug-report-origin"><i class="fas fa-globe"></i> ${entry.origin}</span>`);
    }
    if (detailParts.length > 0) {
      html += `<div class="bug-report-details">${detailParts.join(' · ')}</div>`;
    }

    if (showFunFacts && entry.fun_facts && entry.fun_facts.length > 0) {
      const factsHtml = entry.fun_facts.map(f => `<li>${f}</li>`).join('');
      html += `<button class="bug-report-funfact-btn">🪲 Fun Facts</button>`;
      html += `<div class="bug-report-funfact" style="display:none;"><ul>${factsHtml}</ul></div>`;
    }

    html += `</div>`;
    return html;
  }

  static _typeIcon(bugType) {
    const icons = {
      beetle:     'fa-bug',
      moth:       'fa-moon',
      butterfly:  'fa-feather',
      ant:        'fa-bug',
      bee:        'fa-bug',
      wasp:       'fa-bug',
      fly:        'fa-bug',
      bug:        'fa-bug',
      spider:     'fa-spider',
      arachnid:   'fa-spider',
      dragonfly:  'fa-bug',
      mantis:     'fa-bug',
      grasshopper:'fa-bug',
      cricket:    'fa-bug',
      phasmatid:  'fa-leaf',
      myriapod:   'fa-bug',
      cockroach:  'fa-bug',
      other:      'fa-question-circle'
    };
    return icons[bugType] ?? 'fa-bug';
  }
}
