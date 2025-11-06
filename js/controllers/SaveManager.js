/**
 * Handles game saving, loading, and auto-save functionality
 */
class SaveManager {
    constructor(gameState, storage, ui) {
        this.state = gameState;
        this.storage = storage;
        this.ui = ui;
        this.autoSaveInterval = null;
    }
    
    /**
     * Save the current game state to storage
     * Updates offline training data and play time before saving
     * @returns {boolean} - Returns true if save was successful
     */
    saveGame() {
        const currentState = this.state.get();
        
        // Update play time if currently playing
        if (currentState.isPlaying && currentState.stats.sessionStart) {
            const now = Date.now();
            const sessionTime = now - currentState.stats.sessionStart;
            const totalPlayTime = (currentState.stats.playTime || 0) + sessionTime;
            
            this.state.update('stats.playTime', totalPlayTime);
            this.state.update('stats.sessionStart', now);
        }
        
        // Update offline training data
        this.state.update('offlineTraining.lastSaveTime', Date.now());
        this.state.update('offlineTraining.trainingSkill', currentState.currentActivity);
        
        return this.storage.saveGame(this.state.get());
    }
    
    /**
     * Load a saved game from storage
     * Shows save selection screen if multiple saves exist
     * @param {Function} onLoadComplete - Callback when load is complete
     * @param {Function} onLoadError - Callback when load fails
     */
    loadGame(onLoadComplete, onLoadError) {
        // Get all available saves
        const saves = this.storage.getAllSaves();
        
        if (saves.length === 0) {
            // No saves found - show error and return to menu
            this.ui.showNoSaveError(() => {});
            if (onLoadError) onLoadError();
            return;
        }
        
        // Show save selection screen
        this.ui.showSaveSelectionScreen(
            saves,
            (uuid) => this.loadGameByUUID(uuid, onLoadComplete, onLoadError),
            () => this.ui.showMainMenu()
        );
    }
    
    /**
     * Load a specific game by UUID
     * @param {string} uuid - The UUID of the save to load
     * @param {Function} onLoadComplete - Callback when load is complete
     * @param {Function} onLoadError - Callback when load fails
     */
    loadGameByUUID(uuid, onLoadComplete, onLoadError) {
        const savedState = this.storage.loadGameByUUID(uuid);
        
        if (savedState) {
            // Load the saved state
            this.state.load(savedState);
            
            if (onLoadComplete) {
                onLoadComplete(savedState);
            }
        } else {
            // Failed to load - show error and return to menu
            this.ui.showNoSaveError(() => {});
            if (onLoadError) onLoadError();
        }
    }
    
    /**
     * Start the auto-save mechanism
     * Saves game every 30 seconds
     */
    startAutoSave() {
        // Clear any existing auto-save timer
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.state.isPlaying()) {
                this.saveGame();
            }
        }, 30000);
    }
    
    /**
     * Stop the auto-save mechanism
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * Check if a saved game exists
     * @returns {boolean}
     */
    hasSave() {
        return this.storage.hasSavedGame();
    }
    
    /**
     * Get all saved games
     * @returns {Array} Array of save data
     */
    getAllSaves() {
        return this.storage.getAllSaves();
    }
    
    /**
     * Delete a save by UUID
     * @param {string} uuid - The UUID of the save to delete
     * @returns {boolean}
     */
    deleteSave(uuid) {
        return this.storage.deleteSave(uuid);
    }
    
    /**
     * Delete the current save
     * @returns {boolean}
     */
    deleteCurrentSave() {
        const uuid = this.state.get().uuid;
        return this.deleteSave(uuid);
    }
}
