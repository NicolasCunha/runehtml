// SkillCardRenderer - Handles rendering and updating skill cards
// Responsible for displaying skill levels, experience, and progress bars

class SkillCardRenderer {
    constructor() {
        // Cache for performance
    }

    /**
     * Generate HTML for all skill cards
     * @param {Object} skills - Skills object from game state
     * @returns {string} HTML string for all skill cards
     */
    renderSkillCards(skills) {
        return Object.entries(skills).map(([key, skill]) => {
            return this.renderSkillCard(key, skill);
        }).join('');
    }

    /**
     * Generate HTML for a single skill card
     * @param {string} key - Skill key (e.g., 'mining')
     * @param {Object} skill - Skill data object
     * @returns {string} HTML string for the skill card
     */
    renderSkillCard(key, skill) {
        const progress = skillsSystem.getProgressPercent(skill);
        const nextLevelExp = skillsSystem.getExpForNextLevel(skill.level);
        const expToNextLevel = nextLevelExp - skillsSystem.getExpForLevel(skill.level);
        
        return `
            <div class="skill-card">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">Lv <span id="skill-level-${key}">${skill.level}</span></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="skill-progress-${key}" style="width: ${progress}%"></div>
                </div>
                <div class="skill-info">
                    <span id="skill-exp-${key}">EXP: ${Math.floor(skill.exp)} / ${expToNextLevel}</span>
                </div>
                <button class="train-button" data-skill="${key}">Train</button>
            </div>
        `;
    }

    /**
     * Update all skill cards with current data
     * @param {Object} skills - Skills object from game state
     */
    updateSkillCards(skills) {
        for (const [key, skill] of Object.entries(skills)) {
            this.updateSkillCard(key, skill);
        }
    }

    /**
     * Update a single skill card
     * @param {string} key - Skill key
     * @param {Object} skill - Skill data
     */
    updateSkillCard(key, skill) {
        // Update level
        const levelElement = document.getElementById(`skill-level-${key}`);
        if (levelElement) {
            levelElement.textContent = skill.level;
        }
        
        // Update experience display
        const expElement = document.getElementById(`skill-exp-${key}`);
        if (expElement) {
            const expNeeded = skillsSystem.getExpForLevel(skill.level + 1);
            const currentLevelExp = skillsSystem.getExpForLevel(skill.level);
            const expToNextLevel = expNeeded - currentLevelExp;
            // skill.exp is already the experience into the current level
            expElement.textContent = `EXP: ${Math.floor(skill.exp)} / ${expToNextLevel}`;
        }
        
        // Update progress bar
        const progressBar = document.getElementById(`skill-progress-${key}`);
        if (progressBar) {
            const expNeeded = skillsSystem.getExpForLevel(skill.level + 1);
            const currentLevelExp = skillsSystem.getExpForLevel(skill.level);
            const expToNextLevel = expNeeded - currentLevelExp;
            // skill.exp is already the experience into the current level
            const percentage = Math.floor((skill.exp / expToNextLevel) * 100);
            progressBar.style.width = `${percentage}%`;
        }
    }

    /**
     * Get progress percentage for a skill
     * @param {Object} skill - Skill data
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercent(skill) {
        return skillsSystem.getProgressPercent(skill);
    }
}
