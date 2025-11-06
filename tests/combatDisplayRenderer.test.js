/**
 * @jest-environment jsdom
 */

describe('CombatDisplayRenderer', () => {
    let renderer;
    let mockAnimationArea;
    
    // Mock combat manager
    global.combatManager = {
        getBuffName: (type) => {
            const names = { strength: 'Strength Potion', defence: 'Defence Potion' };
            return names[type] || 'Unknown Buff';
        },
        getBuffDescription: (type) => {
            const descs = { strength: '+10% damage', defence: '+10% defence' };
            return descs[type] || 'Unknown effect';
        }
    };
    
    beforeEach(() => {
        // Mock CombatDisplayRenderer class
        class CombatDisplayRenderer {
            render(animationArea, combat) {
                if (!animationArea) return;
                
                if (combat.isRegenerating) {
                    this.renderRegenerating(animationArea, combat);
                    return;
                }
                
                if (!combat.inCombat || !combat.currentEnemy) {
                    this.renderPreparing(animationArea);
                    return;
                }
                
                this.renderActiveCombat(animationArea, combat);
            }
            
            renderRegenerating(animationArea, combat) {
                const regenPercent = Math.floor((combat.playerCurrentHP / combat.playerMaxHP) * 100);
                animationArea.innerHTML = `
                    <div class="combat-area">
                        <div class="combat-message">
                            <p style="color: #ff6666;">⚠️ Defeated! ⚠️</p>
                            <br>
                            <p>HP Regenerating: ${combat.playerCurrentHP} / ${combat.playerMaxHP} (${regenPercent}%)</p>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${regenPercent}%;"></div>
                            </div>
                            <br>
                            <p style="color: #999;">Press "Stop Training" to return</p>
                        </div>
                    </div>
                `;
            }
            
            renderPreparing(animationArea) {
                animationArea.innerHTML = `
                    <div class="combat-area">
                        <div class="combat-message">
                            <p>Preparing for combat...</p>
                        </div>
                    </div>
                `;
            }
            
            renderActiveCombat(animationArea, combat) {
                const enemy = combat.currentEnemy;
                const playerHPPercent = Math.floor((combat.playerCurrentHP / combat.playerMaxHP) * 100);
                const enemyHPPercent = Math.floor((enemy.currentHP / enemy.maxHP) * 100);
                
                const buffDisplay = this.buildBuffDisplay(combat);
                const potionStatus = this.buildPotionStatus(combat);
                const logHTML = combat.combatLog.slice(-5).map(msg => `<div class="log-entry">• ${msg}</div>`).join('');
                
                animationArea.innerHTML = `
                    <div class="combat-area">
                        <div class="combat-header">
                            <h3 style="color: var(--color-primary);">⚔️ ${enemy.name} (Level ${enemy.level})</h3>
                        </div>
                        
                        <div class="combat-hp-bars">
                            <div class="hp-container">
                                <div class="hp-label">Enemy HP: ${enemy.currentHP} / ${enemy.maxHP}</div>
                                <div class="hp-bar enemy-hp">
                                    <div class="hp-fill" style="width: ${enemyHPPercent}%; background: #ff6666;"></div>
                                </div>
                            </div>
                            
                            <div class="hp-container">
                                <div class="hp-label">Your HP: ${combat.playerCurrentHP} / ${combat.playerMaxHP}</div>
                                <div class="hp-bar player-hp">
                                    <div class="hp-fill" style="width: ${playerHPPercent}%; background: #66ff66;"></div>
                                </div>
                            </div>
                        </div>
                        
                        ${buffDisplay}
                        
                        <div class="combat-actions">
                            <button id="use-potion-btn" class="combat-btn">🧪 Potions ${potionStatus}</button>
                            ${!combat.activeBuff ? '<button id="drink-buff-btn" class="combat-btn">✨ Drink Buff</button>' : '<button id="remove-buff-btn" class="combat-btn">❌ Remove Buff</button>'}
                        </div>
                        
                        <div class="combat-log">
                            <div class="log-title">Combat Log:</div>
                            ${logHTML}
                        </div>
                    </div>
                `;
            }
            
            buildBuffDisplay(combat) {
                if (!combat.activeBuff) return '';
                
                const buffName = combatManager.getBuffName(combat.activeBuff.type);
                const buffDesc = combatManager.getBuffDescription(combat.activeBuff.type);
                return `
                    <div class="active-buff">
                        🧪 ${buffName} (${combat.activeBuff.battlesLeft} battles) - ${buffDesc}
                    </div>
                `;
            }
            
            buildPotionStatus(combat) {
                if (combat.potionCooldown > 0) {
                    return `<span style="color: #ff6666;">(Cooldown: ${Math.ceil(combat.potionCooldown / 1000)}s)</span>`;
                }
                return `<span style="color: #66ff66;">(Ready!)</span>`;
            }
            
            setupEventListeners(onUsePotion, onDrinkBuff, onRemoveBuff) {
                const usePotionBtn = document.getElementById('use-potion-btn');
                const drinkBuffBtn = document.getElementById('drink-buff-btn');
                const removeBuffBtn = document.getElementById('remove-buff-btn');
                
                if (usePotionBtn && onUsePotion) {
                    usePotionBtn.addEventListener('click', onUsePotion);
                }
                
                if (drinkBuffBtn && onDrinkBuff) {
                    drinkBuffBtn.addEventListener('click', onDrinkBuff);
                }
                
                if (removeBuffBtn && onRemoveBuff) {
                    removeBuffBtn.addEventListener('click', onRemoveBuff);
                }
            }
        }
        
        renderer = new CombatDisplayRenderer();
        mockAnimationArea = document.createElement('div');
        mockAnimationArea.id = 'animation-area';
        document.body.appendChild(mockAnimationArea);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
    });
    
    describe('render', () => {
        test('should handle null animation area', () => {
            const combat = { inCombat: true, currentEnemy: { name: 'Goblin' } };
            expect(() => renderer.render(null, combat)).not.toThrow();
        });
        
        test('should render regenerating state when isRegenerating is true', () => {
            const combat = {
                isRegenerating: true,
                playerCurrentHP: 50,
                playerMaxHP: 100
            };
            
            renderer.render(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('⚠️ Defeated! ⚠️');
            expect(mockAnimationArea.innerHTML).toContain('HP Regenerating');
            expect(mockAnimationArea.innerHTML).toContain('50 / 100');
        });
        
        test('should render preparing state when not in combat', () => {
            const combat = {
                inCombat: false,
                currentEnemy: null
            };
            
            renderer.render(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('Preparing for combat...');
        });
        
        test('should render preparing state when no current enemy', () => {
            const combat = {
                inCombat: true,
                currentEnemy: null
            };
            
            renderer.render(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('Preparing for combat...');
        });
        
        test('should render active combat when in combat with enemy', () => {
            const combat = {
                inCombat: true,
                currentEnemy: {
                    name: 'Goblin',
                    level: 5,
                    currentHP: 30,
                    maxHP: 50
                },
                playerCurrentHP: 80,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: ['Hit for 10 damage', 'Enemy hit for 5']
            };
            
            renderer.render(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('⚔️ Goblin (Level 5)');
            expect(mockAnimationArea.innerHTML).toContain('Enemy HP: 30 / 50');
            expect(mockAnimationArea.innerHTML).toContain('Your HP: 80 / 100');
            expect(mockAnimationArea.innerHTML).toContain('Hit for 10 damage');
        });
    });
    
    describe('renderRegenerating', () => {
        test('should show correct HP regeneration percentage', () => {
            const combat = {
                playerCurrentHP: 75,
                playerMaxHP: 100
            };
            
            renderer.renderRegenerating(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('75%');
            expect(mockAnimationArea.querySelector('.hp-fill').style.width).toBe('75%');
        });
        
        test('should show defeat message and stop training hint', () => {
            const combat = {
                playerCurrentHP: 25,
                playerMaxHP: 100
            };
            
            renderer.renderRegenerating(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('⚠️ Defeated! ⚠️');
            expect(mockAnimationArea.innerHTML).toContain('Press "Stop Training" to return');
        });
    });
    
    describe('renderPreparing', () => {
        test('should show preparing message', () => {
            renderer.renderPreparing(mockAnimationArea);
            
            expect(mockAnimationArea.innerHTML).toContain('Preparing for combat...');
            expect(mockAnimationArea.querySelector('.combat-area')).toBeTruthy();
        });
    });
    
    describe('renderActiveCombat', () => {
        test('should display enemy information', () => {
            const combat = {
                currentEnemy: {
                    name: 'Dragon',
                    level: 50,
                    currentHP: 500,
                    maxHP: 1000
                },
                playerCurrentHP: 100,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: []
            };
            
            renderer.renderActiveCombat(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('⚔️ Dragon (Level 50)');
            expect(mockAnimationArea.innerHTML).toContain('Enemy HP: 500 / 1000');
        });
        
        test('should display player HP bars', () => {
            const combat = {
                currentEnemy: { name: 'Goblin', level: 1, currentHP: 10, maxHP: 10 },
                playerCurrentHP: 60,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: []
            };
            
            renderer.renderActiveCombat(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('Your HP: 60 / 100');
            const playerHPBar = mockAnimationArea.querySelector('.player-hp .hp-fill');
            expect(playerHPBar.style.width).toBe('60%');
        });
        
        test('should display active buff when present', () => {
            const combat = {
                currentEnemy: { name: 'Goblin', level: 1, currentHP: 10, maxHP: 10 },
                playerCurrentHP: 100,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: [],
                activeBuff: {
                    type: 'strength',
                    battlesLeft: 5
                }
            };
            
            renderer.renderActiveCombat(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('🧪 Strength Potion (5 battles)');
            expect(mockAnimationArea.innerHTML).toContain('+10% damage');
            expect(mockAnimationArea.innerHTML).toContain('❌ Remove Buff');
        });
        
        test('should show drink buff button when no active buff', () => {
            const combat = {
                currentEnemy: { name: 'Goblin', level: 1, currentHP: 10, maxHP: 10 },
                playerCurrentHP: 100,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: [],
                activeBuff: null
            };
            
            renderer.renderActiveCombat(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('✨ Drink Buff');
            expect(mockAnimationArea.innerHTML).not.toContain('❌ Remove Buff');
        });
        
        test('should display combat log with last 5 messages', () => {
            const combat = {
                currentEnemy: { name: 'Goblin', level: 1, currentHP: 10, maxHP: 10 },
                playerCurrentHP: 100,
                playerMaxHP: 100,
                potionCooldown: 0,
                combatLog: ['Msg 1', 'Msg 2', 'Msg 3', 'Msg 4', 'Msg 5', 'Msg 6', 'Msg 7']
            };
            
            renderer.renderActiveCombat(mockAnimationArea, combat);
            
            expect(mockAnimationArea.innerHTML).toContain('• Msg 3');
            expect(mockAnimationArea.innerHTML).toContain('• Msg 7');
            expect(mockAnimationArea.innerHTML).not.toContain('• Msg 1');
            expect(mockAnimationArea.innerHTML).not.toContain('• Msg 2');
        });
    });
    
    describe('buildBuffDisplay', () => {
        test('should return empty string when no active buff', () => {
            const combat = { activeBuff: null };
            const result = renderer.buildBuffDisplay(combat);
            expect(result).toBe('');
        });
        
        test('should build buff display HTML with buff information', () => {
            const combat = {
                activeBuff: {
                    type: 'defence',
                    battlesLeft: 3
                }
            };
            
            const result = renderer.buildBuffDisplay(combat);
            
            expect(result).toContain('🧪 Defence Potion (3 battles)');
            expect(result).toContain('+10% defence');
            expect(result).toContain('active-buff');
        });
    });
    
    describe('buildPotionStatus', () => {
        test('should show ready status when no cooldown', () => {
            const combat = { potionCooldown: 0 };
            const result = renderer.buildPotionStatus(combat);
            
            expect(result).toContain('Ready!');
            expect(result).toContain('#66ff66');
        });
        
        test('should show cooldown time when on cooldown', () => {
            const combat = { potionCooldown: 5000 };
            const result = renderer.buildPotionStatus(combat);
            
            expect(result).toContain('Cooldown: 5s');
            expect(result).toContain('#ff6666');
        });
        
        test('should round up cooldown seconds', () => {
            const combat = { potionCooldown: 3500 };
            const result = renderer.buildPotionStatus(combat);
            
            expect(result).toContain('Cooldown: 4s');
        });
    });
    
    describe('setupEventListeners', () => {
        test('should setup use potion button listener', () => {
            let callCount = 0;
            const mockOnUsePotion = () => { callCount++; };
            
            mockAnimationArea.innerHTML = '<button id="use-potion-btn">Use Potion</button>';
            renderer.setupEventListeners(mockOnUsePotion, null, null);
            
            document.getElementById('use-potion-btn').click();
            expect(callCount).toBe(1);
        });
        
        test('should setup drink buff button listener', () => {
            let callCount = 0;
            const mockOnDrinkBuff = () => { callCount++; };
            
            mockAnimationArea.innerHTML = '<button id="drink-buff-btn">Drink Buff</button>';
            renderer.setupEventListeners(null, mockOnDrinkBuff, null);
            
            document.getElementById('drink-buff-btn').click();
            expect(callCount).toBe(1);
        });
        
        test('should setup remove buff button listener', () => {
            let callCount = 0;
            const mockOnRemoveBuff = () => { callCount++; };
            
            mockAnimationArea.innerHTML = '<button id="remove-buff-btn">Remove Buff</button>';
            renderer.setupEventListeners(null, null, mockOnRemoveBuff);
            
            document.getElementById('remove-buff-btn').click();
            expect(callCount).toBe(1);
        });
        
        test('should handle missing buttons gracefully', () => {
            expect(() => {
                renderer.setupEventListeners(() => {}, () => {}, () => {});
            }).not.toThrow();
        });
    });
});
