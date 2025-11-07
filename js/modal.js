// Modal Manager - Handles custom modal dialogs in terminal style
// Replaces native browser prompts with styled modals
// Now delegates to specialized modal classes for better organization

class ModalManager {
    constructor() {
        this.currentModal = null;
        this.gameState = null; // Will be set by game.js
        
        // Initialize specialized modal handlers
        this.confirmationModal = new ConfirmationModal();
        this.inventoryModal = new InventoryModal();
        this.potionModal = new PotionModal();
        this.equipmentShopModal = new EquipmentShopModal(this);
        this.offlineGainsModal = new OfflineGainsModal();
    }

    /**
     * Set the game state reference
     * @param {Object} gameState - Game state instance
     */
    setGameState(gameState) {
        this.gameState = gameState;
    }

    /**
     * Show a simple message (success or error)
     * @param {string} message - Message to show
     * @param {string} type - 'success' or 'error'
     */
    showMessage(message, type = 'info') {
        this.showAlert(type === 'error' ? 'Error' : 'Success', message);
    }

    /**
     * Show a confirmation modal
     * @param {string} title - The modal title
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when cancelled (optional)
     */
    showConfirmation(title, message, onConfirm, onCancel) {
        // Delegate to ConfirmationModal
        this.currentModal = this.confirmationModal.getCurrentModal();
        return this.confirmationModal.showConfirmation(title, message, onConfirm, onCancel);
    }

    /**
     * Show an alert modal (information only)
     * @param {string} title - The modal title
     * @param {string} message - The alert message
     * @param {Function} onClose - Callback when closed (optional)
     */
    showAlert(title, message, onClose) {
        // Delegate to ConfirmationModal
        this.currentModal = this.confirmationModal.getCurrentModal();
        return this.confirmationModal.showAlert(title, message, onClose);
    }
    
    /**
     * Show offline training gains modal
     * @param {string} skillName - Name of the skill trained
     * @param {string} timeOffline - Formatted time offline
     * @param {number} expGained - Total experience gained
     * @param {number} oldLevel - Level before offline training
     * @param {number} newLevel - Level after offline training
     * @param {number} levelsGained - Number of levels gained
     * @param {Function} onClose - Callback when closed
     */
    showOfflineGains(skillName, timeOffline, expGained, oldLevel, newLevel, levelsGained, resourcesGathered, onClose) {
        // Delegate to OfflineGainsModal
        this.currentModal = this.offlineGainsModal.getCurrentModal();
        return this.offlineGainsModal.showOfflineGains(skillName, timeOffline, expGained, oldLevel, newLevel, levelsGained, resourcesGathered, onClose);
    }

    /**
     * Show the inventory modal
     * @param {Object} resourcesData - The player's resources
     * @param {Object} currency - The player's currency (gold, etc.)
     */
    showInventory(resourcesData, currency = null) {
        // Delegate to InventoryModal
        this.currentModal = this.inventoryModal.getCurrentModal();
        return this.inventoryModal.showInventory(resourcesData, currency);
    }

    /**
     * Show the equipment shop modal
     */
    showEquipmentShop() {
        this.currentModal = this.equipmentShopModal.modalId;
        this.equipmentShopModal.show();
    }

