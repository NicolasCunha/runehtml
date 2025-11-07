/**
 * Calculates offline training progress and rewards
 */
class OfflineProgressCalculator {
    constructor(gameState, skillsSystem, resourcesManager, ui) {
        this.state = gameState;
        this.skillsSystem = skillsSystem;
        this.resourcesManager = resourcesManager;
        this.ui = ui;
        
        // Configuration
        this.MIN_OFFLINE_TIME = 300000; // 5 minutes in ms
        this.OFFLINE_RATE = 0.8; // 80% efficiency
        this.BASE_EXP_PER_ACTION = 20;
        this.ACTION_INTERVAL = 1000; // One action per second
    }
    
    /**
     * Calculate offline training progress
     * Awards EXP at 80% rate for time spent offline
     * @param {Function} callback - Called after displaying results
     * @param {Function} onResumeTraining - Called to resume training (with skillKey)
     */
    calculate(callback, onResumeTraining) {
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
        const lastTrainingSkill = offlineData.trainingSkill;
        
        // Only calculate if offline for more than minimum time
        if (timeDiff < this.MIN_OFFLINE_TIME) {
            // Still resume training even if no offline gains
            callback();
            this.resumeTraining(lastTrainingSkill, onResumeTraining);
            return;
        }
        
        const skill = currentState.skills[offlineData.trainingSkill];
        if (!skill) {
            callback();
            return;
        }
        
        // Calculate offline gains
        const gains = this.calculateGains(timeDiff, skill, offlineData.trainingSkill, currentState);
        
        // Format time offline
        const timeOfflineStr = this.formatTime(timeDiff);
        
        // Show offline gains modal and resume training after
        this.ui.showOfflineGainsModal(
            skill.name,
            timeOfflineStr,
            gains.totalExpGained,
            gains.oldLevel,
            gains.newLevel,
            gains.levelsGained,
            gains.resourcesGathered,
            () => {
                callback();
                this.resumeTraining(lastTrainingSkill, onResumeTraining);
            }
        );
    }
    
    /**
     * Calculate experience and resources gained offline
     * @param {number} timeDiff - Time spent offline in milliseconds
     * @param {Object} skill - The skill object
     * @param {string} skillKey - The skill key
     * @param {Object} currentState - Current game state
     * @returns {Object} Gains object with exp, levels, and resources
     */
    calculateGains(timeDiff, skill, skillKey, currentState) {
        // Calculate actions performed
        const actionsPerformed = Math.floor(timeDiff / this.ACTION_INTERVAL);
        
        // Calculate experience gained
        const totalExpGained = Math.floor(
            actionsPerformed * this.BASE_EXP_PER_ACTION * this.OFFLINE_RATE
        );
        
        // Store the old level
        const oldLevel = skill.level;
        
        // Add the experience
        const result = this.skillsSystem.addExp(skill, totalExpGained);
        this.state.update(`skills.${skillKey}`, result.skill);
        
        // Calculate offline resources gathered
        const resourcesGathered = this.calculateResources(
            actionsPerformed,
            skillKey,
            skill.level,
            currentState
        );
        
        const newLevel = result.skill.level;
        const levelsGained = newLevel - oldLevel;
        
        return {
            totalExpGained,
            oldLevel,
            newLevel,
            levelsGained,
            resourcesGathered,
            actionsPerformed
        };
    }
    
    /**
     * Calculate resources gathered during offline training
     * @param {number} actionsPerformed - Number of training actions
     * @param {string} skillKey - The skill being trained
     * @param {number} skillLevel - The skill level
     * @param {Object} currentState - Current game state
     * @returns {Object} Resources gathered by type
     */
    calculateResources(actionsPerformed, skillKey, skillLevel, currentState) {
        let resourcesGathered = {};
        
        for (let i = 0; i < actionsPerformed; i++) {
            const drops = this.resourcesManager.getResourceDrop(skillKey, skillLevel);
            
            // Handle array of drops (new system)
            if (Array.isArray(drops)) {
                for (const drop of drops) {
                    if (!resourcesGathered[drop.type]) {
                        resourcesGathered[drop.type] = { 
                            amount: 0, 
                            name: drop.displayName 
                        };
                    }
                    resourcesGathered[drop.type].amount += drop.amount;
                    
                    // Update state
                    const currentAmount = currentState.resources[drop.type] || 0;
                    this.state.update(`resources.${drop.type}`, currentAmount + drop.amount);
                }
            }
        }
        
        return resourcesGathered;
    }
    
    /**
     * Resume training after a short delay
     * @param {string} skillKey - The skill to resume
     * @param {Function} onResumeTraining - Callback to start training
     */
    resumeTraining(skillKey, onResumeTraining) {
        if (skillKey && onResumeTraining) {
            setTimeout(() => {
                onResumeTraining(skillKey);
            }, 500);
        }
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
}
