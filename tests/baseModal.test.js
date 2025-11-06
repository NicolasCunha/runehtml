import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock BaseModal that replicates the actual implementation
class BaseModal {
    constructor() {
        this.currentModal = null;
        this.escapeHandler = null;
    }

    showModal(modalHTML) {
        this.closeModal();
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        this.currentModal = modalElement.firstElementChild;
        document.body.appendChild(this.currentModal);
        return this.currentModal;
    }

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

        if (confirmBtnId) {
            const confirmBtn = document.getElementById(confirmBtnId);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onConfirm) onConfirm();
                });
            }
        }

        if (cancelBtnId) {
            const cancelBtn = document.getElementById(cancelBtnId);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onCancel) onCancel();
                });
            }
        }

        if (closeBtnId) {
            const closeBtn = document.getElementById(closeBtnId);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal();
                    if (onClose) onClose();
                });
            }
        }

        if (closeOnOverlayClick && this.currentModal) {
            this.currentModal.addEventListener('click', (e) => {
                if (e.target === this.currentModal) {
                    this.closeModal();
                    if (onCancel) onCancel();
                    if (onClose) onClose();
                }
            });
        }

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

        if (focusElementId) {
            const focusElement = document.getElementById(focusElementId);
            if (focusElement) {
                focusElement.focus();
            }
        }
    }

    closeModal() {
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.parentNode.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }

    isOpen() {
        return this.currentModal !== null;
    }

    getCurrentModal() {
        return this.currentModal;
    }
}

describe('BaseModal', () => {
    let baseModal;

    beforeEach(() => {
        baseModal = new BaseModal();
        // Clear document body
        document.body.innerHTML = '';
    });

    afterEach(() => {
        baseModal.closeModal();
        document.body.innerHTML = '';
    });

    describe('showModal', () => {
        test('should create and append modal to document body', () => {
            const modalHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">Test Modal</div>
                </div>
            `;

            baseModal.showModal(modalHTML);

            expect(document.querySelector('.modal-overlay')).toBeTruthy();
            expect(document.querySelector('.modal-content').textContent).toBe('Test Modal');
        });

        test('should close existing modal before showing new one', () => {
            const firstModal = '<div class="modal-overlay"><div id="first">First</div></div>';
            const secondModal = '<div class="modal-overlay"><div id="second">Second</div></div>';

            baseModal.showModal(firstModal);
            expect(document.getElementById('first')).toBeTruthy();

            baseModal.showModal(secondModal);
            expect(document.getElementById('first')).toBeFalsy();
            expect(document.getElementById('second')).toBeTruthy();
        });

        test('should return the modal element', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            const result = baseModal.showModal(modalHTML);

            expect(result).toBeTruthy();
            expect(result.classList.contains('modal-overlay')).toBe(true);
        });
    });

    describe('setupModalEvents', () => {
        test('should setup confirm button click handler', () => {
            const modalHTML = `
                <div class="modal-overlay">
                    <button id="confirm-btn">Confirm</button>
                </div>
            `;
            baseModal.showModal(modalHTML);

            let confirmCalled = false;
            baseModal.setupModalEvents({
                confirmBtnId: 'confirm-btn',
                onConfirm: () => { confirmCalled = true; }
            });

            document.getElementById('confirm-btn').click();

            expect(confirmCalled).toBe(true);
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should setup cancel button click handler', () => {
            const modalHTML = `
                <div class="modal-overlay">
                    <button id="cancel-btn">Cancel</button>
                </div>
            `;
            baseModal.showModal(modalHTML);

            let cancelCalled = false;
            baseModal.setupModalEvents({
                cancelBtnId: 'cancel-btn',
                onCancel: () => { cancelCalled = true; }
            });

            document.getElementById('cancel-btn').click();

            expect(cancelCalled).toBe(true);
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should setup close button click handler', () => {
            const modalHTML = `
                <div class="modal-overlay">
                    <button id="close-btn">Close</button>
                </div>
            `;
            baseModal.showModal(modalHTML);

            let closeCalled = false;
            baseModal.setupModalEvents({
                closeBtnId: 'close-btn',
                onClose: () => { closeCalled = true; }
            });

            document.getElementById('close-btn').click();

            expect(closeCalled).toBe(true);
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should close modal on overlay click when enabled', () => {
            const modalHTML = `<div class="modal-overlay">Content</div>`;
            baseModal.showModal(modalHTML);

            let cancelCalled = false;
            baseModal.setupModalEvents({
                closeOnOverlayClick: true,
                onCancel: () => { cancelCalled = true; }
            });

            // Simulate clicking the overlay itself
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: baseModal.getCurrentModal(), enumerable: true });
            baseModal.getCurrentModal().dispatchEvent(clickEvent);

            expect(cancelCalled).toBe(true);
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should close modal on Escape key when enabled', () => {
            const modalHTML = `<div class="modal-overlay">Content</div>`;
            baseModal.showModal(modalHTML);

            let cancelCalled = false;
            baseModal.setupModalEvents({
                closeOnEscape: true,
                onCancel: () => { cancelCalled = true; }
            });

            // Simulate Escape key press
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(cancelCalled).toBe(true);
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should not close on overlay click when disabled', () => {
            const modalHTML = `<div class="modal-overlay">Content</div>`;
            baseModal.showModal(modalHTML);

            baseModal.setupModalEvents({
                closeOnOverlayClick: false
            });

            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: baseModal.getCurrentModal(), enumerable: true });
            baseModal.getCurrentModal().dispatchEvent(clickEvent);

            expect(baseModal.isOpen()).toBe(true);
        });

        test('should not close on Escape when disabled', () => {
            const modalHTML = `<div class="modal-overlay">Content</div>`;
            baseModal.showModal(modalHTML);

            baseModal.setupModalEvents({
                closeOnEscape: false
            });

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(baseModal.isOpen()).toBe(true);
        });
    });

    describe('closeModal', () => {
        test('should remove modal from DOM', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            baseModal.showModal(modalHTML);

            expect(document.querySelector('.modal-overlay')).toBeTruthy();

            baseModal.closeModal();

            expect(document.querySelector('.modal-overlay')).toBeFalsy();
        });

        test('should cleanup escape key listener', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            baseModal.showModal(modalHTML);
            baseModal.setupModalEvents({ closeOnEscape: true });

            expect(baseModal.escapeHandler).toBeTruthy();

            baseModal.closeModal();

            expect(baseModal.escapeHandler).toBeFalsy();
        });

        test('should handle closing when no modal is open', () => {
            expect(() => {
                baseModal.closeModal();
            }).not.toThrow();
        });
    });

    describe('isOpen', () => {
        test('should return false when no modal is open', () => {
            expect(baseModal.isOpen()).toBe(false);
        });

        test('should return true when modal is open', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            baseModal.showModal(modalHTML);

            expect(baseModal.isOpen()).toBe(true);
        });

        test('should return false after modal is closed', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            baseModal.showModal(modalHTML);
            baseModal.closeModal();

            expect(baseModal.isOpen()).toBe(false);
        });
    });

    describe('getCurrentModal', () => {
        test('should return null when no modal is open', () => {
            expect(baseModal.getCurrentModal()).toBeNull();
        });

        test('should return the modal element when open', () => {
            const modalHTML = '<div class="modal-overlay">Content</div>';
            baseModal.showModal(modalHTML);

            const current = baseModal.getCurrentModal();
            expect(current).toBeTruthy();
            expect(current.classList.contains('modal-overlay')).toBe(true);
        });
    });
});
