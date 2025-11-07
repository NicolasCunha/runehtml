import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock Equipment class
class Equipment {
    constructor() {
        this.slots = ['weapon', 'offhand', 'helmet', 'body', 'legs'];
        this.tiers = ['bronze', 'iron', 'steel', 'mithril', 'adamant', 'dragon'];
        this.weaponTypes = ['sword', 'axe'];
        this.items = this.generateEquipmentItems();
    }

    generateEquipmentItems() {
        const items = {};
        
        items.weapon = {};
        this.weaponTypes.forEach(type => {
            items.weapon[type] = {};
            this.tiers.forEach((tier, tierIndex) => {
                const tierLevel = tierIndex + 1;
                items.weapon[type][tier] = {
                    name: `${tier} ${type}`,
                    slot: 'weapon',
                    tier: tier,
                    tierLevel: tierLevel,
                    weaponType: type,
                    bonuses: { melee: tierLevel * 5, defense: 0, ranged: 0, mining: 0, woodcutting: 0, chemistry: 0 },
                    cost: 100 * Math.pow(2, tierLevel - 1),
                    requiredLevel: [1, 10, 20, 40, 60, 80][tierLevel - 1],
                    icon: '⚔'
                };
            });
        });
        
        items.helmet = {};
        this.tiers.forEach((tier, tierIndex) => {
            const tierLevel = tierIndex + 1;
            items.helmet[tier] = {
                name: `${tier} helmet`,
                slot: 'helmet',
                tier: tier,
                tierLevel: tierLevel,
                bonuses: { defense: tierLevel * 4, melee: 0, ranged: 0, mining: 0, woodcutting: 0, chemistry: 0 },
                cost: 60 * Math.pow(2, tierLevel - 1),
                requiredLevel: [1, 10, 20, 40, 60, 80][tierLevel - 1],
                icon: '◬'
            };
        });
        
        return items;
    }

    getItem(slot, typeOrTier, tier = null) {
        if (!this.items[slot]) return null;
        if (slot === 'weapon' && tier) {
            return this.items[slot][typeOrTier]?.[tier] || null;
        } else {
            return this.items[slot][typeOrTier] || null;
        }
    }

    getItemsForSlot(slot) {
        if (!this.items[slot]) return [];
        const items = [];
        if (slot === 'weapon') {
            this.weaponTypes.forEach(type => {
                this.tiers.forEach(tier => {
                    items.push(this.items.weapon[type][tier]);
                });
            });
        } else {
            Object.values(this.items[slot]).forEach(item => {
                items.push(item);
            });
        }
        return items;
    }

    canEquip(item, skills) {
        if (!item || !item.requiredLevel) return false;
        if (item.slot === 'weapon') {
            return skills.melee >= item.requiredLevel;
        }
        return skills.defense >= item.requiredLevel;
    }
}

// Mock GameState
class GameState {
    constructor() {
        this.state = {
            currency: { gold: 1000 },
            equipment: {
                equipped: {
                    weapon: null,
                    offhand: null,
                    helmet: null,
                    body: null,
                    legs: null
                },
                unlocked: []
            },
            skills: {
                melee: 1,
                defense: 1,
                ranged: 1,
                mining: 1,
                woodcutting: 1,
                chemistry: 1
            }
        };
    }

    get() {
        return this.state;
    }

    update(path, value) {
        const keys = path.split('.');
        let current = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }
}

// Mock EquipmentShopModal
class EquipmentShopModal {
    constructor(gameState, equipment) {
        this.gameState = gameState;
        this.equipment = equipment;
        this.currentSlotFilter = 'all';
        this.currentTierFilter = 'all';
        this.currentWeaponTypeFilter = 'all';
    }

    getItemKey(item) {
        if (item.slot === 'weapon') {
            return `${item.slot}_${item.weaponType}_${item.tier}`;
        }
        return `${item.slot}_${item.tier}`;
    }

    parseItemKey(key) {
        const parts = key.split('_');
        if (parts[0] === 'weapon') {
            return { slot: parts[0], weaponType: parts[1], tier: parts[2] };
        }
        return { slot: parts[0], tier: parts[1] };
    }

