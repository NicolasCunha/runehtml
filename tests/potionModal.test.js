import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock BaseModal (same as before)
class BaseModal {
    constructor() {
        this.currentModal = null;
        this.escapeHandler = null;
    }

    showModal(modalHTML) {
        this.closeModal();
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);
        return this.currentModal;
    }

    setupModalEvents(options = {}) {
        const {
            confirmBtnId,
            cancelBtnId,
            closeBtnId,
            onConfirm,
            onCancel,
            onClose,
            closeOnOverlayClick = true,
            closeOnEscape = true,
            focusElementId
        } = options;

        if (confirmBtnId) {
            const confirmBtn = document.getElementById(confirmBtnId);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onConfirm) onConfirm();
                });
            }
        }

        if (cancelBtnId) {
            const cancelBtn = document.getElementById(cancelBtnId);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onCancel) onCancel();
                });
            }
        }

        if (closeBtnId) {
            const closeBtn = document.getElementById(closeBtnId);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onClose) onClose();
                });
            }
        }

        if (closeOnOverlayClick && this.currentModal) {
            this.currentModal.addEventListener('click', (e) => {
                if (e.target === this.currentModal) {
                    this.closeModal();
                    if (onCancel) onCancel();
                    if (onClose) onClose();
                }
            });
        }

        if (closeOnEscape) {
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    if (onCancel) onCancel();
                    if (onClose) onClose();
                    document.removeEventListener('keydown', this.escapeHandler);
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        if (focusElementId) {
            const focusElement = document.getElementById(focusElementId);
            if (focusElement) {
                focusElement.focus();
            }
        }
    }

    closeModal() {
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }

    isOpen() {
        return this.currentModal !== null;
    }

    getCurrentModal() {
        return this.currentModal;
    }
}

// Mock ConfirmationModal
class ConfirmationModal extends BaseModal {
    showAlert(title, message) {
        const modalHTML = `<div class="modal-overlay"><div class="modal-header">${title}</div><div>${message}</div></div>`;
        this.showModal(modalHTML);
    }
}

// Mock gameState
const gameState = {
    get: () => ({
        resources: {},
        combat: {
            potionCooldown: 0,
            inCombat: false,
            activeBuff: null
        }
    })
};

// Mock combatManager
const combatManager = {
    useHealingPotion: (type) => ({ success: true }),
    drinkBuffPotion: (type) => ({ success: true, message: 'Buff activated!' }),
    getBuffName: (type) => 'Test Buff',
    getBuffDescription: (type) => 'Test description'
};

// Mock PotionModal
class PotionModal extends BaseModal {
    constructor() {
        super();
    }

    showHealingPotions() {
        const resources = gameState.get().resources;
        const combat = gameState.get().combat;
        
        const potions = [
            { key: 'basic', name: 'Basic Potion', heal: 25, minLevel: 1 },
            { key: 'health', name: 'Health Potion', heal: 50, minLevel: 11 },
            { key: 'divine', name: 'Divine Potion', heal: 150, minLevel: 71 },
            { key: 'life', name: 'Life Potion', heal: 300, minLevel: 81 }
        ];
        
        const availablePotions = potions.filter(p => (resources[p.key] || 0) > 0);
        
        let potionListHTML = '';
        if (availablePotions.length === 0) {
            potionListHTML = '<p style="color: #ff6666; text-align: center;">No healing potions available!<br>Train Chemistry to brew potions.</p>';
        } else {
            potionListHTML = availablePotions.map(potion => {
                const count = resources[potion.key] || 0;
                return `
                    <div class="potion-item">
                        <button class="modal-btn use-potion-btn" data-potion="${potion.key}">
                            <span class="btn-cursor">></span> ${potion.name} (${count})
                            <br><span style="font-size: 7px; color: #66ff66;">Restores ${potion.heal} HP</span>
                        </button>
                    </div>
                `;
            }).join('');
        }
        
        let cooldownWarning = '';
        if (combat.potionCooldown > 0) {
            cooldownWarning = `<p style="color: #ffaa00; text-align: center;">⏳ Cooldown: ${Math.ceil(combat.potionCooldown / 1000)} seconds remaining</p>`;
        }
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">🧪 Use Healing Potion</span>
                    </div>
                    <div class="modal-content">
                        ${cooldownWarning}
                        ${potionListHTML}
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-cancel" id="modal-close-btn">
                            <span class="btn-cursor">></span> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHTML);
        
        const potionBtns = document.querySelectorAll('.use-potion-btn');
        potionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const potionType = btn.getAttribute('data-potion');
                const result = combatManager.useHealingPotion(potionType);
                
