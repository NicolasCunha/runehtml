// Equipment Shop Modal - Manages equipment purchasing and equipping

class EquipmentShopModal extends BaseModal {
    constructor(modalManager) {
        super();
        this.modalManager = modalManager;
        this.modalId = 'equipment-shop-modal';
        this.currentSlotFilter = 'all';
        this.currentTierFilter = 'all';
        this.currentWeaponTypeFilter = 'all';
    }

    /**
     * Show the equipment shop modal
     */
    show() {
        const content = this.generateShopContent();
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 900px;">
                    <div class="modal-header">
                        <h2>> EQUIPMENT SHOP</h2>
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-equipment-close-btn" class="modal-btn modal-btn-ok">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalHTML);
        this.attachEventListeners();
        
        // Close button listener
        const closeBtn = document.getElementById('modal-equipment-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    /**
     * Generate the shop content HTML
     * @returns {string} - HTML content
     */
    generateShopContent() {
        const gameState = this.modalManager.gameState.get();
        const currentGold = gameState.currency?.gold || 0;

        return `
            <div class="equipment-shop-container">
                <!-- Gold Display -->
                <div class="gold-display">
                    <span class="gold-icon">💰</span>
                    <span class="gold-amount">${this.formatNumber(currentGold)} Gold</span>
                </div>

                <!-- Filters -->
                <div class="shop-filters">
                    <div class="filter-group">
                        <label>Slot:</label>
                        <select id="slot-filter" class="shop-filter">
                            <option value="all">All Slots</option>
                            <option value="weapon">Weapon</option>
                            <option value="offhand">Shield</option>
                            <option value="helmet">Helmet</option>
                            <option value="body">Body</option>
                            <option value="legs">Legs</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Tier:</label>
                        <select id="tier-filter" class="shop-filter">
                            <option value="all">All Tiers</option>
                            <option value="bronze">Bronze</option>
                            <option value="iron">Iron</option>
                            <option value="steel">Steel</option>
                            <option value="mithril">Mithril</option>
                            <option value="adamant">Adamant</option>
                            <option value="dragon">Dragon</option>
                        </select>
                    </div>
                    <div class="filter-group" id="weapon-type-filter-group" style="display: none;">
                        <label>Type:</label>
                        <select id="weapon-type-filter" class="shop-filter">
                            <option value="all">All Types</option>
                            <option value="sword">Sword</option>
                            <option value="axe">Axe</option>
                            <option value="mace">Mace</option>
                            <option value="dagger">Dagger</option>
                            <option value="spear">Spear</option>
                            <option value="bow">Bow</option>
                            <option value="crossbow">Crossbow</option>
                            <option value="staff">Staff</option>
                            <option value="wand">Wand</option>
                            <option value="scythe">Scythe</option>
                        </select>
                    </div>
                </div>

                <!-- Equipment Grid -->
                <div class="equipment-grid" id="equipment-grid">
                    ${this.generateEquipmentItems()}
                </div>
            </div>
        `;
    }

    /**
     * Generate equipment items HTML
     * @returns {string} - HTML for equipment items
     */
    generateEquipmentItems() {
        const gameState = this.modalManager.gameState.get();
        const currentGold = gameState.currency?.gold || 0;
        const equipped = gameState.equipment?.equipped || {};
        const unlocked = gameState.equipment?.unlocked || [];

        let items = [];

        // Get all items based on filters
        if (this.currentSlotFilter === 'all') {
            equipment.slots.forEach(slot => {
                items = items.concat(this.getFilteredItemsForSlot(slot));
            });
        } else {
            items = this.getFilteredItemsForSlot(this.currentSlotFilter);
        }

        if (items.length === 0) {
            return '<div class="no-items">No items match the selected filters</div>';
        }

        return items.map(item => {
            const itemKey = this.getItemKey(item);
            const isEquipped = this.isItemEquipped(item, equipped);
            const isUnlocked = unlocked.includes(itemKey);
            const canAfford = isUnlocked || currentGold >= item.cost;
            const meetsRequirement = equipment.canEquip(item, gameState.skills);
            const canPurchase = !isUnlocked && canAfford && meetsRequirement;

            return this.generateItemCard(item, {
                isEquipped,
                isUnlocked,
                canAfford,
                meetsRequirement,
                canPurchase,
                itemKey
            });
        }).join('');
    }

    /**
     * Get filtered items for a specific slot
     * @param {string} slot - Equipment slot
     * @returns {Array} - Filtered items
     */
    getFilteredItemsForSlot(slot) {
        let items = equipment.getItemsForSlot(slot);

        // Apply tier filter
        if (this.currentTierFilter !== 'all') {
            items = items.filter(item => item.tier === this.currentTierFilter);
        }

        // Apply weapon type filter (only for weapons)
        if (slot === 'weapon' && this.currentWeaponTypeFilter !== 'all') {
            items = items.filter(item => item.weaponType === this.currentWeaponTypeFilter);
        }

        return items;
    }

    /**
     * Generate an item card HTML
     * @param {Object} item - Equipment item
     * @param {Object} flags - Item status flags
     * @returns {string} - HTML for item card
     */
    generateItemCard(item, flags) {
        const cardClasses = ['equipment-card'];
        if (flags.isEquipped) cardClasses.push('equipped');
        if (!flags.canAfford) cardClasses.push('unaffordable');
        if (!flags.meetsRequirement) cardClasses.push('locked');

        const bonusText = this.generateBonusText(item.bonuses);
        const statusText = this.getItemStatusText(flags);

        return `
            <div class="${cardClasses.join(' ')}" data-item-key="${flags.itemKey}">
                <div class="item-header">
                    <span class="item-icon">${item.icon}</span>
                    <span class="item-name">${item.name}</span>
                    ${flags.isEquipped ? '<span class="equipped-badge">Equipped</span>' : ''}
                </div>
                <div class="item-tier">${this.capitalize(item.tier)} Tier</div>
                <div class="item-bonuses">${bonusText}</div>
                <div class="item-requirement">
                    Requires Level ${item.requiredLevel}
                    ${!flags.meetsRequirement ? ' <span class="requirement-not-met">❌</span>' : ' <span class="requirement-met">✓</span>'}
                </div>
                <div class="item-footer">
                    <div class="item-cost">
                        <span class="cost-icon">💰</span>
                        <span class="cost-amount">${this.formatNumber(item.cost)}g</span>
                    </div>
                    <div class="item-actions">
                        ${this.generateItemButtons(item, flags)}
                    </div>
                </div>
                ${statusText ? `<div class="item-status">${statusText}</div>` : ''}
            </div>
        `;
    }

    /**
     * Generate bonus text for an item
     * @param {Object} bonuses - Item bonuses
     * @returns {string} - Formatted bonus text
     */
    generateBonusText(bonuses) {
        const bonusEntries = Object.entries(bonuses)
            .filter(([stat, value]) => value > 0)
            .map(([stat, value]) => `+${value} ${this.capitalize(stat)}`);

        if (bonusEntries.length === 0) {
            return '<span class="no-bonus">No bonuses</span>';
        }

        return bonusEntries.join(', ');
    }

    /**
     * Generate action buttons for an item
     * @param {Object} item - Equipment item
     * @param {Object} flags - Item status flags
     * @returns {string} - HTML for buttons
     */
    generateItemButtons(item, flags) {
        console.log('generateItemButtons called for:', item.name, 'flags:', flags);
        
        if (flags.isEquipped) {
            console.log('  -> Returning UNEQUIP button');
            return `<button class="equipment-btn unequip-btn" data-item-key="${flags.itemKey}">Unequip</button>`;
        }

        if (!flags.isUnlocked) {
            if (!flags.meetsRequirement) {
                console.log('  -> Returning LEVEL REQUIRED button');
                return '<button class="equipment-btn disabled-btn" disabled>Level Required</button>';
            }
            if (!flags.canAfford) {
                console.log('  -> Returning NOT ENOUGH GOLD button');
                return '<button class="equipment-btn disabled-btn" disabled>Not Enough Gold</button>';
            }
            console.log('  -> Returning BUY button');
            return `<button class="equipment-btn buy-btn" data-item-key="${flags.itemKey}">Buy</button>`;
        }

        console.log('  -> Returning EQUIP button');
        return `<button class="equipment-btn equip-btn" data-item-key="${flags.itemKey}">Equip</button>`;
    }

    /**
     * Get status text for an item
     * @param {Object} flags - Item status flags
     * @returns {string} - Status text
     */
    getItemStatusText(flags) {
        if (flags.isEquipped) return '';
        if (!flags.meetsRequirement) return 'Level requirement not met';
        if (!flags.canAfford) return 'Not enough gold';
        return '';
    }

    /**
     * Check if an item is currently equipped
     * @param {Object} item - Equipment item
     * @param {Object} equipped - Currently equipped items
     * @returns {boolean} - True if equipped
     */
    isItemEquipped(item, equipped) {
        const equippedItem = equipped[item.slot];
        if (!equippedItem) return false;
        return this.getItemKey(equippedItem) === this.getItemKey(item);
    }

    /**
     * Get unique key for an item
     * @param {Object} item - Equipment item
     * @returns {string} - Item key
     */
    getItemKey(item) {
        if (item.slot === 'weapon') {
            return `${item.slot}_${item.weaponType}_${item.tier}`;
        }
        return `${item.slot}_${item.tier}`;
    }

    /**
     * Parse item key back to slot/type/tier
     * @param {string} key - Item key
     * @returns {Object} - Parsed key data
     */
    parseItemKey(key) {
        const parts = key.split('_');
        if (parts[0] === 'weapon') {
            return { slot: parts[0], weaponType: parts[1], tier: parts[2] };
        }
        return { slot: parts[0], tier: parts[1] };
    }

    /**
     * Buy an equipment item
     * @param {string} itemKey - Item key
     */
    buyItem(itemKey) {
        const gameState = this.modalManager.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        const item = parsed.weaponType 
            ? equipment.getItem(parsed.slot, parsed.weaponType, parsed.tier)
            : equipment.getItem(parsed.slot, parsed.tier);

        if (!item) return;

        const currentGold = gameState.currency?.gold || 0;
        const unlocked = gameState.equipment?.unlocked || [];

        // Check if already unlocked
        if (unlocked.includes(itemKey)) {
            this.modalManager.showMessage('Item already purchased!', 'error');
            return;
        }

        // Check gold
        if (currentGold < item.cost) {
            this.modalManager.showMessage('Not enough gold!', 'error');
            return;
        }

        // Check requirements
        if (!equipment.canEquip(item, gameState.skills)) {
            this.modalManager.showMessage('Level requirement not met!', 'error');
            return;
        }

        // Purchase item
        this.modalManager.gameState.update('currency.gold', currentGold - item.cost);
        unlocked.push(itemKey);
        this.modalManager.gameState.update('equipment.unlocked', unlocked);

        //this.modalManager.showMessage(`Purchased ${item.name}!`, 'success');
        this.refreshShop();
    }

    /**
     * Equip an item
     * @param {string} itemKey - Item key
     */
    equipItem(itemKey) {
        const gameState = this.modalManager.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        const item = parsed.weaponType 
            ? equipment.getItem(parsed.slot, parsed.weaponType, parsed.tier)
            : equipment.getItem(parsed.slot, parsed.tier);

        if (!item) return;

        const unlocked = gameState.equipment?.unlocked || [];
        
        // Check if unlocked
        if (!unlocked.includes(itemKey)) {
            this.modalManager.showMessage('Item not purchased!', 'error');
            return;
        }

        // Check requirements
        if (!equipment.canEquip(item, gameState.skills)) {
            this.modalManager.showMessage('Level requirement not met!', 'error');
            return;
        }

        // Equip item
        const equipped = gameState.equipment?.equipped || {};
        equipped[item.slot] = item;
        this.modalManager.gameState.update('equipment.equipped', equipped);

        //this.modalManager.showMessage(`Equipped ${item.name}!`, 'success');
        this.refreshShop();
    }

    /**
     * Unequip an item
     * @param {string} itemKey - Item key
     */
    unequipItem(itemKey) {
        const gameState = this.modalManager.gameState.get();
        const parsed = this.parseItemKey(itemKey);
        
        const equipped = gameState.equipment?.equipped || {};
        equipped[parsed.slot] = null;
        this.modalManager.gameState.update('equipment.equipped', equipped);

        //this.modalManager.showMessage('Item unequipped!', 'success');
        this.refreshShop();
    }

    /**
     * Refresh the shop display
     */
    refreshShop() {
        const gridElement = document.getElementById('equipment-grid');
        if (gridElement) {
            gridElement.innerHTML = this.generateEquipmentItems();
            this.attachItemEventListeners();
        }

        // Update gold display
        const goldAmountElement = document.querySelector('.gold-amount');
        if (goldAmountElement) {
            const gameState = this.modalManager.gameState.get();
            const currentGold = gameState.currency?.gold || 0;
            goldAmountElement.textContent = `${this.formatNumber(currentGold)} Gold`;
        }
    }

    /**
     * Attach event listeners to the modal
     */
    attachEventListeners() {
        // Filter listeners
        const slotFilter = document.getElementById('slot-filter');
        const tierFilter = document.getElementById('tier-filter');
        const weaponTypeFilter = document.getElementById('weapon-type-filter');
        const weaponTypeGroup = document.getElementById('weapon-type-filter-group');

        if (slotFilter) {
            slotFilter.addEventListener('change', (e) => {
                this.currentSlotFilter = e.target.value;
                
                // Show/hide weapon type filter
                if (weaponTypeGroup) {
                    weaponTypeGroup.style.display = 
                        (e.target.value === 'weapon' || e.target.value === 'all') ? 'block' : 'none';
                }
                
                this.refreshShop();
            });
        }

        if (tierFilter) {
            tierFilter.addEventListener('change', (e) => {
                this.currentTierFilter = e.target.value;
                this.refreshShop();
            });
        }

        if (weaponTypeFilter) {
            weaponTypeFilter.addEventListener('change', (e) => {
                this.currentWeaponTypeFilter = e.target.value;
                this.refreshShop();
            });
        }

        this.attachItemEventListeners();
    }

    /**
     * Attach event listeners to item cards
     */
    attachItemEventListeners() {
        // Buy button listeners
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemKey = e.target.dataset.itemKey;
                this.buyItem(itemKey);
            });
        });

        // Equip button listeners
        document.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemKey = e.target.dataset.itemKey;
                this.equipItem(itemKey);
            });
        });

        // Unequip button listeners
        document.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemKey = e.target.dataset.itemKey;
                this.unequipItem(itemKey);
            });
        });
    }

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
