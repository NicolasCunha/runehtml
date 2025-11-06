/**
 * Handles all training-related logic and interactions
 */
class TrainingController {
    constructor(gameState, ui, skillsSystem, resourcesManager, upgradesManager, achievementsManager, combatManager) {
        this.state = gameState;
        this.ui = ui;
        this.skillsSystem = skillsSystem;
        this.resourcesManager = resourcesManager;
        this.upgradesManager = upgradesManager;
        this.achievementsManager = achievementsManager;
        this.combat = combatManager;
        
        this.trainingInterval = null;
    }
    
    /**
     * Set up event listeners for training buttons
     * @param {Function} onSave - Callback for save button
     * @param {Function} onMenu - Callback for menu button
     * @param {Function} onShop - Callback for shop button
     * @param {Function} onStats - Callback for stats button
     * @param {Function} onInventory - Callback for inventory button
     * @param {Function} onTheme - Callback for theme button
     * @param {Function} showNotification - Notification display function
     */
    setupListeners(onSave, onMenu, onShop, onStats, onInventory, onTheme, showNotification) {
        this.showNotification = showNotification;
        
        // Training buttons
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
        
        // Button listeners with callbacks
        this.setupButtonListener('stats-button', onStats);
        this.setupButtonListener('shop-button', onShop);
        this.setupButtonListener('inventory-button', onInventory);
        this.setupButtonListener('theme-button', onTheme);
        this.setupButtonListener('menu-button', onMenu);
        
        // Save button with notification
        const saveButton = document.getElementById('save-button');
        if (saveButton && onSave) {
            saveButton.addEventListener('click', () => {
                onSave();
                showNotification('Game saved!');
            });
        }
    }
    
    /**
     * Setup a single button listener
     * @param {string} buttonId - The button element ID
     * @param {Function} callback - The callback function
     */
    setupButtonListener(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button && callback) {
            button.addEventListener('click', () => callback());
        }
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
        
        // Simulate training action (gain exp every second)
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
        if (this.showNotification) {
            this.showNotification('Training stopped', 'var(--color-primary-dim)');
        }
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
            this.performCombatAction(currentState);
            return;
        }
        
        // Non-combat skills: Resource gathering logic
        this.performGatheringAction(skillKey, skill, currentState);
    }
    
    /**
     * Perform a combat training action
     * @param {Object} currentState - Current game state
     */
    performCombatAction(currentState) {
        const combat = currentState.combat;
        
        // Check if regenerating
        if (combat.isRegenerating) {
            this.combat.updateRegeneration();
            this.ui.updateSkillCards(currentState.skills);
            return;
        }
        
        // Start new combat if not already in combat
        if (!combat.inCombat) {
            const started = this.combat.startCombat(currentState.currentActivity);
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
    }
    
    /**
     * Perform a gathering (non-combat) training action
     * @param {string} skillKey - The skill being trained
     * @param {Object} skill - The skill object
     * @param {Object} currentState - Current game state
     */
    performGatheringAction(skillKey, skill, currentState) {
        // Calculate exp gain (random between 10-30)
        const baseExpGain = Math.floor(Math.random() * 21) + 10;
        
        // Apply upgrade bonuses
        const bonus = this.upgradesManager.getTotalBonus(skillKey, currentState.upgrades);
        const expGain = Math.floor(baseExpGain * (1 + bonus));
        
        // Add exp to skill
        const result = this.skillsSystem.addExp(skill, expGain);
        
        // Update state
        this.state.update(`skills.${skillKey}`, result.skill);
        this.state.update('stats.totalActions', currentState.stats.totalActions + 1);
        
        // Track skill training time (1 second per action)
        const currentSkillTime = currentState.stats.skillTime[skillKey] || 0;
        this.state.update(`stats.skillTime.${skillKey}`, currentSkillTime + 1000);
        
        // Check for resource drops
        const resourceDrop = this.resourcesManager.getResourceDrop(skillKey, result.skill.level);
        if (resourceDrop && this.showNotification) {
            const currentAmount = currentState.resources[resourceDrop.type] || 0;
            this.state.update(`resources.${resourceDrop.type}`, currentAmount + resourceDrop.amount);
            this.showNotification(`+${resourceDrop.amount} ${resourceDrop.displayName}`, 'var(--color-primary-dim)');
        }
        
        // Check for level up
        if (result.leveledUp && this.showNotification) {
            const newTitle = this.achievementsManager.getTitle(skillKey, result.newLevel);
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
     * Clean up training interval
     */
    cleanup() {
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
    }
}
