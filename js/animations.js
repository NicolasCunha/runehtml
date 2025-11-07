// Animation Manager - Handles skill-specific animations based on level
// Animations progress and change every 10 levels

class AnimationManager {
    constructor() {
        // Define animations for each skill at different level ranges
        this.animations = {
            melee: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `   ___
  /o o\\
 (  ~  )
  \\___/
   |||
  /   \\`,
                        name: 'Training on Slimes',
                        bgElements: '* ~ *'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `   /\\__/\\
  ( o.o )
   > ^ <
  /|   |\\
   WWWW`,
                        name: 'Fighting Goblins',
                        bgElements: '† ⚔ †'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `   ___
  |o o|
  | - |
  |___|
  |▓▓▓|
  |▓▓▓|`,
                        name: 'Battling Skeletons',
                        bgElements: '† ⚔ †'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `  /\\_/\\
 ( O.O )
  > ^ <
 /|▓▓▓|\\
  MMMMM`,
                        name: 'Fighting Werewolves',
                        bgElements: '☾ ⚔ ☾'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `   /‾‾‾\\
  ( ◉◉ )
   \\___/
   /███\\
  /█████\\`,
                        name: 'Slaying Demons',
                        bgElements: '~ ⚔ ~'
                    },
                    {
                        min: 51, max: 99,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚔ │
  └───┘`,
                        target: `   {‡}
  ╱|╲╱|╲
 ▓▓▓▓▓▓▓
  ╲ ╲ ╱ ╱
   WWWWW`,
                        name: 'Defeating Dragons',
                        bgElements: '⚡ ‡ ⚡'
                    }
                ]
            },
            defense: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
  ┌─┼─┐
  │ | │
  │/ \\│
  └───┘
 ⚔ → ▬`,
                        target: ``,
                        name: 'Blocking with Wooden Shield',
                        bgElements: '⚔ | ⚔'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
  ┌─┼─┐
  │ | │
  │/ \\│
  └───┘
 ⚔ → ▬`,
                        target: ``,
                        name: 'Iron Shield Training',
                        bgElements: '⚔ ⚒ ⚔'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
  ┌═┼═┐
  ║ | ║
  ║/ \\║
  └═══┘
 ⚔ → ▬`,
                        target: ``,
                        name: 'Steel Shield Defense',
                        bgElements: '⚔ ⚡ ⚔'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
  ╔═┼═╗
  ║ | ║
  ║/ \\║
  ╚═══╝
 ⚔ ⇒ ▬`,
                        target: ``,
                        name: 'Mithril Shield Mastery',
                        bgElements: '* ▬ *'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
  ╔═┼═╗
  ║ | ║
  ║/ \\║
  ╚═══╝
 ~ ⇒ ▬`,
                        target: ``,
                        name: 'Adamant Shield Training',
                        bgElements: '◆ ▬ ◆'
                    },
                    {
                        min: 51, max: 99,
                        character: `    O
  ╔═┼═╗
  ║ | ║
  ║/ \\║
  ╚═══╝
 ⚡ ⇒ ▬`,
                        target: ``,
                        name: 'Legendary Shield Defense',
                        bgElements: '⚡ ♛ ⚡'
                    }
                ]
            },
            ranged: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `  ┌─┐
  │●│
  └─┘
  Hay
 Bale`,
                        name: 'Shooting Hay Bales',
                        bgElements: '→ ◉ →'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `  ┌─┐
  │ │
  │●│
  │ │
  └─┘
 Target`,
                        name: 'Target Practice',
                        bgElements: '→ → →'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `   ≈
  \\|/
  /|\\
  / \\
 Flying
  Bird`,
                        name: 'Hunting Birds',
                        bgElements: '≈ ~ ≈'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `  /\\_/\\
 ( x.x )
  > < <
  /|||\\
  Rabbit`,
                        name: 'Hunting Rabbits',
                        bgElements: '∴ ~ ∴'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `  /‾‾‾\\
 ( •.• )
  \\___/
  /|||\\
  MMMM
  Boar`,
                        name: 'Hunting Boars',
                        bgElements: '§ ♠ §'
                    },
                    {
                        min: 51, max: 99,
                        character: `    O
   /|)━━⟶
   / \\
  ┌───┐
  │ ↣ │
  └───┘`,
                        target: `   {≈}
  ╱|╲╱|╲
 ▓▓▓▓▓▓
  ╲ ╲ ╱
 Wyvern`,
                        name: 'Hunting Wyverns',
                        bgElements: '≈ ⚡ ≈'
                    }
                ]
            },
            mining: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░░░░░░░ │
