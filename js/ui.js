// UI Manager - Handles all DOM manipulation and screen transitions
// This module manages the visual interface of the game

class UIManager {
    constructor() {
        // Cache DOM elements for better performance
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            gameArea: document.getElementById('game-area'),
            logo: document.querySelector('.logo')
        };
        
        // Initialize specialized renderers
        this.skillCardRenderer = new SkillCardRenderer();
        this.combatDisplayRenderer = new CombatDisplayRenderer();
        this.animationRenderer = new AnimationRenderer();
    }

    /**
     * Hide the main menu and logo
     * Used when transitioning to game screen
     */
    hideMainMenu() {
        this.elements.mainMenu.style.display = 'none';
        this.elements.logo.style.display = 'none';
    }

    /**
     * Show the main menu and logo
     * Used when returning to the main menu
     */
    showMainMenu() {
        this.elements.mainMenu.style.display = 'block';
        this.elements.logo.style.display = 'block';
        this.elements.gameArea.style.display = 'none';
        
        // Update the load game button state
        if (window.game) {
            window.game.updateLoadGameButton();
        }
    }

    /**
     * Show the game area and hide the menu
     * @param {string} content - HTML content to display in the game area
     */
    showGameArea(content) {
        this.hideMainMenu();
        this.elements.gameArea.style.display = 'block';
        this.elements.gameArea.innerHTML = content;
    }

    /**
     * Display the username input screen
     * @param {Function} onSubmit - Callback function when username is submitted
     */
    showUsernameScreen(onSubmit) {
        const content = `
            <div class="game-message">
                <p>> CREATE CHARACTER</p>
                <br>
                <p>Enter your username:</p>
                <br>
                <div class="username-input-container">
                    <input type="text" id="username-input" maxlength="20" placeholder="Enter username..." autocomplete="off">
                    <button id="random-username-btn" class="dice-button" title="Generate random username">🎲</button>
                </div>
                <br>
                <p id="username-error" style="color: #ff0000; display: none;">Username is required!</p>
                <br>
                <div class="button-group">
                    <button id="create-character-btn" class="action-button">Create Character</button>
                    <button id="back-to-menu-username" class="action-button action-button-secondary">Back to Menu</button>
                </div>
            </div>
        `;
        this.showGameArea(content);
        
        // Set up event listeners
        const input = document.getElementById('username-input');
        const randomBtn = document.getElementById('random-username-btn');
        const createBtn = document.getElementById('create-character-btn');
        const error = document.getElementById('username-error');
        
        // Focus input
        input.focus();
        
        // Random username generator
        randomBtn.addEventListener('click', () => {
            input.value = usernameGenerator.generate();
            error.style.display = 'none';
        });
        
        // Create character
        const submitUsername = () => {
            const username = input.value.trim();
            if (!username) {
                error.style.display = 'block';
                input.focus();
                return;
            }
            onSubmit(username);
        };
        
        createBtn.addEventListener('click', submitUsername);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitUsername();
        });
        
        // Back to menu button
        const backBtn = document.getElementById('back-to-menu-username');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }
    }

    /**
     * Display the main game screen with skills
     * @param {Object} gameState - Current game state
     */
    showGameScreen(gameState) {
        // Use SkillCardRenderer for skills HTML
        const skillsHTML = this.skillCardRenderer.renderSkillCards(gameState.skills);
        
        const content = `
            <div class="game-container">
                <div class="game-header">
                    <div class="header-left">
                        <h2>> ${gameState.player.name}'s Adventure <span id="player-title" style="color: var(--color-primary-dim); font-size: 10px;"></span></h2>
                    </div>
                    <div class="header-right">
                        <button id="hamburger-menu" class="hamburger-button" title="Menu">☰</button>
                        <div id="dropdown-menu" class="dropdown-menu">
                            <button id="stats-button" class="menu-item-btn">📊 Stats</button>
                            <button id="shop-button" class="menu-item-btn">🛒 Shop</button>
                            <button id="inventory-button" class="menu-item-btn">📦 Inventory</button>
                            <button id="theme-button" class="menu-item-btn">🎨 Theme</button>
                            <button id="save-button" class="menu-item-btn">💾 Save Game</button>
                            <button id="menu-button" class="menu-item-btn">🏠 Main Menu</button>
                        </div>
                    </div>
                </div>
                <br>
                <div class="animation-area" id="animation-area">
                    <div class="idle-character">
                        <pre class="stick-figure">
  O
 /|\\
 / \\
                        </pre>
                        <p class="activity-text">Idle</p>
                    </div>
                </div>
                <br>
                <div class="skills-grid">
                    ${skillsHTML}
                </div>
            </div>
        `;
        this.showGameArea(content);
    }

    /**
     * Update the animation area with skill-specific animation or combat
     * @param {string} skillKey - The skill being trained
     * @param {number} level - The current skill level
     */
    updateAnimation(skillKey, level) {
        const animationArea = document.getElementById('animation-area');
        if (!animationArea) return;
        
        // Check if this is a combat skill and if combat is active
        if (combatManager && combatManager.isCombatSkill(skillKey)) {
            this.updateCombatDisplay();
            return;
        }
        
        // Delegate to AnimationRenderer
        this.animationRenderer.render(animationArea, skillKey, level);
    }
    
    /**
     * Update the combat display in the animation area
     */
    updateCombatDisplay() {
        const animationArea = document.getElementById('animation-area');
        if (!animationArea) return;
        
        const combat = gameState.get().combat;
        
        // Delegate to CombatDisplayRenderer
        this.combatDisplayRenderer.render(animationArea, combat);
        
        // Setup event listeners for combat buttons
        this.setupCombatButtons();
    }
    
    /**
     * Setup event listeners for combat buttons
     */
    setupCombatButtons() {
        this.combatDisplayRenderer.setupEventListeners(
            // onUsePotion
            () => {
                modalManager.showHealingPotions();
            },
            // onDrinkBuff
            () => {
                modalManager.showBuffPotions();
            },
            // onRemoveBuff
            () => {
                const result = combatManager.removeActiveBuff();
                // Show notification or update UI
                this.updateCombatDisplay();
            }
        );
    }
    
    /**
     * Update the player's title based on current skill
     * @param {string} skillKey - The skill being trained
     * @param {number} level - Current level in the skill
     */
    updatePlayerTitle(skillKey, level) {
        const titleElement = document.getElementById('player-title');
        if (!titleElement) return;
        
        if (skillKey && level) {
            const title = achievementsManager.getTitle(skillKey, level);
            titleElement.textContent = `[${title}]`;
        } else {
            titleElement.textContent = '';
        }
    }
    
    /**
     * Update skill cards with current levels and experience
     * @param {Object} skills - Skills object from game state
     */
    updateSkillCards(skills) {
        // Delegate to SkillCardRenderer
        this.skillCardRenderer.updateSkillCards(skills);
    }

    /**
     * Display the game screen with saved game data
     * @param {Object} gameState - The loaded game state
     */
    showLoadedGameScreen(gameState) {
        const content = `
            <div class="game-message">
                <p>> Loading saved game...</p>
                <br>
                <p>> Welcome back, ${gameState.player.name}!</p>
                <br>
                <p>> Level: ${gameState.player.level}</p>
                <br><br>
                <p style="color: #ffff00;">[Game will resume here]</p>
            </div>
        `;
        this.showGameArea(content);
    }

    /**
     * Display the save selection screen
     * @param {Array} saves - Array of save objects
     * @param {Function} onSelect - Callback when a save is selected
     * @param {Function} onBack - Callback when back button is pressed
     */
    showSaveSelectionScreen(saves, onSelect, onBack) {
        if (saves.length === 0) {
            this.showNoSaveError(onBack);
            return;
        }
        
        const savesHTML = saves.map((save, index) => {
            const createdDate = new Date(save.created).toLocaleDateString();
            const lastPlayedDate = new Date(save.lastPlayed).toLocaleDateString();
            
            // Ensure playTime is a number and format it properly
            const playTimeMs = Number(save.playTime) || 0;
            const playTimeHours = Math.floor(playTimeMs / 3600000);
            const playTimeMinutes = Math.floor((playTimeMs % 3600000) / 60000);
            const playTimeSeconds = Math.floor((playTimeMs % 60000) / 1000);
            
            // Format play time string - show hours if > 0, always show minutes and seconds
            let playTimeStr = '';
            if (playTimeHours > 0) {
                playTimeStr = `${playTimeHours}h ${playTimeMinutes}m`;
            } else if (playTimeMinutes > 0) {
                playTimeStr = `${playTimeMinutes}m ${playTimeSeconds}s`;
            } else {
                playTimeStr = `${playTimeSeconds}s`;
            }
            
            return `
                <div class="save-card" data-uuid="${save.uuid}">
                    <div class="save-header">
                        <span class="save-number">[${index + 1}]</span>
                        <span class="save-name">${save.playerName}</span>
                        <button class="delete-save-btn" data-uuid="${save.uuid}" title="Delete Save">🗑️</button>
                    </div>
                    <div class="save-info">
                        <p>Total Level: <span style="color: #ffff00;">${save.totalLevel}</span></p>
                        <p>Created: ${createdDate}</p>
                        <p>Last Played: ${lastPlayedDate}</p>
                        <p>Play Time: ${playTimeStr}</p>
                    </div>
                    <button class="load-save-btn" data-uuid="${save.uuid}">Load Game</button>
                </div>
            `;
        }).join('');
        
        const content = `
            <div class="game-message">
                <h2>> SELECT SAVE FILE</h2>
                <br>
                <div class="saves-container">
                    ${savesHTML}
                </div>
                <br>
                <button id="back-to-menu-btn" class="action-button">Back to Menu</button>
            </div>
        `;
        
        this.showGameArea(content);
        
        // Set up event listeners for load buttons
        const loadButtons = document.querySelectorAll('.load-save-btn');
        loadButtons.forEach(button => {
            button.addEventListener('click', () => {
                const uuid = button.getAttribute('data-uuid');
                onSelect(uuid);
            });
        });
        
        // Set up event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-save-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const uuid = button.getAttribute('data-uuid');
                
                modalManager.showConfirmation(
                    'DELETE SAVE',
                    'Are you sure you want to delete this save? This action cannot be undone.',
                    () => {
                        storageAPI.deleteSave(uuid);
                        // Refresh the save list
                        const updatedSaves = storageAPI.getAllSaves();
                        
                        // If no saves left, return to main menu
                        if (updatedSaves.length === 0) {
                            this.showMainMenu();
                        } else {
                            this.showSaveSelectionScreen(updatedSaves, onSelect, onBack);
                        }
                    }
                );
            });
        });
        
        // Set up back button
        const backButton = document.getElementById('back-to-menu-btn');
        if (backButton) {
            backButton.addEventListener('click', onBack);
        }
        
        // Make save cards clickable
        const saveCards = document.querySelectorAll('.save-card');
        saveCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking delete button
                if (e.target.classList.contains('delete-save-btn')) return;
                
                const uuid = card.getAttribute('data-uuid');
                onSelect(uuid);
            });
        });
    }
    
    /**
     * Display an error message when no saved game is found
     * Automatically returns to menu after a delay
     * @param {Function} callback - Function to call after timeout
     */
    showNoSaveError(callback) {
        const content = `
            <div class="game-message">
                <p style="color: #ff0000;">> ERROR: No saved game found!</p>
                <br><br>
                <p>> Returning to menu...</p>
            </div>
        `;
        this.showGameArea(content);

        // Return to menu after 2 seconds
        setTimeout(() => {
            this.showMainMenu();
            if (callback) callback();
        }, 2000);
    }

    /**
     * Show offline gains modal
     * @param {string} skillName - Name of the skill
     * @param {string} timeOffline - Formatted time offline
     * @param {number} expGained - Experience gained
     * @param {number} oldLevel - Old level
     * @param {number} newLevel - New level
     * @param {number} levelsGained - Levels gained
     * @param {Function} callback - Callback when closed
     */
    showOfflineGainsModal(skillName, timeOffline, expGained, oldLevel, newLevel, levelsGained, resourcesGathered, callback) {
        modalManager.showOfflineGains(
            skillName,
            timeOffline,
            expGained,
            oldLevel,
            newLevel,
            levelsGained,
            resourcesGathered,
            callback
        );
    }

    /**
     * Display a generic message in the game area
     * @param {string} message - The message to display
     * @param {string} color - Optional color for the message (hex code)
     */
    showMessage(message, color = '#33dd33') {
        const content = `
            <div class="game-message">
                <p style="color: ${color};">${message}</p>
            </div>
        `;
        this.showGameArea(content);
    }
}

// Export the UI manager
const uiManager = new UIManager();