                if (result.success) {
                    this.closeModal();
                    if (window.game) {
                        window.game.ui.updateCombatDisplay();
                    }
                }
            });
        });
        
        this.setupModalEvents({
            closeBtnId: 'modal-close-btn',
            closeOnEscape: true,
            closeOnOverlayClick: false
        });
    }

    showBuffPotions() {
        const resources = gameState.get().resources;
        const combat = gameState.get().combat;
        
        if (combat.inCombat) {
            const confirmModal = new ConfirmationModal();
            confirmModal.showAlert('Cannot Use Buffs', 'You cannot change buffs during combat!');
            return;
        }
        
        const potions = [
            { key: 'energy', name: 'Energy Potion', effect: '+15% damage', minLevel: 31 },
            { key: 'poison', name: 'Poison Potion', effect: '+5 poison damage/turn', minLevel: 41 },
            { key: 'fire', name: 'Fire Potion', effect: '+5-15 fire damage/hit', minLevel: 51 },
            { key: 'frost', name: 'Frost Potion', effect: '-15% enemy damage', minLevel: 61 }
        ];
        
        const availablePotions = potions.filter(p => (resources[p.key] || 0) > 0);
        
        let potionListHTML = '';
        if (availablePotions.length === 0) {
            potionListHTML = '<p style="color: #ff6666; text-align: center;">No buff potions available!<br>Train Chemistry to brew potions.</p>';
        } else {
            potionListHTML = availablePotions.map(potion => {
                const count = resources[potion.key] || 0;
                return `
                    <div class="potion-item">
                        <button class="modal-btn drink-buff-btn" data-potion="${potion.key}">
                            <span class="btn-cursor">></span> ${potion.name} (${count})
                            <br><span style="font-size: 7px; color: #ffaa00;">${potion.effect} - 10 battles</span>
                        </button>
                    </div>
                `;
            }).join('');
        }
        
        let currentBuffHTML = '';
        if (combat.activeBuff) {
            const buffName = combatManager.getBuffName(combat.activeBuff.type);
            const buffDesc = combatManager.getBuffDescription(combat.activeBuff.type);
            currentBuffHTML = `
                <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid #ffaa00; padding: 10px; margin-bottom: 10px;">
                    <p style="color: #ffaa00;">Active Buff: ${buffName}</p>
                    <p style="font-size: 7px; color: #ffaa00;">${buffDesc} (${combat.activeBuff.battlesLeft} battles left)</p>
                </div>
            `;
        }
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">✨ Drink Buff Potion</span>
                    </div>
                    <div class="modal-content">
                        ${currentBuffHTML}
                        <p style="font-size: 8px; text-align: center; margin-bottom: 10px;">Buffs last for 10 battles. Only one buff can be active at a time.</p>
                        ${potionListHTML}
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-cancel" id="modal-close-btn">
                            <span class="btn-cursor">></span> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHTML);
        
        const buffBtns = document.querySelectorAll('.drink-buff-btn');
        buffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const potionType = btn.getAttribute('data-potion');
                const result = combatManager.drinkBuffPotion(potionType);
                
                if (result.success) {
                    this.closeModal();
                }
            });
        });
        
        this.setupModalEvents({
            closeBtnId: 'modal-close-btn',
            closeOnEscape: true,
            closeOnOverlayClick: true
        });
    }
}

