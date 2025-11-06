// Main Game Controller - Orchestrates all game systems
// This is the main entry point that coordinates UI, storage, and game state

class Game {
    constructor() {
        // Reference to game systems (initialized from other modules)
        this.ui = uiManager;
        this.storage = storageAPI;
        this.state = gameState;
        
        this.init();
    }
    
    /**
     * Initialize the game
     * Sets up event listeners and prepares the game
     */
    init() {
        this.setupMenuListeners();
        this.updateLoadGameButton();
    }
    
    /**
     * Update the Load Game button state based on available saves
     */
    updateLoadGameButton() {
        const loadGameButton = document.getElementById('load-game-menu-item');
        if (!loadGameButton) return;
        
        // Force check localStorage directly
        const saves = this.storage.getAllSaves();
        const hasSaves = saves.length > 0;
        
        if (!hasSaves) {
            loadGameButton.classList.add('disabled');
        } else {
            loadGameButton.classList.remove('disabled');
        }
    }
    
    /**
     * Set up click handlers for menu items
     * Binds menu actions to their respective handlers
     */
    setupMenuListeners() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });
    }
    
    /**
     * Route menu actions to appropriate handlers
     * @param {string} action - The action to perform (e.g., 'new-game', 'load-game')
     */
    handleMenuAction(action) {
        switch(action) {
            case 'new-game':
                this.startNewGame();
                break;
            case 'load-game':
                // Check if load game is disabled
                const loadGameButton = document.getElementById('load-game-menu-item');
                if (loadGameButton && loadGameButton.classList.contains('disabled')) {
                    return; // Don't allow loading if no saves
                }
                this.loadGame();
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }
    
    /**
     * Show the About modal
     */
    showAbout() {
        modalManager.showAbout();
    }
    
    /**
     * Start a new game session
     * Shows username selection screen first
     */
    startNewGame() {
        // Show username selection screen
        this.ui.showUsernameScreen((username) => {
            this.createCharacter(username);
        });
    }
    
    /**
     * Create a new character with the given username
     * @param {string} username - The player's chosen username
     */
    createCharacter(username) {
        // Reset game state to defaults
        this.state.reset();
        
        // Set player name and generate UUID
        const uuid = usernameGenerator.generateUUID();
        this.state.update('uuid', uuid);
        this.state.update('player.name', username);
        
        // Mark game as active
        this.state.startPlaying();
        
        // Show the game screen
        this.ui.showGameScreen(this.state.get());
        
        // Set up training listeners
        this.setupTrainingListeners();
        
        // Auto-save the initial state
        this.saveGame();
        
        // Start auto-save timer
        this.startAutoSave();
    }
    
    /**
     * Load a saved game from storage
     * Shows save selection screen if multiple saves exist
     */
    loadGame() {
        // Get all available saves
        const saves = this.storage.getAllSaves();
        
        if (saves.length === 0) {
            // No saves found - show error and return to menu
            this.ui.showNoSaveError(() => {});
            return;
        }
        
        // Show save selection screen
        this.ui.showSaveSelectionScreen(
            saves,
            (uuid) => this.loadGameByUUID(uuid),
            () => this.ui.showMainMenu()
        );
    }
    
    /**
     * Load a specific game by UUID
     * @param {string} uuid - The UUID of the save to load
     */
    loadGameByUUID(uuid) {
        const savedState = this.storage.loadGameByUUID(uuid);
        
        if (savedState) {
            // Load the saved state
            this.state.load(savedState);
            
            // Calculate offline training gains
            this.calculateOfflineProgress(() => {
                // Show the game screen after offline modal
                this.ui.showGameScreen(this.state.get());
                
                // Set up training listeners
                this.setupTrainingListeners();
                
                // Mark game as active
                this.state.startPlaying();
                
                // Start auto-save timer
                this.startAutoSave();
            });
        } else {
            // Failed to load - show error and return to menu
            this.ui.showNoSaveError(() => {});
        }
    }
    
    /**
     * Calculate offline training progress
     * Awards EXP at 80% rate for time spent offline
     * @param {Function} callback - Called after displaying results
     */
    calculateOfflineProgress(callback) {
        const currentState = this.state.get();
        const offlineData = currentState.offlineTraining;
        
        // Check if there's offline training data
        if (!offlineData || !offlineData.lastSaveTime || !offlineData.trainingSkill) {
            // No offline training, proceed normally
            callback();
            return;
        }
        
        const now = Date.now();
        const timeDiff = now - offlineData.lastSaveTime;
        
        // Store the last training skill to resume later
        const lastTrainingSkill = offlineData.trainingSkill;
        
        // Only calculate if offline for more than 5 minutes (300,000 ms)
        if (timeDiff < 300000) {
            // Still resume training even if no offline gains
            callback();
            // Auto-resume training after a short delay
            if (lastTrainingSkill) {
                setTimeout(() => {
                    this.startTraining(lastTrainingSkill);
                }, 500);
            }
            return;
        }
        
        const skill = currentState.skills[offlineData.trainingSkill];
        if (!skill) {
            callback();
            return;
        }
        
        // Calculate offline gains
        const hoursOffline = timeDiff / 3600000; // Convert to hours
        const actionsPerformed = Math.floor((timeDiff / 2000)); // One action every 2 seconds
        const baseExpPerAction = 20; // Average exp per action
        const offlineRate = 0.8; // 80% efficiency
        
        const totalExpGained = Math.floor(actionsPerformed * baseExpPerAction * offlineRate);
        
        // Store the old level
        const oldLevel = skill.level;
        
        // Add the experience
        const result = skillsSystem.addExp(skill, totalExpGained);
        this.state.update(`skills.${offlineData.trainingSkill}`, result.skill);
        
        const newLevel = result.skill.level;
        const levelsGained = newLevel - oldLevel;
        
        // Format time offline
        const timeOfflineStr = this.formatTime(timeDiff);
        
        // Show offline gains modal and resume training after
        this.ui.showOfflineGainsModal(
            skill.name,
            timeOfflineStr,
            totalExpGained,
            oldLevel,
            newLevel,
            levelsGained,
            () => {
                callback();
                // Auto-resume training the same skill
                setTimeout(() => {
                    this.startTraining(lastTrainingSkill);
                }, 500);
            }
        );
    }
    
    /**
     * Format milliseconds into a readable time string
     * @param {number} ms - Milliseconds
     * @returns {string} - Formatted time string
     */
    formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    /**
     * Set up event listeners for training buttons
     */
    setupTrainingListeners() {
        const trainButtons = document.querySelectorAll('.train-button');
        
        trainButtons.forEach(button => {
            button.addEventListener('click', () => {
                const skillKey = button.getAttribute('data-skill');
                this.startTraining(skillKey);
            });
        });
        
        // Save button listener
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGame();
                this.showNotification('Game saved!');
            });
        }
        
        // Menu button listener
        const menuButton = document.getElementById('menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                this.returnToMainMenu();
            });
        }
    }
    
    /**
     * Return to the main menu
     * Saves the game before returning
     */
    returnToMainMenu() {
        // Confirm before returning
        modalManager.showConfirmation(
            'RETURN TO MENU',
            'Return to main menu? Your game will be saved automatically.',
            () => {
                // Save the current game
                this.saveGame();
                
                // Stop the game session
                this.state.stopPlaying();
                
                // Clean up timers
                this.cleanup();
                
                // Show the main menu
                this.ui.showMainMenu();
            }
        );
    }
    
    /**
     * Start training a specific skill
     * @param {string} skillKey - The skill to train
     */
    startTraining(skillKey) {
        const currentState = this.state.get();
        const skill = currentState.skills[skillKey];
        
        if (!skill) {
            return;
        }
        
        // Update current activity
        this.state.update('currentActivity', skillKey);
        
        // Update animation with current level
        this.ui.updateAnimation(skillKey, skill.level);
        
        // Simulate training action (gain exp every 2 seconds)
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
        }
        
        this.trainingInterval = setInterval(() => {
            this.performTrainingAction(skillKey);
        }, 2000);
    }
    
    /**
     * Perform a single training action and gain experience
     * @param {string} skillKey - The skill being trained
     */
    performTrainingAction(skillKey) {
        const currentState = this.state.get();
        const skill = currentState.skills[skillKey];
        
        // Calculate exp gain (random between 10-30)
        const expGain = Math.floor(Math.random() * 21) + 10;
        
        // Add exp to skill
        const result = skillsSystem.addExp(skill, expGain);
        
        // Update state
        this.state.update(`skills.${skillKey}`, result.skill);
        this.state.update('stats.totalActions', currentState.stats.totalActions + 1);
        
        // Check for level up
        if (result.leveledUp) {
            this.showNotification(`${skill.name} leveled up! Level ${result.newLevel}!`, '#ffff00');
        }
        
        // Refresh the game screen
        this.ui.showGameScreen(this.state.get());
        this.setupTrainingListeners();
        
        // Restore animation with updated level
        const currentActivity = this.state.get().currentActivity;
        if (currentActivity) {
            const currentSkill = this.state.get().skills[currentActivity];
            this.ui.updateAnimation(currentActivity, currentSkill.level);
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
     * Show a notification message
     * @param {string} message - The message to show
     * @param {string} color - The color of the message
     */
    showNotification(message, color = '#33dd33') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #000;
            border: 2px solid ${color};
            color: ${color};
            padding: 10px 15px;
            font-size: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
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
     * Check if a saved game exists
     * @returns {boolean}
     */
    hasSave() {
        return this.storage.hasSavedGame();
    }
    
    /**
     * Delete the current save
     * @returns {boolean}
     */
    deleteSave() {
        const uuid = this.state.get().uuid;
        return this.storage.deleteSave(uuid);
    }
    
    /**
     * Clean up timers when game ends
     */
    cleanup() {
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Make game instance globally accessible for debugging
    window.game = game;
    
    // Also expose individual systems for debugging
    window.gameState = gameState;
    window.storageAPI = storageAPI;
    window.uiManager = uiManager;
});
