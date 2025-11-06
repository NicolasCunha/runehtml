// Achievements Manager - Handles titles and achievements
// Fantasy-themed titles for each skill based on level

class AchievementsManager {
    constructor() {
        // Define title tiers for each skill
        this.titles = {
            mining: [
                { minLevel: 1, maxLevel: 9, title: 'Copper Scrounger' },
                { minLevel: 10, maxLevel: 19, title: 'Ore Seeker' },
                { minLevel: 20, maxLevel: 29, title: 'Cave Delver' },
                { minLevel: 30, maxLevel: 39, title: 'Stone Breaker' },
                { minLevel: 40, maxLevel: 49, title: 'Master Prospector' },
                { minLevel: 50, maxLevel: 59, title: 'Mithril Forger' },
                { minLevel: 60, maxLevel: 69, title: 'Adamant Crusher' },
                { minLevel: 70, maxLevel: 79, title: 'Rune Excavator' },
                { minLevel: 80, maxLevel: 89, title: 'Mountain Lord' },
                { minLevel: 90, maxLevel: 99, title: 'Earthshaper' }
            ],
            woodcutting: [
                { minLevel: 1, maxLevel: 9, title: 'Twig Gatherer' },
                { minLevel: 10, maxLevel: 19, title: 'Lumber Novice' },
                { minLevel: 20, maxLevel: 29, title: 'Forest Walker' },
                { minLevel: 30, maxLevel: 39, title: 'Tree Whisperer' },
                { minLevel: 40, maxLevel: 49, title: 'Master Woodsman' },
                { minLevel: 50, maxLevel: 59, title: 'Grove Guardian' },
                { minLevel: 60, maxLevel: 69, title: 'Ancient Feller' },
                { minLevel: 70, maxLevel: 79, title: 'Redwood Reaper' },
                { minLevel: 80, maxLevel: 89, title: 'Timberking' },
                { minLevel: 90, maxLevel: 99, title: 'Sylvan Sovereign' }
            ],
            chemistry: [
                { minLevel: 1, maxLevel: 9, title: 'Potion Mixer' },
                { minLevel: 10, maxLevel: 19, title: 'Elixir Apprentice' },
                { minLevel: 20, maxLevel: 29, title: 'Brew Master' },
                { minLevel: 30, maxLevel: 39, title: 'Alchemical Adept' },
                { minLevel: 40, maxLevel: 49, title: 'Potion Sage' },
                { minLevel: 50, maxLevel: 59, title: 'Transmutation Expert' },
                { minLevel: 60, maxLevel: 69, title: 'Arcane Chemist' },
                { minLevel: 70, maxLevel: 79, title: 'Grand Alchemist' },
                { minLevel: 80, maxLevel: 89, title: 'Philosopher' },
                { minLevel: 90, maxLevel: 99, title: 'Elixir Archon' }
            ],
            melee: [
                { minLevel: 1, maxLevel: 9, title: 'Peasant Warrior' },
                { minLevel: 10, maxLevel: 19, title: 'Footsoldier' },
                { minLevel: 20, maxLevel: 29, title: 'Bladesman' },
                { minLevel: 30, maxLevel: 39, title: 'Knight-Errant' },
                { minLevel: 40, maxLevel: 49, title: 'Battle Master' },
                { minLevel: 50, maxLevel: 59, title: 'Steel Warlord' },
                { minLevel: 60, maxLevel: 69, title: 'Sword Saint' },
                { minLevel: 70, maxLevel: 79, title: 'Champion of Blades' },
                { minLevel: 80, maxLevel: 89, title: 'Legendary Duelist' },
                { minLevel: 90, maxLevel: 99, title: 'Godslayer' }
            ],
            defense: [
                { minLevel: 1, maxLevel: 9, title: 'Leather Bearer' },
                { minLevel: 10, maxLevel: 19, title: 'Shield Novice' },
                { minLevel: 20, maxLevel: 29, title: 'Iron Guardian' },
                { minLevel: 30, maxLevel: 39, title: 'Stalwart Defender' },
                { minLevel: 40, maxLevel: 49, title: 'Fortress Master' },
                { minLevel: 50, maxLevel: 59, title: 'Bulwark Champion' },
                { minLevel: 60, maxLevel: 69, title: 'Aegis Wielder' },
                { minLevel: 70, maxLevel: 79, title: 'Immortal Sentinel' },
                { minLevel: 80, maxLevel: 89, title: 'Titan Guard' },
                { minLevel: 90, maxLevel: 99, title: 'Unbreakable Wall' }
            ],
            ranged: [
                { minLevel: 1, maxLevel: 9, title: 'Stick Slinger' },
                { minLevel: 10, maxLevel: 19, title: 'Bowman' },
                { minLevel: 20, maxLevel: 29, title: 'Marksman' },
                { minLevel: 30, maxLevel: 39, title: 'Sharpshooter' },
                { minLevel: 40, maxLevel: 49, title: 'Master Archer' },
                { minLevel: 50, maxLevel: 59, title: 'Eagle Eye' },
                { minLevel: 60, maxLevel: 69, title: 'Sniper Elite' },
                { minLevel: 70, maxLevel: 79, title: 'Phantom Ranger' },
                { minLevel: 80, maxLevel: 89, title: 'Deadeye Legend' },
                { minLevel: 90, maxLevel: 99, title: 'Arrow Incarnate' }
            ]
        };
    }
    
