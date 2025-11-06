// ConfirmationModal - Handles confirmation and alert dialogs
// Extends BaseModal to provide Yes/No confirmations and OK-only alerts

class ConfirmationModal extends BaseModal {
    constructor() {
        super();
    }

    /**
     * Show a confirmation modal with Yes/No buttons
     * @param {string} title - The modal title
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Callback when user clicks Yes
     * @param {Function} onCancel - Callback when user clicks No or closes (optional)
     */
    showConfirmation(title, message, onConfirm, onCancel) {
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

        this.showModal(modalHTML);
        
        this.setupModalEvents({
            confirmBtnId: 'modal-confirm-btn',
            cancelBtnId: 'modal-cancel-btn',
            onConfirm: onConfirm,
            onCancel: onCancel,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            focusElementId: 'modal-cancel-btn' // Focus No button by default for safety
        });
    }

    /**
     * Show an alert modal with just an OK button
     * @param {string} title - The modal title
     * @param {string} message - The alert message
     * @param {Function} onClose - Callback when user closes the modal (optional)
     */
    showAlert(title, message, onClose) {
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

        this.showModal(modalHTML);
        
        this.setupModalEvents({
            confirmBtnId: 'modal-ok-btn',
            onConfirm: onClose,
            onClose: onClose,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            focusElementId: 'modal-ok-btn'
        });
    }
}
