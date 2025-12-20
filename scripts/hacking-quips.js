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
    Hooks.on('renderChatMessage', this.onRenderChatMessage.bind(this));
    
    // Register socket for cross-client communication
    game.socket.on(`module.${this.MODULE_ID}`, this.handleSocket.bind(this));
  }
  
  static onRenderChatMessage(message, html, data) {
    // Temporary debug - helps us see what skill checks look like
    const flags = message.flags;
    if (flags?.pf2e?.context) {
      console.log('Hacking Quips | Skill Check Detected:', {
        skill: flags.pf2e.context.skill,
        flavor: message.flavor,
        dc: flags.pf2e.context.dc,
        fullContext: flags.pf2e.context
      });
    }
    
    // Only process for GMs
    if (!game.user.isGM) return;
    
    // Check if this is a skill check without a DC
    if (!flags?.pf2e?.context) return;
    
    const context = flags.pf2e.context;
    
    // Check if there's already a DC set (skip if there is)
    if (context.dc) return;
    
    // Check if it's already been adjudicated
    if (message.getFlag(this.MODULE_ID, 'adjudicated')) return;
    
    // Check if it's a Computers check (hacking skill in SF2e)
    const isHackingCheck = context.skill === 'computers' || 
                          context.skill === 'cmp' ||
                          message.flavor?.toLowerCase().includes('computers') ||
                          message.flavor?.toLowerCase().includes('hacking');
    
    if (!isHackingCheck) return;
    
    // Get the roll total
    const rollTotal = message.rolls?.[0]?.total;
    if (!rollTotal) return;
    
    console.log('Hacking Quips | Adding GM controls for roll:', rollTotal);
    
    // Add GM controls
    this.addGMControls(html, message, rollTotal);
  }
  
  static addGMControls(html, message, rollTotal) {
    // Check if controls already exist
    if (html.find('.hacking-gm-controls').length > 0) return;
    
    const controlsHtml = `
      <div class="hacking-gm-controls" data-message-id="${message.id}">
        <div class="hacking-controls-header">
          <strong>GM: Adjudicate Hacking Check (Roll: ${rollTotal})</strong>
        </div>
        <div class="hacking-controls-buttons">
          <button class="hacking-result-btn critical-success" data-result="criticalSuccess">
            <i class="fas fa-check-double"></i> Critical Success
          </button>
          <button class="hacking-result-btn success" data-result="success">
            <i class="fas fa-check"></i> Success
          </button>
          <button class="hacking-result-btn failure" data-result="failure">
            <i class="fas fa-times"></i> Failure
          </button>
          <button class="hacking-result-btn critical-failure" data-result="criticalFailure">
            <i class="fas fa-times-circle"></i> Critical Failure
          </button>
        </div>
      </div>
    `;
    
    // Insert after the message content
    const messageContent = html.find('.message-content');
    messageContent.append(controlsHtml);
    
    // Add click handlers
    html.find('.hacking-result-btn').on('click', (event) => {
      const result = event.currentTarget.dataset.result;
      this.adjudicateCheck(message, result, rollTotal);
    });
  }
  
  static async adjudicateCheck(message, result, rollTotal) {
    console.log('Hacking Quips | Adjudicating check as:', result);
    
    // Mark as adjudicated
    await message.setFlag(this.MODULE_ID, 'adjudicated', true);
    await message.setFlag(this.MODULE_ID, 'result', result);
    
    // Remove the controls from all clients
    game.socket.emit(`module.${this.MODULE_ID}`, {
      action: 'removeControls',
      messageId: message.id
    });
    
    // Remove locally
    this.removeControls(message.id);
    
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
      case 'showQuip':
        this.displayQuip(data.quip, data.speaker, data.userId);
        break;
    }
  }
}

Hooks.once('init', () => {
  HackingQuips.initialize();
});