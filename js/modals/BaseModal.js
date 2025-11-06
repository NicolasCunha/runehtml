// BaseModal - Foundation class for all modal dialogs
// Provides common functionality for creating, displaying, and closing modals

class BaseModal {
    constructor() {
        this.currentModal = null;
        this.escapeHandler = null;
    }

    /**
     * Create and display a modal with the given HTML content
     * @param {string} modalHTML - The complete HTML for the modal
     * @returns {HTMLElement} The modal element
     */
    showModal(modalHTML) {
        // Remove any existing modal first
        this.closeModal();

        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        
        // Add to document
        document.body.appendChild(this.currentModal);
        
        return this.currentModal;
    }

    /**
     * Setup standard modal event listeners
     * @param {Object} options - Configuration object
     * @param {string} options.confirmBtnId - ID of confirm button (optional)
     * @param {string} options.cancelBtnId - ID of cancel button (optional)
     * @param {string} options.closeBtnId - ID of close button (optional)
     * @param {Function} options.onConfirm - Callback for confirm action
     * @param {Function} options.onCancel - Callback for cancel action
     * @param {Function} options.onClose - Callback for close action
     * @param {boolean} options.closeOnOverlayClick - Whether to close on overlay click (default: true)
     * @param {boolean} options.closeOnEscape - Whether to close on Escape key (default: true)
     * @param {string} options.focusElementId - ID of element to focus (optional)
     */
    setupModalEvents(options = {}) {
        const {
            confirmBtnId,
            cancelBtnId,
            closeBtnId,
            onConfirm,
            onCancel,
            onClose,
            closeOnOverlayClick = true,
            closeOnEscape = true,
            focusElementId
        } = options;

        // Setup confirm button
        if (confirmBtnId) {
            const confirmBtn = document.getElementById(confirmBtnId);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onConfirm) onConfirm();
                });
            }
        }

        // Setup cancel button
        if (cancelBtnId) {
            const cancelBtn = document.getElementById(cancelBtnId);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onCancel) onCancel();
                });
            }
        }

        // Setup close button
        if (closeBtnId) {
            const closeBtn = document.getElementById(closeBtnId);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onClose) onClose();
                });
            }
        }

        // Setup overlay click to close
        if (closeOnOverlayClick && this.currentModal) {
            this.currentModal.addEventListener('click', (e) => {
                if (e.target === this.currentModal) {
                    this.closeModal();
                    if (onCancel) onCancel();
                    if (onClose) onClose();
                }
            });
        }

        // Setup Escape key to close
        if (closeOnEscape) {
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    if (onCancel) onCancel();
                    if (onClose) onClose();
                    document.removeEventListener('keydown', this.escapeHandler);
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        // Focus specific element if provided
        if (focusElementId) {
            const focusElement = document.getElementById(focusElementId);
            if (focusElement) {
                focusElement.focus();
            }
        }
    }

    /**
     * Close the current modal and cleanup event listeners
     */
    closeModal() {
        // Remove escape key listener if it exists
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        // Remove modal from DOM
        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }

    /**
     * Check if a modal is currently open
     * @returns {boolean}
     */
    isOpen() {
        return this.currentModal !== null;
    }

    /**
     * Get the current modal element
     * @returns {HTMLElement|null}
     */
    getCurrentModal() {
        return this.currentModal;
    }
}
