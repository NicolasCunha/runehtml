import { describe, test, expect, beforeEach } from '@jest/globals';

// Mock combat manager for testing
class CombatManager {
  constructor() {
    this.potionCooldownDuration = 10000;
  }

  isCombatSkill(skill) {
    return ['melee', 'ranged', 'defense'].includes(skill);
  }

  calculatePlayerMaxHP(defenseLevel = 1, armorBonus = 0) {
    let maxHP = 100 + (defenseLevel * 10);
    maxHP += armorBonus * 5;
    return maxHP;
  }

  calculateEnemyHP(enemyLevel) {
    return 50 + (enemyLevel * 8);
  }

  calculatePlayerDamage(attackLevel = 1, weaponBonus = 0) {
    let baseDamage = 10 + (attackLevel * 0.5);
    baseDamage *= (1 + weaponBonus / 100);
    const variance = Math.floor(Math.random() * 5) - 2;
    return Math.max(1, Math.floor(baseDamage + variance));
  }

  calculateEnemyDamage(enemyLevel = 1, defenseLevel = 1, armorBonus = 0) {
    let baseDamage = 5 + (enemyLevel * 0.4);
    const defenseReduction = 1 - (defenseLevel * 0.003);
    baseDamage *= Math.max(0.5, defenseReduction);
    baseDamage *= (1 - armorBonus / 100);
    const variance = Math.floor(Math.random() * 5) - 2;
    return Math.max(1, Math.floor(baseDamage + variance));
  }

  calculateGoldReward(enemyLevel) {
    const baseGold = enemyLevel * 5;
    const bonusGold = Math.floor(Math.random() * (enemyLevel * 3 + 1));
    return baseGold + bonusGold;
  }
}

describe('CombatManager', () => {
  let combatManager;

  beforeEach(() => {
    combatManager = new CombatManager();
  });

  describe('isCombatSkill', () => {
    test('should return true for combat skills', () => {
      expect(combatManager.isCombatSkill('melee')).toBe(true);
      expect(combatManager.isCombatSkill('ranged')).toBe(true);
      expect(combatManager.isCombatSkill('defense')).toBe(true);
    });

    test('should return false for non-combat skills', () => {
      expect(combatManager.isCombatSkill('mining')).toBe(false);
      expect(combatManager.isCombatSkill('woodcutting')).toBe(false);
      expect(combatManager.isCombatSkill('chemistry')).toBe(false);
    });
  });

  describe('calculatePlayerMaxHP', () => {
    test('should return 110 HP at level 1 defense', () => {
      expect(combatManager.calculatePlayerMaxHP(1, 0)).toBe(110);
    });

    test('should increase HP by 10 per defense level', () => {
      expect(combatManager.calculatePlayerMaxHP(10, 0)).toBe(200);
    });

    test('should add bonus HP from armor', () => {
      expect(combatManager.calculatePlayerMaxHP(1, 10)).toBe(160);
    });

    test('should reach 1090 HP at level 99', () => {
      expect(combatManager.calculatePlayerMaxHP(99, 0)).toBe(1090);
    });
  });

  describe('calculateEnemyHP', () => {
    test('should return correct HP for level 1 enemy', () => {
      expect(combatManager.calculateEnemyHP(1)).toBe(58);
    });

    test('should increase HP by 8 per level', () => {
      expect(combatManager.calculateEnemyHP(10)).toBe(130);
    });

    test('should return 842 HP for level 99 enemy', () => {
      expect(combatManager.calculateEnemyHP(99)).toBe(842);
    });
  });

  describe('calculatePlayerDamage', () => {
    test('should return positive damage', () => {
      const damage = combatManager.calculatePlayerDamage(1, 0);
      expect(damage).toBeGreaterThan(0);
    });

    test('should increase damage with higher attack level', () => {
      const avgLow = Array(50).fill(0).map(() => combatManager.calculatePlayerDamage(1, 0)).reduce((a, b) => a + b) / 50;
      const avgHigh = Array(50).fill(0).map(() => combatManager.calculatePlayerDamage(50, 0)).reduce((a, b) => a + b) / 50;
      expect(avgHigh).toBeGreaterThan(avgLow);
    });

    test('should always deal at least 1 damage', () => {
      expect(combatManager.calculatePlayerDamage(1, 0)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateEnemyDamage', () => {
    test('should return positive damage', () => {
      const damage = combatManager.calculateEnemyDamage(1, 1, 0);
      expect(damage).toBeGreaterThan(0);
    });

    test('should reduce damage with higher defense', () => {
      const avgLowDef = Array(50).fill(0).map(() => combatManager.calculateEnemyDamage(20, 1, 0)).reduce((a, b) => a + b) / 50;
      const avgHighDef = Array(50).fill(0).map(() => combatManager.calculateEnemyDamage(20, 50, 0)).reduce((a, b) => a + b) / 50;
      expect(avgHighDef).toBeLessThan(avgLowDef);
    });

    test('should always deal at least 1 damage', () => {
      expect(combatManager.calculateEnemyDamage(1, 99, 100)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateGoldReward', () => {
    test('should return gold for level 1 enemy', () => {
      const gold = combatManager.calculateGoldReward(1);
      expect(gold).toBeGreaterThanOrEqual(5); // baseGold = 1 * 5 = 5
      expect(gold).toBeLessThanOrEqual(8);   // 5 + random(0-3)
    });

    test('should scale gold with enemy level', () => {
      const gold10 = combatManager.calculateGoldReward(10);
      const gold20 = combatManager.calculateGoldReward(20);
      
      // Level 10: 50 base + 0-30 bonus = 50-80
      expect(gold10).toBeGreaterThanOrEqual(50);
      expect(gold10).toBeLessThanOrEqual(80);
      
      // Level 20: 100 base + 0-60 bonus = 100-160
      expect(gold20).toBeGreaterThanOrEqual(100);
      expect(gold20).toBeLessThanOrEqual(160);
    });

    test('should always give at least base gold', () => {
      const level = 50;
      const gold = combatManager.calculateGoldReward(level);
      expect(gold).toBeGreaterThanOrEqual(level * 5);
    });

    test('should give correct maximum gold', () => {
      const level = 99;
      const baseGold = level * 5; // 495
      const maxBonus = level * 3;  // 297
      const gold = combatManager.calculateGoldReward(level);
      
      expect(gold).toBeGreaterThanOrEqual(baseGold);
      expect(gold).toBeLessThanOrEqual(baseGold + maxBonus);
    });
  });
});

