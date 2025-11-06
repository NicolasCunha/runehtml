/**
 * Handles rendering of the combat display in the animation area
 */
class CombatDisplayRenderer {
    /**
     * Render the combat display
     * @param {HTMLElement} animationArea - The animation area element
     * @param {Object} combat - Combat state from gameState
     */
    render(animationArea, combat) {
        if (!animationArea) return;
        
        // If regenerating after defeat
        if (combat.isRegenerating) {
            this.renderRegenerating(animationArea, combat);
            return;
        }
        
        // If not in combat yet
        if (!combat.inCombat || !combat.currentEnemy) {
            this.renderPreparing(animationArea);
            return;
        }
        
        // Active combat display
        this.renderActiveCombat(animationArea, combat);
    }
    
    /**
     * Render the regenerating state after defeat
     * @param {HTMLElement} animationArea - The animation area element
     * @param {Object} combat - Combat state
     */
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
    
    /**
     * Render the preparing for combat state
     * @param {HTMLElement} animationArea - The animation area element
     */
    renderPreparing(animationArea) {
        animationArea.innerHTML = `
            <div class="combat-area">
                <div class="combat-message">
                    <p>Preparing for combat...</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render active combat
     * @param {HTMLElement} animationArea - The animation area element
     * @param {Object} combat - Combat state
     */
    renderActiveCombat(animationArea, combat) {
        const enemy = combat.currentEnemy;
        const playerHPPercent = Math.floor((combat.playerCurrentHP / combat.playerMaxHP) * 100);
        const enemyHPPercent = Math.floor((enemy.currentHP / enemy.maxHP) * 100);
        
        // Get buff display
        const buffDisplay = this.buildBuffDisplay(combat);
        
        // Get potion cooldown display
        const potionStatus = this.buildPotionStatus(combat);
        
        // Combat log
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
    
    /**
     * Build buff display HTML
     * @param {Object} combat - Combat state
     * @returns {string} HTML string for buff display
     */
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
    
    /**
     * Build potion status HTML
     * @param {Object} combat - Combat state
     * @returns {string} HTML string for potion status
     */
    buildPotionStatus(combat) {
        if (combat.potionCooldown > 0) {
            return `<span style="color: #ff6666;">(Cooldown: ${Math.ceil(combat.potionCooldown / 1000)}s)</span>`;
        }
        return `<span style="color: #66ff66;">(Ready!)</span>`;
    }
    
    /**
     * Setup event listeners for combat buttons
     * @param {Function} onUsePotion - Callback for use potion button
     * @param {Function} onDrinkBuff - Callback for drink buff button
     * @param {Function} onRemoveBuff - Callback for remove buff button
     */
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
