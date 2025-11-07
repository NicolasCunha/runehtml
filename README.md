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
- **297 Unique Enemies**: Battle against 99 distinct enemies for each combat skill
- **Combat System**: Turn-based battles with HP, damage calculation, and strategic potion usage
- **Potion System**: Use 9 different potions for healing and combat buffs
- **Progressive Animations**: Unique ASCII art animations that evolve every 10 levels
- **Fantasy Titles**: Earn 10 unique titles per skill based on your level (60 total titles)
- **Statistics Tracking**: Detailed stats including enemies defeated, potions used, and combat achievements
- **Resource Gathering**: Collect 74+ different resources (ores, logs, potions, combat drops)
- **Charm Shop**: Purchase 28 magical charms to boost your training efficiency (10%-100% bonus)
- **Smart Shopping**: Shop automatically filters to show only your current skill's charms
- **Inventory System**: Track all your collected resources organized by category
- **4 Color Themes**: Choose between Green, Amber, Blue, or Red terminal themes
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
Each skill features multiple tiers of content and resources:

**Gathering Skills:**
- **Mining**: Gather 8 ore types (Copper → Tin → Iron → Coal → Gold → Mithril → Adamant → Runite)
- **Woodcutting**: Chop 7 log types (Normal → Oak → Willow → Maple → Yew → Magic → Redwood)
- **Chemistry**: Brew 9 potions (Basic → Health → Mana → Energy → Poison → Fire → Frost → Divine → Life)

**Combat Skills:**
- **Melee Combat**: Battle 99 unique melee enemies (Rats → Goblins → Dragons → God of War) and collect combat resources
- **Defense**: Face 99 defense enemies (Angry Boar → Mammoths → Ragnarok Beast) while training your defensive skills
- **Ranged**: Fight 99 ranged enemies (Bats → Eagles → Eternal Phoenix) to master ranged combat
- **Combat Resources**: Earn 50+ combat-specific resources from defeated enemies
- **Potion Usage**: Drink healing potions (25-300 HP) or buff potions (+15% damage, fire damage, poison damage, -15% enemy damage)
- **HP System**: Player HP scales with Defense level (110-1090 HP), enemies have level-based HP
- **Strategic Combat**: Use potions wisely with 10-second cooldowns, manage buffs lasting 10 battles each

## 🎮 How to Play

1. **Create a Character**: Enter a username or use the random name generator
2. **Choose a Skill**: Click on any skill card to start training (click "Stop" to pause)
3. **Watch the Progress**: See your character perform actions with ASCII animations or engage in turn-based combat
4. **Battle Enemies**: Combat skills feature unique enemy encounters with HP bars and combat logs
5. **Use Potions**: Heal during combat or drink buff potions before battle for advantages
6. **Earn Titles**: Unlock fantasy-themed titles as you level up (e.g., "Earthshaper", "Godslayer", "Dragon Hunter")
7. **View Statistics**: Check detailed stats including enemies defeated, potions used, and time per skill
8. **Gather Resources**: Collect ores, logs, potions, and combat drops as you train
9. **Visit the Charm Shop**: Buy magical charms with your resources to boost EXP gain (10%-100%)
10. **Check Inventory**: View all your collected resources organized by category (includes combat resources!)
11. **Customize Theme**: Switch between 4 terminal color themes
12. **Level Up**: Gain experience and level up your skills (1-99)
13. **Explore Content**: Unlock new animations, enemies, and resources every 10 levels
14. **Take Breaks**: The game continues training offline at 80% efficiency

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
- Turn-based combat system with 297 unique enemies
- HP system with damage calculation and potion usage
- Healing potions (4 types) and buff potions (4 types)
- 74+ resources including combat drops
- Multi-save system with UUID identification
- 60 fantasy-themed achievement titles (10 per skill)
- Comprehensive statistics tracking (time, resources, enemies defeated, potions used)
- Resource gathering system (24 gathering resources + 50+ combat resources)
- Charm shop with 28 magical progression items
- Smart shop filtering based on active skill
- Inventory management system with combat resource categories
- Theme customization (4 color schemes)
- Offline progression calculation
- Custom modal dialogs including potion selection menus
- Progressive animation system with combat UI
- Auto-save and manual save functionality
- Play time tracking across sessions
- Stop/Start training toggle buttons
- Dynamic title display based on current skill
- Combat log and HP bars for real-time battle feedback

## 📜 License

This is a fan project inspired by RuneScape. RuneScape is a trademark of Jagex Ltd.

## 🎮 Future Ideas

Potential features for future development:
- ✅ ~~Resource gathering and inventory system~~ (Implemented!)
- ✅ ~~Equipment and charms~~ (Implemented!)
- ✅ ~~Multiple themes~~ (Implemented!)
- ✅ ~~Statistics and achievements~~ (Implemented!)
- ✅ ~~Combat mechanics with enemies~~ (Implemented!)
- Boss encounters and special combat challenges
- Quests and challenges
- Trading/Market system
- More skills (Fishing, Cooking, Smithing, Magic)
- Prestige/Mastery system
- Leaderboards

---

**Made with ❤️ and Claude 3.5 Sonnet**

[Play Now](https://nicolascunha.github.io/runehtml/) | [Report Issues](https://github.com/nicolascunha/runehtml/issues)
