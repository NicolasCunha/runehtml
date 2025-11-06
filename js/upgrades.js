// Upgrades Manager - Handles shop and upgrade system
// Provides upgrades that boost skill training efficiency

class UpgradesManager {
    constructor() {
        // Define all available upgrades
        this.upgrades = {
            // Mining pickaxes
            bronzePickaxe: {
                name: 'Bronze Pickaxe',
                description: 'A basic pickaxe that increases mining speed',
                skill: 'mining',
                bonus: 0.10, // 10% bonus
                cost: { copper: 50, tin: 30 },
                requiredLevel: 1,
                category: 'tool'
            },
            ironPickaxe: {
                name: 'Iron Pickaxe',
                description: 'A sturdy pickaxe for faster mining',
                skill: 'mining',
                bonus: 0.25, // 25% bonus
                cost: { iron: 40, coal: 20 },
                requiredLevel: 20,
                requires: ['bronzePickaxe'],
                category: 'tool'
            },
            steelPickaxe: {
                name: 'Steel Pickaxe',
                description: 'An excellent pickaxe for experienced miners',
                skill: 'mining',
                bonus: 0.50, // 50% bonus
                cost: { iron: 80, coal: 60 },
                requiredLevel: 40,
                requires: ['ironPickaxe'],
                category: 'tool'
            },
            mithrilPickaxe: {
                name: 'Mithril Pickaxe',
                description: 'A magical pickaxe of great power',
                skill: 'mining',
                bonus: 0.75, // 75% bonus
                cost: { mithril: 100, gold: 50 },
                requiredLevel: 60,
                requires: ['steelPickaxe'],
                category: 'tool'
            },
            runePickaxe: {
                name: 'Rune Pickaxe',
                description: 'The ultimate mining tool',
                skill: 'mining',
                bonus: 1.0, // 100% bonus (2x speed)
                cost: { runite: 50, adamant: 100 },
                requiredLevel: 80,
                requires: ['mithrilPickaxe'],
                category: 'tool'
            },
            
            // Woodcutting axes
            bronzeAxe: {
                name: 'Bronze Axe',
                description: 'A basic axe for chopping trees',
                skill: 'woodcutting',
                bonus: 0.10,
                cost: { copper: 40, tin: 40 },
                requiredLevel: 1,
                category: 'tool'
            },
            ironAxe: {
                name: 'Iron Axe',
                description: 'A sharp axe for faster woodcutting',
                skill: 'woodcutting',
                bonus: 0.25,
                cost: { iron: 50, normal: 100 },
                requiredLevel: 20,
                requires: ['bronzeAxe'],
                category: 'tool'
            },
            steelAxe: {
                name: 'Steel Axe',
                description: 'An excellent axe for expert lumberjacks',
                skill: 'woodcutting',
                bonus: 0.50,
                cost: { iron: 100, oak: 150 },
                requiredLevel: 40,
                requires: ['ironAxe'],
                category: 'tool'
            },
            mithrilAxe: {
                name: 'Mithril Axe',
                description: 'A legendary axe of immense cutting power',
                skill: 'woodcutting',
                bonus: 0.75,
                cost: { mithril: 80, maple: 200 },
                requiredLevel: 60,
                requires: ['steelAxe'],
                category: 'tool'
            },
            runeAxe: {
                name: 'Rune Axe',
                description: 'The finest axe ever crafted',
                skill: 'woodcutting',
                bonus: 1.0,
                cost: { runite: 40, magic: 100 },
                requiredLevel: 80,
                requires: ['mithrilAxe'],
                category: 'tool'
            },
            
            // Chemistry equipment
            basicKit: {
                name: 'Basic Brewing Kit',
                description: 'Simple equipment for brewing potions',
                skill: 'chemistry',
                bonus: 0.10,
                cost: { basic: 20, copper: 30 },
                requiredLevel: 1,
                category: 'tool'
            },
            advancedKit: {
                name: 'Advanced Brewing Kit',
                description: 'Professional equipment for alchemists',
                skill: 'chemistry',
                bonus: 0.30,
                cost: { health: 30, mana: 30, iron: 50 },
                requiredLevel: 25,
                requires: ['basicKit'],
                category: 'tool'
            },
            masterKit: {
                name: 'Master Brewing Kit',
                description: 'The ultimate alchemy laboratory',
                skill: 'chemistry',
                bonus: 0.60,
                cost: { energy: 50, fire: 30, gold: 80 },
                requiredLevel: 50,
                requires: ['advancedKit'],
                category: 'tool'
            },
            arcaneKit: {
                name: 'Arcane Brewing Kit',
                description: 'Mystical equipment blessed by ancient powers',
                skill: 'chemistry',
                bonus: 1.0,
                cost: { divine: 40, frost: 40, mithril: 100 },
                requiredLevel: 75,
                requires: ['masterKit'],
                category: 'tool'
            },
            
            // Melee weapons
            bronzeSword: {
                name: 'Bronze Longsword',
                description: 'A simple blade for beginning warriors',
                skill: 'melee',
                bonus: 0.10,
                cost: { copper: 60, tin: 40 },
                requiredLevel: 1,
                category: 'weapon'
            },
            ironScimitar: {
                name: 'Iron Scimitar',
                description: 'A curved blade with faster attack speed',
                skill: 'melee',
                bonus: 0.25,
                cost: { iron: 50, coal: 30 },
                requiredLevel: 20,
                requires: ['bronzeSword'],
                category: 'weapon'
            },
            steelBattleaxe: {
                name: 'Steel Battleaxe',
                description: 'A heavy weapon that deals devastating blows',
                skill: 'melee',
                bonus: 0.50,
                cost: { iron: 100, coal: 80, oak: 40 },
                requiredLevel: 40,
                requires: ['ironScimitar'],
                category: 'weapon'
            },
            mithrilGreatsword: {
                name: 'Mithril Greatsword',
                description: 'An enchanted blade forged from magical ore',
                skill: 'melee',
                bonus: 0.75,
                cost: { mithril: 120, gold: 60, magic: 30 },
                requiredLevel: 60,
                requires: ['steelBattleaxe'],
                category: 'weapon'
            },
            dragonScimitar: {
                name: 'Dragon Scimitar',
                description: 'Legendary weapon wielded by ancient heroes',
                skill: 'melee',
                bonus: 1.0,
                cost: { runite: 80, adamant: 100, life: 20, divine: 30 },
                requiredLevel: 80,
                requires: ['mithrilGreatsword'],
                category: 'weapon'
            },
            
            // Defense armor
            leatherArmor: {
                name: 'Leather Armor',
                description: 'Basic protection for novice defenders',
                skill: 'defense',
                bonus: 0.10,
                cost: { normal: 100, oak: 50 },
                requiredLevel: 1,
                category: 'armor'
            },
            chainmail: {
                name: 'Iron Chainmail',
                description: 'Interlocking rings provide solid defense',
                skill: 'defense',
                bonus: 0.25,
                cost: { iron: 80, copper: 60, willow: 40 },
                requiredLevel: 20,
                requires: ['leatherArmor'],
                category: 'armor'
            },
            steelPlate: {
                name: 'Steel Plate Armor',
                description: 'Heavy plating that can withstand fierce attacks',
                skill: 'defense',
                bonus: 0.50,
                cost: { iron: 150, coal: 120, maple: 60 },
                requiredLevel: 40,
                requires: ['chainmail'],
                category: 'armor'
            },
            mithrilKiteshield: {
                name: 'Mithril Kiteshield',
                description: 'Magical shield that deflects powerful strikes',
                skill: 'defense',
                bonus: 0.75,
                cost: { mithril: 140, gold: 80, yew: 50, health: 30 },
                requiredLevel: 60,
                requires: ['steelPlate'],
                category: 'armor'
            },
            dragonArmor: {
                name: 'Dragon Plate Set',
                description: 'Impenetrable armor crafted from dragon scales',
                skill: 'defense',
                bonus: 1.0,
                cost: { runite: 100, adamant: 120, magic: 40, fire: 40, energy: 50 },
                requiredLevel: 80,
                requires: ['mithrilKiteshield'],
                category: 'armor'
            },
            
            // Ranged weapons
            shortbow: {
                name: 'Oak Shortbow',
                description: 'A simple bow for practicing marksmanship',
                skill: 'ranged',
                bonus: 0.10,
                cost: { oak: 80, normal: 50 },
                requiredLevel: 1,
                category: 'weapon'
            },
            crossbow: {
                name: 'Iron Crossbow',
                description: 'Mechanical precision for improved accuracy',
                skill: 'ranged',
                bonus: 0.25,
                cost: { iron: 60, willow: 80, copper: 40 },
                requiredLevel: 20,
                requires: ['shortbow'],
                category: 'weapon'
            },
            mapleLongbow: {
                name: 'Maple Longbow',
                description: 'Extended range with powerful draw strength',
                skill: 'ranged',
                bonus: 0.50,
                cost: { maple: 100, iron: 50, basic: 20, mana: 20 },
                requiredLevel: 40,
                requires: ['crossbow'],
                category: 'weapon'
            },
            yewCompound: {
                name: 'Yew Compound Bow',
                description: 'Advanced design for expert archers',
                skill: 'ranged',
                bonus: 0.75,
                cost: { yew: 120, mithril: 80, gold: 50, poison: 30 },
                requiredLevel: 60,
                requires: ['mapleLongbow'],
                category: 'weapon'
            },
            crystalBow: {
                name: 'Crystal Bow',
                description: 'Ethereal weapon that never runs out of arrows',
                skill: 'ranged',
                bonus: 1.0,
                cost: { magic: 80, redwood: 60, frost: 40, divine: 40, mithril: 100 },
                requiredLevel: 80,
                requires: ['yewCompound'],
                category: 'weapon'
            }
        };
    }
    
