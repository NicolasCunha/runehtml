// Combat Manager - Handles all combat mechanics
// Turn-based battle system with HP, damage, potions, and buffs

class CombatManager {
    constructor(gameState, skillsSystem, upgradesManager, game) {
        this.state = gameState;
        this.skills = skillsSystem;
        this.upgrades = upgradesManager;
        this.game = game;
        this.potionCooldownDuration = 10000; // 10 seconds in milliseconds
    }

    /**
     * Check if a skill is a combat skill
     * @param {string} skill - Skill key
     * @returns {boolean}
     */
    isCombatSkill(skill) {
        return ['melee', 'ranged', 'defense'].includes(skill);
    }

    /**
     * Start a new combat encounter
     * @param {string} skill - Combat skill (melee, ranged, defense)
     */
    startCombat(skill) {
        const playerLevel = this.state.get().skills[skill].level;
        const enemy = enemiesManager.getRandomEnemy(skill, playerLevel);
        
        if (!enemy) {
            console.error(`No enemy found for ${skill} at level ${playerLevel}`);
            return false;
        }

        // Calculate max HP values
        const playerMaxHP = this.calculatePlayerMaxHP();
        const enemyMaxHP = enemiesManager.calculateEnemyHP(enemy.level);

        // Initialize combat state
        this.state.update('combat', {
            inCombat: true,
            skill: skill,
            currentEnemy: {
                name: enemy.name,
                level: enemy.level,
                maxHP: enemyMaxHP,
                currentHP: enemyMaxHP,
                drops: enemy.drops
            },
            playerMaxHP: playerMaxHP,
            playerCurrentHP: playerMaxHP,
            combatLog: [`You encounter a ${enemy.name} (Level ${enemy.level})!`],
            turn: 'player' // Player always goes first
        });

        return true;
    }

    /**
     * Process a single combat turn
     * Alternates between player and enemy attacks
     */
    processCombatTurn() {
        const combat = this.state.get().combat;
        
        if (!combat.inCombat) return;

        // Update potion cooldown
        if (combat.potionCooldown > 0) {
            const newCooldown = Math.max(0, combat.potionCooldown - 1000); // Decrease by 1 second
            this.state.update('combat.potionCooldown', newCooldown);
        }

        // Player's turn
        if (combat.turn === 'player') {
            const damage = this.calculatePlayerDamage();
            const newEnemyHP = Math.max(0, combat.currentEnemy.currentHP - damage);
            
            // Add to combat log
            this.addToCombatLog(`You hit ${combat.currentEnemy.name} for ${damage} damage`);

            // Update enemy with new HP
            const updatedEnemy = {
                ...combat.currentEnemy,
                currentHP: newEnemyHP
            };
            this.state.update('combat.currentEnemy', updatedEnemy);

            // Check if enemy defeated
            if (newEnemyHP <= 0) {
                this.handleVictory();
                return;
            }

            // Switch to enemy turn
            this.state.update('combat.turn', 'enemy');
        }
        // Enemy's turn
        else {
            const damage = this.calculateEnemyDamage();
            const newPlayerHP = Math.max(0, combat.playerCurrentHP - damage);
            
            // Add to combat log
            this.addToCombatLog(`${combat.currentEnemy.name} hits you for ${damage} damage`);

            // Update player HP
            this.state.update('combat.playerCurrentHP', newPlayerHP);

            // Check if player defeated
            if (newPlayerHP <= 0) {
                this.handleDefeat();
                return;
            }

            // Switch to player turn
            this.state.update('combat.turn', 'player');
        }
    }

