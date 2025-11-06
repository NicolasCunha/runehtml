import { describe, test, expect, beforeEach } from '@jest/globals';

// Mock SkillsSystem that replicates the actual implementation
class SkillsSystem {
  getExpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.floor(total / 4);
  }

  getLevelFromExp(exp) {
    let level = 1;
    while (this.getExpForLevel(level + 1) <= exp) {
      level++;
      if (level >= 99) break;
    }
    return level;
  }

  addExp(skill, expGain) {
    skill.totalExp += expGain;
    const newLevel = this.getLevelFromExp(skill.totalExp);
    const leveledUp = newLevel > skill.level;
    
    skill.level = newLevel;
    skill.exp = skill.totalExp - this.getExpForLevel(newLevel);
    
    return {
      skill: skill,
      leveledUp: leveledUp,
      newLevel: newLevel
    };
  }

  getExpForNextLevel(currentLevel) {
    return this.getExpForLevel(currentLevel + 1);
  }

  getProgressPercent(skill) {
    const currentLevelExp = this.getExpForLevel(skill.level);
    const nextLevelExp = this.getExpForLevel(skill.level + 1);
    const progress = ((skill.totalExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.floor(progress);
  }
}

describe('SkillsSystem', () => {
  let skillsSystem;
  
  beforeEach(() => {
    skillsSystem = new SkillsSystem();
  });

  describe('getExpForLevel', () => {
    test('should return 0 for level 1', () => {
      expect(skillsSystem.getExpForLevel(1)).toBe(0);
    });

    test('should return correct exp for level 2', () => {
      const exp = skillsSystem.getExpForLevel(2);
      expect(exp).toBeGreaterThan(0);
      expect(exp).toBeLessThan(100);
    });

    test('should return increasing exp values for higher levels', () => {
      const exp10 = skillsSystem.getExpForLevel(10);
      const exp20 = skillsSystem.getExpForLevel(20);
      const exp50 = skillsSystem.getExpForLevel(50);
      
      expect(exp20).toBeGreaterThan(exp10);
      expect(exp50).toBeGreaterThan(exp20);
    });

    test('should handle level 99', () => {
      const exp99 = skillsSystem.getExpForLevel(99);
      expect(exp99).toBeGreaterThan(0);
    });
  });

  describe('getLevelFromExp', () => {
    test('should return 1 for 0 exp', () => {
      expect(skillsSystem.getLevelFromExp(0)).toBe(1);
    });

    test('should return correct level for given exp', () => {
      const expFor10 = skillsSystem.getExpForLevel(10);
      expect(skillsSystem.getLevelFromExp(expFor10)).toBe(10);
    });

    test('should cap at level 99', () => {
      const hugeExp = 999999999;
      expect(skillsSystem.getLevelFromExp(hugeExp)).toBeLessThanOrEqual(99);
    });
  });

  describe('addExp', () => {
    test('should add experience to skill', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      const result = skillsSystem.addExp(skill, 100);
      
      expect(result.skill.totalExp).toBe(100);
      expect(result.skill.exp).toBeGreaterThanOrEqual(0);
    });

    test('should detect level up', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      const expForLevel5 = skillsSystem.getExpForLevel(5);
      
      const result = skillsSystem.addExp(skill, expForLevel5);
      
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(1);
    });

    test('should not level up with small exp gain', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      const result = skillsSystem.addExp(skill, 10);
      
      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
    });

    test('should update skill.exp to be exp into current level', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      const expForLevel3 = skillsSystem.getExpForLevel(3);
      
      skillsSystem.addExp(skill, expForLevel3 + 50);
      
      expect(skill.exp).toBe(50); // 50 exp into level 3
    });
  });

  describe('getProgressPercent', () => {
    test('should return 0 for new skill', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      expect(skillsSystem.getProgressPercent(skill)).toBe(0);
    });

    test('should return value between 0 and 100', () => {
      const skill = { name: 'Mining', level: 1, exp: 0, totalExp: 0 };
      // Add some exp to get partway through level 1
      skillsSystem.addExp(skill, 50);
      
      const progress = skillsSystem.getProgressPercent(skill);
      
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});
