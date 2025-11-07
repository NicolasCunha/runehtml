import { jest } from '@jest/globals';

// Mock ModalManager
class MockModalManager {
    constructor() {
        this.lastModal = null;
        this.lastCallbacks = null;
    }

    showConfirmation(title, message, onConfirm, onCancel) {
        this.lastModal = { type: 'confirmation', title, message };
        this.lastCallbacks = { onConfirm, onCancel };
    }

    showNotification(title, message) {
        this.lastModal = { type: 'notification', title, message };
    }
}

// Mock GameState
class MockGameState {
    constructor() {
        this.data = {
            player: { name: 'TestPlayer' },
            skills: { mining: { level: 5, xp: 1000 } },
            inventory: { stone: 50 },
            stats: { playTime: 3600 },
            upgrades: { pickaxe: 2 }
        };
        this.resetCalled = false;
    }

    get() {
        return this.data;
    }

    reset() {
        this.resetCalled = true;
        this.data.skills = {};
        this.data.inventory = {};
        this.data.stats = { playTime: this.data.stats.playTime };
        this.data.upgrades = {};
    }

    update(callback) {
        callback(this.data);
    }
}

// Mock UI
class MockUI {
    constructor() {
        this.refreshCalled = false;
    }

    refreshDisplay() {
        this.refreshCalled = true;
    }
}

// Mock Storage
class MockStorage {
    constructor() {
        this.savedData = null;
    }

    saveGame(data) {
        this.savedData = data;
    }
}

