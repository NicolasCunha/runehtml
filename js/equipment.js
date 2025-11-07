// Equipment System - Manages player equipment and bonuses
// Equipment provides combat and training bonuses

class Equipment {
    constructor() {
        // Equipment slots
        this.slots = ['weapon', 'offhand', 'helmet', 'body', 'legs'];
        
        // Equipment tiers (in order of progression)
        this.tiers = ['bronze', 'iron', 'steel', 'mithril', 'adamant', 'dragon'];
        
        // Weapon types (each affects different combat styles)
        this.weaponTypes = [
            'sword',      // Balanced melee
            'axe',        // High damage melee
            'mace',       // Defense-oriented melee
            'dagger',     // Fast melee
            'spear',      // Ranged melee
            'bow',        // Ranged
            'crossbow',   // High damage ranged
            'staff',      // Magic/chemistry
            'wand',       // Fast magic
            'scythe'      // Woodcutting/mining
        ];
        
        // Define all equipment items
        this.items = this.generateEquipmentItems();
    }

    /**
     * Generate all equipment items with their properties
     * @returns {Object} - Equipment items organized by slot and tier
     */
    generateEquipmentItems() {
        const items = {};
        
        // Generate weapons for each type and tier
        items.weapon = {};
        this.weaponTypes.forEach(type => {
            items.weapon[type] = {};
            this.tiers.forEach((tier, tierIndex) => {
                const tierLevel = tierIndex + 1;
                items.weapon[type][tier] = {
                    name: `${this.capitalize(tier)} ${this.capitalize(type)}`,
                    slot: 'weapon',
                    tier: tier,
                    tierLevel: tierLevel,
                    weaponType: type,
                    bonuses: this.calculateWeaponBonuses(type, tierLevel),
                    cost: this.calculateCost('weapon', tierLevel),
                    requiredLevel: this.calculateRequiredLevel('weapon', tierLevel),
                    icon: this.getWeaponIcon(type)
                };
            });
        });
        
        // Generate armor pieces (helmet, body, legs)
        ['helmet', 'body', 'legs'].forEach(slot => {
            items[slot] = {};
            this.tiers.forEach((tier, tierIndex) => {
                const tierLevel = tierIndex + 1;
                items[slot][tier] = {
                    name: `${this.capitalize(tier)} ${this.capitalize(slot)}`,
                    slot: slot,
                    tier: tier,
                    tierLevel: tierLevel,
                    bonuses: this.calculateArmorBonuses(slot, tierLevel),
                    cost: this.calculateCost(slot, tierLevel),
                    requiredLevel: this.calculateRequiredLevel(slot, tierLevel),
                    icon: this.getArmorIcon(slot)
                };
            });
        });
        
        // Generate shields (offhand)
        items.offhand = {};
        this.tiers.forEach((tier, tierIndex) => {
            const tierLevel = tierIndex + 1;
            items.offhand[tier] = {
                name: `${this.capitalize(tier)} Shield`,
                slot: 'offhand',
                tier: tier,
                tierLevel: tierLevel,
                bonuses: this.calculateShieldBonuses(tierLevel),
                cost: this.calculateCost('offhand', tierLevel),
                requiredLevel: this.calculateRequiredLevel('offhand', tierLevel),
                icon: '▬'
            };
        });
        
        return items;
    }

    /**
     * Calculate weapon bonuses based on type and tier
     * @param {string} type - Weapon type
     * @param {number} tierLevel - Tier level (1-6)
     * @returns {Object} - Bonus stats
     */
    calculateWeaponBonuses(type, tierLevel) {
        const baseMeleeBonus = tierLevel * 5;
        const baseRangedBonus = tierLevel * 5;
        const baseDefenseBonus = tierLevel * 2;
        
        const bonuses = {
            melee: 0,
            ranged: 0,
            defense: 0,
            mining: 0,
            woodcutting: 0,
            chemistry: 0
        };
        
        // Weapon-specific bonuses
        switch(type) {
            case 'sword':
                bonuses.melee = baseMeleeBonus;
                bonuses.defense = baseDefenseBonus;
                break;
            case 'axe':
                bonuses.melee = baseMeleeBonus + tierLevel * 2;
                bonuses.woodcutting = tierLevel * 3;
                break;
            case 'mace':
                bonuses.melee = baseMeleeBonus - tierLevel;
                bonuses.defense = baseDefenseBonus * 2;
                break;
            case 'dagger':
                bonuses.melee = baseMeleeBonus - tierLevel;
                break;
            case 'spear':
                bonuses.melee = baseMeleeBonus;
                bonuses.ranged = tierLevel * 2;
                break;
            case 'bow':
                bonuses.ranged = baseRangedBonus;
                break;
            case 'crossbow':
                bonuses.ranged = baseRangedBonus + tierLevel * 2;
                break;
            case 'staff':
                bonuses.melee = tierLevel * 2;
                bonuses.chemistry = tierLevel * 4;
                break;
            case 'wand':
                bonuses.chemistry = tierLevel * 5;
                break;
            case 'scythe':
                bonuses.melee = baseMeleeBonus - tierLevel * 2;
                bonuses.mining = tierLevel * 3;
                bonuses.woodcutting = tierLevel * 3;
                break;
        }
        
        return bonuses;
    }

    /**
     * Calculate armor bonuses based on slot and tier
     * @param {string} slot - Armor slot
     * @param {number} tierLevel - Tier level (1-6)
     * @returns {Object} - Bonus stats
     */
    calculateArmorBonuses(slot, tierLevel) {
        const baseDefenseBonus = tierLevel * 4;
        const bonuses = {
            melee: 0,
            ranged: 0,
            defense: baseDefenseBonus,
            mining: 0,
            woodcutting: 0,
            chemistry: 0
        };
        
        // Body armor provides more defense
        if (slot === 'body') {
            bonuses.defense = Math.floor(baseDefenseBonus * 1.5);
        }
        
        return bonuses;
    }

