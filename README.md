# Greenbottle's Hacking Quips

A Foundry VTT module that adds witty programming and hacking-related error messages to failed Computers skill checks in Starfinder 2e (using Pathfinder 2e system).

## Features

- **20 Programming-Related Quips**: Displays random error messages when hacking attempts fail
- **GM Controls**: Adds interactive buttons for GMs to determine success/failure on skill checks without pre-set DCs
- **Automatic Detection**: Triggers on Computers skill checks or any check with "hacking" in the description
- **Player Feedback**: Failed attempts show humorous messages to keep the mood light

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

### For Players

When your hacking check fails, you'll see a humorous programming-related error message in chat. Don't worry - it's all in good fun!

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

### v1.0.0 - Initial Release
- 20 programming-related quips for failed hacking checks
- GM adjudication controls for skill checks without DCs
- Automatic detection of Computers skill checks


### v1.1.0 - settings n' stuff
- added some options so there are actually settings to change (hiding success buttons, merging failure buttons)
- the "disable failure button" feature works, but doesn't grey out the button yet
- there MAY be working detection of checks with included DCs