    /**
     * Get all upgrades for a specific skill
     * @param {string} skill - The skill to filter by
     * @returns {Array} - Array of upgrade objects with keys
     */
    getUpgradesForSkill(skill) {
        const upgrades = [];
        for (const [key, upgrade] of Object.entries(this.upgrades)) {
            if (upgrade.skill === skill) {
                upgrades.push({ key, ...upgrade });
            }
        }
        return upgrades;
    }
    
    /**
     * Check if player can afford an upgrade
     * @param {string} upgradeKey - The upgrade to check
     * @param {Object} resources - Player's resources
     * @returns {boolean} - Whether player can afford it
     */
    canAfford(upgradeKey, resources) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return false;
        
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            if ((resources[resource] || 0) < amount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if player meets level requirement
     * @param {string} upgradeKey - The upgrade to check
     * @param {number} level - Player's skill level
     * @returns {boolean} - Whether player meets requirement
     */
    meetsLevelRequirement(upgradeKey, level) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return false;
        return level >= upgrade.requiredLevel;
    }
    
    /**
     * Check if player has prerequisite upgrades
     * @param {string} upgradeKey - The upgrade to check
     * @param {Array} ownedUpgrades - Array of owned upgrade keys
     * @returns {boolean} - Whether player has prerequisites
     */
    hasPrerequisites(upgradeKey, ownedUpgrades) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade || !upgrade.requires) return true;
        
        return upgrade.requires.every(req => ownedUpgrades.includes(req));
    }
    
    /**
     * Calculate total bonus for a skill
     * @param {string} skill - The skill to calculate bonus for
     * @param {Array} ownedUpgrades - Array of owned upgrade keys
     * @returns {number} - Total bonus multiplier (e.g., 0.5 = 50% bonus)
     */
    getTotalBonus(skill, ownedUpgrades) {
        let totalBonus = 0;
        
        for (const upgradeKey of ownedUpgrades) {
            const upgrade = this.upgrades[upgradeKey];
            if (upgrade && upgrade.skill === skill) {
                totalBonus += upgrade.bonus;
            }
        }
        
        return totalBonus;
    }
    
    /**
     * Get upgrade by key
     * @param {string} key - Upgrade key
     * @returns {Object} - Upgrade object
     */
    getUpgrade(key) {
        return this.upgrades[key];
    }
    
    /**
     * Check if player meets level requirement
     * @param {string} upgradeKey - The upgrade to check
     * @param {number} currentLevel - Player's current level in the skill
     * @returns {boolean} - Whether level requirement is met
     */
    meetsLevelRequirement(upgradeKey, currentLevel) {
        const upgrade = this.upgrades[upgradeKey];
        if (!upgrade) return false;
        return currentLevel >= upgrade.requiredLevel;
    }
    
    /**
     * Format cost string for display
     * @param {Object} cost - Cost object
     * @returns {string} - Formatted cost string
     */
    formatCost(cost) {
        const parts = [];
        for (const [resource, amount] of Object.entries(cost)) {
            const name = resourcesManager.getResourceDisplayName(resource);
            parts.push(`${amount} ${name}`);
        }
        return parts.join(', ');
    }
}

// Export the upgrades manager
const upgradesManager = new UpgradesManager();