    /**
     * Calculate shield bonuses based on tier
     * @param {number} tierLevel - Tier level (1-6)
     * @returns {Object} - Bonus stats
     */
    calculateShieldBonuses(tierLevel) {
        return {
            melee: tierLevel,
            ranged: tierLevel,
            defense: tierLevel * 6,
            mining: 0,
            woodcutting: 0,
            chemistry: 0
        };
    }

    /**
     * Calculate equipment cost based on slot and tier
     * @param {string} slot - Equipment slot
     * @param {number} tierLevel - Tier level (1-6)
     * @returns {number} - Gold cost
     */
    calculateCost(slot, tierLevel) {
        const baseCosts = {
            weapon: 100,
            offhand: 80,
            helmet: 60,
            body: 90,
            legs: 70
        };
        
        const baseCost = baseCosts[slot] || 50;
        // Cost scales exponentially with tier
        return Math.floor(baseCost * Math.pow(2, tierLevel - 1));
    }

    /**
     * Calculate required level for equipment
     * @param {string} slot - Equipment slot
     * @param {number} tierLevel - Tier level (1-6)
     * @returns {number} - Required level
     */
    calculateRequiredLevel(slot, tierLevel) {
        // Bronze (tier 1) = level 1
        // Iron (tier 2) = level 10
        // Steel (tier 3) = level 20
        // Mithril (tier 4) = level 40
        // Adamant (tier 5) = level 60
        // Dragon (tier 6) = level 80
        const levelRequirements = [1, 10, 20, 40, 60, 80];
        return levelRequirements[tierLevel - 1];
    }

    /**
     * Get weapon icon based on type
     * @param {string} type - Weapon type
     * @returns {string} - ASCII icon
     */
    getWeaponIcon(type) {
        const icons = {
            sword: '⚔',
            axe: '⚒',
            mace: '♨',
            dagger: '†',
            spear: '↣',
            bow: '↣',
            crossbow: '⇶',
            staff: '⌬',
            wand: '✦',
            scythe: '⚔'
        };
        return icons[type] || '⚔';
    }

    /**
     * Get armor icon based on slot
     * @param {string} slot - Armor slot
     * @returns {string} - ASCII icon
     */
    getArmorIcon(slot) {
        const icons = {
            helmet: '◬',
            body: '▓',
            legs: '◭'
        };
        return icons[slot] || '▓';
    }

    /**
     * Get equipment item by slot, type, and tier
     * @param {string} slot - Equipment slot
     * @param {string} typeOrTier - Weapon type (for weapons) or tier (for armor)
     * @param {string} tier - Tier (only for weapons)
     * @returns {Object|null} - Equipment item or null
     */
    getItem(slot, typeOrTier, tier = null) {
        if (!this.items[slot]) return null;
        
        if (slot === 'weapon' && tier) {
            return this.items[slot][typeOrTier]?.[tier] || null;
        } else {
            return this.items[slot][typeOrTier] || null;
        }
    }

    /**
     * Get all items for a specific slot
     * @param {string} slot - Equipment slot
     * @returns {Array} - Array of equipment items
     */
    getItemsForSlot(slot) {
        if (!this.items[slot]) return [];
        
        const items = [];
        if (slot === 'weapon') {
            // Flatten weapon items
            this.weaponTypes.forEach(type => {
                this.tiers.forEach(tier => {
                    items.push(this.items.weapon[type][tier]);
                });
            });
        } else {
            // Flat list for armor/shield
            Object.values(this.items[slot]).forEach(item => {
                items.push(item);
            });
        }
        
        return items;
    }

    /**
     * Calculate total bonuses from equipped items
     * @param {Object} equippedItems - Currently equipped items {slot: itemData}
     * @returns {Object} - Total bonus stats
     */
    calculateTotalBonuses(equippedItems) {
        const totalBonuses = {
            melee: 0,
            ranged: 0,
            defense: 0,
            mining: 0,
            woodcutting: 0,
            chemistry: 0
        };
        
        Object.values(equippedItems).forEach(item => {
            if (item && item.bonuses) {
                Object.keys(totalBonuses).forEach(stat => {
                    totalBonuses[stat] += item.bonuses[stat] || 0;
                });
            }
        });
        
        return totalBonuses;
    }

    /**
     * Check if player meets level requirement for item
     * @param {Object} item - Equipment item
     * @param {Object} skills - Player's skill levels
     * @returns {boolean} - True if requirements met
     */
    canEquip(item, skills) {
        if (!item || !item.requiredLevel) return false;
        
        // For weapons, check the appropriate combat skill
        if (item.slot === 'weapon') {
            const weaponType = item.weaponType;
            
            if (weaponType === 'bow' || weaponType === 'crossbow') {
                return skills.ranged?.level >= item.requiredLevel;
            } else if (weaponType === 'staff' || weaponType === 'wand') {
                return skills.chemistry?.level >= item.requiredLevel;
            } else if (weaponType === 'scythe') {
                return skills.mining?.level >= item.requiredLevel || skills.woodcutting?.level >= item.requiredLevel;
            } else {
                return skills.melee?.level >= item.requiredLevel;
            }
        }
        
        // For armor, check defense skill
        if (item.slot === 'helmet' || item.slot === 'body' || item.slot === 'legs' || item.slot === 'offhand') {
            return skills.defense?.level >= item.requiredLevel;
        }
        
        return false;
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export the equipment system
const equipment = new Equipment();
