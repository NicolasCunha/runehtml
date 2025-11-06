// Skills System - Manages player skills, leveling, and experience
// Based on Runescape's exponential leveling formula

class SkillsSystem {
    constructor() {
        // Available skills in the game
        this.SKILLS = {
            MELEE: 'Melee Combat',
            DEFENSE: 'Defense',
            RANGED: 'Ranged',
            MINING: 'Mining',
            WOODCUTTING: 'Woodcutting',
            CHEMISTRY: 'Chemistry'
        };

        // Maximum level cap
        this.MAX_LEVEL = 99;
        
        // Base experience for level 2
        this.BASE_EXP = 83;
    }

    /**
     * Calculate total experience required for a given level
     * Uses a formula similar to Runescape (exponential growth)
     * @param {number} level - The target level
     * @returns {number} - Total experience required
     */
    getExpForLevel(level) {
        if (level <= 1) return 0;
        
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += Math.floor(i + 300 * Math.pow(2, i / 7));
        }
        return Math.floor(total / 4);
    }

    /**
     * Get experience required for next level
     * @param {number} currentLevel - Current skill level
     * @returns {number} - Experience needed for next level
     */
    getExpForNextLevel(currentLevel) {
        if (currentLevel >= this.MAX_LEVEL) return 0;
        return this.getExpForLevel(currentLevel + 1);
    }

    /**
     * Calculate current level based on total experience
     * @param {number} exp - Total experience
     * @returns {number} - Current level
     */
    getLevelFromExp(exp) {
        for (let level = this.MAX_LEVEL; level >= 1; level--) {
            if (exp >= this.getExpForLevel(level)) {
                return level;
            }
        }
        return 1;
    }

    /**
     * Create default skills object for a new player
     * @returns {Object} - Skills object with all skills at level 1
     */
    createDefaultSkills() {
        const skills = {};
        
        for (const [key, name] of Object.entries(this.SKILLS)) {
            skills[key.toLowerCase()] = {
                name: name,
                level: 1,
                exp: 0,
                totalExp: 0
            };
        }
        
        return skills;
    }

    /**
     * Add experience to a skill and update level
     * @param {Object} skill - The skill object to update
     * @param {number} expGain - Amount of experience to add
     * @returns {Object} - Updated skill with level up info
     */
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

    /**
     * Get progress to next level as a percentage
     * @param {Object} skill - The skill object
     * @returns {number} - Progress percentage (0-100)
     */
    getProgressPercent(skill) {
        if (skill.level >= this.MAX_LEVEL) return 100;
        
        const currentLevelExp = this.getExpForLevel(skill.level);
        const nextLevelExp = this.getExpForLevel(skill.level + 1);
        const expInLevel = skill.totalExp - currentLevelExp;
        const expForLevel = nextLevelExp - currentLevelExp;
        
        return Math.floor((expInLevel / expForLevel) * 100);
    }
}

// Export the skills system
const skillsSystem = new SkillsSystem();