    /**
     * Calculate player damage
     * @returns {number} - Damage dealt
     */
    calculatePlayerDamage() {
        const combat = this.state.get().combat;
        const attackSkill = combat.skill === 'defense' ? 'melee' : combat.skill;
        const attackLevel = this.state.get().skills[attackSkill].level;
        
        // Base damage
        let baseDamage = 10 + (attackLevel * 0.5);
        
        // Weapon bonus from upgrades
        const weaponBonus = this.upgrades.getTotalBonus(attackSkill, this.state.get().upgrades) / 100;
        baseDamage *= (1 + weaponBonus);
        
        // Active buff bonuses
        if (combat.activeBuff) {
            switch (combat.activeBuff.type) {
                case 'energy':
                    baseDamage *= 1.15; // +15% damage
                    break;
                case 'fire':
                    baseDamage += Math.floor(Math.random() * 11) + 5; // +5-15 fire damage
                    break;
                case 'poison':
                    baseDamage += 5; // +5 poison damage
                    break;
            }
        }
        
        // Random variance (-3 to +3)
        const variance = Math.floor(Math.random() * 7) - 3;
        
        return Math.max(1, Math.floor(baseDamage + variance));
    }

    /**
     * Calculate enemy damage
     * @returns {number} - Damage dealt
     */
    calculateEnemyDamage() {
        const combat = this.state.get().combat;
        const enemy = combat.currentEnemy;
        const defenseLevel = this.state.get().skills.defense.level;
        
        // Base damage
        let baseDamage = 5 + (enemy.level * 0.4);
        
        // Defense reduction
        const defenseReduction = 1 - (defenseLevel * 0.003);
        baseDamage *= Math.max(0.5, defenseReduction); // Min 50% damage even at 99 defense
        
        // Armor bonus from upgrades
        const armorBonus = this.upgrades.getTotalBonus('defense', this.state.get().upgrades) / 100;
        baseDamage *= (1 - armorBonus);
        
        // Frost potion reduces enemy damage
        if (combat.activeBuff && combat.activeBuff.type === 'frost') {
            baseDamage *= 0.85; // -15% enemy damage
        }
        
        // Random variance (-2 to +2)
        const variance = Math.floor(Math.random() * 5) - 2;
        
        return Math.max(1, Math.floor(baseDamage + variance));
    }

    /**
     * Calculate player's maximum HP
     * @returns {number} - Max HP
     */
    calculatePlayerMaxHP() {
        const defenseLevel = this.state.get().skills.defense.level;
        let maxHP = 100 + (defenseLevel * 10);
        
        // Armor bonus from defense upgrades
        const armorBonus = this.upgrades.getTotalBonus('defense', this.state.get().upgrades);
        maxHP += armorBonus * 5; // Each 10% defense bonus adds 50 HP
        
        return maxHP;
    }

    /**
     * Handle victory - award EXP and resources
     */
    handleVictory() {
        const combat = this.state.get().combat;
        const enemy = combat.currentEnemy;
        
        // Calculate EXP reward
        const baseExp = enemy.level * 10;
        const bonusMultiplier = 1 + (this.upgrades.getTotalBonus(combat.skill, this.state.get().upgrades) / 100);
        const expGained = Math.floor(baseExp * bonusMultiplier);
        
        // Award EXP
        const skill = this.state.get().skills[combat.skill];
        const result = this.skills.addExp(skill, expGained);
        this.state.update(`skills.${combat.skill}`, result.skill);
        
        // Check for level up and show notification
        if (result.leveledUp) {
            const newTitle = achievementsManager.getTitle(combat.skill, result.newLevel);
            this.game.showNotification(`${result.skill.name} leveled up! Level ${result.newLevel}! [${newTitle}]`, '#ffff00');
            // Update title display
            this.game.ui.updatePlayerTitle(combat.skill, result.newLevel);
        }
        
        // Award 2 random resource drops from enemy
        const drops = enemy.drops;
        for (let i = 0; i < 2; i++) {
            const randomDrop = drops[Math.floor(Math.random() * drops.length)];
            const amount = Math.floor(Math.random() * 3) + 1; // 1-3 of each resource
            
            const currentAmount = this.state.get().resources[randomDrop] || 0;
            this.state.update(`resources.${randomDrop}`, currentAmount + amount);
            
            const displayName = combatResourcesManager.getDisplayName(randomDrop);
            this.addToCombatLog(`+${amount} ${displayName}`);
        }
        
        // Add victory message
        this.addToCombatLog(`Victory! Gained ${expGained} EXP`);
        
        // Update statistics
        const stats = this.state.get().statistics || {};
        stats.enemiesDefeated = (stats.enemiesDefeated || 0) + 1;
        stats[`${combat.skill}EnemiesDefeated`] = (stats[`${combat.skill}EnemiesDefeated`] || 0) + 1;
        this.state.update('statistics', stats);
        
        // Consume buff charge if active
        if (combat.activeBuff) {
            combat.activeBuff.battlesLeft--;
            if (combat.activeBuff.battlesLeft <= 0) {
                this.addToCombatLog(`${this.getBuffName(combat.activeBuff.type)} wore off`);
                combat.activeBuff = null;
            }
        }
        
        // Restore HP and start new combat
        const newMaxHP = this.calculatePlayerMaxHP();
        combat.playerMaxHP = newMaxHP;
        combat.playerCurrentHP = newMaxHP;
        
        // Start next battle after a brief delay (automatic)
        this.startCombat(combat.skill);
    }

