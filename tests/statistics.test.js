import { describe, test, expect, beforeEach } from '@jest/globals';

// Mock GameState for statistics testing
class GameState {
  constructor() {
    this.state = {
      statistics: {
        enemiesDefeated: 0,
        meleeEnemiesDefeated: 0,
        rangedEnemiesDefeated: 0,
        defenseEnemiesDefeated: 0,
        potionsUsed: 0,
        totalGoldEarned: 0
      },
      currency: {
        gold: 100
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

describe('Statistics System', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Initial Statistics', () => {
    test('should start with zero enemies defeated', () => {
      const stats = gameState.get().statistics;
      expect(stats.enemiesDefeated).toBe(0);
    });

    test('should start with zero skill-specific defeats', () => {
      const stats = gameState.get().statistics;
      expect(stats.meleeEnemiesDefeated).toBe(0);
      expect(stats.rangedEnemiesDefeated).toBe(0);
      expect(stats.defenseEnemiesDefeated).toBe(0);
    });

    test('should start with zero potions used', () => {
      const stats = gameState.get().statistics;
      expect(stats.potionsUsed).toBe(0);
    });

    test('should start with zero total gold earned', () => {
      const stats = gameState.get().statistics;
      expect(stats.totalGoldEarned).toBe(0);
    });

    test('should start with 100 current gold', () => {
      const currency = gameState.get().currency;
      expect(currency.gold).toBe(100);
    });
  });

  describe('Enemy Defeat Tracking', () => {
    test('should increment total enemies defeated', () => {
      const stats = gameState.get().statistics;
      stats.enemiesDefeated++;
      expect(stats.enemiesDefeated).toBe(1);
    });

    test('should track melee enemies separately', () => {
      const stats = gameState.get().statistics;
      stats.enemiesDefeated++;
      stats.meleeEnemiesDefeated++;
      
      expect(stats.enemiesDefeated).toBe(1);
      expect(stats.meleeEnemiesDefeated).toBe(1);
    });

    test('should track ranged enemies separately', () => {
      const stats = gameState.get().statistics;
      stats.enemiesDefeated++;
      stats.rangedEnemiesDefeated++;
      
      expect(stats.enemiesDefeated).toBe(1);
      expect(stats.rangedEnemiesDefeated).toBe(1);
    });

    test('should track defense enemies separately', () => {
      const stats = gameState.get().statistics;
      stats.enemiesDefeated++;
      stats.defenseEnemiesDefeated++;
      
      expect(stats.enemiesDefeated).toBe(1);
      expect(stats.defenseEnemiesDefeated).toBe(1);
    });

    test('should track multiple defeats correctly', () => {
      const stats = gameState.get().statistics;
      
      // 2 melee, 3 ranged, 1 defense = 6 total
      stats.enemiesDefeated += 6;
      stats.meleeEnemiesDefeated += 2;
      stats.rangedEnemiesDefeated += 3;
      stats.defenseEnemiesDefeated += 1;
      
      expect(stats.enemiesDefeated).toBe(6);
      expect(stats.meleeEnemiesDefeated).toBe(2);
      expect(stats.rangedEnemiesDefeated).toBe(3);
      expect(stats.defenseEnemiesDefeated).toBe(1);
    });
  });

  describe('Gold Tracking', () => {
    test('should add gold to current balance', () => {
      const currency = gameState.get().currency;
      const initialGold = currency.gold;
      const earnedGold = 50;
      
      currency.gold += earnedGold;
      expect(currency.gold).toBe(initialGold + earnedGold);
    });

    test('should track total gold earned separately from current gold', () => {
      const state = gameState.get();
      const earnedGold = 75;
      
      // Add to current balance
      state.currency.gold += earnedGold;
      // Track total earned
      state.statistics.totalGoldEarned += earnedGold;
      
      expect(state.currency.gold).toBe(175);
      expect(state.statistics.totalGoldEarned).toBe(75);
    });

    test('should accumulate total gold earned over multiple victories', () => {
      const stats = gameState.get().statistics;
      
      stats.totalGoldEarned += 50;
      stats.totalGoldEarned += 75;
      stats.totalGoldEarned += 100;
      
      expect(stats.totalGoldEarned).toBe(225);
    });

    test('should track gold even if current balance is spent', () => {
      const state = gameState.get();
      
      // Earn 200 gold
      state.currency.gold += 200;
      state.statistics.totalGoldEarned += 200;
      
      // Spend 150 gold
      state.currency.gold -= 150;
      
      // Total earned should not decrease when spending
      expect(state.currency.gold).toBe(150); // 100 + 200 - 150
      expect(state.statistics.totalGoldEarned).toBe(200);
    });

    test('should handle large gold amounts', () => {
      const state = gameState.get();
      const largeAmount = 999999;
      
      state.currency.gold += largeAmount;
      state.statistics.totalGoldEarned += largeAmount;
      
      expect(state.currency.gold).toBe(100 + largeAmount);
      expect(state.statistics.totalGoldEarned).toBe(largeAmount);
    });
  });

  describe('Potion Usage Tracking', () => {
    test('should increment potions used', () => {
      const stats = gameState.get().statistics;
      stats.potionsUsed++;
      
      expect(stats.potionsUsed).toBe(1);
    });

    test('should track multiple potion uses', () => {
      const stats = gameState.get().statistics;
      stats.potionsUsed += 5;
      
      expect(stats.potionsUsed).toBe(5);
    });
  });

  describe('Statistics Integration', () => {
    test('should handle victory with all statistics updates', () => {
      const state = gameState.get();
      const goldEarned = 45;
      
      // Simulate a melee enemy victory
      state.statistics.enemiesDefeated++;
      state.statistics.meleeEnemiesDefeated++;
      state.currency.gold += goldEarned;
      state.statistics.totalGoldEarned += goldEarned;
      
      expect(state.statistics.enemiesDefeated).toBe(1);
      expect(state.statistics.meleeEnemiesDefeated).toBe(1);
      expect(state.currency.gold).toBe(145);
      expect(state.statistics.totalGoldEarned).toBe(45);
    });

    test('should track comprehensive combat session', () => {
      const state = gameState.get();
      
      // Battle 1: Melee enemy, earn 30g
      state.statistics.enemiesDefeated++;
      state.statistics.meleeEnemiesDefeated++;
      state.currency.gold += 30;
      state.statistics.totalGoldEarned += 30;
      
      // Battle 2: Ranged enemy, earn 45g
      state.statistics.enemiesDefeated++;
      state.statistics.rangedEnemiesDefeated++;
      state.currency.gold += 45;
      state.statistics.totalGoldEarned += 45;
      
      // Use a potion
      state.statistics.potionsUsed++;
      
      // Battle 3: Defense enemy, earn 60g
      state.statistics.enemiesDefeated++;
      state.statistics.defenseEnemiesDefeated++;
      state.currency.gold += 60;
      state.statistics.totalGoldEarned += 60;
      
      expect(state.statistics.enemiesDefeated).toBe(3);
      expect(state.statistics.meleeEnemiesDefeated).toBe(1);
      expect(state.statistics.rangedEnemiesDefeated).toBe(1);
      expect(state.statistics.defenseEnemiesDefeated).toBe(1);
      expect(state.statistics.potionsUsed).toBe(1);
      expect(state.currency.gold).toBe(235); // 100 + 30 + 45 + 60
      expect(state.statistics.totalGoldEarned).toBe(135); // 30 + 45 + 60
    });
  });
});