describe('PotionModal', () => {
    let potionModal;
    let mockGameState;

    beforeEach(() => {
        potionModal = new PotionModal();
        document.body.innerHTML = '';
        
        // Reset mock gameState
        mockGameState = {
            resources: {},
            combat: {
                potionCooldown: 0,
                inCombat: false,
                activeBuff: null
            }
        };
        gameState.get = () => mockGameState;
    });

    afterEach(() => {
        potionModal.closeModal();
        document.body.innerHTML = '';
    });

    describe('showHealingPotions', () => {
        test('should display healing potions modal with title', () => {
            mockGameState.resources = { basic: 5 };
            potionModal.showHealingPotions();

            const title = document.querySelector('.modal-title');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('🧪 Use Healing Potion');
        });

        test('should show empty message when no potions available', () => {
            mockGameState.resources = {};
            potionModal.showHealingPotions();

            const content = document.querySelector('.modal-content');
            expect(content.textContent).toContain('No healing potions available!');
            expect(content.textContent).toContain('Train Chemistry to brew potions.');
        });

        test('should display available healing potions', () => {
            mockGameState.resources = { basic: 5, health: 3 };
            potionModal.showHealingPotions();

            const potionButtons = document.querySelectorAll('.use-potion-btn');
            expect(potionButtons.length).toBe(2);
            expect(potionButtons[0].textContent).toContain('Basic Potion (5)');
            expect(potionButtons[1].textContent).toContain('Health Potion (3)');
        });

        test('should show heal amounts for each potion', () => {
            mockGameState.resources = { basic: 1, divine: 1 };
            potionModal.showHealingPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('Restores 25 HP');
            expect(content).toContain('Restores 150 HP');
        });

        test('should display cooldown warning when on cooldown', () => {
            mockGameState.resources = { basic: 1 };
            mockGameState.combat.potionCooldown = 5000; // 5 seconds
            potionModal.showHealingPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('⏳ Cooldown:');
            expect(content).toContain('5 seconds remaining');
        });

        test('should not display cooldown warning when ready', () => {
            mockGameState.resources = { basic: 1 };
            mockGameState.combat.potionCooldown = 0;
            potionModal.showHealingPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).not.toContain('Cooldown:');
        });

        test('should close modal when close button clicked', () => {
            mockGameState.resources = { basic: 1 };
            potionModal.showHealingPotions();
            expect(potionModal.isOpen()).toBe(true);

            document.getElementById('modal-close-btn').click();
            expect(potionModal.isOpen()).toBe(false);
        });

        test('should close on Escape key', () => {
            mockGameState.resources = { basic: 1 };
            potionModal.showHealingPotions();
            
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(potionModal.isOpen()).toBe(false);
        });
    });

    describe('showBuffPotions', () => {
        test('should display buff potions modal with title', () => {
            mockGameState.resources = { energy: 3 };
            potionModal.showBuffPotions();

            const title = document.querySelector('.modal-title');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('✨ Drink Buff Potion');
        });

        test('should show alert when trying to use buffs during combat', () => {
            mockGameState.combat.inCombat = true;
            potionModal.showBuffPotions();

            // Should show a ConfirmationModal alert instead
            const modal = document.querySelector('.modal-overlay');
            expect(modal).toBeTruthy();
            expect(modal.innerHTML).toContain('Cannot Use Buffs');
        });

        test('should show empty message when no buff potions available', () => {
            mockGameState.resources = {};
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content');
            expect(content.textContent).toContain('No buff potions available!');
        });

        test('should display available buff potions', () => {
            mockGameState.resources = { energy: 2, fire: 1 };
            potionModal.showBuffPotions();

            const buffButtons = document.querySelectorAll('.drink-buff-btn');
            expect(buffButtons.length).toBe(2);
            expect(buffButtons[0].textContent).toContain('Energy Potion (2)');
            expect(buffButtons[1].textContent).toContain('Fire Potion (1)');
        });

        test('should show buff effects and duration', () => {
            mockGameState.resources = { energy: 1, poison: 1 };
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('+15% damage');
            expect(content).toContain('+5 poison damage/turn');
            expect(content).toContain('10 battles');
        });

        test('should display active buff information', () => {
            mockGameState.resources = { energy: 1 };
            mockGameState.combat.activeBuff = {
                type: 'energy',
                battlesLeft: 7
            };
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('Active Buff:');
            expect(content).toContain('Test Buff');
            expect(content).toContain('7 battles left');
        });

        test('should not display active buff section when no buff active', () => {
            mockGameState.resources = { energy: 1 };
            mockGameState.combat.activeBuff = null;
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).not.toContain('Active Buff:');
        });

        test('should show buff duration description', () => {
            mockGameState.resources = { energy: 1 };
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('Buffs last for 10 battles');
            expect(content).toContain('Only one buff can be active at a time');
        });

        test('should close modal when close button clicked', () => {
            mockGameState.resources = { energy: 1 };
            potionModal.showBuffPotions();
            expect(potionModal.isOpen()).toBe(true);

            document.getElementById('modal-close-btn').click();
            expect(potionModal.isOpen()).toBe(false);
        });
    });

    describe('potion types', () => {
        test('should list all 4 healing potion types', () => {
            mockGameState.resources = { 
                basic: 1, 
                health: 1, 
                divine: 1, 
                life: 1 
            };
            potionModal.showHealingPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('Basic Potion');
            expect(content).toContain('Health Potion');
            expect(content).toContain('Divine Potion');
            expect(content).toContain('Life Potion');
        });

        test('should list all 4 buff potion types', () => {
            mockGameState.resources = { 
                energy: 1, 
                poison: 1, 
                fire: 1, 
                frost: 1 
            };
            potionModal.showBuffPotions();

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('Energy Potion');
            expect(content).toContain('Poison Potion');
            expect(content).toContain('Fire Potion');
            expect(content).toContain('Frost Potion');
        });
    });
});
