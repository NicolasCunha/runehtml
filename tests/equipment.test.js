import { describe, test, expect, beforeEach } from '@jest/globals';

// Mock Equipment class
class Equipment {
    constructor() {
        this.slots = ['weapon', 'offhand', 'helmet', 'body', 'legs'];
        this.tiers = ['bronze', 'iron', 'steel', 'mithril', 'adamant', 'dragon'];
        this.weaponTypes = ['sword', 'axe', 'mace', 'dagger', 'spear', 'bow', 'crossbow', 'staff', 'wand', 'scythe'];
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
        
        if (slot === 'body') {
            bonuses.defense = Math.floor(baseDefenseBonus * 1.5);
        }
        
        return bonuses;
    }

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

    calculateCost(slot, tierLevel) {
        const baseCosts = {
            weapon: 100,
            offhand: 80,
            helmet: 60,
            body: 90,
            legs: 70
        };
        
        const baseCost = baseCosts[slot] || 50;
        return Math.floor(baseCost * Math.pow(2, tierLevel - 1));
    }

    calculateRequiredLevel(slot, tierLevel) {
        const levelRequirements = [1, 10, 20, 40, 60, 80];
        return levelRequirements[tierLevel - 1];
    }

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

    getArmorIcon(slot) {
        const icons = {
            helmet: '◬',
            body: '▓',
            legs: '◭'
        };
        return icons[slot] || '▓';
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

    canEquip(item, skills) {
        if (!item || !item.requiredLevel) return false;
        
        if (item.slot === 'weapon') {
            const weaponType = item.weaponType;
            
            if (weaponType === 'bow' || weaponType === 'crossbow') {
                return skills.ranged >= item.requiredLevel;
            } else if (weaponType === 'staff' || weaponType === 'wand') {
                return skills.chemistry >= item.requiredLevel;
            } else if (weaponType === 'scythe') {
                return skills.mining >= item.requiredLevel || skills.woodcutting >= item.requiredLevel;
            } else {
                return skills.melee >= item.requiredLevel;
            }
        }
        
        if (item.slot === 'helmet' || item.slot === 'body' || item.slot === 'legs' || item.slot === 'offhand') {
            return skills.defense >= item.requiredLevel;
        }
        
        return false;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

describe('Equipment System', () => {
    let equipment;

    beforeEach(() => {
        equipment = new Equipment();
    });

    describe('Equipment Structure', () => {
        test('should have 5 equipment slots', () => {
            expect(equipment.slots).toHaveLength(5);
            expect(equipment.slots).toContain('weapon');
            expect(equipment.slots).toContain('offhand');
            expect(equipment.slots).toContain('helmet');
            expect(equipment.slots).toContain('body');
            expect(equipment.slots).toContain('legs');
        });

        test('should have 6 equipment tiers', () => {
            expect(equipment.tiers).toHaveLength(6);
            expect(equipment.tiers).toEqual(['bronze', 'iron', 'steel', 'mithril', 'adamant', 'dragon']);
        });

        test('should have 10 weapon types', () => {
            expect(equipment.weaponTypes).toHaveLength(10);
            expect(equipment.weaponTypes).toContain('sword');
            expect(equipment.weaponTypes).toContain('bow');
            expect(equipment.weaponTypes).toContain('staff');
        });
    });

    describe('Weapon Generation', () => {
        test('should generate all weapon combinations', () => {
            const weaponCount = equipment.weaponTypes.length * equipment.tiers.length;
            const allWeapons = equipment.getItemsForSlot('weapon');
            expect(allWeapons).toHaveLength(weaponCount);
            expect(allWeapons).toHaveLength(60); // 10 types × 6 tiers
        });

        test('should have correct bronze sword properties', () => {
            const bronzeSword = equipment.getItem('weapon', 'sword', 'bronze');
            expect(bronzeSword.name).toBe('Bronze Sword');
            expect(bronzeSword.tier).toBe('bronze');
            expect(bronzeSword.tierLevel).toBe(1);
            expect(bronzeSword.requiredLevel).toBe(1);
            expect(bronzeSword.cost).toBe(100);
        });

        test('should have correct dragon axe properties', () => {
            const dragonAxe = equipment.getItem('weapon', 'axe', 'dragon');
            expect(dragonAxe.name).toBe('Dragon Axe');
            expect(dragonAxe.tier).toBe('dragon');
            expect(dragonAxe.tierLevel).toBe(6);
            expect(dragonAxe.requiredLevel).toBe(80);
            expect(dragonAxe.cost).toBe(3200); // 100 * 2^5
        });

        test('should have weapon-specific bonuses', () => {
            const sword = equipment.getItem('weapon', 'sword', 'bronze');
            expect(sword.bonuses.melee).toBeGreaterThan(0);
            expect(sword.bonuses.defense).toBeGreaterThan(0);

            const bow = equipment.getItem('weapon', 'bow', 'bronze');
            expect(bow.bonuses.ranged).toBeGreaterThan(0);
            expect(bow.bonuses.melee).toBe(0);
        });
    });

    describe('Armor Generation', () => {
        test('should generate armor for each tier', () => {
            const helmets = equipment.getItemsForSlot('helmet');
            const bodies = equipment.getItemsForSlot('body');
            const legs = equipment.getItemsForSlot('legs');

            expect(helmets).toHaveLength(6);
            expect(bodies).toHaveLength(6);
            expect(legs).toHaveLength(6);
        });

        test('should have correct bronze helmet properties', () => {
            const bronzeHelmet = equipment.getItem('helmet', 'bronze');
            expect(bronzeHelmet.name).toBe('Bronze Helmet');
            expect(bronzeHelmet.slot).toBe('helmet');
            expect(bronzeHelmet.requiredLevel).toBe(1);
            expect(bronzeHelmet.cost).toBe(60);
        });

        test('should provide defense bonuses', () => {
            const helmet = equipment.getItem('helmet', 'bronze');
            expect(helmet.bonuses.defense).toBe(4); // tierLevel 1 * 4
        });

        test('should give body armor more defense', () => {
            const helmet = equipment.getItem('helmet', 'bronze');
            const body = equipment.getItem('body', 'bronze');
            expect(body.bonuses.defense).toBeGreaterThan(helmet.bonuses.defense);
        });
    });

    describe('Shield Generation', () => {
        test('should generate shields for each tier', () => {
            const shields = equipment.getItemsForSlot('offhand');
            expect(shields).toHaveLength(6);
        });

        test('should have correct bronze shield properties', () => {
            const bronzeShield = equipment.getItem('offhand', 'bronze');
            expect(bronzeShield.name).toBe('Bronze Shield');
            expect(bronzeShield.slot).toBe('offhand');
            expect(bronzeShield.requiredLevel).toBe(1);
            expect(bronzeShield.cost).toBe(80);
        });

        test('should provide strong defense bonuses', () => {
            const shield = equipment.getItem('offhand', 'bronze');
            expect(shield.bonuses.defense).toBe(6); // tierLevel 1 * 6
        });
    });

    describe('Cost Calculation', () => {
        test('should scale costs exponentially', () => {
            const bronze = equipment.getItem('weapon', 'sword', 'bronze');
            const iron = equipment.getItem('weapon', 'sword', 'iron');
            const steel = equipment.getItem('weapon', 'sword', 'steel');

            expect(bronze.cost).toBe(100);
            expect(iron.cost).toBe(200);
            expect(steel.cost).toBe(400);
        });

        test('should have different base costs per slot', () => {
            const weapon = equipment.getItem('weapon', 'sword', 'bronze');
            const shield = equipment.getItem('offhand', 'bronze');
            const helmet = equipment.getItem('helmet', 'bronze');

            expect(weapon.cost).toBe(100);
            expect(shield.cost).toBe(80);
            expect(helmet.cost).toBe(60);
        });
    });

    describe('Level Requirements', () => {
        test('should have correct level requirements', () => {
            const requirements = [1, 10, 20, 40, 60, 80];
            
            equipment.tiers.forEach((tier, index) => {
                const item = equipment.getItem('helmet', tier);
                expect(item.requiredLevel).toBe(requirements[index]);
            });
        });
    });

    describe('Bonus Calculation', () => {
        test('should calculate total bonuses from multiple items', () => {
            const equipped = {
                weapon: equipment.getItem('weapon', 'sword', 'bronze'),
                offhand: equipment.getItem('offhand', 'bronze'),
                helmet: equipment.getItem('helmet', 'bronze'),
                body: equipment.getItem('body', 'bronze'),
                legs: equipment.getItem('legs', 'bronze')
            };

            const totalBonuses = equipment.calculateTotalBonuses(equipped);
            
            expect(totalBonuses.melee).toBeGreaterThan(0);
            expect(totalBonuses.defense).toBeGreaterThan(0);
        });

        test('should handle empty equipment slots', () => {
            const equipped = {
                weapon: equipment.getItem('weapon', 'sword', 'bronze'),
                offhand: null,
                helmet: null,
                body: null,
                legs: null
            };

            const totalBonuses = equipment.calculateTotalBonuses(equipped);
            expect(totalBonuses.melee).toBe(5); // Only sword bonus
        });
    });

    describe('Equipment Requirements', () => {
        test('should allow equipping items with sufficient level', () => {
            const bronzeSword = equipment.getItem('weapon', 'sword', 'bronze');
            const skills = { melee: 1, defense: 1, ranged: 1, chemistry: 1, mining: 1, woodcutting: 1 };
            
            expect(equipment.canEquip(bronzeSword, skills)).toBe(true);
        });

        test('should prevent equipping items without sufficient level', () => {
            const dragonSword = equipment.getItem('weapon', 'sword', 'dragon');
            const skills = { melee: 50, defense: 1, ranged: 1, chemistry: 1, mining: 1, woodcutting: 1 };
            
            expect(equipment.canEquip(dragonSword, skills)).toBe(false);
        });

        test('should check melee level for melee weapons', () => {
            const ironSword = equipment.getItem('weapon', 'sword', 'iron');
            const skills = { melee: 10, defense: 1, ranged: 1, chemistry: 1, mining: 1, woodcutting: 1 };
            
            expect(equipment.canEquip(ironSword, skills)).toBe(true);
        });

        test('should check ranged level for bows', () => {
            const ironBow = equipment.getItem('weapon', 'bow', 'iron');
            const skills = { melee: 1, defense: 1, ranged: 10, chemistry: 1, mining: 1, woodcutting: 1 };
            
            expect(equipment.canEquip(ironBow, skills)).toBe(true);
        });

        test('should check defense level for armor', () => {
            const ironHelmet = equipment.getItem('helmet', 'iron');
            const skills = { melee: 1, defense: 10, ranged: 1, chemistry: 1, mining: 1, woodcutting: 1 };
            
            expect(equipment.canEquip(ironHelmet, skills)).toBe(true);
        });
    });

    describe('Weapon Type Bonuses', () => {
        test('axe should give woodcutting bonus', () => {
            const axe = equipment.getItem('weapon', 'axe', 'bronze');
            expect(axe.bonuses.woodcutting).toBeGreaterThan(0);
        });

        test('scythe should give mining and woodcutting bonuses', () => {
            const scythe = equipment.getItem('weapon', 'scythe', 'bronze');
            expect(scythe.bonuses.mining).toBeGreaterThan(0);
            expect(scythe.bonuses.woodcutting).toBeGreaterThan(0);
        });

        test('staff should give chemistry bonus', () => {
            const staff = equipment.getItem('weapon', 'staff', 'bronze');
            expect(staff.bonuses.chemistry).toBeGreaterThan(0);
        });

        test('wand should give high chemistry bonus', () => {
            const wand = equipment.getItem('weapon', 'wand', 'bronze');
            const staff = equipment.getItem('weapon', 'staff', 'bronze');
            expect(wand.bonuses.chemistry).toBeGreaterThan(staff.bonuses.chemistry);
        });
    });
});