    /**
     * Handle defeat - stop training and regenerate
     */
    handleDefeat() {
        const combat = this.state.get().combat;
        
        this.addToCombatLog('You have been defeated!');
        this.addToCombatLog('HP will regenerate over 30 seconds...');
        
        // End combat
        combat.inCombat = false;
        combat.playerCurrentHP = 0;
        combat.isRegenerating = true;
        combat.regenerationStartTime = Date.now();
        this.state.update('combat', combat);
        
        // UI will handle showing defeated state
        // Training will automatically stop
    }

    /**
     * Check and update HP regeneration
     * Called from game loop when not in combat
     */
    updateRegeneration() {
        const combat = this.state.get().combat;
        
        if (!combat.isRegenerating) return;
        
        const elapsed = Date.now() - combat.regenerationStartTime;
        const regenerationDuration = 30000; // 30 seconds
        
        if (elapsed >= regenerationDuration) {
            // Full regeneration complete
            combat.playerCurrentHP = combat.playerMaxHP;
            combat.isRegenerating = false;
            this.state.update('combat', combat);
        } else {
            // Gradual regeneration (1% per second)
            const regenPercent = elapsed / regenerationDuration;
            combat.playerCurrentHP = Math.floor(combat.playerMaxHP * regenPercent);
            this.state.update('combat', combat);
        }
    }

    /**
     * Use a healing potion
     * @param {string} potionType - Type of potion (basic, health, divine, life)
     * @returns {boolean} - Success
     */
    useHealingPotion(potionType) {
        const combat = this.state.get().combat;
        
        // Check if on cooldown
        if (combat.potionCooldown > 0) {
            return { success: false, message: `Potion cooldown: ${Math.ceil(combat.potionCooldown / 1000)}s` };
        }
        
        // Check if player has the potion
        const potionAmount = this.state.get().resources[potionType] || 0;
        if (potionAmount <= 0) {
            return { success: false, message: `No ${potionType} potions available` };
        }
        
        // Determine heal amount
        const healAmounts = {
            'basic': 25,
            'health': 50,
            'divine': 150,
            'life': 300
        };
        
        const healAmount = healAmounts[potionType] || 50;
        const oldHP = combat.playerCurrentHP;
        combat.playerCurrentHP = Math.min(combat.playerMaxHP, combat.playerCurrentHP + healAmount);
        const actualHeal = combat.playerCurrentHP - oldHP;
        
        // Consume potion
        this.state.update(`resources.${potionType}`, potionAmount - 1);
        
        // Set cooldown
        combat.potionCooldown = this.potionCooldownDuration;
        
        // Update statistics
        const stats = this.state.get().statistics || {};
        stats.potionsUsed = (stats.potionsUsed || 0) + 1;
        this.state.update('statistics', stats);
        
        this.addToCombatLog(`Used ${combatResourcesManager.formatResourceName(potionType)} Potion (+${actualHeal} HP)`);
        this.state.update('combat', combat);
        
        return { success: true, message: `Restored ${actualHeal} HP` };
    }

