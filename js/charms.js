// Charms Manager - Handles charm shop and enchantment system
// Provides magical charms that boost skill training efficiency

class CharmsManager {
    constructor() {
        // Define all available charms
        this.charms = {
            // Mining charms
            bronzePickaxe: {
                name: 'Lesser Mining Charm',
                description: 'A basic enchantment that increases mining speed',
                skill: 'mining',
                bonus: 0.10, // 10% bonus
                cost: { copper: 50, tin: 30 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            ironPickaxe: {
                name: 'Minor Mining Charm',
                description: 'A sturdy enchantment for faster mining',
                skill: 'mining',
                bonus: 0.25, // 25% bonus
                cost: { iron: 40, coal: 20 },
                requiredLevel: 20,
                requires: ['bronzePickaxe'],
                category: 'enchantment'
            },
            steelPickaxe: {
                name: 'Mining Charm',
                description: 'An excellent enchantment for experienced miners',
                skill: 'mining',
                bonus: 0.50, // 50% bonus
                cost: { iron: 80, coal: 60 },
                requiredLevel: 40,
                requires: ['ironPickaxe'],
                category: 'enchantment'
            },
            mithrilPickaxe: {
                name: 'Greater Mining Charm',
                description: 'A magical enchantment of great power',
                skill: 'mining',
                bonus: 0.75, // 75% bonus
                cost: { mithril: 100, gold: 50 },
                requiredLevel: 60,
                requires: ['steelPickaxe'],
                category: 'enchantment'
            },
            runePickaxe: {
                name: 'Master Mining Charm',
                description: 'The ultimate mining enchantment',
                skill: 'mining',
                bonus: 1.0, // 100% bonus (2x speed)
                cost: { runite: 50, adamant: 100 },
                requiredLevel: 80,
                requires: ['mithrilPickaxe'],
                category: 'enchantment'
            },
            
            // Woodcutting charms
            bronzeAxe: {
                name: 'Lesser Forestry Charm',
                description: 'A basic enchantment for chopping trees',
                skill: 'woodcutting',
                bonus: 0.10,
                cost: { copper: 40, tin: 40 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            ironAxe: {
                name: 'Minor Forestry Charm',
                description: 'A sharp enchantment for faster woodcutting',
                skill: 'woodcutting',
                bonus: 0.25,
                cost: { iron: 50, normal: 100 },
                requiredLevel: 20,
                requires: ['bronzeAxe'],
                category: 'enchantment'
            },
            steelAxe: {
                name: 'Forestry Charm',
                description: 'An excellent enchantment for expert lumberjacks',
                skill: 'woodcutting',
                bonus: 0.50,
                cost: { iron: 100, oak: 150 },
                requiredLevel: 40,
                requires: ['ironAxe'],
                category: 'enchantment'
            },
            mithrilAxe: {
                name: 'Greater Forestry Charm',
                description: 'A legendary enchantment of immense cutting power',
                skill: 'woodcutting',
                bonus: 0.75,
                cost: { mithril: 80, maple: 200 },
                requiredLevel: 60,
                requires: ['steelAxe'],
                category: 'enchantment'
            },
            runeAxe: {
                name: 'Master Forestry Charm',
                description: 'The finest enchantment ever crafted',
                skill: 'woodcutting',
                bonus: 1.0,
                cost: { runite: 40, magic: 100 },
                requiredLevel: 80,
                requires: ['mithrilAxe'],
                category: 'enchantment'
            },
            
            // Chemistry charms
            basicKit: {
                name: 'Lesser Alchemy Charm',
                description: 'Simple enchantment for brewing potions',
                skill: 'chemistry',
                bonus: 0.10,
                cost: { basic: 20, copper: 30 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            advancedKit: {
                name: 'Minor Alchemy Charm',
                description: 'Professional enchantment for alchemists',
                skill: 'chemistry',
                bonus: 0.30,
                cost: { health: 30, mana: 30, iron: 50 },
                requiredLevel: 25,
                requires: ['basicKit'],
                category: 'enchantment'
            },
            masterKit: {
                name: 'Alchemy Charm',
                description: 'The ultimate enchantment for magical brewing',
                skill: 'chemistry',
                bonus: 0.60,
                cost: { energy: 50, fire: 30, gold: 80 },
                requiredLevel: 50,
                requires: ['advancedKit'],
                category: 'enchantment'
            },
            arcaneKit: {
                name: 'Master Alchemy Charm',
                description: 'Mystical enchantment blessed by ancient powers',
                skill: 'chemistry',
                bonus: 1.0,
                cost: { divine: 40, frost: 40, mithril: 100 },
                requiredLevel: 75,
                requires: ['masterKit'],
                category: 'enchantment'
            },
            
            // Melee combat charms
            bronzeSword: {
                name: 'Lesser Combat Charm',
                description: 'A simple enchantment for beginning warriors',
                skill: 'melee',
                bonus: 0.10,
                cost: { rat_tail: 60, goblin_tooth: 40, leather_scraps: 30 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            ironScimitar: {
                name: 'Minor Combat Charm',
                description: 'A curved enchantment with faster attack speed',
                skill: 'melee',
                bonus: 0.25,
                cost: { goblin_blade: 50, iron_scraps: 40, broken_sword: 30 },
                requiredLevel: 20,
                requires: ['bronzeSword'],
                category: 'enchantment'
            },
            steelBattleaxe: {
                name: 'Combat Charm',
                description: 'A heavy enchantment that deals devastating blows',
                skill: 'melee',
                bonus: 0.50,
                cost: { orc_axe: 80, iron_plate: 60, dark_steel: 40 },
                requiredLevel: 40,
                requires: ['ironScimitar'],
                category: 'enchantment'
            },
            mithrilGreatsword: {
                name: 'Greater Combat Charm',
                description: 'An enchanted blessing forged from magical ore',
                skill: 'melee',
                bonus: 0.75,
                cost: { ancient_blade: 100, cursed_armor: 80, steel_plate: 60 },
                requiredLevel: 60,
                requires: ['steelBattleaxe'],
                category: 'enchantment'
            },
            dragonScimitar: {
                name: 'Master Combat Charm',
                description: 'Legendary enchantment wielded by ancient heroes',
                skill: 'melee',
                bonus: 1.0,
                cost: { dragon_scale: 80, war_core: 60, abyssal_whip: 40, demon_heart: 30 },
                requiredLevel: 80,
                requires: ['mithrilGreatsword'],
                category: 'enchantment'
            },
            
            // Defense charms
            leatherArmor: {
                name: 'Lesser Defense Charm',
                description: 'Basic enchantment for novice defenders',
                skill: 'defense',
                bonus: 0.10,
                cost: { boar_hide: 80, wolf_pelt: 60, thick_leather: 40 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            chainmail: {
                name: 'Minor Defense Charm',
                description: 'Interlocking enchantment provides solid defense',
                skill: 'defense',
                bonus: 0.25,
                cost: { iron_shield: 70, captain_helm: 50, bear_pelt: 40 },
                requiredLevel: 20,
                requires: ['leatherArmor'],
                category: 'enchantment'
            },
            steelPlate: {
                name: 'Defense Charm',
                description: 'Heavy enchantment that can withstand fierce attacks',
                skill: 'defense',
                bonus: 0.50,
                cost: { steel_shield: 90, fortress_shield: 70, knight_shield: 50 },
                requiredLevel: 40,
                requires: ['chainmail'],
                category: 'enchantment'
            },
            mithrilKiteshield: {
                name: 'Greater Defense Charm',
                description: 'Magical enchantment that deflects powerful strikes',
                skill: 'defense',
                bonus: 0.75,
                cost: { turtle_shell: 100, golem_shield: 80, holy_shield: 60 },
                requiredLevel: 60,
                requires: ['steelPlate'],
                category: 'enchantment'
            },
            dragonArmor: {
                name: 'Master Defense Charm',
                description: 'Impenetrable enchantment crafted from dragon scales',
                skill: 'defense',
                bonus: 1.0,
                cost: { dragon_shell: 80, divine_scale: 70, immortal_armor: 50, holy_plate: 40 },
                requiredLevel: 80,
                requires: ['mithrilKiteshield'],
                category: 'enchantment'
            },
            
            // Ranged combat charms
            shortbow: {
                name: 'Lesser Archery Charm',
                description: 'A simple enchantment for practicing marksmanship',
                skill: 'ranged',
                bonus: 0.10,
                cost: { bat_wing: 70, raven_feather: 60, wooden_bow: 50 },
                requiredLevel: 1,
                category: 'enchantment'
            },
            crossbow: {
                name: 'Minor Archery Charm',
                description: 'Mechanical precision enchantment for improved accuracy',
                skill: 'ranged',
                bonus: 0.25,
                cost: { hawk_feather: 80, crossbow_bolt: 60, iron_arrow: 50 },
                requiredLevel: 20,
                requires: ['shortbow'],
                category: 'enchantment'
            },
            mapleLongbow: {
                name: 'Archery Charm',
                description: 'Extended range enchantment with powerful draw strength',
                skill: 'ranged',
                bonus: 0.50,
                cost: { scorpion_stinger: 90, longbow: 70, steel_arrow: 50 },
                requiredLevel: 40,
                requires: ['crossbow'],
                category: 'enchantment'
            },
            yewCompound: {
                name: 'Greater Archery Charm',
                description: 'Advanced enchantment for expert archers',
                skill: 'ranged',
                bonus: 0.75,
                cost: { giant_feather: 100, shadow_blade: 80, elven_longbow: 60 },
                requiredLevel: 60,
                requires: ['mapleLongbow'],
                category: 'enchantment'
            },
            crystalBow: {
                name: 'Master Archery Charm',
                description: 'Ethereal enchantment that never runs out of arrows',
                skill: 'ranged',
                bonus: 1.0,
                cost: { crystal_bow: 80, legendary_bow: 70, demon_bow: 50, prismatic_arrow: 40 },
                requiredLevel: 80,
                requires: ['yewCompound'],
                category: 'enchantment'
            }
        };
    }
    
    /**
     * Get all charms for a specific skill
     * @param {string} skill - The skill to filter by
     * @returns {Array} - Array of charm objects with keys
     */
    getCharmsForSkill(skill) {
        const charms = [];
        for (const [key, charm] of Object.entries(this.charms)) {
            if (charm.skill === skill) {
                charms.push({ key, ...charm });
            }
        }
        return charms;
    }

    /**
     * Get a specific charm by key
     * @param {string} key - The charm key
     * @returns {Object} - Charm object
     */
    getCharm(key) {
        return this.charms[key];
    }
    
    /**
     * Check if player can afford a charm
     * @param {string} charmKey - The charm to check
     * @param {Object} resources - Player's resources
     * @returns {boolean} - Whether player can afford it
     */
    canAfford(charmKey, resources) {
        const charm = this.charms[charmKey];
        if (!charm) return false;
        
        for (const [resource, amount] of Object.entries(charm.cost)) {
            if ((resources[resource] || 0) < amount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if player meets level requirement
     * @param {string} charmKey - The charm to check
     * @param {number} level - Player's skill level
     * @returns {boolean} - Whether player meets requirement
     */
    meetsLevelRequirement(charmKey, level) {
        const charm = this.charms[charmKey];
        if (!charm) return false;
        return level >= charm.requiredLevel;
    }
    
    /**
     * Check if player has prerequisites for a charm
     * @param {string} charmKey - The charm to check
     * @param {Array} ownedCharms - Array of owned charm keys
     * @returns {boolean} - Whether player has prerequisites
     */
    hasPrerequisites(charmKey, ownedCharms) {
        const charm = this.charms[charmKey];
        if (!charm || !charm.requires) return true;
        
        return charm.requires.every(req => ownedCharms.includes(req));
    }
    
    /**
     * Get total bonus from owned charms for a specific skill
     * @param {string} skill - The skill to calculate bonus for
     * @param {Array} ownedCharms - Array of owned charm keys
     * @returns {number} - Total bonus percentage (as whole number, e.g., 25 for 25%)
     */
    getTotalBonus(skill, ownedCharms) {
        let totalBonus = 0;
        
        for (const charmKey of ownedCharms) {
            const charm = this.charms[charmKey];
            if (charm && charm.skill === skill) {
                totalBonus += charm.bonus * 100; // Convert to percentage
            }
        }
        
        return totalBonus;
    }
    
    /**
     * Check if current level meets the requirement for a charm
     */
    meetsLevelRequirement(upgradeKey, currentLevel) {
        const upgrade = this.charms[upgradeKey];
        if (!upgrade) return false;
        return currentLevel >= upgrade.requiredLevel;
    }
    
    /**
     * Format cost display for a charm
     * @param {Object} cost - Cost object with resource: amount pairs
     * @returns {string} - Formatted cost string
     */
    formatCost(cost) {
        return Object.entries(cost)
            .map(([resource, amount]) => `${amount} ${combatResourcesManager.formatResourceName(resource)}`)
            .join(', ');
    }
}

// Export the charms manager
const charmsManager = new CharmsManager();

// Backwards compatibility - keep upgradesManager reference  
const upgradesManager = charmsManager;

// Make sure both are globally available
if (typeof window !== 'undefined') {
    window.charmsManager = charmsManager;
    window.upgradesManager = upgradesManager;
}