│ ░▓▓▓▓░░ │
│ ░░▓▓░░░ │
└─────────┘`,
                        name: 'Mining Rocks',
                        bgElements: '∴ ⛏ ∴'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░░○○░░░ │
│ ░○▓▓○░░ │
│ ░░○○░░░ │
└─────────┘`,
                        name: 'Mining Tin Ore',
                        bgElements: '○ ⛏ ○'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░░███░░ │
│ ░█▓▓▓█░ │
│ ░░███░░ │
└─────────┘`,
                        name: 'Mining Iron Ore',
                        bgElements: '◘ ⛏ ◘'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░▓▓▓▓░░ │
│ ░▓███▓░ │
│ ░▓▓▓▓░░ │
└─────────┘`,
                        name: 'Mining Coal',
                        bgElements: '● ~ ●'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░▓▓▓▓░░ │
│ ▓█▓▓▓█▓ │
│ ░▓▓▓▓░░ │
└─────────┘`,
                        name: 'Mining Gold Ore',
                        bgElements: '$ * $'
                    },
                    {
                        min: 51, max: 60,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░◊◊◊◊░░ │
│ ◊█▓▓█◊░ │
│ ░◊◊◊◊░░ │
└─────────┘`,
                        name: 'Mining Mithril Ore',
                        bgElements: '◊ ⛏ ◊'
                    },
                    {
                        min: 61, max: 70,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ░▓███▓░ │
│ ▓█▓▓▓█▓ │
│ ░▓███▓░ │
└─────────┘`,
                        name: 'Mining Adamantite',
                        bgElements: '◆ * ◆'
                    },
                    {
                        min: 71, max: 99,
                        character: `    O
   ⛏\\
   / \\
  ┌───┐
  │ ⛏ │
  └───┘`,
                        target: `
┌─────────┐
│ ◊█▓▓█◊░ │
│ █▓███▓█ │
│ ◊█▓▓█◊░ │
└─────────┘`,
                        name: 'Mining Runite Ore',
                        bgElements: '♦ * ♦'
                    }
                ]
            },
            woodcutting: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `    ♣
   ♣♣♣
   ║║║
   ║║║
  ━━━━━
 Normal
  Tree`,
                        name: 'Chopping Normal Trees',
                        bgElements: '∴ ═ ∴'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `    ♠
   ♠♠♠
  ♠♠♠♠♠
   ║║║
   ║║║
  ━━━━━
   Oak
  Tree`,
                        name: 'Chopping Oak Trees',
                        bgElements: '∴ ═ ∴'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `    ♦
   ♦♦♦
  ♦♦♦♦♦
 ♦♦♦♦♦♦♦
   ║║║
   ║║║
  ━━━━━
 Willow
  Tree`,
                        name: 'Chopping Willow Trees',
                        bgElements: '≈ ═ ≈'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `   ▲▲▲
  ▲▲▲▲▲
 ▲▲▲▲▲▲▲
   ║║║
   ║║║
  ━━━━━
 Maple
  Tree`,
                        name: 'Chopping Maple Trees',
                        bgElements: '† ═ †'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `    ♣
   ♣♣♣
  ♣♣♣♣♣
 ♣♣♣♣♣♣♣
   ║║║
   ║║║
  ━━━━━
   Yew
  Tree`,
                        name: 'Chopping Yew Trees',
                        bgElements: '♠ ═ ♠'
                    },
                    {
                        min: 51, max: 60,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `   ✦✦✦
  ✦✦✦✦✦
 ✦✦✦✦✦✦✦
   ║║║
   ║║║
  ━━━━━
 Magic
  Tree`,
                        name: 'Chopping Magic Trees',
                        bgElements: '* ═ *'
                    },
                    {
                        min: 61, max: 99,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⚒ │
  └───┘`,
                        target: `   ◊◊◊
  ◊◊◊◊◊
 ◊◊◊◊◊◊◊
◊◊◊◊◊◊◊◊◊
   ║║║
   ║║║
  ━━━━━
 Redwood
  Tree`,
                        name: 'Chopping Redwood Trees',
                        bgElements: '♛ ═ ♛'
                    }
                ]
            },
            chemistry: {
                ranges: [
                    {
                        min: 1, max: 10,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ≈ ║
  ║≈≈≈║
  ╚═══╝
  Basic
 Potion`,
                        name: 'Brewing Basic Potions',
                        bgElements: '~ ⌬ ~'
                    },
                    {
                        min: 11, max: 20,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ~ ║
  ║~♥~║
  ╚═══╝
 Health
 Potion`,
                        name: 'Crafting Health Potions',
                        bgElements: '♥ ⌬ ♥'
                    },
                    {
                        min: 21, max: 30,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ≋ ║
  ║≋♦≋║
  ╚═══╝
  Mana
 Potion`,
                        name: 'Brewing Mana Potions',
                        bgElements: '◊ ⌬ ◊'
                    },
                    {
                        min: 31, max: 40,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ⚡ ║
  ║⚡★⚡║
  ╚═══╝
 Energy
 Potion`,
                        name: 'Mixing Energy Potions',
                        bgElements: '⚡ ⚙ ⚡'
                    },
                    {
                        min: 41, max: 50,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ☠ ║
  ║☠◆☠║
  ╚═══╝
 Poison
  Vial`,
                        name: 'Concocting Poisons',
                        bgElements: '† ☠ †'
                    },
                    {
                        min: 51, max: 60,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ~ ║
  ║~◈~║
  ╚═══╝
  Fire
 Elixir`,
                        name: 'Brewing Fire Elixirs',
                        bgElements: '~ * ~'
                    },
                    {
                        min: 61, max: 70,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ * ║
  ║*◇*║
  ╚═══╝
  Frost
 Elixir`,
                        name: 'Creating Frost Elixirs',
                        bgElements: '* ◇ *'
                    },
                    {
                        min: 71, max: 80,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ✦ ║
  ║✦★✦║
  ╚═══╝
 Divine
 Elixir`,
                        name: 'Distilling Divine Elixirs',
                        bgElements: '* ★ *'
                    },
                    {
                        min: 81, max: 99,
                        character: `    O
   /|\\
   / \\
  ┌───┐
  │ ⌬ │
  └───┘`,
                        target: `  ╔═══╗
  ║ ♛ ║
  ║♛◆♛║
  ╚═══╝
 Elixir
of Life`,
                        name: 'Creating Elixir of Life',
                        bgElements: '♛ ✦ ♛'
                    }
                ]
            }
        };
    }

    /**
     * Get the appropriate animation for a skill based on level
     * @param {string} skillKey - The skill being trained
     * @param {number} level - The current skill level
     * @returns {Object} - Animation data
     */
    getAnimation(skillKey, level) {
        const skillAnimations = this.animations[skillKey];
        
        if (!skillAnimations) {
            return this.getDefaultAnimation();
        }

        // Find the appropriate animation range
        for (const range of skillAnimations.ranges) {
            if (level >= range.min && level <= range.max) {
                return range;
            }
        }

        // Fallback to the last range if level is beyond
        return skillAnimations.ranges[skillAnimations.ranges.length - 1];
    }

    /**
     * Get default idle animation
     * @returns {Object} - Default animation data
     */
    getDefaultAnimation() {
        return {
            character: `  O
 /|\\
 / \\`,
            target: '',
            name: 'Idle',
            bgElements: '* * *'
        };
    }
}

// Export the animation manager
const animationManager = new AnimationManager();