    /**
     * Get the title for a specific skill and level
     * @param {string} skillKey - The skill key
     * @param {number} level - The current level
     * @returns {string} - The title for that level
     */
    getTitle(skillKey, level) {
        const skillTitles = this.titles[skillKey];
        if (!skillTitles) return 'Adventurer';
        
        const titleData = skillTitles.find(t => level >= t.minLevel && level <= t.maxLevel);
        return titleData ? titleData.title : 'Adventurer';
    }
    
    /**
     * Check if all skills are maxed out
     * @param {Object} skills - Skills object from game state
     * @returns {boolean} - True if all skills are at level 99
     */
    areAllSkillsMaxed(skills) {
        if (!skills) return false;
        
        const skillKeys = Object.keys(skills);
        if (skillKeys.length === 0) return false;
        
        return skillKeys.every(key => skills[key].level >= 99);
    }
    
    /**
     * Get the global title based on all skills
     * @param {Object} skills - Skills object from game state
     * @returns {string} - The global title (e.g., "Demi-fiend")
     */
    getGlobalTitle(skills) {
        if (this.areAllSkillsMaxed(skills)) {
            return 'Demi-fiend';
        }
        return null;
    }
    
    /**
     * Get all titles for a skill with progress
     * @param {string} skillKey - The skill key
     * @param {number} currentLevel - The current level
     * @returns {Array} - Array of title objects with unlocked status
     */
    getAllTitlesForSkill(skillKey, currentLevel) {
        const skillTitles = this.titles[skillKey];
        if (!skillTitles) return [];
        
        return skillTitles.map(titleData => ({
            ...titleData,
            unlocked: currentLevel >= titleData.minLevel
        }));
    }
    
    /**
     * Get achievement progress for a skill
     * @param {string} skillKey - The skill key
     * @param {number} level - Current level
     * @returns {Object} - Progress information
     */
    getAchievementProgress(skillKey, level) {
        const allTitles = this.titles[skillKey];
        if (!allTitles) return { current: 0, total: 0 };
        
        const unlockedCount = allTitles.filter(t => level >= t.minLevel).length;
        
        return {
            current: unlockedCount,
            total: allTitles.length,
            percentage: Math.floor((unlockedCount / allTitles.length) * 100)
        };
    }
}

// Export the achievements manager
const achievementsManager = new AchievementsManager();