describe('Reset Skills Feature', () => {
    let mockModalManager;
    let mockGameState;
    let mockUI;
    let mockStorage;
    let resetSkills;

    beforeEach(() => {
        mockModalManager = new MockModalManager();
        mockGameState = new MockGameState();
        mockUI = new MockUI();
        mockStorage = new MockStorage();

        // Create resetSkills function (simulating the game.js implementation)
        resetSkills = function() {
            mockModalManager.showConfirmation(
                'Reset Skills',
                'This will reset ALL your skills, inventory, stats, and upgrades. Your character name and play time will be preserved. This action cannot be undone!',
                () => {
                    // Preserve player identity
                    const playerName = mockGameState.get().player.name;
                    const uuid = mockGameState.get().uuid;
                    const created = mockGameState.get().player.created;
                    const playTime = mockGameState.get().stats.playTime;

                    // Reset game state
                    mockGameState.reset();

                    // Restore preserved values
                    mockGameState.update(data => {
                        data.player.name = playerName;
                        data.uuid = uuid;
                        data.player.created = created;
                        data.stats.playTime = playTime;
                    });

                    // Save and refresh
                    mockStorage.saveGame(mockGameState.get());
                    mockUI.refreshDisplay();

                    mockModalManager.showNotification(
                        'Skills Reset',
                        'All skills have been reset. Your character name and play time have been preserved.'
                    );
                },
                null
            );
        };
    });

    describe('confirmation modal', () => {
        test('should show confirmation modal when resetSkills is called', () => {
            resetSkills();

            expect(mockModalManager.lastModal).not.toBeNull();
            expect(mockModalManager.lastModal.type).toBe('confirmation');
            expect(mockModalManager.lastModal.title).toBe('Reset Skills');
            expect(mockModalManager.lastModal.message).toContain('This will reset ALL your skills');
            expect(mockModalManager.lastModal.message).toContain('cannot be undone');
        });

        test('should provide onConfirm callback', () => {
            resetSkills();

            expect(mockModalManager.lastCallbacks).not.toBeNull();
            expect(typeof mockModalManager.lastCallbacks.onConfirm).toBe('function');
        });

        test('should have onCancel callback as null', () => {
            resetSkills();

            expect(mockModalManager.lastCallbacks.onCancel).toBeNull();
        });
    });

    describe('data preservation', () => {
        beforeEach(() => {
            // Set up initial state with data
            mockGameState.data = {
                player: { 
                    name: 'PreservedPlayer',
                    created: '2025-01-01'
                },
                uuid: 'test-uuid-12345',
                skills: { 
                    mining: { level: 10, xp: 5000 },
                    woodcutting: { level: 8, xp: 3000 }
                },
                inventory: { 
                    stone: 100,
                    wood: 50 
                },
                stats: { 
                    playTime: 7200,
                    totalXP: 10000
                },
                upgrades: { 
                    pickaxe: 3,
                    axe: 2 
                }
            };
        });

        test('should preserve player name', () => {
            resetSkills();
            
            // Execute the confirmation callback
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().player.name).toBe('PreservedPlayer');
        });

        test('should preserve uuid', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().uuid).toBe('test-uuid-12345');
        });

        test('should preserve created date', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().player.created).toBe('2025-01-01');
        });

        test('should preserve playTime', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().stats.playTime).toBe(7200);
        });
    });

    describe('data reset', () => {
        beforeEach(() => {
            mockGameState.data = {
                player: { name: 'TestPlayer', created: '2025-01-01' },
                uuid: 'test-uuid',
                skills: { mining: { level: 10, xp: 5000 } },
                inventory: { stone: 100 },
                stats: { playTime: 7200, totalXP: 10000 },
                upgrades: { pickaxe: 3 }
            };
        });

        test('should call gameState.reset()', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.resetCalled).toBe(true);
        });

        test('should reset skills to empty', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().skills).toEqual({});
        });

        test('should reset inventory to empty', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().inventory).toEqual({});
        });

        test('should reset upgrades to empty', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().upgrades).toEqual({});
        });

        test('should reset stats except playTime', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            const stats = mockGameState.get().stats;
            expect(stats.playTime).toBe(7200);
            expect(stats.totalXP).toBeUndefined();
        });
    });

    describe('post-reset actions', () => {
        test('should save game after reset', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockStorage.savedData).not.toBeNull();
            expect(mockStorage.savedData.player.name).toBe('TestPlayer');
        });

        test('should refresh UI after reset', () => {
            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockUI.refreshCalled).toBe(true);
        });

        test('should show success notification', () => {
            resetSkills();
            
            // Clear the confirmation modal
            mockModalManager.lastModal = null;
            
            // Execute confirmation
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockModalManager.lastModal).not.toBeNull();
            expect(mockModalManager.lastModal.type).toBe('notification');
            expect(mockModalManager.lastModal.title).toBe('Skills Reset');
            expect(mockModalManager.lastModal.message).toContain('All skills have been reset');
        });

        test('should execute actions in correct order', () => {
            const executionOrder = [];

            // Spy on methods
            const originalReset = mockGameState.reset.bind(mockGameState);
            const originalSave = mockStorage.saveGame.bind(mockStorage);
            const originalRefresh = mockUI.refreshDisplay.bind(mockUI);

            mockGameState.reset = () => {
                executionOrder.push('reset');
                originalReset();
            };

            mockStorage.saveGame = (data) => {
                executionOrder.push('save');
                originalSave(data);
            };

            mockUI.refreshDisplay = () => {
                executionOrder.push('refresh');
                originalRefresh();
            };

            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(executionOrder).toEqual(['reset', 'save', 'refresh']);
        });
    });

    describe('edge cases', () => {
        test('should handle missing player data gracefully', () => {
            mockGameState.data = {
                player: {},
                skills: {},
                inventory: {},
                stats: {},
                upgrades: {}
            };

            resetSkills();
            
            expect(() => {
                mockModalManager.lastCallbacks.onConfirm();
            }).not.toThrow();
        });

        test('should handle missing uuid', () => {
            mockGameState.data.uuid = undefined;

            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().uuid).toBeUndefined();
        });

        test('should handle missing playTime', () => {
            mockGameState.data.stats.playTime = undefined;

            resetSkills();
            mockModalManager.lastCallbacks.onConfirm();

            expect(mockGameState.get().stats.playTime).toBeUndefined();
        });
    });
});
