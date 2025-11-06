// Modal Manager - Handles custom modal dialogs in terminal style
// Replaces native browser prompts with styled modals

class ModalManager {
    constructor() {
        this.currentModal = null;
    }

    /**
     * Show a confirmation modal
     * @param {string} title - The modal title
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when cancelled (optional)
     */
    showConfirmation(title, message, onConfirm, onCancel) {
        // Remove any existing modal
        this.closeModal();

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">${title}</span>
                    </div>
                    <div class="modal-content">
                        <p>${message}</p>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm" id="modal-confirm-btn">
                            <span class="btn-cursor">></span> Yes
                        </button>
                        <button class="modal-btn modal-btn-cancel" id="modal-cancel-btn">
                            <span class="btn-cursor">></span> No
                        </button>
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
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const overlay = this.currentModal;

        confirmBtn.addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
                if (onCancel) onCancel();
            }
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the cancel button by default
        cancelBtn.focus();
    }

    /**
     * Show an alert modal (information only)
     * @param {string} title - The modal title
     * @param {string} message - The alert message
     * @param {Function} onClose - Callback when closed (optional)
     */
    showAlert(title, message, onClose) {
        // Remove any existing modal
        this.closeModal();

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">${title}</span>
                    </div>
                    <div class="modal-content">
                        <p>${message}</p>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm" id="modal-ok-btn">
                            <span class="btn-cursor">></span> OK
                        </button>
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
        const okBtn = document.getElementById('modal-ok-btn');
        const overlay = this.currentModal;

        okBtn.addEventListener('click', () => {
            this.closeModal();
            if (onClose) onClose();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
                if (onClose) onClose();
            }
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                if (onClose) onClose();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the OK button
        okBtn.focus();
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
    showOfflineGains(skillName, timeOffline, expGained, oldLevel, newLevel, levelsGained, onClose) {
        // Remove any existing modal
        this.closeModal();

        const levelUpText = levelsGained > 0 
            ? `<p style="color: #ffff00; margin-top: 15px;">🎉 LEVEL UP! ${oldLevel} → ${newLevel} (+${levelsGained} levels)</p>`
            : '';

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container modal-offline">
                    <div class="modal-header">
                        <span class="modal-title">⏰ OFFLINE TRAINING REPORT</span>
                    </div>
                    <div class="modal-content">
                        <p style="color: #ffff00; font-size: 12px; margin-bottom: 20px;">Welcome back!</p>
                        <p>You were away for: <span style="color: #33dd33;">${timeOffline}</span></p>
                        <br>
                        <p>Your character continued training:</p>
                        <p style="color: #ffff00; margin-top: 5px;">${skillName}</p>
                        <br>
                        <div class="offline-stats">
                            <p>⚡ EXP Gained: <span style="color: #33dd33;">+${expGained.toLocaleString()}</span></p>
                            <p style="font-size: 8px; color: #888; margin-top: 5px;">(at 80% efficiency)</p>
                        </div>
                        ${levelUpText}
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

        // Insert modal into document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);

        // Set up event listeners
        const okBtn = document.getElementById('modal-ok-btn');
        const overlay = this.currentModal;

        okBtn.addEventListener('click', () => {
            this.closeModal();
            if (onClose) onClose();
        });

        // Don't close on overlay click for this modal (force user to acknowledge)
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                if (onClose) onClose();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Focus the OK button
        okBtn.focus();
    }

    /**
     * Close the current modal
     */
    closeModal() {
        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }
}

// Export the modal manager
const modalManager = new ModalManager();
