const HACKING_QUIPS = [
  "Your exploit crashes with a segmentation fault. Time to debug.",
  "Error 404: Access not found. Maybe try turning it off and on again?",
  "You forgot to sanitize your inputs and the firewall sanitized YOU instead.",
  "The system returns 'Permission Denied' in 47 different languages simultaneously.",
  "Your brute force attack was more 'brute' than 'force' – the system is laughing at you.",
  "Stack overflow! No, not the website – your actual intrusion buffer just exploded.",
  "You triggered an infinite loop and your hacking kit is now stuck counting to infinity.",
  "The ICE detects your presence. Turns out commenting your code with 'todo: make stealthy' wasn't enough.",
  "Null pointer exception! Your connection points to nothing but empty space and regret.",
  "You mixed up your bitwise operators. The door is now locked 65,535 times harder.",
  "Syntax error on line 1. Also lines 2 through 47. The compiler is judging you.",
  "Your script kiddie copy-paste from the darknet forums was... not compatible with this architecture.",
  "Connection timeout. The system ghosted you harder than your last datamatch.",
  "You divided by zero. Somewhere, a mathematician is crying, and the firewall is laughing.",
  "The system patches your vulnerability before you finish typing. Did it just... learn from you?",
  "Your SQL injection attempt results in a database returning only cat videos. Unhelpful, but adorable.",
  "Memory leak detected – specifically, your memory of how to do this properly.",
  "The honeypot trap was obvious. You still walked right into it. The sysadmin is sending you a 'thanks for playing' message.",
  "Your encryption key was rejected. Turns out 'password123' doesn't crack military-grade security.",
  "Kernel panic! Not in the system – in you. You're panicking. The kernel is fine and mocking you."
];

class HackingQuips {
  static MODULE_ID = 'greenbottles-hacking-quips';
  
  static initialize() {
    console.log('Hacking Quips | Initializing module');
    
    // Register module settings
    this.registerSettings();
    
    Hooks.on('renderChatMessage', this.onRenderChatMessage.bind(this));
    
    // Register socket for cross-client communication
    game.socket.on(`module.${this.MODULE_ID}`, this.handleSocket.bind(this));
  }
  