    isItemEquipped(item, equipped) {
        const equippedItem = equipped[item.slot];
        if (!equippedItem) return false;
        return this.getItemKey(equippedItem) === this.getItemKey(item);
    }

    canPurchaseItem(item) {
        const gameState = this.gameState.get();
        const currentGold = gameState.currency?.gold || 0;
        const unlocked = gameState.equipment?.unlocked || [];
        const itemKey = this.getItemKey(item);

        if (unlocked.includes(itemKey)) return false;
        if (currentGold < item.cost) return false;
        if (!this.equipment.canEquip(item, gameState.skills)) return false;

        return true;
    }

    buyItem(itemKey) {
        const gameState = this.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        const item = parsed.weaponType 
            ? this.equipment.getItem(parsed.slot, parsed.weaponType, parsed.tier)
            : this.equipment.getItem(parsed.slot, parsed.tier);

        if (!item) return { success: false, message: 'Item not found' };

        const currentGold = gameState.currency?.gold || 0;
        const unlocked = gameState.equipment?.unlocked || [];

        if (unlocked.includes(itemKey)) {
            return { success: false, message: 'Item already purchased' };
        }

        if (currentGold < item.cost) {
            return { success: false, message: 'Not enough gold' };
        }

        if (!this.equipment.canEquip(item, gameState.skills)) {
            return { success: false, message: 'Level requirement not met' };
        }

        this.gameState.update('currency.gold', currentGold - item.cost);
        unlocked.push(itemKey);
        this.gameState.update('equipment.unlocked', unlocked);

        return { success: true, message: 'Purchase successful' };
    }

    equipItem(itemKey) {
        const gameState = this.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        const item = parsed.weaponType 
            ? this.equipment.getItem(parsed.slot, parsed.weaponType, parsed.tier)
            : this.equipment.getItem(parsed.slot, parsed.tier);

        if (!item) return { success: false, message: 'Item not found' };

        const unlocked = gameState.equipment?.unlocked || [];
        
        if (!unlocked.includes(itemKey)) {
            return { success: false, message: 'Item not purchased' };
        }

        if (!this.equipment.canEquip(item, gameState.skills)) {
            return { success: false, message: 'Level requirement not met' };
        }

        const equipped = gameState.equipment?.equipped || {};
        equipped[item.slot] = item;
        this.gameState.update('equipment.equipped', equipped);

        return { success: true, message: 'Item equipped' };
    }

    unequipItem(itemKey) {
        const gameState = this.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        
        const equipped = gameState.equipment?.equipped || {};
        equipped[parsed.slot] = null;
        this.gameState.update('equipment.equipped', equipped);

        return { success: true, message: 'Item unequipped' };
    }

    getFilteredItemsForSlot(slot) {
        let items = this.equipment.getItemsForSlot(slot);

        if (this.currentTierFilter !== 'all') {
            items = items.filter(item => item.tier === this.currentTierFilter);
        }

        if (slot === 'weapon' && this.currentWeaponTypeFilter !== 'all') {
            items = items.filter(item => item.weaponType === this.currentWeaponTypeFilter);
        }

        return items;
    }

    getAllFilteredItems() {
        let items = [];
        if (this.currentSlotFilter === 'all') {
            this.equipment.slots.forEach(slot => {
                items = items.concat(this.getFilteredItemsForSlot(slot));
            });
        } else {
            items = this.getFilteredItemsForSlot(this.currentSlotFilter);
        }
        return items;
    }
}

