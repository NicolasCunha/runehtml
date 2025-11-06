// InventoryModal - Displays player inventory organized by resource categories
// Extends BaseModal to show resources grouped by type

class InventoryModal extends BaseModal {
    constructor() {
        super();
    }

    /**
     * Show the inventory modal with resources organized by category
     * @param {Object} resourcesData - The player's resources object
     */
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

    /**
     * Build the HTML for inventory items grouped by category
     * @param {Array} inventory - Array of inventory items
     * @returns {string} HTML string for inventory display
     */
    buildInventoryHTML(inventory) {
        let html = '';
        
        // Group by category
        const ores = inventory.filter(i => ['copper', 'tin', 'iron', 'coal', 'gold', 'mithril', 'adamant', 'runite'].includes(i.key));
        const logs = inventory.filter(i => ['normal', 'oak', 'willow', 'maple', 'yew', 'magic', 'redwood'].includes(i.key));
        const potions = inventory.filter(i => ['basic', 'health', 'mana', 'energy', 'poison', 'fire', 'frost', 'divine', 'life'].includes(i.key));
        
        // Combat resources - check using combatResourcesManager
        const combatResources = inventory.filter(i => {
            return combatResourcesManager.isCombatResource(i.key);
        });
        
        // Group combat resources by type
        const meleeResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('melee').includes(i.key));
        const rangedResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('ranged').includes(i.key));
        const defenseResources = combatResources.filter(i => combatResourcesManager.getResourceKeys('defense').includes(i.key));
        
        // Build HTML for each category
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
            // Don't add <br> after last category
            html += this.buildCategoryHTML('🛡 Defense Resources', defenseResources, false);
        }
        
        return html;
    }

    /**
     * Build HTML for a single inventory category
     * @param {string} title - Category title
     * @param {Array} items - Items in this category
     * @param {boolean} addBreak - Whether to add <br> after category
     * @returns {string} HTML string for the category
     */
    buildCategoryHTML(title, items, addBreak = true) {
        let html = `<div class="inventory-category"><h3 style="color: var(--color-primary); margin-bottom: 10px;">${title}</h3>`;
        items.forEach(item => {
            html += `<div class="inventory-item"><span>${item.name}</span><span style="color: #ffff00;">${item.amount}</span></div>`;
        });
        html += `</div>${addBreak ? '<br>' : ''}`;
        return html;
    }
}
