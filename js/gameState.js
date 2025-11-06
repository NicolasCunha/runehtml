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
                wood: 0,
                stone: 0,
                iron: 0,
                gold: 0
            },
            upgrades: {},
            stats: {
                totalActions: 0,
                playTime: 0,
                sessionStart: Date.now()
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
        // Merge saved state with default state to ensure all properties exist
        this.state = { ...this.createDefaultState(), ...savedState };
        console.log('Game state loaded:', this.state);
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
     * Stop the game session
     */
    stopPlaying() {
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