    /**
     * Drink a buff potion before combat
     * @param {string} potionType - Type of potion (energy, poison, fire, frost)
     * @returns {Object} - Result
     */
    drinkBuffPotion(potionType) {
        const combat = this.state.get().combat;
        
        // Can't change buffs during combat
        if (combat.inCombat) {
            return { success: false, message: 'Cannot change buffs during combat' };
        }
        
        // Check if player has the potion
        const potionAmount = this.state.get().resources[potionType] || 0;
        if (potionAmount <= 0) {
            return { success: false, message: `No ${potionType} potions available` };
        }
        
        // Valid buff potions
        const validBuffs = ['energy', 'poison', 'fire', 'frost'];
        if (!validBuffs.includes(potionType)) {
            return { success: false, message: 'Invalid buff potion' };
        }
        
        // Consume potion
        this.state.update(`resources.${potionType}`, potionAmount - 1);
        
        // Apply buff
        combat.activeBuff = {
            type: potionType,
            battlesLeft: 10
        };
        this.state.update('combat', combat);
        
        // Update statistics
        const stats = this.state.get().statistics || {};
        stats.potionsUsed = (stats.potionsUsed || 0) + 1;
        this.state.update('statistics', stats);
        
        return { 
            success: true, 
            message: `${this.getBuffName(potionType)} active for 10 battles!`
        };
    }

    /**
     * Remove active buff
     */
    removeActiveBuff() {
        const combat = this.state.get().combat;
        if (combat.activeBuff) {
            combat.activeBuff = null;
            this.state.update('combat', combat);
            return { success: true, message: 'Buff removed' };
        }
        return { success: false, message: 'No active buff' };
    }

    /**
     * Get user-friendly buff name
     * @param {string} type - Buff type
     * @returns {string}
     */
    getBuffName(type) {
        const names = {
            'energy': 'Energy Boost',
            'poison': 'Poison Strike',
            'fire': 'Flame Weapon',
            'frost': 'Frost Armor'
        };
        return names[type] || type;
    }

    /**
     * Get buff description
     * @param {string} type - Buff type
     * @returns {string}
     */
    getBuffDescription(type) {
        const descriptions = {
            'energy': '+15% damage',
            'poison': '+5 poison damage per hit',
            'fire': '+5-15 fire damage per hit',
            'frost': '-15% enemy damage'
        };
        return descriptions[type] || '';
    }

    /**
     * Add message to combat log (keep last 5 messages)
     * @param {string} message - Log message
     */
    addToCombatLog(message) {
        const combat = this.state.get().combat;
        combat.combatLog = combat.combatLog || [];
        combat.combatLog.push(message);
        
        // Keep only last 5 messages
        if (combat.combatLog.length > 5) {
            combat.combatLog.shift();
        }
        
        this.state.update('combat.combatLog', combat.combatLog);
    }

    /**
     * Flee from combat (emergency exit)
     */
    fleeCombat() {
        const combat = this.state.get().combat;
        
        if (!combat.inCombat) {
            return { success: false, message: 'Not in combat' };
        }
        
        this.addToCombatLog('You fled from battle!');
        combat.inCombat = false;
        this.state.update('combat', combat);
        
        return { success: true, message: 'Fled from combat' };
    }

    /**
     * Get combat state summary for UI
     * @returns {Object} - Combat state info
     */
    getCombatState() {
        return this.state.get().combat || {};
    }

    /**
     * Reset combat state (for new game or testing)
     */
    resetCombat() {
        this.state.update('combat', {
            inCombat: false,
            skill: null,
            currentEnemy: null,
            playerMaxHP: 0,
            playerCurrentHP: 0,
            combatLog: [],
            turn: 'player',
            activeBuff: null,
            potionCooldown: 0,
            isRegenerating: false,
            regenerationStartTime: 0
        });
    }
}

// Will be initialized in game.js
let combatManager = null;
