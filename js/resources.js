// Resources Manager - Handles resource gathering and inventory
// Maps skills to their resource outputs

class ResourcesManager {
    constructor() {
        // Define which skills gather which resources
        this.skillResources = {
            mining: {
                resource: 'ore',
                drops: [
                    { min: 1, max: 10, type: 'copper', chance: 1.0 },      // Always drops copper at low levels
                    { min: 11, max: 20, type: 'tin', chance: 1.0 },
                    { min: 21, max: 30, type: 'iron', chance: 1.0 },
                    { min: 31, max: 40, type: 'coal', chance: 1.0 },
                    { min: 41, max: 50, type: 'gold', chance: 1.0 },
                    { min: 51, max: 60, type: 'mithril', chance: 1.0 },
                    { min: 61, max: 70, type: 'adamant', chance: 1.0 },
                    { min: 71, max: 99, type: 'runite', chance: 1.0 }
                ]
            },
            woodcutting: {
                resource: 'logs',
                drops: [
                    { min: 1, max: 10, type: 'normal', chance: 1.0 },
                    { min: 11, max: 20, type: 'oak', chance: 1.0 },
                    { min: 21, max: 30, type: 'willow', chance: 1.0 },
                    { min: 31, max: 40, type: 'maple', chance: 1.0 },
                    { min: 41, max: 50, type: 'yew', chance: 1.0 },
                    { min: 51, max: 60, type: 'magic', chance: 1.0 },
                    { min: 61, max: 99, type: 'redwood', chance: 1.0 }
                ]
            },
            chemistry: {
                resource: 'potions',
                drops: [
                    { min: 1, max: 10, type: 'basic', chance: 1.0 },
                    { min: 11, max: 20, type: 'health', chance: 1.0 },
                    { min: 21, max: 30, type: 'mana', chance: 1.0 },
                    { min: 31, max: 40, type: 'energy', chance: 1.0 },
                    { min: 41, max: 50, type: 'poison', chance: 1.0 },
                    { min: 51, max: 60, type: 'fire', chance: 1.0 },
                    { min: 61, max: 70, type: 'frost', chance: 1.0 },
                    { min: 71, max: 80, type: 'divine', chance: 1.0 },
                    { min: 81, max: 99, type: 'life', chance: 1.0 }
                ]
            }
        };
    }
    
    /**
     * Get resource drops for a skill action (can return multiple resources)
     * @param {string} skillKey - The skill being trained
     * @param {number} level - Current skill level
     * @returns {Array} - Array of resource drop objects
     */
    getResourceDrop(skillKey, level) {
        const skillResource = this.skillResources[skillKey];
        if (!skillResource) return [];
        
        // Find all drops available at current level (current range and all previous ranges)
        const availableDrops = skillResource.drops.filter(d => level >= d.min);
        if (availableDrops.length === 0) return [];
        
        const drops = [];
        
        // Each resource type gets its own roll
        // Drop chance decreases for higher tier resources
        for (let i = 0; i < availableDrops.length; i++) {
            const drop = availableDrops[i];
            
            // Calculate drop chance based on tier (lower index = higher tier = lower chance)
            // Reverse the index so newest unlocks have lowest chance
            const tierIndex = availableDrops.length - i - 1;
            // Base chance decreases with tier: 60%, 45%, 30%, 20%, 15%, 10%, 7%, 5%
            const baseChance = Math.max(0.05, 0.60 - (tierIndex * 0.15));
            
            // Roll for this resource
            if (Math.random() <= baseChance) {
                // Calculate amount (1-3 resources per drop)
                const amount = Math.floor(Math.random() * 3) + 1;
                
                drops.push({
                    resource: skillResource.resource,
                    type: drop.type,
                    amount: amount,
                    displayName: this.getDisplayName(skillResource.resource, drop.type)
                });
            }
        }
        
        return drops;
    }
    
    /**
     * Get display name for a resource
     * @param {string} resource - Resource category
     * @param {string} type - Resource type
     * @returns {string} - Display name
     */
    getDisplayName(resource, type) {
        const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
        
        if (resource === 'ore') {
            return `${typeCapitalized} Ore`;
        } else if (resource === 'logs') {
            return `${typeCapitalized} Logs`;
        } else if (resource === 'potions') {
            return `${typeCapitalized} Potion`;
        }
        return typeCapitalized;
    }
    
    /**
     * Get all resources for inventory display
     * @param {Object} resourcesData - Resources data from game state
     * @returns {Array} - Array of resource objects for display
     */
    getInventoryDisplay(resourcesData) {
        const inventory = [];
        
        // Group resources by category
        for (const [key, value] of Object.entries(resourcesData)) {
            if (value > 0) {
                inventory.push({
                    key: key,
                    name: this.getResourceDisplayName(key),
                    amount: value
                });
            }
        }
        
        return inventory;
    }
    
    /**
     * Get display name for a resource key
     * @param {string} key - Resource key
     * @returns {string} - Display name
     */
    getResourceDisplayName(key) {
        const names = {
            // Ores
            copper: 'Copper Ore',
            tin: 'Tin Ore',
            iron: 'Iron Ore',
            coal: 'Coal',
            gold: 'Gold Ore',
            mithril: 'Mithril Ore',
            adamant: 'Adamantite Ore',
            runite: 'Runite Ore',
            // Logs
            normal: 'Normal Logs',
            oak: 'Oak Logs',
            willow: 'Willow Logs',
            maple: 'Maple Logs',
            yew: 'Yew Logs',
            magic: 'Magic Logs',
            redwood: 'Redwood Logs',
            // Potions
            basic: 'Basic Potion',
            health: 'Health Potion',
            mana: 'Mana Potion',
            energy: 'Energy Potion',
            poison: 'Poison Vial',
            fire: 'Fire Elixir',
            frost: 'Frost Elixir',
            divine: 'Divine Elixir',
            life: 'Elixir of Life'
        };
        
        // Check if it's a combat resource
        if (combatResourcesManager && combatResourcesManager.isCombatResource(key)) {
            return combatResourcesManager.getDisplayName(key);
        }
        
        return names[key] || key;
    }
}

// Export the resources manager
const resourcesManager = new ResourcesManager();

