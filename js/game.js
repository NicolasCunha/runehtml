// Main Game Controller - Orchestrates all game systems
// This is the main entry point that coordinates UI, storage, and game state

class Game {
    constructor() {
        // Reference to game systems (initialized from other modules)
        this.ui = uiManager;
        this.storage = storageAPI;
        this.state = gameState;
        
        // Initialize combat manager
        combatManager = new CombatManager(this.state, skillsSystem, upgradesManager, this);
        this.combat = combatManager;
        
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
            case 'theme':
                this.showThemeSelectorFromMenu();
                break;
            case 'about':
                this.showAbout();
                break;
            case 'github':
                this.openGitHub();
                break;
            case 'kofi':
                this.openKofi();
                break;
        }
    }
    
    /**
     * Show the theme selector from main menu
     */
    showThemeSelectorFromMenu() {
        modalManager.showThemeSelector();
    }
    
    /**
     * Show the About modal
     */
    showAbout() {
        modalManager.showAbout();
    }
    
    /**
     * Open GitHub repository in a new tab
     */
    openGitHub() {
        window.open('https://github.com/NicolasCunha/runehtml', '_blank');
    }
    
    /**
     * Open Ko-fi support page in a new tab
     */
    openKofi() {
        window.open('https://bmc.link/nfcunha', '_blank');
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
        
        // CHEAT CODE: Check if username is SwagLordMessiah2000
        if (username === 'SwagLordMessiah2000') {
            this.activateCheatMode();
        }
        
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
     * Activate cheat mode for special username
     * Maxes all skills, unlocks all upgrades, adds Dessimon theme
     */
    activateCheatMode() {
        // Max out all skills to level 99
        const currentState = this.state.get();
        const maxExp = skillsSystem.getExpForLevel(99);
        
        Object.keys(currentState.skills).forEach(skillKey => {
            const skill = currentState.skills[skillKey];
            skill.level = 99;
            skill.exp = 0;
            skill.totalExp = maxExp;
            this.state.update(`skills.${skillKey}`, skill);
        });
        
        // Unlock all upgrades (stored as array of owned upgrade keys)
        const allUpgradeKeys = Object.keys(upgradesManager.upgrades);
        this.state.update('upgrades', allUpgradeKeys);
        
        // Add massive resources for purchasing anything
        const resources = {
            copper: 100000,
            tin: 100000,
            iron: 100000,
            coal: 100000,
            mithril: 100000,
            adamant: 100000,
            runite: 100000,
            gold: 100000,
            normal: 100000,
            oak: 100000,
            willow: 100000,
            maple: 100000,
            yew: 100000,
            magic: 100000,
            herbs: 100000,
            vials: 100000
        };
        
        Object.keys(resources).forEach(resourceKey => {
            this.state.update(`resources.${resourceKey}`, resources[resourceKey]);
        });
        
        // Apply the Dessimon theme
        themeManager.applyTheme('dessimon');
        
        // Show special notification
        setTimeout(() => {
            this.showNotification('🎮 CHEAT MODE ACTIVATED: All skills maxed! Dessimon theme unlocked! 🎮', '#d946ef');
        }, 500);
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
                
                // Restore training state if there was an active skill
                const currentState = this.state.get();
                if (currentState.currentActivity) {
                    this.updateTrainButtons(currentState.currentActivity);
                }
                
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
        const actionsPerformed = Math.floor((timeDiff / 1000)); // One action every second
        const baseExpPerAction = 20; // Average exp per action
        const offlineRate = 0.8; // 80% efficiency
        
        const totalExpGained = Math.floor(actionsPerformed * baseExpPerAction * offlineRate);
        
        // Store the old level
        const oldLevel = skill.level;
        
        // Add the experience
        const result = skillsSystem.addExp(skill, totalExpGained);
        this.state.update(`skills.${offlineData.trainingSkill}`, result.skill);
        
        // Calculate offline resources gathered
        let resourcesGathered = {};
        for (let i = 0; i < actionsPerformed; i++) {
            const drop = resourcesManager.getResourceDrop(offlineData.trainingSkill, skill.level);
            if (drop) {
                if (!resourcesGathered[drop.type]) {
                    resourcesGathered[drop.type] = { amount: 0, name: drop.displayName };
                }
                resourcesGathered[drop.type].amount += drop.amount;
                
                // Update state
                const currentAmount = currentState.resources[drop.type] || 0;
                this.state.update(`resources.${drop.type}`, currentAmount + drop.amount);
            }
        }
        
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
            resourcesGathered,
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
                const currentState = this.state.get();
                
                // Toggle training: stop if training this skill, start if not
                if (currentState.currentActivity === skillKey) {
                    this.stopTraining();
                } else {
                    this.startTraining(skillKey);
                }
            });
        });
        
        // Hamburger menu toggle
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (hamburgerBtn && dropdownMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside (but not on notifications)
            const closeMenuHandler = (e) => {
                // Don't close if clicking on a notification
                if (e.target.closest('.notification')) {
                    return;
                }
                
                if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            };
            
            document.addEventListener('click', closeMenuHandler);
            
            // Close dropdown when clicking a menu item
            const menuItems = dropdownMenu.querySelectorAll('.menu-item-btn');
            menuItems.forEach(item => {
                item.addEventListener('click', () => {
                    dropdownMenu.classList.remove('show');
                });
            });
        }
        
        // Stats button listener
        const statsButton = document.getElementById('stats-button');
        if (statsButton) {
            statsButton.addEventListener('click', () => {
                this.showStatistics();
            });
        }
        
        // Shop button listener
        const shopButton = document.getElementById('shop-button');
        if (shopButton) {
            shopButton.addEventListener('click', () => {
                this.showShop();
            });
        }
        
        // Inventory button listener
        const inventoryButton = document.getElementById('inventory-button');
        if (inventoryButton) {
            inventoryButton.addEventListener('click', () => {
                this.showInventory();
            });
        }
        
        // Theme button listener
        const themeButton = document.getElementById('theme-button');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                this.showThemeSelector();
            });
        }
        
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
     * Show the shop modal
     */
    showShop() {
        const currentState = this.state.get();
        modalManager.showShop(currentState, (upgradeKey) => {
            this.purchaseUpgrade(upgradeKey);
        });
    }
    
    /**
     * Purchase an upgrade
     * @param {string} upgradeKey - The upgrade to purchase
     */
    purchaseUpgrade(upgradeKey) {
        const currentState = this.state.get();
        const upgrade = upgradesManager.getUpgrade(upgradeKey);
        
        if (!upgrade) return;
        
        // Check if can afford
        if (!upgradesManager.canAfford(upgradeKey, currentState.resources)) {
            this.showNotification('Cannot afford this upgrade!', '#ff6666');
            return;
        }
        
        // Check level requirement
        const skill = currentState.skills[upgrade.skill];
        if (!upgradesManager.meetsLevelRequirement(upgradeKey, skill.level)) {
            this.showNotification(`Requires level ${upgrade.requiredLevel} ${skill.name}!`, '#ff6666');
            return;
        }
        
        // Check prerequisites
        if (!upgradesManager.hasPrerequisites(upgradeKey, currentState.upgrades)) {
            this.showNotification('Missing prerequisite upgrades!', '#ff6666');
            return;
        }
        
        // Deduct resources
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            const current = currentState.resources[resource] || 0;
            this.state.update(`resources.${resource}`, current - amount);
        }
        
        // Add upgrade to owned list
        const newUpgrades = [...currentState.upgrades, upgradeKey];
        this.state.update('upgrades', newUpgrades);
        
        // Save and notify
        this.saveGame();
        this.showNotification(`Purchased ${upgrade.name}!`, '#ffff00');
        
        // Refresh shop content without closing modal
        modalManager.refreshShop(this.state.get());
    }
    
    /**
     * Show the statistics modal
     */
    showStatistics() {
        const currentState = this.state.get();
        modalManager.showStatistics(currentState);
    }
    
    /**
     * Show the inventory modal
     */
    showInventory() {
        const currentState = this.state.get();
        modalManager.showInventory(currentState.resources);
    }
    
    /**
     * Show the theme selector modal
     */
    showThemeSelector() {
        modalManager.showThemeSelector(() => {
            // Theme changed, no need to refresh
            this.showNotification('Theme changed!');
        });
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
                
                // If using Dessimon theme, reset to default
                if (themeManager.getCurrentTheme() === 'dessimon') {
                    themeManager.applyTheme('green');
                }
                
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
        
        // If switching between combat skills, reset combat
        const currentActivity = currentState.currentActivity;
        if (currentActivity && currentActivity !== skillKey) {
            const currentIsCombat = this.combat.isCombatSkill(currentActivity);
            const newIsCombat = this.combat.isCombatSkill(skillKey);
            
            // If both are combat skills but different, reset combat
            if (currentIsCombat && newIsCombat) {
                this.state.update('combat.inCombat', false);
            }
        }
        
        // Update current activity
        this.state.update('currentActivity', skillKey);
        
        // Update animation with current level
        this.ui.updateAnimation(skillKey, skill.level);
        
        // Update player title
        this.ui.updatePlayerTitle(skillKey, skill.level);
        
        // Update all train buttons to show stop button for active skill
        this.updateTrainButtons(skillKey);
        
        // Simulate training action (gain exp every 2 seconds)
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
        }
        
        this.trainingInterval = setInterval(() => {
            this.performTrainingAction(skillKey);
        }, 1000); // One action per second
    }
    
    /**
     * Stop training the current skill
     */
    stopTraining() {
        // Clear training interval
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
        
        // Clear current activity
        this.state.update('currentActivity', null);
        
        // Clear animation area
        const animationArea = document.getElementById('animation-area');
        if (animationArea) {
            animationArea.innerHTML = '<p style="color: var(--color-primary-dim);">> Select a skill to start training...</p>';
        }
        
        // Clear player title
        this.ui.updatePlayerTitle(null, null);
        
        // Reset all train buttons
        this.updateTrainButtons(null);
        
        // Show notification
        this.showNotification('Training stopped', 'var(--color-primary-dim)');
    }
    
    /**
     * Update train buttons to show Train/Stop based on active skill
     * @param {string|null} activeSkill - The currently active skill, or null
     */
    updateTrainButtons(activeSkill) {
        const trainButtons = document.querySelectorAll('.train-button');
        
        trainButtons.forEach(button => {
            const skillKey = button.getAttribute('data-skill');
            
            if (skillKey === activeSkill) {
                button.textContent = 'Stop';
                button.style.backgroundColor = '#ff6666';
            } else {
                button.textContent = 'Train';
                button.style.backgroundColor = '';
            }
        });
    }
    
    /**
     * Perform a single training action and gain experience
     * @param {string} skillKey - The skill being trained
     */
    performTrainingAction(skillKey) {
        const currentState = this.state.get();
        const skill = currentState.skills[skillKey];
        
        // Check if this is a combat skill
        if (this.combat.isCombatSkill(skillKey)) {
            // Handle combat training
            const combat = currentState.combat;
            
            // Check if regenerating
            if (combat.isRegenerating) {
                this.combat.updateRegeneration();
                this.ui.updateSkillCards(currentState.skills);
                return;
            }
            
            // Start new combat if not already in combat
            if (!combat.inCombat) {
                const started = this.combat.startCombat(skillKey);
                if (!started) {
                    console.error('Failed to start combat');
                    return;
                }
                // Update UI to show initial combat state before first turn
                this.ui.updateCombatDisplay();
                this.ui.updateSkillCards(currentState.skills);
                return; // Don't process turn on the same tick as starting combat
            }
            
            // Process combat turn
            this.combat.processCombatTurn();
            
            // Update UI
            this.ui.updateSkillCards(currentState.skills);
            this.ui.updateCombatDisplay();
            return;
        }
        
        // Non-combat skills: Original resource gathering logic
        // Calculate exp gain (random between 10-30)
        const baseExpGain = Math.floor(Math.random() * 21) + 10;
        
        // Apply upgrade bonuses
        const bonus = upgradesManager.getTotalBonus(skillKey, currentState.upgrades);
        const expGain = Math.floor(baseExpGain * (1 + bonus));
        
        // Add exp to skill
        const result = skillsSystem.addExp(skill, expGain);
        
        // Update state
        this.state.update(`skills.${skillKey}`, result.skill);
        this.state.update('stats.totalActions', currentState.stats.totalActions + 1);
        
        // Track skill training time (1 second per action)
        const currentSkillTime = currentState.stats.skillTime[skillKey] || 0;
        this.state.update(`stats.skillTime.${skillKey}`, currentSkillTime + 1000);
        
        // Check for resource drops
        const resourceDrop = resourcesManager.getResourceDrop(skillKey, result.skill.level);
        if (resourceDrop) {
            const currentAmount = currentState.resources[resourceDrop.type] || 0;
            this.state.update(`resources.${resourceDrop.type}`, currentAmount + resourceDrop.amount);
            this.showNotification(`+${resourceDrop.amount} ${resourceDrop.displayName}`, 'var(--color-primary-dim)');
        }
        
        // Check for level up
        if (result.leveledUp) {
            const newTitle = achievementsManager.getTitle(skillKey, result.newLevel);
            this.showNotification(`${skill.name} leveled up! Level ${result.newLevel}! [${newTitle}]`, '#ffff00');
            // Update title display
            this.ui.updatePlayerTitle(skillKey, result.newLevel);
        }
        
        // Update only the skill cards, not the entire screen
        this.ui.updateSkillCards(this.state.get().skills);
        
        // Update animation if level changed (new animation tier)
        if (result.leveledUp) {
            const currentActivity = this.state.get().currentActivity;
            if (currentActivity) {
                const currentSkill = this.state.get().skills[currentActivity];
                this.ui.updateAnimation(currentActivity, currentSkill.level);
            }
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
        // Remove any existing notifications first
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => {
            if (notif.parentNode) {
                document.body.removeChild(notif);
            }
        });
        
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
        
        // Prevent clicks on notification from closing menu
        notification.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
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
