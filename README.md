# 🎮 RuneHTML

[![Play Now](https://img.shields.io/badge/Play%20Now-green?style=for-the-badge&logo=web&logoColor=white)](https://nicolascunha.github.io/runehtml/)

**A retro terminal-style idle game inspired by RuneScape**

Experience the nostalgia of classic MMORPGs combined with the aesthetic of old-school terminal interfaces. Train your skills, level up, and watch your character progress in this unique browser-based idle game.

## 🎯 Play the Game

🔗 **[https://nicolascunha.github.io/runehtml/](https://nicolascunha.github.io/runehtml/)**

No installation required - just open the link and start playing!

## ✨ Features

### 🖥️ Terminal Aesthetic
- Retro CRT screen effects with scanlines and vignette
- Classic pixelated font (Press Start 2P)
- Green terminal glow and animations
- Old-school terminal borders and UI

### 🎯 Gameplay
- **6 Skills to Train**: Melee Combat, Defense, Ranged, Mining, Woodcutting, and Chemistry
- **99 Levels per Skill**: Exponential progression system inspired by RuneScape
- **Progressive Animations**: Unique ASCII art animations that evolve every 10 levels
- **Offline Training**: Earn 80% experience while away from the game
- **Auto-Save System**: Your progress is saved automatically every 30 seconds
- **Multiple Save Slots**: Create and manage multiple characters with UUID-based saves

### 💾 Save System
- Create multiple characters with unique names
- Random name generator with fantasy-themed suggestions
- Track play time, total level, and last played date
- Delete saves you no longer need
- Automatic offline progress calculation

### 🎨 Skill Progression
Each skill features multiple tiers of content:
- **Mining**: From Copper to Runite ore
- **Woodcutting**: From Normal Trees to Magic Trees
- **Melee Combat**: Face various enemies from Goblins to Dragons
- **Defense**: Train against different combat scenarios
- **Ranged**: Master various ranged combat situations
- **Chemistry**: Brew potions from Basic to Master level

## 🎮 How to Play

1. **Create a Character**: Enter a username or use the random name generator
2. **Choose a Skill**: Click on any skill card to start training
3. **Watch the Progress**: See your character perform actions with ASCII animations
4. **Level Up**: Gain experience and level up your skills (1-99)
5. **Explore Content**: Unlock new animations and content every 10 levels
6. **Take Breaks**: The game continues training offline at 80% efficiency

## 🛠️ Technical Details

Built with pure vanilla technologies:
- **HTML5** for structure
- **CSS3** with custom animations and effects
- **Vanilla JavaScript** (ES6+ classes and modules)
- **localStorage API** for persistent saves
- **No frameworks or dependencies** - just pure web technologies

### Architecture
- Modular ES6 class-based design
- Separation of concerns (UI, State, Storage, Game Logic)
- Event-driven architecture
- Custom modal system
- Progressive skill system with dynamic content

## 🎲 Game Mechanics

### Experience & Leveling
Uses a RuneScape-inspired exponential formula where:
- Each level requires progressively more experience
- Level 92 is halfway to level 99 in terms of total experience
- Actions grant 10-30 random experience every 2 seconds

### Offline Training
- If you're away for more than 5 minutes, offline gains are calculated
- Offline training grants 80% of normal experience
- Automatically resumes your last training activity
- Shows a summary of your offline progress

## 🎨 Inspiration

RuneHTML is inspired by the classic MMORPG **RuneScape**, featuring:
- The iconic skill system with 99 level cap
- Exponential leveling curve
- Various skills like Mining, Woodcutting, and Combat
- Progressive content unlocking
- Idle-style gameplay perfect for casual gaming

Combined with the aesthetic of retro terminal interfaces, creating a unique blend of old-school gaming nostalgia.

## 🤖 Development

This project was created with the assistance of **Claude 3.5 Sonnet** by Anthropic, demonstrating the power of AI-assisted development in creating complete, functional web applications.

### Features Implemented
- Complete game loop with training mechanics
- Multi-save system with UUID identification
- Offline progression calculation
- Custom modal dialogs
- Progressive animation system
- Auto-save and manual save functionality
- Play time tracking across sessions

## 📜 License

This is a fan project inspired by RuneScape. RuneScape is a trademark of Jagex Ltd.

## 🎮 Future Ideas

Potential features for future development:
- Resource gathering and inventory system
- Equipment and upgrades
- Combat mechanics
- Quests and achievements
- More skills and content
- Prestige system

---

**Made with ❤️ and Claude 3.5 Sonnet**

[Play Now](https://nicolascunha.github.io/runehtml/) | [Report Issues](https://github.com/nicolascunha/runehtml/issues)
