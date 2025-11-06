// Statistics Manager - Tracks and calculates game statistics
// Provides detailed breakdowns of player progress

class StatisticsManager {
    /**
     * Calculate total level across all skills
     * @param {Object} skills - Skills object from game state
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
     * Calculate total experience across all skills
     * @param {Object} skills - Skills object from game state
     * @returns {number} - Total experience
     */
    calculateTotalExp(skills) {
        let total = 0;
        for (const skill of Object.values(skills)) {
            total += skill.exp;
        }
        return total;
    }
    
    /**
     * Get skill with highest level
     * @param {Object} skills - Skills object from game state
     * @returns {Object} - Skill info with highest level
     */
    getHighestSkill(skills) {
        let highest = { name: 'None', level: 0, key: null };
        
        for (const [key, skill] of Object.entries(skills)) {
            if (skill.level > highest.level) {
                highest = { name: skill.name, level: skill.level, key };
            }
        }
        
        return highest;
    }
    
    /**
     * Calculate time spent training each skill
     * Based on actions performed (assumes 2 seconds per action)
     * @param {Object} skills - Skills object from game state
     * @returns {Object} - Time breakdown by skill
     */
    calculateSkillTime(skills) {
        const times = {};
        
        for (const [key, skill] of Object.entries(skills)) {
            // Estimate actions from experience (avg 20 exp per action)
            const estimatedActions = Math.floor(skill.exp / 20);
            const timeInSeconds = estimatedActions * 2;
            times[key] = {
                name: skill.name,
                seconds: timeInSeconds,
                formatted: this.formatTime(timeInSeconds * 1000)
            };
        }
        
        return times;
    }
    
    /**
     * Get total resources gathered
     * @param {Object} resources - Resources object from game state
     * @returns {number} - Total count
     */
    getTotalResources(resources) {
        let total = 0;
        for (const amount of Object.values(resources)) {
            total += amount;
        }
        return total;
    }
    
    /**
     * Get resources by category
     * @param {Object} resources - Resources object from game state
     * @returns {Object} - Categorized resources
     */
    getResourcesByCategory(resources) {
        const categories = {
            ores: { count: 0, types: ['copper', 'tin', 'iron', 'coal', 'gold', 'mithril', 'adamant', 'runite'] },
            logs: { count: 0, types: ['normal', 'oak', 'willow', 'maple', 'yew', 'magic', 'redwood'] },
            potions: { count: 0, types: ['basic', 'health', 'mana', 'energy', 'poison', 'fire', 'frost', 'divine', 'life'] }
        };
        
        for (const [key, value] of Object.entries(resources)) {
            if (categories.ores.types.includes(key)) {
                categories.ores.count += value;
            } else if (categories.logs.types.includes(key)) {
                categories.logs.count += value;
            } else if (categories.potions.types.includes(key)) {
                categories.potions.count += value;
            }
        }
        
        return categories;
    }
    
    /**
     * Get most gathered resource
     * @param {Object} resources - Resources object from game state
     * @returns {Object} - Resource info
     */
    getMostGatheredResource(resources) {
        let most = { name: 'None', amount: 0, key: null };
        
        for (const [key, amount] of Object.entries(resources)) {
            if (amount > most.amount) {
                most = {
                    name: resourcesManager.getResourceDisplayName(key),
                    amount,
                    key
                };
            }
        }
        
        return most;
    }
    
    /**
     * Calculate upgrade statistics
     * @param {Array} upgrades - Upgrades array from game state
     * @param {Object} skills - Skills object for calculating total bonus
     * @returns {Object} - Upgrade stats
     */
    getUpgradeStats(upgrades, skills) {
        const stats = {
            total: upgrades.length,
            bySkill: {}
        };
        
        // Count upgrades per skill and calculate bonuses
        for (const [skillKey, skill] of Object.entries(skills)) {
            const bonus = upgradesManager.getTotalBonus(skillKey, upgrades);
            const upgradeCount = upgrades.filter(u => {
                const upgrade = upgradesManager.getUpgrade(u);
                return upgrade && upgrade.skill === skillKey;
            }).length;
            
            stats.bySkill[skillKey] = {
                name: skill.name,
                count: upgradeCount,
                bonus: Math.round(bonus * 100)
            };
        }
        
        return stats;
    }
    
    /**
     * Format time in milliseconds to readable string
     * @param {number} ms - Milliseconds
     * @returns {string} - Formatted time
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Format large numbers with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Export the statistics manager
const statisticsManager = new StatisticsManager();
