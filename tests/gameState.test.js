import { describe, test, expect, beforeEach } from '@jest/globals';

class GameState {
  constructor() {
    this.state = this.createDefaultState();
  }

  createDefaultState() {
    return {
      player: { name: 'Player' },
      isPlaying: false,
      currentActivity: null,
      skills: {
        mining: { name: 'Mining', level: 1, exp: 0, totalExp: 0 },
        woodcutting: { name: 'Woodcutting', level: 1, exp: 0, totalExp: 0 },
        chemistry: { name: 'Chemistry', level: 1, exp: 0, totalExp: 0 },
        melee: { name: 'Melee', level: 1, exp: 0, totalExp: 0 },
        ranged: { name: 'Ranged', level: 1, exp: 0, totalExp: 0 },
        defense: { name: 'Defense', level: 1, exp: 0, totalExp: 0 }
      },
      resources: {},
      upgrades: [],
      achievements: [],
      combat: {
        inCombat: false,
        playerMaxHP: 110,
        playerCurrentHP: 110,
        potionCooldown: 0
      },
      statistics: {
        enemiesDefeated: 0,
        potionsUsed: 0
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
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }
}

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('createDefaultState', () => {
    test('should initialize all 6 skills at level 1', () => {
      const state = gameState.get();
      
      expect(state.skills.mining.level).toBe(1);
      expect(state.skills.woodcutting.level).toBe(1);
      expect(state.skills.chemistry.level).toBe(1);
      expect(state.skills.melee.level).toBe(1);
      expect(state.skills.ranged.level).toBe(1);
      expect(state.skills.defense.level).toBe(1);
    });

    test('should initialize combat state', () => {
      const state = gameState.get();
      
      expect(state.combat.inCombat).toBe(false);
      expect(state.combat.playerMaxHP).toBe(110);
      expect(state.combat.potionCooldown).toBe(0);
    });
  });

  describe('update', () => {
    test('should update top-level property', () => {
      gameState.update('currentActivity', 'mining');
      expect(gameState.get().currentActivity).toBe('mining');
    });

    test('should update nested property', () => {
      gameState.update('skills.mining.level', 10);
      expect(gameState.get().skills.mining.level).toBe(10);
    });

    test('should create missing intermediate objects', () => {
      gameState.update('new.nested.property', 'value');
      expect(gameState.get().new.nested.property).toBe('value');
    });
  });
});
