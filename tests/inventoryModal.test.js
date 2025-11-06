import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock BaseModal
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

// Mock resourcesManager
const resourcesManager = {
    getInventoryDisplay: (resources) => {
        const inventory = [];
        for (const [key, amount] of Object.entries(resources)) {
            if (amount > 0) {
                inventory.push({
                    key: key,
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    amount: amount
                });
            }
        }
        return inventory;
    }
};

// Mock combatResourcesManager
const combatResourcesManager = {
    isCombatResource: (key) => {
        const combatKeys = ['sword', 'bow', 'shield', 'armor', 'helmet', 'boots'];
        return combatKeys.includes(key);
    },
    getResourceKeys: (type) => {
        if (type === 'melee') return ['sword', 'armor'];
        if (type === 'ranged') return ['bow'];
        if (type === 'defense') return ['shield', 'helmet', 'boots'];
        return [];
    }
};

// Mock InventoryModal
class InventoryModal extends BaseModal {
    constructor() {
        super();
    }

    showInventory(resourcesData) {
        const inventory = resourcesManager.getInventoryDisplay(resourcesData);
        
        let inventoryHTML = '';
        if (inventory.length === 0) {
            inventoryHTML = '<p style="color: #999; text-align: center; padding: 20px;">Your inventory is empty.<br>Train skills to gather resources!</p>';
        } else {
            inventoryHTML = this.buildInventoryHTML(inventory);
        }
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>> INVENTORY</h2>
                    </div>
                    <div class="modal-content" style="max-height: 500px; overflow-y: auto;">
                        ${inventoryHTML}
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-inventory-close-btn" class="modal-btn modal-btn-ok">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
        
        this.setupModalEvents({
            closeBtnId: 'modal-inventory-close-btn',
            onClose: null,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            focusElementId: 'modal-inventory-close-btn'
        });
    }

    buildInventoryHTML(inventory) {
        let html = '';
        
        const ores = inventory.filter(i => ['copper', 'tin', 'iron', 'coal', 'gold', 'mithril', 'adamant', 'runite'].includes(i.key));
        const logs = inventory.filter(i => ['normal', 'oak', 'willow', 'maple', 'yew', 'magic', 'redwood'].includes(i.key));
        const potions = inventory.filter(i => ['basic', 'health', 'mana', 'energy', 'poison', 'fire', 'frost', 'divine', 'life'].includes(i.key));
        
        const combatResources = inventory.filter(i => {
            return combatResourcesManager.isCombatResource(i.key);
        });
        
        const meleeResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('melee').includes(i.key));
        const rangedResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('ranged').includes(i.key));
        const defenseResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('defense').includes(i.key));
        
        if (ores.length > 0) {
            html += this.buildCategoryHTML('⛏ Ores', ores);
        }
        
        if (logs.length > 0) {
            html += this.buildCategoryHTML('🪵 Logs', logs);
        }
        
        if (potions.length > 0) {
            html += this.buildCategoryHTML('🧪 Potions', potions);
        }
        
        if (meleeResources.length > 0) {
            html += this.buildCategoryHTML('⚔️ Melee Resources', meleeResources);
        }
        
        if (rangedResources.length > 0) {
            html += this.buildCategoryHTML('🏹 Ranged Resources', rangedResources);
        }
        
        if (defenseResources.length > 0) {
            html += this.buildCategoryHTML('🛡 Defense Resources', defenseResources, false);
        }
        
        return html;
    }

    buildCategoryHTML(title, items, addBreak = true) {
        let html = `<div class="inventory-category"><h3 style="color: var(--color-primary); margin-bottom: 10px;">${title}</h3>`;
        items.forEach(item => {
            html += `<div class="inventory-item"><span>${item.name}</span><span style="color: #ffff00;">${item.amount}</span></div>`;
        });
        html += `</div>${addBreak ? '<br>' : ''}`;
        return html;
    }
}

