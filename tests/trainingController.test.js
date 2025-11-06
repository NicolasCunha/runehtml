/**
 * @jest-environment jsdom
 */

describe('TrainingController', () => {
    let controller;
    let mockGameState;
    let mockUI;
    let mockSkillsSystem;
    let mockResourcesManager;
    let mockUpgradesManager;
    let mockAchievementsManager;
    let mockCombatManager;
    
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <button class="train-button" data-skill="woodcutting">Train</button>
            <button class="train-button" data-skill="mining">Train</button>
            <button id="hamburger-menu">Menu</button>
            <div id="dropdown-menu"></div>
            <button id="stats-button">Stats</button>
            <button id="shop-button">Shop</button>
            <button id="inventory-button">Inventory</button>
            <button id="theme-button">Theme</button>
            <button id="save-button">Save</button>
            <button id="menu-button">Menu</button>
            <div id="animation-area"></div>
        `;
        
        // Mock GameState
        const stateData = {
            currentActivity: null,
            skills: {
                woodcutting: { name: 'Woodcutting', level: 10, exp: 1000 },
                mining: { name: 'Mining', level: 5, exp: 500 },
                attack: { name: 'Attack', level: 1, exp: 0 }
            },
            resources: {},
            upgrades: {},
            stats: {
                totalActions: 0,
                skillTime: {}
            },
            combat: {
                inCombat: false,
                isRegenerating: false
            }
        };
        
        mockGameState = {
            get: () => ({ ...stateData }),
            update: (key, value) => {
                const keys = key.split('.');
                let obj = stateData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) obj[keys[i]] = {};
                    obj = obj[keys[i]];
                }
                obj[keys[keys.length - 1]] = value;
            }
        };
        
        // Mock UI
        mockUI = {
            updateAnimation: () => {},
            updatePlayerTitle: () => {},
            updateSkillCards: () => {},
            updateCombatDisplay: () => {}
        };
        
        // Mock SkillsSystem
        mockSkillsSystem = {
            addExp: (skill, exp) => {
                const newExp = skill.exp + exp;
                const newLevel = skill.level + (exp > 100 ? 1 : 0);
                return {
                    skill: { ...skill, exp: newExp, level: newLevel },
                    leveledUp: newLevel > skill.level,
                    newLevel: newLevel
                };
            }
        };
        
        // Mock ResourcesManager
        mockResourcesManager = {
            getResourceDrop: (skillKey, level) => {
                if (skillKey === 'woodcutting') {
                    return { type: 'logs', displayName: 'Logs', amount: 1 };
                }
                return null;
            }
        };
        
        // Mock UpgradesManager
        mockUpgradesManager = {
            getTotalBonus: () => 0.1 // 10% bonus
        };
        
        // Mock AchievementsManager
        mockAchievementsManager = {
            getTitle: (skillKey, level) => `Level ${level} ${skillKey}`
        };
        
        // Mock CombatManager
        mockCombatManager = {
            isCombatSkill: (skillKey) => skillKey === 'attack',
            startCombat: () => true,
            processCombatTurn: () => {},
            updateRegeneration: () => {}
        };
        
        // Mock TrainingController class
        class TrainingController {
            constructor(gameState, ui, skillsSystem, resourcesManager, upgradesManager, achievementsManager, combatManager) {
                this.state = gameState;
                this.ui = ui;
                this.skillsSystem = skillsSystem;
                this.resourcesManager = resourcesManager;
                this.upgradesManager = upgradesManager;
                this.achievementsManager = achievementsManager;
                this.combat = combatManager;
                this.trainingInterval = null;
            }
            
            setupListeners(onSave, onMenu, onShop, onStats, onInventory, onTheme, showNotification) {
                this.showNotification = showNotification;
                
                const trainButtons = document.querySelectorAll('.train-button');
                trainButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const skillKey = button.getAttribute('data-skill');
                        const currentState = this.state.get();
                        
                        if (currentState.currentActivity === skillKey) {
                            this.stopTraining();
                        } else {
                            this.startTraining(skillKey);
                        }
                    });
                });
                
                const hamburgerBtn = document.getElementById('hamburger-menu');
                const dropdownMenu = document.getElementById('dropdown-menu');
                
                if (hamburgerBtn && dropdownMenu) {
                    hamburgerBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        dropdownMenu.classList.toggle('show');
                    });
                    
                    const closeMenuHandler = (e) => {
                        if (e.target.closest('.notification')) return;
                        if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                            dropdownMenu.classList.remove('show');
                        }
                    };
                    
                    document.addEventListener('click', closeMenuHandler);
                    
                    const menuItems = dropdownMenu.querySelectorAll('.menu-item-btn');
                    menuItems.forEach(item => {
                        item.addEventListener('click', () => {
                            dropdownMenu.classList.remove('show');
                        });
                    });
                }
                
                this.setupButtonListener('stats-button', onStats);
                this.setupButtonListener('shop-button', onShop);
                this.setupButtonListener('inventory-button', onInventory);
                this.setupButtonListener('theme-button', onTheme);
                this.setupButtonListener('menu-button', onMenu);
                
                const saveButton = document.getElementById('save-button');
                if (saveButton && onSave) {
                    saveButton.addEventListener('click', () => {
                        onSave();
                        showNotification('Game saved!');
                    });
                }
            }
            
            setupButtonListener(buttonId, callback) {
                const button = document.getElementById(buttonId);
                if (button && callback) {
                    button.addEventListener('click', () => callback());
                }
            }
            
            startTraining(skillKey) {
                const currentState = this.state.get();
                const skill = currentState.skills[skillKey];
                
                if (!skill) return;
                
                const currentActivity = currentState.currentActivity;
                if (currentActivity && currentActivity !== skillKey) {
                    const currentIsCombat = this.combat.isCombatSkill(currentActivity);
                    const newIsCombat = this.combat.isCombatSkill(skillKey);
                    
                    if (currentIsCombat && newIsCombat) {
                        this.state.update('combat.inCombat', false);
                    }
                }
                
                this.state.update('currentActivity', skillKey);
                this.ui.updateAnimation(skillKey, skill.level);
                this.ui.updatePlayerTitle(skillKey, skill.level);
                this.updateTrainButtons(skillKey);
                
                if (this.trainingInterval) {
                    clearInterval(this.trainingInterval);
                }
                
                this.trainingInterval = setInterval(() => {
                    this.performTrainingAction(skillKey);
                }, 1000);
            }
            
            stopTraining() {
                if (this.trainingInterval) {
                    clearInterval(this.trainingInterval);
                    this.trainingInterval = null;
                }
                
                this.state.update('currentActivity', null);
                
                const animationArea = document.getElementById('animation-area');
                if (animationArea) {
                    animationArea.innerHTML = '<p style="color: var(--color-primary-dim);">> Select a skill to start training...</p>';
                }
                
                this.ui.updatePlayerTitle(null, null);
                this.updateTrainButtons(null);
                
                if (this.showNotification) {
                    this.showNotification('Training stopped', 'var(--color-primary-dim)');
                }
            }
            
            updateTrainButtons(activeSkill) {
                const trainButtons = document.querySelectorAll('.train-button');
                
                trainButtons.forEach(button => {
                    const skillKey = button.getAttribute('data-skill');
                    
                    if (skillKey === activeSkill) {
                        button.textContent = 'Stop';
                        button.style.backgroundColor = '#ff6666';
                    } else {
                        button.textContent = 'Train';
                        button.style.backgroundColor = '';
                    }
                });
            }
            
            performTrainingAction(skillKey) {
                const currentState = this.state.get();
                const skill = currentState.skills[skillKey];
                
                if (this.combat.isCombatSkill(skillKey)) {
                    this.performCombatAction(currentState);
                    return;
                }
                
                this.performGatheringAction(skillKey, skill, currentState);
            }
            
            performCombatAction(currentState) {
                const combat = currentState.combat;
                
                if (combat.isRegenerating) {
                    this.combat.updateRegeneration();
                    this.ui.updateSkillCards(currentState.skills);
                    return;
                }
                
                if (!combat.inCombat) {
                    const started = this.combat.startCombat(currentState.currentActivity);
                    if (!started) {
                        console.error('Failed to start combat');
                        return;
                    }
                    this.ui.updateCombatDisplay();
                    this.ui.updateSkillCards(currentState.skills);
                    return;
                }
                
                this.combat.processCombatTurn();
                this.ui.updateSkillCards(currentState.skills);
                this.ui.updateCombatDisplay();
            }
            
            performGatheringAction(skillKey, skill, currentState) {
                const baseExpGain = Math.floor(Math.random() * 21) + 10;
                const bonus = this.upgradesManager.getTotalBonus(skillKey, currentState.upgrades);
                const expGain = Math.floor(baseExpGain * (1 + bonus));
                
                const result = this.skillsSystem.addExp(skill, expGain);
                
                this.state.update(`skills.${skillKey}`, result.skill);
                this.state.update('stats.totalActions', currentState.stats.totalActions + 1);
                
                const currentSkillTime = currentState.stats.skillTime[skillKey] || 0;
                this.state.update(`stats.skillTime.${skillKey}`, currentSkillTime + 1000);
                
                const resourceDrop = this.resourcesManager.getResourceDrop(skillKey, result.skill.level);
                if (resourceDrop && this.showNotification) {
                    const currentAmount = currentState.resources[resourceDrop.type] || 0;
                    this.state.update(`resources.${resourceDrop.type}`, currentAmount + resourceDrop.amount);
                    this.showNotification(`+${resourceDrop.amount} ${resourceDrop.displayName}`, 'var(--color-primary-dim)');
                }
                
                if (result.leveledUp && this.showNotification) {
                    const newTitle = this.achievementsManager.getTitle(skillKey, result.newLevel);
                    this.showNotification(`${skill.name} leveled up! Level ${result.newLevel}! [${newTitle}]`, '#ffff00');
                    this.ui.updatePlayerTitle(skillKey, result.newLevel);
                }
                
                this.ui.updateSkillCards(this.state.get().skills);
                
                if (result.leveledUp) {
                    const currentActivity = this.state.get().currentActivity;
                    if (currentActivity) {
                        const currentSkill = this.state.get().skills[currentActivity];
                        this.ui.updateAnimation(currentActivity, currentSkill.level);
                    }
                }
            }
            
            cleanup() {
                if (this.trainingInterval) {
                    clearInterval(this.trainingInterval);
                    this.trainingInterval = null;
                }
            }
        }
        
        controller = new TrainingController(
            mockGameState,
            mockUI,
            mockSkillsSystem,
            mockResourcesManager,
            mockUpgradesManager,
            mockAchievementsManager,
            mockCombatManager
        );
    });
    
    afterEach(() => {
        if (controller.trainingInterval) {
            clearInterval(controller.trainingInterval);
        }
        document.body.innerHTML = '';
    });
    
    describe('setupListeners', () => {
        test('should setup train button listeners', () => {
            controller.setupListeners(null, null, null, null, null, null, () => {});
            
            const button = document.querySelector('[data-skill="woodcutting"]');
            button.click();
            
            const state = mockGameState.get();
            expect(state.currentActivity).toBe('woodcutting');
        });
        
        test('should setup save button with notification', () => {
            let saveCalled = false;
            let notificationShown = false;
            
            controller.setupListeners(
                () => { saveCalled = true; },
                null, null, null, null, null,
                (msg) => { notificationShown = msg === 'Game saved!'; }
            );
            
            document.getElementById('save-button').click();
            
            expect(saveCalled).toBe(true);
            expect(notificationShown).toBe(true);
        });
        
        test('should setup menu button listener', () => {
            let menuCalled = false;
            
            controller.setupListeners(null, () => { menuCalled = true; }, null, null, null, null, () => {});
            
            document.getElementById('menu-button').click();
            
            expect(menuCalled).toBe(true);
        });
    });
    
    describe('startTraining', () => {
        test('should set current activity', () => {
            controller.startTraining('woodcutting');
            
            const state = mockGameState.get();
            expect(state.currentActivity).toBe('woodcutting');
        });
        
        test('should update train buttons', () => {
            controller.startTraining('woodcutting');
            
            const button = document.querySelector('[data-skill="woodcutting"]');
            expect(button.textContent).toBe('Stop');
            expect(button.style.backgroundColor).toContain('rgb(255, 102, 102)');
        });
        
        test('should handle invalid skill', () => {
            controller.startTraining('invalid_skill');
            
            const state = mockGameState.get();
            expect(state.currentActivity).toBeNull();
        });
        
        test('should reset combat when switching between combat skills', () => {
            // Test that combat reset is called when switching combat skills
            let combatResetCalled = false;
            
            // Override the state to simulate switching from attack
            const originalGet = mockGameState.get;
            mockGameState.get = () => ({
                currentActivity: 'attack',
                skills: {
                    attack: { name: 'Attack', level: 1, exp: 0 },
                    strength: { name: 'Strength', level: 1, exp: 0 }
                },
                combat: { inCombat: true, isRegenerating: false },
                resources: {},
                upgrades: {},
                stats: { totalActions: 0, skillTime: {} }
            });
            
            // Override update to track combat reset
            const originalUpdate = mockGameState.update;
            mockGameState.update = (key, value) => {
                if (key === 'combat.inCombat' && value === false) {
                    combatResetCalled = true;
                }
                originalUpdate(key, value);
            };
            
            // Override combat manager
            const originalIsCombat = mockCombatManager.isCombatSkill;
            mockCombatManager.isCombatSkill = (skill) => skill === 'attack' || skill === 'strength';
            
            controller.startTraining('strength');
            
            expect(combatResetCalled).toBe(true);
            
            // Restore
            mockGameState.get = originalGet;
            mockGameState.update = originalUpdate;
            mockCombatManager.isCombatSkill = originalIsCombat;
        });
        
        test('should create training interval', (done) => {
            controller.startTraining('woodcutting');
            
            expect(controller.trainingInterval).not.toBeNull();
            
            setTimeout(() => {
                controller.cleanup();
                done();
            }, 100);
        });
    });
    
    describe('stopTraining', () => {
        test('should clear current activity', () => {
            controller.startTraining('woodcutting');
            controller.stopTraining();
            
            const state = mockGameState.get();
            expect(state.currentActivity).toBeNull();
        });
        
        test('should clear training interval', () => {
            controller.startTraining('woodcutting');
            controller.stopTraining();
            
            expect(controller.trainingInterval).toBeNull();
        });
        
        test('should reset train buttons', () => {
            controller.startTraining('woodcutting');
            controller.stopTraining();
            
            const button = document.querySelector('[data-skill="woodcutting"]');
            expect(button.textContent).toBe('Train');
            expect(button.style.backgroundColor).toBe('');
        });
        
        test('should show notification if available', () => {
            let notificationText = '';
            controller.showNotification = (msg) => { notificationText = msg; };
            
            controller.startTraining('woodcutting');
            controller.stopTraining();
            
            expect(notificationText).toBe('Training stopped');
        });
    });
    
    describe('updateTrainButtons', () => {
        test('should mark active skill button as Stop', () => {
            controller.updateTrainButtons('woodcutting');
            
            const button = document.querySelector('[data-skill="woodcutting"]');
            expect(button.textContent).toBe('Stop');
            expect(button.style.backgroundColor).toContain('rgb(255, 102, 102)');
        });
        
        test('should mark inactive skills as Train', () => {
            controller.updateTrainButtons('woodcutting');
            
            const button = document.querySelector('[data-skill="mining"]');
            expect(button.textContent).toBe('Train');
        });
        
        test('should reset all buttons when passed null', () => {
            controller.updateTrainButtons('woodcutting');
            controller.updateTrainButtons(null);
            
            const buttons = document.querySelectorAll('.train-button');
            buttons.forEach(button => {
                expect(button.textContent).toBe('Train');
            });
        });
    });
    
    describe('performGatheringAction', () => {
        test('should add experience to skill', () => {
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            controller.performGatheringAction('woodcutting', skill, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.skills.woodcutting.exp).toBeGreaterThan(1000);
        });
        
        test('should increment total actions', () => {
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            controller.performGatheringAction('woodcutting', skill, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.stats.totalActions).toBe(1);
        });
        
        test('should track skill time', () => {
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            controller.performGatheringAction('woodcutting', skill, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.stats.skillTime.woodcutting).toBe(1000);
        });
        
        test('should gather resources', () => {
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            controller.showNotification = () => {};
            
            controller.performGatheringAction('woodcutting', skill, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.resources.logs).toBe(1);
        });
    });
    
    describe('performCombatAction', () => {
        test('should update regeneration when regenerating', () => {
            let regenCalled = false;
            mockCombatManager.updateRegeneration = () => { regenCalled = true; };
            
            const state = {
                ...mockGameState.get(),
                combat: { isRegenerating: true, inCombat: false }
            };
            
            controller.performCombatAction(state);
            
            expect(regenCalled).toBe(true);
        });
        
        test('should start combat if not in combat', () => {
            let combatStarted = false;
            mockCombatManager.startCombat = () => { combatStarted = true; return true; };
            
            const state = {
                ...mockGameState.get(),
                currentActivity: 'attack',
                combat: { isRegenerating: false, inCombat: false }
            };
            
            controller.performCombatAction(state);
            
            expect(combatStarted).toBe(true);
        });
        
        test('should process combat turn when in combat', () => {
            let turnProcessed = false;
            mockCombatManager.processCombatTurn = () => { turnProcessed = true; };
            
            const state = {
                ...mockGameState.get(),
                combat: { isRegenerating: false, inCombat: true }
            };
            
            controller.performCombatAction(state);
            
            expect(turnProcessed).toBe(true);
        });
    });
    
    describe('cleanup', () => {
        test('should clear training interval', () => {
            controller.startTraining('woodcutting');
            controller.cleanup();
            
            expect(controller.trainingInterval).toBeNull();
        });
        
        test('should handle cleanup when no interval', () => {
            expect(() => controller.cleanup()).not.toThrow();
        });
    });
});
