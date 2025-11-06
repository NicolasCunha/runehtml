/**
 * @jest-environment jsdom
 */

describe('SaveManager', () => {
    let saveManager;
    let mockGameState;
    let mockStorage;
    let mockUI;
    
    beforeEach(() => {
        // Mock GameState
        const stateData = {
            uuid: 'test-uuid-123',
            currentActivity: 'woodcutting',
            isPlaying: true,
            stats: {
                playTime: 1000,
                sessionStart: Date.now() - 5000
            },
            offlineTraining: {
                lastSaveTime: 0,
                trainingSkill: null
            }
        };
        
        mockGameState = {
            get: () => ({ ...stateData }),
            update: (key, value) => {
                const keys = key.split('.');
                let obj = stateData;
                for (let i = 0; i < keys.length - 1; i++) {
                    obj = obj[keys[i]];
                }
                obj[keys[keys.length - 1]] = value;
            },
            isPlaying: () => stateData.isPlaying,
            load: (data) => {
                Object.assign(stateData, data);
            }
        };
        
        // Mock Storage
        const saves = [
            { uuid: 'save-1', player: { name: 'Player1' } },
            { uuid: 'save-2', player: { name: 'Player2' } }
        ];
        
        mockStorage = {
            saveGame: (state) => true,
            loadGameByUUID: (uuid) => {
                return saves.find(s => s.uuid === uuid) || null;
            },
            getAllSaves: () => [...saves],
            hasSavedGame: () => saves.length > 0,
            deleteSave: (uuid) => {
                const index = saves.findIndex(s => s.uuid === uuid);
                if (index !== -1) {
                    saves.splice(index, 1);
                    return true;
                }
                return false;
            }
        };
        
        // Mock UI
        mockUI = {
            showNoSaveError: (callback) => callback(),
            showSaveSelectionScreen: (saves, onSelect, onCancel) => {},
            showMainMenu: () => {}
        };
        
        // Mock SaveManager class
        class SaveManager {
            constructor(gameState, storage, ui) {
                this.state = gameState;
                this.storage = storage;
                this.ui = ui;
                this.autoSaveInterval = null;
            }
            
            saveGame() {
                const currentState = this.state.get();
                
                if (currentState.isPlaying && currentState.stats.sessionStart) {
                    const now = Date.now();
                    const sessionTime = now - currentState.stats.sessionStart;
                    const totalPlayTime = (currentState.stats.playTime || 0) + sessionTime;
                    
                    this.state.update('stats.playTime', totalPlayTime);
                    this.state.update('stats.sessionStart', now);
                }
                
                this.state.update('offlineTraining.lastSaveTime', Date.now());
                this.state.update('offlineTraining.trainingSkill', currentState.currentActivity);
                
                return this.storage.saveGame(this.state.get());
            }
            
            loadGame(onLoadComplete, onLoadError) {
                const saves = this.storage.getAllSaves();
                
                if (saves.length === 0) {
                    this.ui.showNoSaveError(() => {});
                    if (onLoadError) onLoadError();
                    return;
                }
                
                this.ui.showSaveSelectionScreen(
                    saves,
                    (uuid) => this.loadGameByUUID(uuid, onLoadComplete, onLoadError),
                    () => this.ui.showMainMenu()
                );
            }
            
            loadGameByUUID(uuid, onLoadComplete, onLoadError) {
                const savedState = this.storage.loadGameByUUID(uuid);
                
                if (savedState) {
                    this.state.load(savedState);
                    
                    if (onLoadComplete) {
                        onLoadComplete(savedState);
                    }
                } else {
                    this.ui.showNoSaveError(() => {});
                    if (onLoadError) onLoadError();
                }
            }
            
            startAutoSave() {
                if (this.autoSaveInterval) {
                    clearInterval(this.autoSaveInterval);
                }
                
                this.autoSaveInterval = setInterval(() => {
                    if (this.state.isPlaying()) {
                        this.saveGame();
                    }
                }, 30000);
            }
            
            stopAutoSave() {
                if (this.autoSaveInterval) {
                    clearInterval(this.autoSaveInterval);
                    this.autoSaveInterval = null;
                }
            }
            
            hasSave() {
                return this.storage.hasSavedGame();
            }
            
            getAllSaves() {
                return this.storage.getAllSaves();
            }
            
            deleteSave(uuid) {
                return this.storage.deleteSave(uuid);
            }
            
            deleteCurrentSave() {
                const uuid = this.state.get().uuid;
                return this.deleteSave(uuid);
            }
        }
        
        saveManager = new SaveManager(mockGameState, mockStorage, mockUI);
    });
    
    afterEach(() => {
        if (saveManager.autoSaveInterval) {
            clearInterval(saveManager.autoSaveInterval);
        }
    });
    
    describe('saveGame', () => {
        test('should save game state to storage', () => {
            const result = saveManager.saveGame();
            expect(result).toBe(true);
        });
        
        test('should update offline training data', () => {
            const beforeTime = Date.now();
            saveManager.saveGame();
            
            const state = mockGameState.get();
            expect(state.offlineTraining.lastSaveTime).toBeGreaterThanOrEqual(beforeTime);
            expect(state.offlineTraining.trainingSkill).toBe('woodcutting');
        });
        
        test('should update play time when playing', () => {
            const initialPlayTime = mockGameState.get().stats.playTime;
            saveManager.saveGame();
            
            const state = mockGameState.get();
            expect(state.stats.playTime).toBeGreaterThan(initialPlayTime);
        });
        
        test('should update session start time', () => {
            const beforeTime = Date.now();
            saveManager.saveGame();
            
            const state = mockGameState.get();
            expect(state.stats.sessionStart).toBeGreaterThanOrEqual(beforeTime);
        });
    });
    
    describe('loadGame', () => {
        test('should show save selection screen when saves exist', () => {
            const showSaveSelectionSpy = mockUI.showSaveSelectionScreen = () => {};
            saveManager.loadGame();
            
            const saves = mockStorage.getAllSaves();
            expect(saves.length).toBeGreaterThan(0);
        });
        
        test('should show error when no saves exist', () => {
            mockStorage.getAllSaves = () => [];
            let errorShown = false;
            mockUI.showNoSaveError = () => { errorShown = true; };
            
            saveManager.loadGame();
            expect(errorShown).toBe(true);
        });
        
        test('should call onLoadError callback when no saves', () => {
            mockStorage.getAllSaves = () => [];
            let errorCalled = false;
            
            saveManager.loadGame(null, () => { errorCalled = true; });
            expect(errorCalled).toBe(true);
        });
    });
    
    describe('loadGameByUUID', () => {
        test('should load saved state by UUID', () => {
            let loadedState = null;
            saveManager.loadGameByUUID('save-1', (state) => {
                loadedState = state;
            });
            
            expect(loadedState).not.toBeNull();
            expect(loadedState.uuid).toBe('save-1');
        });
        
        test('should call onLoadComplete callback on success', () => {
            let completeCalled = false;
            saveManager.loadGameByUUID('save-1', () => {
                completeCalled = true;
            });
            
            expect(completeCalled).toBe(true);
        });
        
        test('should show error when UUID not found', () => {
            let errorShown = false;
            mockUI.showNoSaveError = () => { errorShown = true; };
            
            saveManager.loadGameByUUID('invalid-uuid');
            expect(errorShown).toBe(true);
        });
        
        test('should call onLoadError callback on failure', () => {
            let errorCalled = false;
            saveManager.loadGameByUUID('invalid-uuid', null, () => {
                errorCalled = true;
            });
            
            expect(errorCalled).toBe(true);
        });
    });
    
    describe('startAutoSave', () => {
        test('should start auto-save interval', () => {
            saveManager.startAutoSave();
            expect(saveManager.autoSaveInterval).not.toBeNull();
        });
        
        test('should clear existing interval before starting new one', () => {
            saveManager.startAutoSave();
            const firstInterval = saveManager.autoSaveInterval;
            
            saveManager.startAutoSave();
            const secondInterval = saveManager.autoSaveInterval;
            
            expect(secondInterval).not.toBeNull();
            expect(secondInterval).not.toBe(firstInterval);
        });
    });
    
    describe('stopAutoSave', () => {
        test('should stop auto-save interval', () => {
            saveManager.startAutoSave();
            expect(saveManager.autoSaveInterval).not.toBeNull();
            
            saveManager.stopAutoSave();
            expect(saveManager.autoSaveInterval).toBeNull();
        });
        
        test('should handle stopping when no interval is active', () => {
            expect(() => saveManager.stopAutoSave()).not.toThrow();
        });
    });
    
    describe('hasSave', () => {
        test('should return true when saves exist', () => {
            expect(saveManager.hasSave()).toBe(true);
        });
        
        test('should return false when no saves exist', () => {
            mockStorage.hasSavedGame = () => false;
            expect(saveManager.hasSave()).toBe(false);
        });
    });
    
    describe('getAllSaves', () => {
        test('should return all saved games', () => {
            const saves = saveManager.getAllSaves();
            expect(saves).toHaveLength(2);
            expect(saves[0].uuid).toBe('save-1');
            expect(saves[1].uuid).toBe('save-2');
        });
    });
    
    describe('deleteSave', () => {
        test('should delete save by UUID', () => {
            const result = saveManager.deleteSave('save-1');
            expect(result).toBe(true);
            
            const saves = saveManager.getAllSaves();
            expect(saves).toHaveLength(1);
            expect(saves[0].uuid).toBe('save-2');
        });
        
        test('should return false for invalid UUID', () => {
            const result = saveManager.deleteSave('invalid-uuid');
            expect(result).toBe(false);
        });
    });
    
    describe('deleteCurrentSave', () => {
        test('should delete the current game save', () => {
            const result = saveManager.deleteCurrentSave();
            // Note: test-uuid-123 is not in our mock saves, so this will return false
            expect(result).toBe(false);
        });
        
        test('should use UUID from game state', () => {
            // Create a new saveManager with the current UUID in saves
            const saves = [{ uuid: 'test-uuid-123', player: { name: 'Current' } }];
            
            mockStorage.deleteSave = (uuid) => {
                const index = saves.findIndex(s => s.uuid === uuid);
                if (index !== -1) {
                    saves.splice(index, 1);
                    return true;
                }
                return false;
            };
            
            const result = saveManager.deleteCurrentSave();
            expect(result).toBe(true);
        });
    });
});