describe('Equipment Shop Modal', () => {
    let gameState;
    let equipment;
    let shopModal;

    beforeEach(() => {
        gameState = new GameState();
        equipment = new Equipment();
        shopModal = new EquipmentShopModal(gameState, equipment);
    });

    describe('Item Key Generation', () => {
        test('should generate correct key for weapon', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);
            expect(key).toBe('weapon_sword_bronze');
        });

        test('should generate correct key for armor', () => {
            const helmet = equipment.getItem('helmet', 'bronze');
            const key = shopModal.getItemKey(helmet);
            expect(key).toBe('helmet_bronze');
        });

        test('should parse weapon key correctly', () => {
            const parsed = shopModal.parseItemKey('weapon_axe_iron');
            expect(parsed.slot).toBe('weapon');
            expect(parsed.weaponType).toBe('axe');
            expect(parsed.tier).toBe('iron');
        });

        test('should parse armor key correctly', () => {
            const parsed = shopModal.parseItemKey('helmet_steel');
            expect(parsed.slot).toBe('helmet');
            expect(parsed.tier).toBe('steel');
        });
    });

    describe('Item Purchase Validation', () => {
        test('should allow purchase with sufficient gold and level', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const canPurchase = shopModal.canPurchaseItem(sword);
            expect(canPurchase).toBe(true);
        });

        test('should prevent purchase without enough gold', () => {
            gameState.update('currency.gold', 50);
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const canPurchase = shopModal.canPurchaseItem(sword);
            expect(canPurchase).toBe(false);
        });

        test('should prevent purchase without required level', () => {
            const dragonSword = equipment.getItem('weapon', 'sword', 'dragon');
            const canPurchase = shopModal.canPurchaseItem(dragonSword);
            expect(canPurchase).toBe(false);
        });

        test('should prevent duplicate purchases', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);
            
            const state = gameState.get();
            state.equipment.unlocked.push(key);
            
            const canPurchase = shopModal.canPurchaseItem(sword);
            expect(canPurchase).toBe(false);
        });
    });

    describe('Buying Items', () => {
        test('should successfully buy an item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);
            const initialGold = gameState.get().currency.gold;

            const result = shopModal.buyItem(key);

            expect(result.success).toBe(true);
            expect(gameState.get().currency.gold).toBe(initialGold - sword.cost);
            expect(gameState.get().equipment.unlocked).toContain(key);
        });

        test('should fail to buy without enough gold', () => {
            gameState.update('currency.gold', 50);
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            const result = shopModal.buyItem(key);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough gold');
        });

        test('should fail to buy without level requirement', () => {
            gameState.update('currency.gold', 5000); // Ensure enough gold
            const dragonSword = equipment.getItem('weapon', 'sword', 'dragon');
            const key = shopModal.getItemKey(dragonSword);

            const result = shopModal.buyItem(key);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Level requirement not met');
        });

        test('should fail to buy already purchased item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            // First purchase
            shopModal.buyItem(key);

            // Try to purchase again
            const result = shopModal.buyItem(key);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Item already purchased');
        });

        test('should deduct correct gold amount', () => {
            const helmet = equipment.getItem('helmet', 'bronze');
            const key = shopModal.getItemKey(helmet);
            const initialGold = 1000;

            shopModal.buyItem(key);

            expect(gameState.get().currency.gold).toBe(initialGold - 60);
        });
    });

    describe('Equipping Items', () => {
        test('should equip purchased item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            shopModal.buyItem(key);
            const result = shopModal.equipItem(key);

            expect(result.success).toBe(true);
            expect(gameState.get().equipment.equipped.weapon).not.toBeNull();
            expect(gameState.get().equipment.equipped.weapon.name).toBe('bronze sword');
        });

        test('should fail to equip unpurchased item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            const result = shopModal.equipItem(key);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Item not purchased');
        });

        test('should fail to equip without level requirement', () => {
            const dragonSword = equipment.getItem('weapon', 'sword', 'dragon');
            const key = shopModal.getItemKey(dragonSword);

            // Force unlock the item
            gameState.get().equipment.unlocked.push(key);

            const result = shopModal.equipItem(key);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Level requirement not met');
        });

        test('should replace equipped item in same slot', () => {
            const bronzeSword = equipment.getItem('weapon', 'sword', 'bronze');
            const ironSword = equipment.getItem('weapon', 'sword', 'iron');
            
            const bronzeKey = shopModal.getItemKey(bronzeSword);
            const ironKey = shopModal.getItemKey(ironSword);

            // Buy and equip bronze sword
            shopModal.buyItem(bronzeKey);
            shopModal.equipItem(bronzeKey);

            // Level up and buy iron sword
            gameState.update('skills.melee', 10);
            shopModal.buyItem(ironKey);
            shopModal.equipItem(ironKey);

            expect(gameState.get().equipment.equipped.weapon.tier).toBe('iron');
        });
    });

    describe('Unequipping Items', () => {
        test('should unequip item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            shopModal.buyItem(key);
            shopModal.equipItem(key);
            const result = shopModal.unequipItem(key);

            expect(result.success).toBe(true);
            expect(gameState.get().equipment.equipped.weapon).toBeNull();
        });

        test('should be able to re-equip after unequipping', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            shopModal.buyItem(key);
            shopModal.equipItem(key);
            shopModal.unequipItem(key);
            const result = shopModal.equipItem(key);

            expect(result.success).toBe(true);
            expect(gameState.get().equipment.equipped.weapon).not.toBeNull();
        });
    });

    describe('Item Equipped Status', () => {
        test('should correctly identify equipped item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const key = shopModal.getItemKey(sword);

            shopModal.buyItem(key);
            shopModal.equipItem(key);

            const equipped = gameState.get().equipment.equipped;
            const isEquipped = shopModal.isItemEquipped(sword, equipped);

            expect(isEquipped).toBe(true);
        });

        test('should correctly identify non-equipped item', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const equipped = gameState.get().equipment.equipped;
            const isEquipped = shopModal.isItemEquipped(sword, equipped);

            expect(isEquipped).toBe(false);
        });
    });

    describe('Filtering', () => {
        test('should filter by slot', () => {
            shopModal.currentSlotFilter = 'weapon';
            const items = shopModal.getFilteredItemsForSlot('weapon');
            
            expect(items.length).toBeGreaterThan(0);
            items.forEach(item => {
                expect(item.slot).toBe('weapon');
            });
        });

        test('should filter by tier', () => {
            shopModal.currentTierFilter = 'bronze';
            const items = shopModal.getFilteredItemsForSlot('helmet');
            
            expect(items.length).toBe(1);
            expect(items[0].tier).toBe('bronze');
        });

        test('should filter weapons by type', () => {
            shopModal.currentWeaponTypeFilter = 'sword';
            const items = shopModal.getFilteredItemsForSlot('weapon');
            
            items.forEach(item => {
                expect(item.weaponType).toBe('sword');
            });
        });

        test('should combine multiple filters', () => {
            shopModal.currentSlotFilter = 'weapon';
            shopModal.currentTierFilter = 'iron';
            shopModal.currentWeaponTypeFilter = 'axe';
            
            const items = shopModal.getAllFilteredItems();
            
            expect(items.length).toBe(1);
            expect(items[0].tier).toBe('iron');
            expect(items[0].weaponType).toBe('axe');
        });

        test('should return all items with no filters', () => {
            shopModal.currentSlotFilter = 'all';
            shopModal.currentTierFilter = 'all';
            shopModal.currentWeaponTypeFilter = 'all';
            
            const items = shopModal.getAllFilteredItems();
            
            // 2 weapon types × 6 tiers + 1 armor slot × 6 tiers = 18
            expect(items.length).toBe(18);
        });
    });

    describe('Multiple Purchases', () => {
        test('should handle multiple item purchases', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            const helmet = equipment.getItem('helmet', 'bronze');
            
            const swordKey = shopModal.getItemKey(sword);
            const helmetKey = shopModal.getItemKey(helmet);

            shopModal.buyItem(swordKey);
            shopModal.buyItem(helmetKey);

            expect(gameState.get().equipment.unlocked).toHaveLength(2);
            expect(gameState.get().currency.gold).toBe(1000 - 100 - 60);
        });

        test('should track gold across multiple purchases', () => {
            let currentGold = 1000;
            
            const bronzeSword = equipment.getItem('weapon', 'sword', 'bronze');
            shopModal.buyItem(shopModal.getItemKey(bronzeSword));
            currentGold -= 100;
            expect(gameState.get().currency.gold).toBe(currentGold);

            const bronzeHelmet = equipment.getItem('helmet', 'bronze');
            shopModal.buyItem(shopModal.getItemKey(bronzeHelmet));
            currentGold -= 60;
            expect(gameState.get().currency.gold).toBe(currentGold);
        });
    });
});
