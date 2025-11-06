// Storage API - Handles browser localStorage operations for game saves
// This module provides a simple interface to save and load game data

class StorageAPI {
    constructor() {
        // Storage key prefix for game saves
        this.SAVE_PREFIX = 'runehtml_save_';
        this.LAST_SAVE_KEY = 'runehtml_last_save';
    }
    
    /**
     * Get the storage key for a specific UUID
     * @param {string} uuid - The player's UUID
     * @returns {string} - The storage key
     */
    getSaveKey(uuid) {
        return this.SAVE_PREFIX + uuid;
    }

    /**
     * Save the current game state to localStorage
     * @param {Object} gameState - The game state object to save
     * @returns {boolean} - Returns true if save was successful
     */
    saveGame(gameState) {
        try {
            if (!gameState.uuid) {
                console.error('Cannot save game without UUID');
                return false;
            }
            
            const serializedState = JSON.stringify(gameState);
            const saveKey = this.getSaveKey(gameState.uuid);
            localStorage.setItem(saveKey, serializedState);
            localStorage.setItem(this.LAST_SAVE_KEY, gameState.uuid);
            console.log('Game saved successfully!');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load the last saved game state from localStorage
     * @returns {Object|null} - Returns the saved game state or null if no save exists
     */
    loadGame() {
        try {
            const lastUUID = localStorage.getItem(this.LAST_SAVE_KEY);
            
            if (!lastUUID) {
                console.log('No saved game found');
                return null;
            }
            
            const saveKey = this.getSaveKey(lastUUID);
            const serializedState = localStorage.getItem(saveKey);
            
            if (!serializedState) {
                console.log('No saved game found');
                return null;
            }

            const gameState = JSON.parse(serializedState);
            console.log('Game loaded successfully!');
            return gameState;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    /**
     * Check if a saved game exists
     * @returns {boolean} - Returns true if a save exists
     */
    hasSavedGame() {
        const saves = this.getAllSaves();
        return saves.length > 0;
    }
    
    /**
     * Get all saved games
     * @returns {Array} - Array of save objects with metadata
     */
    getAllSaves() {
        const saves = [];
        
        // Iterate through localStorage to find all game saves
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.startsWith(this.SAVE_PREFIX)) {
                try {
                    const saveData = localStorage.getItem(key);
                    const gameState = JSON.parse(saveData);
                    
                    saves.push({
                        uuid: gameState.uuid,
                        playerName: gameState.player.name,
                        created: gameState.player.created,
                        totalLevel: this.calculateTotalLevel(gameState.skills),
                        playTime: gameState.stats.playTime || 0,
                        lastPlayed: gameState.stats.sessionStart || gameState.player.created
                    });
                } catch (error) {
                    console.error('Failed to parse save:', key, error);
                }
            }
        }
        
        // Sort by last played (most recent first)
        saves.sort((a, b) => b.lastPlayed - a.lastPlayed);
        
        return saves;
    }
    
    /**
     * Calculate total level from skills
     * @param {Object} skills - Skills object
     * @returns {number} - Total level
     */
    calculateTotalLevel(skills) {
        let total = 0;
        for (const skill of Object.values(skills)) {
            total += skill.level;
        }
        return total;
    }
    
    /**
     * Load a specific game by UUID
     * @param {string} uuid - The UUID of the save to load
     * @returns {Object|null} - The game state or null
     */
    loadGameByUUID(uuid) {
        try {
            const saveKey = this.getSaveKey(uuid);
            const serializedState = localStorage.getItem(saveKey);
            
            if (!serializedState) {
                console.log('Save not found for UUID:', uuid);
                return null;
            }

            const gameState = JSON.parse(serializedState);
            console.log('Game loaded successfully!');
            
            // Update last save key
            localStorage.setItem(this.LAST_SAVE_KEY, uuid);
            
            return gameState;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    /**
     * Delete a saved game from localStorage
     * @param {string} uuid - The UUID of the save to delete
     * @returns {boolean} - Returns true if deletion was successful
     */
    deleteSave(uuid) {
        try {
            if (!uuid) {
                const lastUUID = localStorage.getItem(this.LAST_SAVE_KEY);
                if (lastUUID) uuid = lastUUID;
            }
            
            if (uuid) {
                const saveKey = this.getSaveKey(uuid);
                localStorage.removeItem(saveKey);
                localStorage.removeItem(this.LAST_SAVE_KEY);
                console.log('Save deleted successfully!');
            }
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    /**
     * Clear all game data from localStorage
     * @returns {boolean} - Returns true if clear was successful
     */
    clearAll() {
        try {
            localStorage.clear();
            console.log('All storage cleared!');
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
}

// Export the storage API
const storageAPI = new StorageAPI();
