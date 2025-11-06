// PotionModal - Handles healing and buff potion selection
// Extends BaseModal to show available potions for combat

class PotionModal extends BaseModal {
    constructor() {
        super();
    }

    /**
     * Show healing potion selection modal (in-combat)
     */
    showHealingPotions() {
        const resources = gameState.get().resources;
        const combat = gameState.get().combat;
        
        // Available healing potions
        const potions = [
            { key: 'basic', name: 'Basic Potion', heal: 25, minLevel: 1 },
            { key: 'health', name: 'Health Potion', heal: 50, minLevel: 11 },
            { key: 'divine', name: 'Divine Potion', heal: 150, minLevel: 71 },
            { key: 'life', name: 'Life Potion', heal: 300, minLevel: 81 }
        ];
        
        // Filter to show only potions player has
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
        
        // Cooldown warning
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
        
        // Event listeners for potion buttons
        const potionBtns = document.querySelectorAll('.use-potion-btn');
        potionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const potionType = btn.getAttribute('data-potion');
                const result = combatManager.useHealingPotion(potionType);
                
                if (result.success) {
                    this.closeModal();
                    // Trigger UI update
                    if (window.game) {
                        window.game.ui.updateCombatDisplay();
                    }
                } else {
                    alert(result.message);
                }
            });
        });
        
        this.setupModalEvents({
            closeBtnId: 'modal-close-btn',
            closeOnEscape: true,
            closeOnOverlayClick: false // Don't close on overlay during combat
        });
    }

    /**
     * Show buff potion selection modal (pre-combat)
     */
    showBuffPotions() {
        const resources = gameState.get().resources;
        const combat = gameState.get().combat;
        
        // Can't change buffs during combat
        if (combat.inCombat) {
            // Create a temporary ConfirmationModal to show alert
            const confirmModal = new ConfirmationModal();
            confirmModal.showAlert('Cannot Use Buffs', 'You cannot change buffs during combat!');
            return;
        }
        
        // Available buff potions
        const potions = [
            { key: 'energy', name: 'Energy Potion', effect: '+15% damage', minLevel: 31 },
            { key: 'poison', name: 'Poison Potion', effect: '+5 poison damage/turn', minLevel: 41 },
            { key: 'fire', name: 'Fire Potion', effect: '+5-15 fire damage/hit', minLevel: 51 },
            { key: 'frost', name: 'Frost Potion', effect: '-15% enemy damage', minLevel: 61 }
        ];
        
        // Filter to show only potions player has
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
        
        // Current buff display
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
        
        // Event listeners for buff buttons
        const buffBtns = document.querySelectorAll('.drink-buff-btn');
        buffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const potionType = btn.getAttribute('data-potion');
                const result = combatManager.drinkBuffPotion(potionType);
                
                if (result.success) {
                    this.closeModal();
                    // Show success alert
                    const confirmModal = new ConfirmationModal();
                    confirmModal.showAlert('Buff Active!', result.message);
                } else {
                    alert(result.message);
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
