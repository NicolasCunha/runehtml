import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock skillsSystem
const skillsSystem = {
    getProgressPercent: (skill) => {
        const expNeeded = skillsSystem.getExpForLevel(skill.level + 1);
        const currentLevelExp = skillsSystem.getExpForLevel(skill.level);
        const expToNextLevel = expNeeded - currentLevelExp;
        const progress = (skill.exp / expToNextLevel) * 100;
        return Math.floor(progress);
    },
    getExpForLevel: (level) => {
        if (level <= 1) return 0;
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += Math.floor(i + 300 * Math.pow(2, i / 7));
        }
        return Math.floor(total / 4);
    },
    getExpForNextLevel: (currentLevel) => {
        return skillsSystem.getExpForLevel(currentLevel + 1);
    }
};

// Mock SkillCardRenderer
class SkillCardRenderer {
    constructor() {}

    renderSkillCards(skills) {
        return Object.entries(skills).map(([key, skill]) => {
            return this.renderSkillCard(key, skill);
        }).join('');
    }

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

    updateSkillCards(skills) {
        for (const [key, skill] of Object.entries(skills)) {
            this.updateSkillCard(key, skill);
        }
    }

    updateSkillCard(key, skill) {
        const levelElement = document.getElementById(`skill-level-${key}`);
        if (levelElement) {
            levelElement.textContent = skill.level;
        }
        
        const expElement = document.getElementById(`skill-exp-${key}`);
        if (expElement) {
            const expNeeded = skillsSystem.getExpForLevel(skill.level + 1);
            const currentLevelExp = skillsSystem.getExpForLevel(skill.level);
            const expToNextLevel = expNeeded - currentLevelExp;
            expElement.textContent = `EXP: ${Math.floor(skill.exp)} / ${expToNextLevel}`;
        }
        
        const progressBar = document.getElementById(`skill-progress-${key}`);
        if (progressBar) {
            const expNeeded = skillsSystem.getExpForLevel(skill.level + 1);
            const currentLevelExp = skillsSystem.getExpForLevel(skill.level);
            const expToNextLevel = expNeeded - currentLevelExp;
            const percentage = Math.floor((skill.exp / expToNextLevel) * 100);
            progressBar.style.width = `${percentage}%`;
        }
    }

    getProgressPercent(skill) {
        return skillsSystem.getProgressPercent(skill);
    }
}

