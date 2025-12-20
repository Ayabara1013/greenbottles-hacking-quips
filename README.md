# Greenbottle's Hacking Quips

A Foundry VTT module that adds witty programming and hacking-related error messages to failed Computers skill checks in Starfinder 2e (using Pathfinder 2e system).

## Features

- **20 Programming-Related Quips**: Displays random error messages when hacking attempts fail
- **GM Adjudication Controls**: Adds interactive buttons for GMs to determine success/failure on skill checks without pre-set DCs
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

- **Foundry VTT**: Version 12 or higher (tested on v13)
- **Game System**: Pathfinder 2e
- **Recommended**: Starfinder Anachronism module (for Starfinder 2e content)

## Compatibility

- Foundry VTT v12+
- Pathfinder 2e system
- Works with Starfinder 2e via Starfinder Anachronism module

## Known Issues

None at this time! If you find a bug, please [report it](https://github.com/Ayabara1013/greenbottles-hacking-quips/issues).

## Roadmap

Potential future features:
- Customizable quip lists via module settings
- Support for other sci-fi skill checks
- Localization support
- Sound effects for critical failures

## Contributing

Contributions are welcome! If you have suggestions for new quips or features:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Or simply [open an issue](https://github.com/Ayabara1013/greenbottles-hacking-quips/issues) with your ideas!

## License

This module is licensed under the [MIT License](LICENSE).

## Credits

**Author**: Doc_ (Greenbottle)  
**Repository**: [GitHub](https://github.com/Ayabara1013/greenbottles-hacking-quips)

Special thanks to the Foundry VTT and Pathfinder 2e communities!

## Support

If you enjoy this module, consider:
- ⭐ Starring the [GitHub repository](https://github.com/Ayabara1013/greenbottles-hacking-quips)
- 🐛 Reporting bugs via [GitHub Issues](https://github.com/Ayabara1013/greenbottles-hacking-quips/issues)
- 💡 Suggesting new quips or features

## Changelog

### v1.0.0 - Initial Release
- 20 programming-related quips for failed hacking checks
- GM adjudication controls for skill checks without DCs
- Automatic detection of Computers skill checks
