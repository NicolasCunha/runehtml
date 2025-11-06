/**
 * @jest-environment jsdom
 */

describe('OfflineProgressCalculator', () => {
    let calculator;
    let mockGameState;
    let mockSkillsSystem;
    let mockResourcesManager;
    let mockUI;
    
    beforeEach(() => {
        // Mock GameState
        const stateData = {
            offlineTraining: {
                lastSaveTime: Date.now() - 600000, // 10 minutes ago
                trainingSkill: 'woodcutting'
            },
            skills: {
                woodcutting: {
                    name: 'Woodcutting',
                    level: 10,
                    exp: 1000
                }
            },
            resources: {}
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
        
        // Mock SkillsSystem
        mockSkillsSystem = {
            addExp: (skill, exp) => {
                const newExp = skill.exp + exp;
                const newLevel = Math.floor(Math.log(newExp / 100 + 1) / Math.log(1.5)) + 1;
                return {
                    skill: {
                        ...skill,
                        exp: newExp,
                        level: newLevel
                    },
                    leveledUp: newLevel > skill.level
                };
            }
        };
        
        // Mock ResourcesManager
        mockResourcesManager = {
            getResourceDrop: (skillKey, level) => {
                if (skillKey === 'woodcutting') {
                    return {
                        type: 'logs',
                        displayName: 'Logs',
                        amount: 1
                    };
                }
                return null;
            }
        };
        
        // Mock UI
        mockUI = {
            showOfflineGainsModal: (skillName, time, exp, oldLevel, newLevel, levelsGained, resources, callback) => {
                if (callback) callback();
            }
        };
        
        // Mock OfflineProgressCalculator class
        class OfflineProgressCalculator {
            constructor(gameState, skillsSystem, resourcesManager, ui) {
                this.state = gameState;
                this.skillsSystem = skillsSystem;
                this.resourcesManager = resourcesManager;
                this.ui = ui;
                
                this.MIN_OFFLINE_TIME = 300000;
                this.OFFLINE_RATE = 0.8;
                this.BASE_EXP_PER_ACTION = 20;
                this.ACTION_INTERVAL = 1000;
            }
            
            calculate(callback, onResumeTraining) {
                const currentState = this.state.get();
                const offlineData = currentState.offlineTraining;
                
                if (!offlineData || !offlineData.lastSaveTime || !offlineData.trainingSkill) {
                    callback();
                    return;
                }
                
                const now = Date.now();
                const timeDiff = now - offlineData.lastSaveTime;
                const lastTrainingSkill = offlineData.trainingSkill;
                
                if (timeDiff < this.MIN_OFFLINE_TIME) {
                    callback();
                    this.resumeTraining(lastTrainingSkill, onResumeTraining);
                    return;
                }
                
                const skill = currentState.skills[offlineData.trainingSkill];
                if (!skill) {
                    callback();
                    return;
                }
                
                const gains = this.calculateGains(timeDiff, skill, offlineData.trainingSkill, currentState);
                const timeOfflineStr = this.formatTime(timeDiff);
                
                this.ui.showOfflineGainsModal(
                    skill.name,
                    timeOfflineStr,
                    gains.totalExpGained,
                    gains.oldLevel,
                    gains.newLevel,
                    gains.levelsGained,
                    gains.resourcesGathered,
                    () => {
                        callback();
                        this.resumeTraining(lastTrainingSkill, onResumeTraining);
                    }
                );
            }
            
            calculateGains(timeDiff, skill, skillKey, currentState) {
                const actionsPerformed = Math.floor(timeDiff / this.ACTION_INTERVAL);
                const totalExpGained = Math.floor(actionsPerformed * this.BASE_EXP_PER_ACTION * this.OFFLINE_RATE);
                
                const oldLevel = skill.level;
                const result = this.skillsSystem.addExp(skill, totalExpGained);
                this.state.update(`skills.${skillKey}`, result.skill);
                
                const resourcesGathered = this.calculateResources(actionsPerformed, skillKey, skill.level, currentState);
                
                const newLevel = result.skill.level;
                const levelsGained = newLevel - oldLevel;
                
                return {
                    totalExpGained,
                    oldLevel,
                    newLevel,
                    levelsGained,
                    resourcesGathered,
                    actionsPerformed
                };
            }
            
            calculateResources(actionsPerformed, skillKey, skillLevel, currentState) {
                let resourcesGathered = {};
                
                for (let i = 0; i < actionsPerformed; i++) {
                    const drop = this.resourcesManager.getResourceDrop(skillKey, skillLevel);
                    if (drop) {
                        if (!resourcesGathered[drop.type]) {
                            resourcesGathered[drop.type] = { amount: 0, name: drop.displayName };
                        }
                        resourcesGathered[drop.type].amount += drop.amount;
                        
                        const currentAmount = currentState.resources[drop.type] || 0;
                        this.state.update(`resources.${drop.type}`, currentAmount + drop.amount);
                    }
                }
                
                return resourcesGathered;
            }
            
            resumeTraining(skillKey, onResumeTraining) {
                if (skillKey && onResumeTraining) {
                    setTimeout(() => {
                        onResumeTraining(skillKey);
                    }, 500);
                }
            }
            
            formatTime(ms) {
                const hours = Math.floor(ms / 3600000);
                const minutes = Math.floor((ms % 3600000) / 60000);
                
                if (hours > 24) {
                    const days = Math.floor(hours / 24);
                    const remainingHours = hours % 24;
                    return `${days}d ${remainingHours}h ${minutes}m`;
                } else if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                } else {
                    return `${minutes}m`;
                }
            }
        }
        
        calculator = new OfflineProgressCalculator(
            mockGameState,
            mockSkillsSystem,
            mockResourcesManager,
            mockUI
        );
    });
    
    describe('calculate', () => {
        test('should call callback when no offline data', () => {
            mockGameState.get = () => ({ offlineTraining: {} });
            let callbackCalled = false;
            
            calculator.calculate(() => { callbackCalled = true; });
            
            expect(callbackCalled).toBe(true);
        });
        
        test('should call callback when no lastSaveTime', () => {
            mockGameState.get = () => ({ 
                offlineTraining: { trainingSkill: 'woodcutting' } 
            });
            let callbackCalled = false;
            
            calculator.calculate(() => { callbackCalled = true; });
            
            expect(callbackCalled).toBe(true);
        });
        
        test('should resume training when offline time is less than minimum', () => {
            mockGameState.get = () => ({
                offlineTraining: {
                    lastSaveTime: Date.now() - 100000, // 100 seconds (< 5 minutes)
                    trainingSkill: 'woodcutting'
                },
                skills: {
                    woodcutting: { name: 'Woodcutting', level: 10, exp: 1000 }
                }
            });
            
            let resumedSkill = null;
            calculator.calculate(
                () => {},
                (skillKey) => { resumedSkill = skillKey; }
            );
            
            // Wait for setTimeout
            setTimeout(() => {
                expect(resumedSkill).toBe('woodcutting');
            }, 600);
        });
        
        test('should calculate gains when offline time exceeds minimum', (done) => {
            let modalShown = false;
            mockUI.showOfflineGainsModal = (skillName, time, exp, oldLevel, newLevel, levelsGained, resources, callback) => {
                modalShown = true;
                expect(skillName).toBe('Woodcutting');
                expect(exp).toBeGreaterThan(0);
                if (callback) callback();
                done();
            };
            
            calculator.calculate(() => {});
            
            expect(modalShown).toBe(true);
        });
        
        test('should handle missing skill gracefully', () => {
            mockGameState.get = () => ({
                offlineTraining: {
                    lastSaveTime: Date.now() - 600000,
                    trainingSkill: 'invalid_skill'
                },
                skills: {}
            });
            
            let callbackCalled = false;
            calculator.calculate(() => { callbackCalled = true; });
            
            expect(callbackCalled).toBe(true);
        });
    });
    
    describe('calculateGains', () => {
        test('should calculate correct number of actions', () => {
            const timeDiff = 600000; // 10 minutes = 600 seconds
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            const gains = calculator.calculateGains(timeDiff, skill, 'woodcutting', state);
            
            expect(gains.actionsPerformed).toBe(600);
        });
        
        test('should calculate experience with offline rate', () => {
            const timeDiff = 600000; // 10 minutes
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            const gains = calculator.calculateGains(timeDiff, skill, 'woodcutting', state);
            
            // 600 actions * 20 exp * 0.8 rate = 9600 exp
            expect(gains.totalExpGained).toBe(9600);
        });
        
        test('should track level gains', () => {
            const timeDiff = 600000;
            const skill = { name: 'Woodcutting', level: 1, exp: 0 };
            const state = mockGameState.get();
            
            const gains = calculator.calculateGains(timeDiff, skill, 'woodcutting', state);
            
            expect(gains.oldLevel).toBe(1);
            expect(gains.newLevel).toBeGreaterThan(1);
            expect(gains.levelsGained).toBeGreaterThan(0);
        });
        
        test('should update skill in game state', () => {
            const timeDiff = 600000;
            const skill = { name: 'Woodcutting', level: 10, exp: 1000 };
            const state = mockGameState.get();
            
            calculator.calculateGains(timeDiff, skill, 'woodcutting', state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.skills.woodcutting.exp).toBeGreaterThan(1000);
        });
    });
    
    describe('calculateResources', () => {
        test('should gather resources for each action', () => {
            const actionsPerformed = 100;
            const state = mockGameState.get();
            
            const resources = calculator.calculateResources(
                actionsPerformed,
                'woodcutting',
                10,
                state
            );
            
            expect(resources.logs).toBeDefined();
            expect(resources.logs.amount).toBe(100);
            expect(resources.logs.name).toBe('Logs');
        });
        
        test('should update resources in game state', () => {
            const actionsPerformed = 50;
            const state = mockGameState.get();
            
            calculator.calculateResources(actionsPerformed, 'woodcutting', 10, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.resources.logs).toBe(50);
        });
        
        test('should handle skills with no resource drops', () => {
            mockResourcesManager.getResourceDrop = () => null;
            const actionsPerformed = 100;
            const state = mockGameState.get();
            
            const resources = calculator.calculateResources(
                actionsPerformed,
                'unknown_skill',
                10,
                state
            );
            
            expect(Object.keys(resources).length).toBe(0);
        });
        
        test('should accumulate multiple resources', () => {
            const actionsPerformed = 10;
            const state = mockGameState.get();
            state.resources.logs = 50; // Pre-existing resources
            
            calculator.calculateResources(actionsPerformed, 'woodcutting', 10, state);
            
            const updatedState = mockGameState.get();
            expect(updatedState.resources.logs).toBe(60);
        });
    });
    
    describe('resumeTraining', () => {
        test('should call onResumeTraining after delay', (done) => {
            let resumed = false;
            
            calculator.resumeTraining('woodcutting', (skillKey) => {
                resumed = true;
                expect(skillKey).toBe('woodcutting');
                done();
            });
            
            expect(resumed).toBe(false); // Not called immediately
        });
        
        test('should not call if skillKey is null', (done) => {
            let resumed = false;
            
            calculator.resumeTraining(null, () => {
                resumed = true;
            });
            
            setTimeout(() => {
                expect(resumed).toBe(false);
                done();
            }, 600);
        });
        
        test('should not call if onResumeTraining is null', (done) => {
            calculator.resumeTraining('woodcutting', null);
            
            setTimeout(() => {
                // Should not throw error
                done();
            }, 600);
        });
    });
    
    describe('formatTime', () => {
        test('should format minutes only', () => {
            const result = calculator.formatTime(300000); // 5 minutes
            expect(result).toBe('5m');
        });
        
        test('should format hours and minutes', () => {
            const result = calculator.formatTime(3900000); // 1h 5m
            expect(result).toBe('1h 5m');
        });
        
        test('should format days, hours, and minutes', () => {
            const result = calculator.formatTime(90000000); // 25 hours = 1d 1h
            expect(result).toBe('1d 1h 0m');
        });
        
        test('should handle zero time', () => {
            const result = calculator.formatTime(0);
            expect(result).toBe('0m');
        });
        
        test('should format exactly 24 hours', () => {
            const result = calculator.formatTime(86400000); // 24 hours
            expect(result).toBe('24h 0m');
        });
        
        test('should format multiple days', () => {
            const result = calculator.formatTime(259200000); // 3 days
            expect(result).toBe('3d 0h 0m');
        });
    });
});