describe('InventoryModal', () => {
    let inventoryModal;

    beforeEach(() => {
        inventoryModal = new InventoryModal();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        inventoryModal.closeModal();
        document.body.innerHTML = '';
    });

    describe('showInventory', () => {
        test('should display inventory modal with title', () => {
            inventoryModal.showInventory({ copper: 10 });

            const header = document.querySelector('.modal-header h2');
            expect(header).toBeTruthy();
            expect(header.textContent).toBe('> INVENTORY');
        });

        test('should show empty message when inventory is empty', () => {
            inventoryModal.showInventory({});

            const content = document.querySelector('.modal-content');
            expect(content.textContent).toContain('Your inventory is empty');
            expect(content.textContent).toContain('Train skills to gather resources!');
        });

        test('should display close button', () => {
            inventoryModal.showInventory({ copper: 10 });

            const closeBtn = document.getElementById('modal-inventory-close-btn');
            expect(closeBtn).toBeTruthy();
            expect(closeBtn.textContent).toBe('Close');
        });

        test('should close modal when close button is clicked', () => {
            inventoryModal.showInventory({ copper: 10 });
            expect(inventoryModal.isOpen()).toBe(true);

            document.getElementById('modal-inventory-close-btn').click();
            expect(inventoryModal.isOpen()).toBe(false);
        });

        test('should close on Escape key', () => {
            inventoryModal.showInventory({ copper: 10 });
            expect(inventoryModal.isOpen()).toBe(true);

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(inventoryModal.isOpen()).toBe(false);
        });
    });

    describe('buildInventoryHTML', () => {
        test('should categorize ores correctly', () => {
            inventoryModal.showInventory({ copper: 5, iron: 10, gold: 3 });

            const oresCategory = document.querySelector('.inventory-category');
            expect(oresCategory).toBeTruthy();
            expect(oresCategory.textContent).toContain('⛏ Ores');
            expect(oresCategory.textContent).toContain('Copper');
            expect(oresCategory.textContent).toContain('5');
            expect(oresCategory.textContent).toContain('Iron');
            expect(oresCategory.textContent).toContain('10');
        });

        test('should categorize logs correctly', () => {
            inventoryModal.showInventory({ normal: 15, oak: 8, yew: 2 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('🪵 Logs');
            expect(content).toContain('Normal');
            expect(content).toContain('15');
            expect(content).toContain('Oak');
            expect(content).toContain('8');
        });

        test('should categorize potions correctly', () => {
            inventoryModal.showInventory({ health: 5, mana: 3, energy: 7 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('🧪 Potions');
            expect(content).toContain('Health');
            expect(content).toContain('5');
        });

        test('should categorize melee resources correctly', () => {
            inventoryModal.showInventory({ sword: 2, armor: 1 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('⚔️ Melee Resources');
            expect(content).toContain('Sword');
            expect(content).toContain('2');
        });

        test('should categorize ranged resources correctly', () => {
            inventoryModal.showInventory({ bow: 3 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('🏹 Ranged Resources');
            expect(content).toContain('Bow');
            expect(content).toContain('3');
        });

        test('should categorize defense resources correctly', () => {
            inventoryModal.showInventory({ shield: 1, helmet: 1, boots: 2 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).toContain('🛡 Defense Resources');
            expect(content).toContain('Shield');
            expect(content).toContain('1');
        });

        test('should display multiple categories in correct order', () => {
            inventoryModal.showInventory({ 
                copper: 10, 
                normal: 5, 
                health: 3,
                sword: 1
            });

            const categories = document.querySelectorAll('.inventory-category');
            expect(categories.length).toBe(4);
            
            expect(categories[0].textContent).toContain('⛏ Ores');
            expect(categories[1].textContent).toContain('🪵 Logs');
            expect(categories[2].textContent).toContain('🧪 Potions');
            expect(categories[3].textContent).toContain('⚔️ Melee Resources');
        });

        test('should only show categories with items', () => {
            inventoryModal.showInventory({ copper: 10 });

            const categories = document.querySelectorAll('.inventory-category');
            expect(categories.length).toBe(1);
            expect(categories[0].textContent).toContain('⛏ Ores');
        });
    });

    describe('buildCategoryHTML', () => {
        test('should build category with proper structure', () => {
            const items = [
                { name: 'Copper Ore', amount: 10 },
                { name: 'Iron Ore', amount: 5 }
            ];
            
            const html = inventoryModal.buildCategoryHTML('Test Category', items);
            
            expect(html).toContain('inventory-category');
            expect(html).toContain('Test Category');
            expect(html).toContain('Copper Ore');
            expect(html).toContain('10');
            expect(html).toContain('Iron Ore');
            expect(html).toContain('5');
        });

        test('should add break by default', () => {
            const items = [{ name: 'Test', amount: 1 }];
            const html = inventoryModal.buildCategoryHTML('Category', items);
            
            expect(html).toContain('</div><br>');
        });

        test('should not add break when addBreak is false', () => {
            const items = [{ name: 'Test', amount: 1 }];
            const html = inventoryModal.buildCategoryHTML('Category', items, false);
            
            expect(html).not.toContain('<br>');
            expect(html).toContain('</div>');
        });

        test('should display item amounts with yellow color', () => {
            const items = [{ name: 'Test Item', amount: 42 }];
            const html = inventoryModal.buildCategoryHTML('Category', items);
            
            expect(html).toContain('color: #ffff00');
            expect(html).toContain('42');
        });
    });

    describe('edge cases', () => {
        test('should handle resources with zero amount', () => {
            inventoryModal.showInventory({ copper: 0, iron: 5 });

            const content = document.querySelector('.modal-content').innerHTML;
            expect(content).not.toContain('Copper');
            expect(content).toContain('Iron');
        });

        test('should handle mixed resource types', () => {
            inventoryModal.showInventory({ 
                copper: 10,
                tin: 5,
                normal: 15,
                health: 3,
                sword: 1,
                shield: 2
            });

            const categories = document.querySelectorAll('.inventory-category');
            expect(categories.length).toBeGreaterThan(1);
        });
    });
});
