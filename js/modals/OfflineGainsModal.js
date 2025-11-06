// OfflineGainsModal - Displays offline training rewards when player returns
// Extends BaseModal to show experience and resources gained while away

class OfflineGainsModal extends BaseModal {
    constructor() {
        super();
    }

    /**
     * Show offline training gains report
     * @param {string} skillName - Name of the skill trained offline
     * @param {string} timeOffline - Formatted time away (e.g., "2h 15m")
     * @param {number} expGained - Total experience gained
     * @param {number} oldLevel - Level before offline training
     * @param {number} newLevel - Level after offline training
     * @param {number} levelsGained - Number of levels gained (can be 0)
     * @param {Object} resourcesGathered - Resources collected {type: {name, amount}}
     * @param {Function} onClose - Callback when modal is closed
     */
    showOfflineGains(skillName, timeOffline, expGained, oldLevel, newLevel, levelsGained, resourcesGathered, onClose) {
        const levelUpText = levelsGained > 0 
            ? `<p style="color: #ffff00; margin-top: 15px;">🎉 LEVEL UP! ${oldLevel} → ${newLevel} (+${levelsGained} levels)</p>`
            : '';
        
        // Format resources gathered
        let resourcesText = '';
        if (resourcesGathered && Object.keys(resourcesGathered).length > 0) {
            resourcesText = '<br><div class="offline-stats"><p>📦 Resources Gathered:</p>';
            for (const [type, data] of Object.entries(resourcesGathered)) {
                resourcesText += `<p style="margin-left: 15px;">• ${data.name}: <span style="color: var(--color-primary);">+${data.amount}</span></p>`;
            }
            resourcesText += '</div>';
        }

        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container modal-offline">
                    <div class="modal-header">
                        <span class="modal-title">⏰ OFFLINE TRAINING REPORT</span>
                    </div>
                    <div class="modal-content">
                        <p style="color: #ffff00; font-size: 12px; margin-bottom: 20px;">Welcome back!</p>
                        <p>You were away for: <span style="color: var(--color-primary);">${timeOffline}</span></p>
                        <br>
                        <p>Your character continued training:</p>
                        <p style="color: #ffff00; margin-top: 5px;">${skillName}</p>
                        <br>
                        <div class="offline-stats">
                            <p>⚡ EXP Gained: <span style="color: var(--color-primary);">+${expGained.toLocaleString()}</span></p>
                            <p style="font-size: 8px; color: #888; margin-top: 5px;">(at 80% efficiency)</p>
                        </div>
                        ${levelUpText}
                        ${resourcesText}
                        <br>
                        <p style="font-size: 8px; color: #888; margin-top: 15px;">Offline training continues while you're away!</p>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm" id="modal-ok-btn">
                            <span class="btn-cursor">></span> Continue Adventure
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);
        
        this.setupModalEvents({
            confirmBtnId: 'modal-ok-btn',
            onConfirm: onClose,
            closeOnOverlayClick: false, // Force user to acknowledge
            closeOnEscape: true,
            focusElementId: 'modal-ok-btn'
        });
    }
}