    /**
     * Show the shop modal
     * @param {Object} gameState - Current game state
     * @param {Function} onPurchase - Callback when charm is purchased
     */
    showShop(gameState, onPurchase) {
        // Remove any existing modal
        this.closeModal();
        
        // Filter skills based on current activity
        let skills = ['mining', 'woodcutting', 'chemistry'];
        if (gameState.currentActivity) {
            // Only show charms for the currently training skill
            skills = [gameState.currentActivity];
        }
        
        let shopHTML = '';
        
        for (const skill of skills) {
            const charms = charmsManager.getCharmsForSkill(skill);
            const skillData = gameState.skills[skill];
            
            shopHTML += `<div class="shop-category">`;
            shopHTML += `<h3 style="color: var(--color-primary); margin-bottom: 15px; text-transform: capitalize;">${skillData.name} Charms</h3>`;
            
            charms.forEach(charm => {
                const owned = gameState.upgrades.includes(charm.key);
                const canAfford = charmsManager.canAfford(charm.key, gameState.resources);
                const meetsLevel = charmsManager.meetsLevelRequirement(charm.key, skillData.level);
                const hasPrereqs = charmsManager.hasPrerequisites(charm.key, gameState.upgrades);
                
                const canBuy = !owned && canAfford && meetsLevel && hasPrereqs;
                const costStr = charmsManager.formatCost(charm.cost);
                
                let statusText = '';
                let statusColor = '';
                if (owned) {
                    statusText = 'OWNED';
                    statusColor = '#ffff00';
                } else if (!meetsLevel) {
                    statusText = `REQUIRES LVL ${charm.requiredLevel}`;
                    statusColor = '#ff6666';
                } else if (!hasPrereqs) {
                    statusText = 'LOCKED';
                    statusColor = '#ff6666';
                } else if (!canAfford) {
                    statusText = 'CANNOT AFFORD';
                    statusColor = '#ff9999';
                } else {
                    statusText = 'AVAILABLE';
                    statusColor = 'var(--color-primary)';
                }
                
                const bonusPercent = Math.round(charm.bonus * 100);
                
                shopHTML += `
                    <div class="shop-item ${owned ? 'owned' : ''} ${canBuy ? 'can-buy' : ''}">
                        <div class="shop-item-header">
                            <strong>${charm.name}</strong>
                            <span style="color: ${statusColor}; font-size: 8px;">${statusText}</span>
                        </div>
                        <p style="font-size: 8px; color: #999; margin: 5px 0;">${charm.description}</p>
                        <p style="font-size: 9px; margin: 5px 0;">Bonus: <span style="color: var(--color-primary);">+${bonusPercent}% EXP</span></p>
                        <p style="font-size: 8px; margin: 5px 0;">Cost: <span style="color: #ffff00;">${costStr}</span></p>
                        ${canBuy ? `<button class="shop-buy-btn" data-charm="${charm.key}">Purchase</button>` : ''}
                    </div>
                `;
            });
            
            shopHTML += '</div><br>';
        }
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>> CHARM SHOP</h2>
                    </div>
                    <div class="modal-content" style="max-height: 500px; overflow-y: auto;">
                        <p style="margin-bottom: 20px; font-size: 9px;">Purchase charms to boost your training efficiency!</p>
                        ${shopHTML}
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-shop-close-btn" class="modal-btn modal-btn-ok">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);

        // Set up purchase button listeners
        const buyButtons = document.querySelectorAll('.shop-buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const charmKey = btn.getAttribute('data-charm');
                if (onPurchase) {
                    onPurchase(charmKey);
                }
            });
        });

        // Close button
        const closeBtn = document.getElementById('modal-shop-close-btn');
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close on overlay click
        const overlay = this.currentModal;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the close button
        closeBtn.focus();
        
        // Store callback for refresh
        this.currentShopCallback = onPurchase;
    }
    
    /**
     * Refresh the shop content without closing the modal
     * @param {Object} gameState - Current game state
     */
    refreshShop(gameState) {
        if (!this.currentModal) return;
        
        const contentDiv = this.currentModal.querySelector('.modal-content');
        if (!contentDiv) return;
        
        // Filter skills based on current activity
        let skills = ['mining', 'woodcutting', 'chemistry'];
        if (gameState.currentActivity) {
            skills = [gameState.currentActivity];
        }
        
        let shopHTML = '<p style="margin-bottom: 20px; font-size: 9px;">Purchase charms to boost your training efficiency!</p>';
        
        for (const skill of skills) {
            const charms = charmsManager.getCharmsForSkill(skill);
            const skillData = gameState.skills[skill];
            
            shopHTML += `<div class="shop-category">`;
            shopHTML += `<h3 style="color: var(--color-primary); margin-bottom: 15px; text-transform: capitalize;">${skillData.name} Charms</h3>`;
            
            charms.forEach(charm => {
                const owned = gameState.upgrades.includes(charm.key);
                const canAfford = charmsManager.canAfford(charm.key, gameState.resources);
                const meetsLevel = charmsManager.meetsLevelRequirement(charm.key, skillData.level);
                const hasPrereqs = charmsManager.hasPrerequisites(charm.key, gameState.upgrades);
                
                const canBuy = !owned && canAfford && meetsLevel && hasPrereqs;
                const costStr = charmsManager.formatCost(charm.cost);
                
                let statusText = '';
                let statusColor = '';
                if (owned) {
                    statusText = 'OWNED';
                    statusColor = '#ffff00';
                } else if (!meetsLevel) {
                    statusText = `REQUIRES LVL ${charm.requiredLevel}`;
                    statusColor = '#ff6666';
                } else if (!hasPrereqs) {
                    statusText = 'LOCKED';
                    statusColor = '#ff6666';
                } else if (!canAfford) {
                    statusText = 'CANNOT AFFORD';
                    statusColor = '#ff9999';
                } else {
                    statusText = 'AVAILABLE';
                    statusColor = 'var(--color-primary)';
                }
                
                const bonusPercent = Math.round(charm.bonus * 100);
                
                shopHTML += `
                    <div class="shop-item ${owned ? 'owned' : ''} ${canBuy ? 'can-buy' : ''}">
                        <div class="shop-item-header">
                            <strong>${charm.name}</strong>
                            <span style="color: ${statusColor}; font-size: 8px;">${statusText}</span>
                        </div>
                        <p style="font-size: 8px; color: #999; margin: 5px 0;">${charm.description}</p>
                        <p style="font-size: 9px; margin: 5px 0;">Bonus: <span style="color: var(--color-primary);">+${bonusPercent}% EXP</span></p>
                        <p style="font-size: 8px; margin: 5px 0;">Cost: <span style="color: #ffff00;">${costStr}</span></p>
                        ${canBuy ? `<button class="shop-buy-btn" data-charm="${charm.key}">Purchase</button>` : ''}
                    </div>
                `;
            });
            
            shopHTML += '</div><br>';
        }
        
        // Update the content
        contentDiv.innerHTML = shopHTML;
        
        // Re-attach purchase button listeners
        const buyButtons = contentDiv.querySelectorAll('.shop-buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const charmKey = btn.getAttribute('data-charm');
                if (this.currentShopCallback) {
                    this.currentShopCallback(charmKey);
                }
            });
        });
    }

    /**
     * Show a theme selector modal
     * @param {Function} onThemeSelect - Callback when theme is selected
     */
    showThemeSelector(onThemeSelect) {
        const playerName = gameState.get().player?.name || null;
        const themes = themeManager.getThemes(playerName);
        const currentTheme = themeManager.getCurrentTheme();
        
        const themeButtons = Object.entries(themes).map(([key, name]) => {
            const selected = key === currentTheme ? ' (Current)' : '';
            const selectedClass = key === currentTheme ? 'selected' : '';
            return `
                <button class="modal-btn theme-btn ${selectedClass}" data-theme="${key}" style="width: 100%; margin: 5px 0;">
                    <span class="btn-cursor">></span> ${name}${selected}
                </button>
            `;
        }).join('');
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>> SELECT THEME</h2>
                    </div>
                    <div class="modal-content">
                        <p style="margin-bottom: 15px;">Choose your terminal color scheme:</p>
                        ${themeButtons}
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-theme-close-btn" class="modal-btn modal-btn-cancel">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);

        // Remove focus from any auto-focused elements
        setTimeout(() => {
            const focused = this.currentModal.querySelector(':focus');
            if (focused) {
                focused.blur();
            }
        }, 0);

        // Set up event listeners for theme buttons
        const themeButtons_elements = document.querySelectorAll('.theme-btn');
        themeButtons_elements.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                themeManager.applyTheme(theme);
                if (onThemeSelect) onThemeSelect(theme);
                this.closeModal();
            });
        });

        // Close button
        const closeBtn = document.getElementById('modal-theme-close-btn');
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close on overlay click
        const overlay = this.currentModal;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the first theme button
        themeButtons_elements[0]?.focus();
    }

    /**
     * Show an About modal with game information
     */
    showAbout() {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>> ABOUT RUNEHTML</h2>
                    </div>
                    <div class="modal-content" style="text-align: left; max-height: 400px; overflow-y: auto;">
                        <p style="margin-bottom: 15px;">
                            <span style="color: #ffff00;">RuneHTML</span> is a retro terminal-style idle game 
                            that brings the nostalgia of classic MMORPGs to your browser.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: #33dd33;">Inspiration:</strong><br>
                            This game is heavily inspired by <span style="color: #ffff00;">RuneScape</span>, 
                            the iconic MMORPG by Jagex. The skill system, leveling curve (1-99), 
                            and various mechanics pay homage to the classic game that defined 
                            a generation of online gaming.
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--color-primary);">Core Features:</strong><br>
                            • 6 skills to master (Melee, Defense, Ranged, Mining, Woodcutting, Chemistry)<br>
                            • 297 unique enemies across 99 combat levels per skill<br>
                            • Turn-based combat with HP, damage, and strategic potion usage<br>
                            • 9 potions: 4 healing (25-300 HP) + 4 buffs (damage/defense/elemental)<br>
                            • 60 fantasy-themed titles to unlock (10 per skill)<br>
                            • Comprehensive statistics tracking (enemies, potions, time, resources)<br>
                            • 74+ resources (8 ores, 7 logs, 9 potions, 50+ combat drops)<br>
                            • 28 charms across all skills (10%-100% EXP bonus)<br>
                            • Smart shop system that filters by active skill<br>
                            • Inventory management with combat resource categories<br>
                            • 4 customizable color themes (Green, Amber, Blue, Red)<br>
                            • Progressive content that unlocks every 10 levels<br>
                            • Offline training at 80% efficiency<br>
                            • Multiple character save slots with play time tracking<br>
                            • Stop/Start training at any time<br>
                            • Dynamic title display showing current achievement<br>
                            • Retro terminal aesthetic with CRT effects
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--color-primary);">Combat System:</strong><br>
                            • Fight 99 unique enemies per combat skill (297 total)<br>
                            • HP scales with Defense level (110-1090)<br>
                            • Strategic potion management with cooldowns<br>
                            • Buff potions last 10 battles each<br>
                            • Earn 2+ combat resources per victory<br>
                            • No harsh death penalties - soft regeneration system
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--color-primary);">Progression System:</strong><br>
                            • Gather resources while training skills<br>
                            • Defeat enemies to collect rare combat materials<br>
                            • Use resources to buy charms and equipment<br>
                            • Stack bonuses for massive EXP gains<br>
                            • Unlock better resources and equipment at higher levels
                        </p>
                        
                        <p style="margin-bottom: 15px;">
                            <strong style="color: var(--color-primary);">Development:</strong><br>
                            Built with pure vanilla HTML, CSS, and JavaScript.<br>
                            No frameworks, no dependencies - just web fundamentals.<br>
                            Modular ES6 architecture with 18+ separate modules.
                        </p>
                        
                        <p style="margin-bottom: 10px;">
                            Created with the assistance of <span style="color: #ffff00;">Claude 3.5 Sonnet</span> 
                            by Anthropic.
                        </p>
                        
                        <p style="font-size: 8px; color: #666; margin-top: 15px;">
                            RuneScape is a trademark of Jagex Ltd.<br>
                            This is a fan project and is not affiliated with Jagex.
                        </p>
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-about-ok-btn" class="modal-btn modal-btn-ok">OK</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);

        // Set up event listeners
        const okBtn = document.getElementById('modal-about-ok-btn');
        const overlay = this.currentModal;

        okBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the OK button
        okBtn.focus();
    }
    
    /**
     * Show the statistics modal
     * @param {Object} gameState - Current game state
     */
    showStatistics(gameState) {
        const stats = statisticsManager;
        
        // Calculate statistics
        const totalLevel = stats.calculateTotalLevel(gameState.skills);
        const totalExp = stats.calculateTotalExp(gameState.skills);
        const highestSkill = stats.getHighestSkill(gameState.skills);
        const totalResources = stats.getTotalResources(gameState.resources);
        const resourcesByCategory = stats.getResourcesByCategory(gameState.resources);
        const mostGathered = stats.getMostGatheredResource(gameState.resources);
        const charmStats = stats.getCharmStats(gameState.upgrades, gameState.skills);
        const playTime = stats.formatTime(gameState.stats.playTime);
        
        // Build skill time breakdown
        let skillTimeHTML = '';
        for (const [key, skill] of Object.entries(gameState.skills)) {
            const timeMs = gameState.stats.skillTime[key] || 0;
            const timeStr = stats.formatTime(timeMs);
            const title = achievementsManager.getTitle(key, skill.level);
            const progress = achievementsManager.getAchievementProgress(key, skill.level);
            
            skillTimeHTML += `
                <div style="margin-bottom: 10px; padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong style="color: var(--color-primary);">${skill.name}</strong>
                        <span style="color: #ffff00;">Level ${skill.level}</span>
                    </div>
                    <div style="font-size: 8px; color: var(--color-primary-dim); margin-bottom: 3px;">
                        Title: <span style="color: #ffff00;">${title}</span>
                    </div>
                    <div style="font-size: 8px; color: #999;">
                        Time Trained: ${timeStr} | Titles: ${progress.current}/${progress.total} (${progress.percentage}%)
                    </div>
                    ${charmStats.bySkill[key].count > 0 ? `
                    <div style="font-size: 8px; color: var(--color-primary-dim); margin-top: 3px;">
                        Charms: ${charmStats.bySkill[key].count} (+${charmStats.bySkill[key].bonus}% EXP)
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2>> STATISTICS & ACHIEVEMENTS</h2>
                    </div>
                    <div class="modal-content" style="text-align: left; max-height: 500px; overflow-y: auto;">
                        <h3 style="color: var(--color-primary); margin-bottom: 10px;">General Statistics</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Level</div>
                                <div style="font-size: 12px; color: #ffff00;">${totalLevel} / 594</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Experience</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(totalExp)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Play Time</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${playTime}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Actions</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(gameState.stats.totalActions)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Highest Skill</div>
                                <div style="font-size: 12px; color: #ffff00;">${highestSkill.name} (${highestSkill.level})</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Charms</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${charmStats.total} / 28</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid #ffd700; background: rgba(255,215,0,0.1);">
                                <div style="font-size: 8px; color: #999;">💰 Total Gold Earned</div>
                                <div style="font-size: 12px; color: #ffd700;">${stats.formatNumber(gameState.statistics?.totalGoldEarned || 0)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid #ffd700; background: rgba(255,215,0,0.1);">
                                <div style="font-size: 8px; color: #999;">💰 Current Gold</div>
                                <div style="font-size: 12px; color: #ffd700;">${stats.formatNumber(gameState.currency?.gold || 0)}</div>
                            </div>
                        </div>
                        
                        <h3 style="color: var(--color-primary); margin-bottom: 10px; margin-top: 15px;">Resources Gathered</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Resources</div>
                                <div style="font-size: 12px; color: #ffff00;">${stats.formatNumber(totalResources)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Ores Mined</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(resourcesByCategory.ores.count)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Logs Chopped</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(resourcesByCategory.logs.count)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Potions Brewed</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(resourcesByCategory.potions.count)}</div>
                            </div>
                        </div>
                        ${mostGathered.amount > 0 ? `
                        <div style="padding: 8px; border: 1px solid #ffff00; background: rgba(255,255,0,0.1); margin-bottom: 15px;">
                            <div style="font-size: 8px; color: #999;">Most Gathered Resource</div>
                            <div style="font-size: 12px; color: #ffff00;">${mostGathered.name} (${stats.formatNumber(mostGathered.amount)})</div>
                        </div>
                        ` : ''}
                        
                        ${gameState.statistics && gameState.statistics.enemiesDefeated > 0 ? `
                        <h3 style="color: var(--color-primary); margin-bottom: 10px; margin-top: 15px;">Combat Statistics</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Total Enemies Defeated</div>
                                <div style="font-size: 12px; color: #ffff00;">${stats.formatNumber(gameState.statistics.enemiesDefeated || 0)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Melee Enemies</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(gameState.statistics.meleeEnemiesDefeated || 0)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Ranged Enemies</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(gameState.statistics.rangedEnemiesDefeated || 0)}</div>
                            </div>
                            <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                                <div style="font-size: 8px; color: #999;">Defense Enemies</div>
                                <div style="font-size: 12px; color: var(--color-primary);">${stats.formatNumber(gameState.statistics.defenseEnemiesDefeated || 0)}</div>
                            </div>
                        </div>
                        <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3); margin-bottom: 15px;">
                            <div style="font-size: 8px; color: #999;">Potions Consumed in Combat</div>
                            <div style="font-size: 12px; color: #ffaa00;">${stats.formatNumber(gameState.statistics.potionsUsed || 0)}</div>
                        </div>
                        ` : ''}
                        
                        <h3 style="color: var(--color-primary); margin-bottom: 10px; margin-top: 15px;">Skills & Achievements</h3>
                        ${skillTimeHTML}
                        
                        <h3 style="color: var(--color-primary); margin-bottom: 10px; margin-top: 15px;">Equipment</h3>
                        ${this.generateEquipmentSection(gameState)}
                    </div>
                    <div class="modal-buttons">
                        <button id="modal-stats-ok-btn" class="modal-btn modal-btn-ok">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);

        // Set up event listeners
        const okBtn = document.getElementById('modal-stats-ok-btn');
        const overlay = this.currentModal;

        okBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the OK button
        okBtn.focus();
    }

    /**
     * Generate equipment section for statistics modal
     * @param {Object} gameState - Current game state
     * @returns {string} - HTML for equipment section
     */
    generateEquipmentSection(gameState) {
        const equippedItems = gameState.equipment?.equipped || {};
        const equipmentBonuses = equipment.calculateTotalBonuses(equippedItems);
        
        let equipmentHTML = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">';
        
        // Show equipped items
        const slots = ['weapon', 'offhand', 'helmet', 'body', 'legs'];
        slots.forEach(slot => {
            const item = equippedItems[slot];
            const slotName = slot === 'offhand' ? 'Shield' : this.capitalize(slot);
            
            equipmentHTML += `
                <div style="padding: 8px; border: 1px solid var(--color-primary-dim); background: rgba(0,0,0,0.3);">
                    <div style="font-size: 8px; color: #999;">${slotName}</div>
                    <div style="font-size: 12px; color: var(--color-primary);">
                        ${item ? item.name : 'None equipped'}
                    </div>
                    ${item ? `<div style="font-size: 8px; color: var(--color-primary-dim);">${this.generateBonusText(item.bonuses)}</div>` : ''}
                </div>
            `;
        });
        
        equipmentHTML += '</div>';
        
        // Show total bonuses if any equipment is equipped
        const hasEquipment = Object.values(equippedItems).some(item => item !== null);
        if (hasEquipment) {
            equipmentHTML += `
                <div style="padding: 8px; border: 1px solid #ffff00; background: rgba(255,255,0,0.1); margin-bottom: 15px;">
                    <div style="font-size: 8px; color: #999;">Total Equipment Bonuses</div>
                    <div style="font-size: 12px; color: #ffff00;">${this.generateBonusText(equipmentBonuses)}</div>
                </div>
            `;
        }
        
        return equipmentHTML;
    }

    /**
     * Generate bonus text from bonuses object
     * @param {Object} bonuses - Bonuses object
     * @returns {string} - Formatted bonus text
     */
    generateBonusText(bonuses) {
        const bonusEntries = Object.entries(bonuses)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => `+${value} ${this.capitalize(key)}`);
        
        return bonusEntries.length > 0 ? bonusEntries.join(', ') : 'No bonuses';
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Show healing potion selection modal (in-combat)
     */
    showHealingPotions() {
        // Delegate to PotionModal
        this.currentModal = this.potionModal.getCurrentModal();
        return this.potionModal.showHealingPotions();
    }

    /**
     * Show buff potion selection modal (pre-combat)
     */
    showBuffPotions() {
        // Delegate to PotionModal
        this.currentModal = this.potionModal.getCurrentModal();
        return this.potionModal.showBuffPotions();
    }

    /**
     * Close the current modal
     */
    closeModal() {
        // Close all specialized modals
        this.confirmationModal.closeModal();
        this.inventoryModal.closeModal();
        this.potionModal.closeModal();
        this.offlineGainsModal.closeModal();
        
        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }
}

// Export the modal manager
const modalManager = new ModalManager();