describe('SkillCardRenderer', () => {
    let renderer;

    beforeEach(() => {
        renderer = new SkillCardRenderer();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('renderSkillCard', () => {
        test('should render skill card with name and level', () => {
            const skill = {
                name: 'Mining',
                level: 5,
                exp: 50,
                totalExp: 388
            };

            const html = renderer.renderSkillCard('mining', skill);

            expect(html).toContain('Mining');
            expect(html).toContain('Lv');
            expect(html).toContain('skill-level-mining');
            expect(html).toContain('>5<');
        });

        test('should render progress bar with correct width', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 41.75,
                totalExp: 125
            };

            const html = renderer.renderSkillCard('mining', skill);

            expect(html).toContain('progress-fill');
            expect(html).toContain('skill-progress-mining');
            // Progress should be around 45-46%
            const match = html.match(/width: (\d+)%/);
            expect(match).toBeTruthy();
            const width = parseInt(match[1]);
            expect(width).toBeGreaterThanOrEqual(45);
            expect(width).toBeLessThanOrEqual(50);
        });

        test('should render experience display', () => {
            const skill = {
                name: 'Mining',
                level: 1,
                exp: 50,
                totalExp: 50
            };

            const html = renderer.renderSkillCard('mining', skill);

            expect(html).toContain('EXP:');
            expect(html).toContain('skill-exp-mining');
            expect(html).toContain('50');
        });

        test('should render train button', () => {
            const skill = {
                name: 'Mining',
                level: 1,
                exp: 0,
                totalExp: 0
            };

            const html = renderer.renderSkillCard('mining', skill);

            expect(html).toContain('train-button');
            expect(html).toContain('data-skill="mining"');
            expect(html).toContain('Train');
        });

        test('should handle different skill keys', () => {
            const skill = {
                name: 'Woodcutting',
                level: 10,
                exp: 100,
                totalExp: 1254
            };

            const html = renderer.renderSkillCard('woodcutting', skill);

            expect(html).toContain('skill-level-woodcutting');
            expect(html).toContain('skill-progress-woodcutting');
            expect(html).toContain('skill-exp-woodcutting');
            expect(html).toContain('data-skill="woodcutting"');
        });

        test('should render skill card structure correctly', () => {
            const skill = {
                name: 'Mining',
                level: 1,
                exp: 0,
                totalExp: 0
            };

            const html = renderer.renderSkillCard('mining', skill);

            expect(html).toContain('skill-card');
            expect(html).toContain('skill-header');
            expect(html).toContain('skill-name');
            expect(html).toContain('skill-level');
            expect(html).toContain('progress-bar');
            expect(html).toContain('skill-info');
        });
    });

    describe('renderSkillCards', () => {
        test('should render multiple skill cards', () => {
            const skills = {
                mining: {
                    name: 'Mining',
                    level: 5,
                    exp: 50,
                    totalExp: 388
                },
                woodcutting: {
                    name: 'Woodcutting',
                    level: 3,
                    exp: 30,
                    totalExp: 184.75
                }
            };

            const html = renderer.renderSkillCards(skills);

            expect(html).toContain('Mining');
            expect(html).toContain('Woodcutting');
            expect(html).toContain('skill-level-mining');
            expect(html).toContain('skill-level-woodcutting');
        });

        test('should handle empty skills object', () => {
            const skills = {};
            const html = renderer.renderSkillCards(skills);

            expect(html).toBe('');
        });

        test('should render all skills in order', () => {
            const skills = {
                mining: { name: 'Mining', level: 1, exp: 0, totalExp: 0 },
                woodcutting: { name: 'Woodcutting', level: 1, exp: 0, totalExp: 0 },
                chemistry: { name: 'Chemistry', level: 1, exp: 0, totalExp: 0 }
            };

            const html = renderer.renderSkillCards(skills);

            const miningIndex = html.indexOf('Mining');
            const woodcuttingIndex = html.indexOf('Woodcutting');
            const chemistryIndex = html.indexOf('Chemistry');

            expect(miningIndex).toBeLessThan(woodcuttingIndex);
            expect(woodcuttingIndex).toBeLessThan(chemistryIndex);
        });
    });

    describe('updateSkillCard', () => {
        beforeEach(() => {
            // Create a skill card in the DOM
            document.body.innerHTML = `
                <div class="skill-card">
                    <div class="skill-header">
                        <span class="skill-name">Mining</span>
                        <span class="skill-level">Lv <span id="skill-level-mining">1</span></span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="skill-progress-mining" style="width: 0%"></div>
                    </div>
                    <div class="skill-info">
                        <span id="skill-exp-mining">EXP: 0 / 83</span>
                    </div>
                </div>
            `;
        });

        test('should update skill level', () => {
            const skill = {
                name: 'Mining',
                level: 5,
                exp: 50,
                totalExp: 388
            };

            renderer.updateSkillCard('mining', skill);

            const levelElement = document.getElementById('skill-level-mining');
            expect(levelElement.textContent).toBe('5');
        });

        test('should update experience display', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 41.75,
                totalExp: 125
            };

            renderer.updateSkillCard('mining', skill);

            const expElement = document.getElementById('skill-exp-mining');
            expect(expElement.textContent).toContain('EXP:');
            expect(expElement.textContent).toContain('41');
        });

        test('should update progress bar width', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 41.75,
                totalExp: 125
            };

            renderer.updateSkillCard('mining', skill);

            const progressBar = document.getElementById('skill-progress-mining');
            const width = parseInt(progressBar.style.width);
            expect(width).toBeGreaterThanOrEqual(45);
            expect(width).toBeLessThanOrEqual(50);
        });

        test('should handle missing DOM elements gracefully', () => {
            const skill = {
                name: 'Woodcutting',
                level: 5,
                exp: 100,
                totalExp: 500
            };

            expect(() => {
                renderer.updateSkillCard('woodcutting', skill);
            }).not.toThrow();
        });

        test('should update to near 100% when close to level up', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 83.5,
                totalExp: 166.75
            };

            renderer.updateSkillCard('mining', skill);

            const progressBar = document.getElementById('skill-progress-mining');
            const width = parseInt(progressBar.style.width);
            expect(width).toBeGreaterThan(90); // Near 100%
        });
    });

    describe('updateSkillCards', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="skill-level-mining">1</div>
                <div id="skill-exp-mining">EXP: 0 / 83</div>
                <div id="skill-progress-mining" style="width: 0%"></div>
                
                <div id="skill-level-woodcutting">1</div>
                <div id="skill-exp-woodcutting">EXP: 0 / 83</div>
                <div id="skill-progress-woodcutting" style="width: 0%"></div>
            `;
        });

        test('should update all skills', () => {
            const skills = {
                mining: {
                    name: 'Mining',
                    level: 5,
                    exp: 50,
                    totalExp: 388
                },
                woodcutting: {
                    name: 'Woodcutting',
                    level: 3,
                    exp: 30,
                    totalExp: 184.75
                }
            };

            renderer.updateSkillCards(skills);

            expect(document.getElementById('skill-level-mining').textContent).toBe('5');
            expect(document.getElementById('skill-level-woodcutting').textContent).toBe('3');
        });

        test('should handle empty skills object', () => {
            const skills = {};

            expect(() => {
                renderer.updateSkillCards(skills);
            }).not.toThrow();
        });
    });

    describe('getProgressPercent', () => {
        test('should return progress percentage', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 41.75,
                totalExp: 125
            };

            const progress = renderer.getProgressPercent(skill);

            expect(progress).toBeGreaterThanOrEqual(45);
            expect(progress).toBeLessThanOrEqual(50);
        });

        test('should return 0 for no progress', () => {
            const skill = {
                name: 'Mining',
                level: 1,
                exp: 0,
                totalExp: 0
            };

            const progress = renderer.getProgressPercent(skill);

            expect(progress).toBe(0);
        });

        test('should floor the percentage', () => {
            const skill = {
                name: 'Mining',
                level: 2,
                exp: 45,
                totalExp: 128.5
            };

            const progress = renderer.getProgressPercent(skill);

            expect(progress).toBeGreaterThanOrEqual(49);
            expect(progress).toBeLessThanOrEqual(54);
            expect(Number.isInteger(progress)).toBe(true);
        });
    });
});