  static registerSettings() {
    game.settings.register(this.MODULE_ID, 'disableInsteadOfRemove', {
      name: 'Disable Buttons Instead of Removing',
      hint: 'When enabled, buttons will be greyed out and disabled after use instead of being removed.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
    
    game.settings.register(this.MODULE_ID, 'hideSuccessButtons', {
      name: 'Hide Success Buttons',
      hint: 'When enabled, only Failure and Critical Failure buttons will be shown for adjudication.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
    
    game.settings.register(this.MODULE_ID, 'simplifiedFailure', {
      name: 'Simplified Failure Button',
      hint: 'When enabled, combine Failure and Critical Failure into a single "Failure" button.',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
  }
  
  static onRenderChatMessage(message, html, data) {
    // Temporary debug - helps us see what skill checks look like
    const flags = message.flags;
    if (flags?.pf2e?.context) {
      console.log('Hacking Quips | Skill Check Detected:', {
        skill: flags.pf2e.context.skill,
        flavor: message.flavor,
        dc: flags.pf2e.context.dc,
        outcome: flags.pf2e.context.outcome,
        fullContext: flags.pf2e.context
      });
    }
    
    // Only process for GMs
    if (!game.user.isGM) return;
    
    // Check if this is a skill check
    if (!flags?.pf2e?.context) return;
    
    const context = flags.pf2e.context;
    
    // Check if it's already been processed
    if (message.getFlag(this.MODULE_ID, 'processed')) {
      // If we're in "disable mode", re-render the disabled state
      if (game.settings.get(this.MODULE_ID, 'disableInsteadOfRemove')) {
        this.renderDisabledState(html, message);
      }
      return;
    }
    
    // Check if it's a Computers check (hacking skill in SF2e)
    const isHackingCheck = context.skill === 'computers' || 
                          context.skill === 'cmp' ||
                          message.flavor?.toLowerCase().includes('computers') ||
                          message.flavor?.toLowerCase().includes('hacking');
    
    if (!isHackingCheck) return;
    
    // Get the roll total
    const rollTotal = message.rolls?.[0]?.total;
    if (!rollTotal) return;
    
    // Check if there's a DC set
    if (context.dc) {
      // DC is set - check if it's a failure and offer to show quip
      const outcome = context.outcome;
      const isFailure = outcome === 'failure' || outcome === 'criticalFailure';
      
      if (isFailure) {
        console.log('Hacking Quips | Adding quip button for failed check with DC');
        this.addQuipButton(html, message, rollTotal);
      }
    } else {
      // No DC - show adjudication controls
      console.log('Hacking Quips | Adding GM controls for roll:', rollTotal);
      this.addGMControls(html, message, rollTotal);
    }
  }
  
  static renderDisabledState(html, message) {
    const savedResult = message.getFlag(this.MODULE_ID, 'result');
    
    // Check if this had adjudication controls
    if (savedResult) {
      this.addGMControls(html, message, message.rolls?.[0]?.total, true);
    } else {
      // It was a quip button
      this.addQuipButton(html, message, message.rolls?.[0]?.total, true);
    }
  }
  
  static addQuipButton(html, message, rollTotal, isDisabled = false) {
    // Check if button already exists
    if (html.find('.hacking-quip-button').length > 0) return;
    
    const buttonHtml = `
      <div class="hacking-quip-button-container" data-message-id="${message.id}">
        <button class="hacking-quip-button ${isDisabled ? 'disabled' : ''}" ${isDisabled ? 'disabled' : ''}>
          <i class="fas fa-terminal"></i> ${isDisabled ? 'Quip Shown' : 'Show Hacking Quip'}
        </button>
      </div>
    `;
    
    // Insert after the message content
    const messageContent = html.find('.message-content');
    messageContent.append(buttonHtml);
    
    // Add click handler only if not disabled
    if (!isDisabled) {
      html.find('.hacking-quip-button').on('click', (event) => {
        this.showQuipFromButton(message);
      });
    }
  }
  
  static async showQuipFromButton(message) {
    // Mark as processed
    await message.setFlag(this.MODULE_ID, 'processed', true);
    
    const disableMode = game.settings.get(this.MODULE_ID, 'disableInsteadOfRemove');
    
    if (disableMode) {
      // Disable the button on all clients
      game.socket.emit(`module.${this.MODULE_ID}`, {
        action: 'disableButton',
        messageId: message.id
      });
      
      // Disable locally
      this.disableButton(message.id);
    } else {
      // Remove the button from all clients
      game.socket.emit(`module.${this.MODULE_ID}`, {
        action: 'removeButton',
        messageId: message.id
      });
      
      // Remove locally
      this.removeButton(message.id);
    }
    
    // Show a random quip
    const quip = HACKING_QUIPS[Math.floor(Math.random() * HACKING_QUIPS.length)];
    const speaker = message.speaker;
    
    console.log('Hacking Quips | Displaying quip from button:', quip);
    
    // Emit to all clients to show the quip
    game.socket.emit(`module.${this.MODULE_ID}`, {
      action: 'showQuip',
      quip: quip,
      speaker: speaker,
      userId: message.user.id
    });
    
    // Show locally
    this.displayQuip(quip, speaker, message.user.id);
  }
  
  static addGMControls(html, message, rollTotal, isDisabled = false) {
    // Check if controls already exist
    if (html.find('.hacking-gm-controls').length > 0) return;
    
    const hideSuccess = game.settings.get(this.MODULE_ID, 'hideSuccessButtons');
    const simplifiedFailure = game.settings.get(this.MODULE_ID, 'simplifiedFailure');
    const savedResult = message.getFlag(this.MODULE_ID, 'result');
    
    let buttonsHtml = '';
    
    if (!hideSuccess) {
      buttonsHtml += `
        <button class="hacking-result-btn critical-success ${isDisabled && savedResult !== 'criticalSuccess' ? 'disabled' : ''}" 
                data-result="criticalSuccess" 
                ${isDisabled && savedResult !== 'criticalSuccess' ? 'disabled' : ''}>
          <i class="fas fa-check-double"></i> Critical Success
        </button>
        <button class="hacking-result-btn success ${isDisabled && savedResult !== 'success' ? 'disabled' : ''}" 
                data-result="success" 
                ${isDisabled && savedResult !== 'success' ? 'disabled' : ''}>
          <i class="fas fa-check"></i> Success
        </button>
      `;
    }
    
    if (simplifiedFailure) {
      buttonsHtml += `
        <button class="hacking-result-btn failure ${isDisabled && savedResult !== 'failure' && savedResult !== 'criticalFailure' ? 'disabled' : ''}" 
                data-result="failure" 
                ${isDisabled && savedResult !== 'failure' && savedResult !== 'criticalFailure' ? 'disabled' : ''}>
          <i class="fas fa-times"></i> Failure
        </button>
      `;
    } else {
      buttonsHtml += `
        <button class="hacking-result-btn failure ${isDisabled && savedResult !== 'failure' ? 'disabled' : ''}" 
                data-result="failure" 
                ${isDisabled && savedResult !== 'failure' ? 'disabled' : ''}>
          <i class="fas fa-times"></i> Failure
        </button>
        <button class="hacking-result-btn critical-failure ${isDisabled && savedResult !== 'criticalFailure' ? 'disabled' : ''}" 
                data-result="criticalFailure" 
                ${isDisabled && savedResult !== 'criticalFailure' ? 'disabled' : ''}>
          <i class="fas fa-times-circle"></i> Critical Failure
        </button>
      `;
    }
    
    const controlsHtml = `
      <div class="hacking-gm-controls" data-message-id="${message.id}">
        <div class="hacking-controls-header">
          <strong>GM: Adjudicate Hacking Check (Roll: ${rollTotal})</strong>
        </div>
        <div class="hacking-controls-buttons">
          ${buttonsHtml}
        </div>
      </div>
    `;
    
    // Insert after the message content
    const messageContent = html.find('.message-content');
    messageContent.append(controlsHtml);
    
    // Add click handlers only for enabled buttons
    if (!isDisabled) {
      html.find('.hacking-result-btn').on('click', (event) => {
        const result = event.currentTarget.dataset.result;
        this.adjudicateCheck(message, result, rollTotal);
      });
    }
  }
  
  static async adjudicateCheck(message, result, rollTotal) {
    console.log('Hacking Quips | Adjudicating check as:', result);
    
    // Mark as processed
    await message.setFlag(this.MODULE_ID, 'processed', true);
    await message.setFlag(this.MODULE_ID, 'result', result);
    
    const disableMode = game.settings.get(this.MODULE_ID, 'disableInsteadOfRemove');
    
    if (disableMode) {
      // Disable the controls on all clients
      game.socket.emit(`module.${this.MODULE_ID}`, {
        action: 'disableControls',
        messageId: message.id,
        result: result
      });
      
      // Disable locally
      this.disableControls(message.id, result);
    } else {
      // Remove the controls from all clients
      game.socket.emit(`module.${this.MODULE_ID}`, {
        action: 'removeControls',
        messageId: message.id
      });
      
      // Remove locally
      this.removeControls(message.id);
    }
    
    // Post result to chat
    const speaker = message.speaker;
    const actorName = speaker.alias || 'Unknown';
    
    let resultText = '';
    let resultClass = '';
    
    switch(result) {
      case 'criticalSuccess':
        resultText = 'Critical Success';
        resultClass = 'critical-success';
        break;
      case 'success':
        resultText = 'Success';
        resultClass = 'success';
        break;
      case 'failure':
        resultText = 'Failure';
        resultClass = 'failure';
        break;
      case 'criticalFailure':
        resultText = 'Critical Failure';
        resultClass = 'critical-failure';
        break;
    }
    
    // Create result message
    await ChatMessage.create({
      content: `<div class="hacking-result ${resultClass}">
        <strong>${actorName}'s hacking check (${rollTotal}):</strong> ${resultText}
      </div>`,
      speaker: speaker
    });
    
    // If it's a failure, show a quip
    if (result === 'failure' || result === 'criticalFailure') {
      const quip = HACKING_QUIPS[Math.floor(Math.random() * HACKING_QUIPS.length)];
      
      console.log('Hacking Quips | Displaying quip:', quip);
      
      // Emit to all clients to show the quip
      game.socket.emit(`module.${this.MODULE_ID}`, {
        action: 'showQuip',
        quip: quip,
        speaker: speaker,
        userId: message.user.id
      });
      
      // Show locally
      this.displayQuip(quip, speaker, message.user.id);
    }
  }
  
  static removeControls(messageId) {
    const messageElement = $(`.chat-message[data-message-id="${messageId}"]`);
    messageElement.find('.hacking-gm-controls').remove();
  }
  
  static disableControls(messageId, selectedResult) {
    const messageElement = $(`.chat-message[data-message-id="${messageId}"]`);
    const buttons = messageElement.find('.hacking-result-btn');
    
    buttons.each(function() {
      const button = $(this);
      const buttonResult = button.data('result');
      
      if (buttonResult !== selectedResult) {
        button.addClass('disabled');
        button.prop('disabled', true);
      }
    });
  }
  
  static removeButton(messageId) {
    const messageElement = $(`.chat-message[data-message-id="${messageId}"]`);
    messageElement.find('.hacking-quip-button-container').remove();
  }
  
  static disableButton(messageId) {
    const messageElement = $(`.chat-message[data-message-id="${messageId}"]`);
    const button = messageElement.find('.hacking-quip-button');
    
    button.addClass('disabled');
    button.prop('disabled', true);
    button.html('<i class="fas fa-terminal"></i> Quip Shown');
  }
  
  static displayQuip(quip, speaker, userId) {
    // Only show to the player who rolled or the GM
    if (game.user.id !== userId && !game.user.isGM) return;
    
    ChatMessage.create({
      content: `<div class="hacking-quip"><em>${quip}</em></div>`,
      speaker: speaker,
      whisper: game.user.isGM ? [] : [game.user.id],
      flags: {
        [this.MODULE_ID]: {
          isQuip: true
        }
      }
    });
  }
  
  static handleSocket(data) {
    switch(data.action) {
      case 'removeControls':
        this.removeControls(data.messageId);
        break;
      case 'disableControls':
        this.disableControls(data.messageId, data.result);
        break;
      case 'removeButton':
        this.removeButton(data.messageId);
        break;
      case 'disableButton':
        this.disableButton(data.messageId);
        break;
      case 'showQuip':
        this.displayQuip(data.quip, data.speaker, data.userId);
        break;
    }
  }
}

Hooks.once('init', () => {
  HackingQuips.initialize();
});