// Game State Manager - Handles game state initialization and updates
// This module manages all game data and state

class GameState {
    constructor() {
        // Initialize with default game state
        this.state = this.createDefaultState();
    }

    /**
     * Create a fresh game state with default values
     * @returns {Object} - New game state object
     */
    createDefaultState() {
        return {
            uuid: null,
            isPlaying: false,
            player: {
                name: 'Player',
                created: Date.now()
            },
            skills: skillsSystem.createDefaultSkills(),
            currentActivity: null,
            offlineTraining: {
                lastSaveTime: Date.now(),
                trainingSkill: null
            },
            resources: {
                // Mining ores
                copper: 0,
                tin: 0,
                iron: 0,
                coal: 0,
                gold: 0,
                mithril: 0,
                adamant: 0,
                runite: 0,
                // Woodcutting logs
                normal: 0,
                oak: 0,
                willow: 0,
                maple: 0,
                yew: 0,
                magic: 0,
                redwood: 0,
                // Chemistry potions
                basic: 0,
                health: 0,
                mana: 0,
                energy: 0,
                poison: 0,
                fire: 0,
                frost: 0,
                divine: 0,
                life: 0
            },
            currency: {
                gold: 100 // Starting gold for equipment purchases
            },
            charms: [],
            stats: {
                totalActions: 0,
                playTime: 0,
                sessionStart: Date.now(),
                skillTime: {
                    mining: 0,
                    woodcutting: 0,
                    chemistry: 0,
                    melee: 0,
                    defense: 0,
                    ranged: 0
                }
            },
            combat: {
                inCombat: false,
                skill: null,
                currentEnemy: null,
                playerMaxHP: 0,
                playerCurrentHP: 0,
                combatLog: [],
                turn: 'player',
                activeBuff: null,
                potionCooldown: 0,
                isRegenerating: false,
                regenerationStartTime: 0
            },
            statistics: {
                enemiesDefeated: 0,
                meleeEnemiesDefeated: 0,
                rangedEnemiesDefeated: 0,
                defenseEnemiesDefeated: 0,
                potionsUsed: 0,
                totalGoldEarned: 0
            },
            equipment: {
                equipped: {
                    weapon: null,
                    offhand: null,
                    helmet: null,
                    body: null,
                    legs: null
                },
                unlocked: []  // Array of unlocked equipment item keys
            }
        };
    }

    /**
     * Reset the game state to default values
     */
    reset() {
        this.state = this.createDefaultState();
    }

    /**
     * Load a saved game state
     * @param {Object} savedState - The saved game state to load
     */
    load(savedState) {
        // Create default state
        const defaultState = this.createDefaultState();
        
        // Merge saved state with default state to ensure all properties exist
        this.state = { ...defaultState, ...savedState };
        
        // Deep merge for resources to ensure backward compatibility
        this.state.resources = { ...defaultState.resources, ...(savedState.resources || {}) };
        
        // Migrate old 'upgrades' property to 'charms' (for backward compatibility)
        if (savedState.upgrades && Array.isArray(savedState.upgrades)) {
            this.state.charms = savedState.upgrades;
            delete this.state.upgrades; // Remove old property
        }
        
        // Ensure charms is always an array (for backward compatibility)
        if (!Array.isArray(this.state.charms)) {
            this.state.charms = [];
        }
        
        // Ensure stats.skillTime exists (for backward compatibility)
        if (!this.state.stats.skillTime) {
            this.state.stats.skillTime = defaultState.stats.skillTime;
        }
        
        // Ensure combat state exists (for backward compatibility)
        if (!this.state.combat) {
            this.state.combat = defaultState.combat;
        }
        
        // Ensure statistics exist (for backward compatibility)
        if (!this.state.statistics) {
            this.state.statistics = defaultState.statistics;
        }
    }

    /**
     * Get the current game state
     * @returns {Object} - Current game state
     */
    get() {
        return this.state;
    }

    /**
     * Update a specific property in the game state
     * @param {string} path - Dot-notation path to the property (e.g., 'player.level')
     * @param {*} value - The new value
     */
    update(path, value) {
        const keys = path.split('.');
        let current = this.state;

        // Navigate to the parent of the target property
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        // Set the value
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Start the game session
     */
    startPlaying() {
        this.state.isPlaying = true;
        this.state.stats.sessionStart = Date.now();
    }

    /**
     * Stop the game session and update play time
     */
    stopPlaying() {
        // Calculate session time before stopping
        if (this.state.isPlaying && this.state.stats.sessionStart) {
            const now = Date.now();
            const sessionTime = now - this.state.stats.sessionStart;
            this.state.stats.playTime = (this.state.stats.playTime || 0) + sessionTime;
        }
        
        this.state.isPlaying = false;
    }

    /**
     * Check if the game is currently being played
     * @returns {boolean}
     */
    isPlaying() {
        return this.state.isPlaying;
    }
}

// Export the game state manager
const gameState = new GameState();
