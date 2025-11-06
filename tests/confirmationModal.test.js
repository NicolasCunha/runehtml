import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock BaseModal (same as in baseModal.test.js)
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

// Mock ConfirmationModal that extends BaseModal
class ConfirmationModal extends BaseModal {
    constructor() {
        super();
    }

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
            focusElementId: 'modal-cancel-btn'
        });
    }

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

describe('ConfirmationModal', () => {
    let confirmationModal;

    beforeEach(() => {
        confirmationModal = new ConfirmationModal();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        confirmationModal.closeModal();
        document.body.innerHTML = '';
    });

    describe('showConfirmation', () => {
        test('should display confirmation modal with title and message', () => {
            confirmationModal.showConfirmation('Test Title', 'Test Message', () => {}, () => {});

            const title = document.querySelector('.modal-title');
            const content = document.querySelector('.modal-content p');

            expect(title.textContent).toBe('Test Title');
            expect(content.textContent).toBe('Test Message');
        });

        test('should display Yes and No buttons', () => {
            confirmationModal.showConfirmation('Title', 'Message', () => {}, () => {});

            const confirmBtn = document.getElementById('modal-confirm-btn');
            const cancelBtn = document.getElementById('modal-cancel-btn');

            expect(confirmBtn).toBeTruthy();
            expect(confirmBtn.textContent).toContain('Yes');
            expect(cancelBtn).toBeTruthy();
            expect(cancelBtn.textContent).toContain('No');
        });

        test('should call onConfirm when Yes button is clicked', () => {
            let confirmCalled = false;
            confirmationModal.showConfirmation(
                'Title',
                'Message',
                () => { confirmCalled = true; },
                () => {}
            );

            document.getElementById('modal-confirm-btn').click();

            expect(confirmCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should call onCancel when No button is clicked', () => {
            let cancelCalled = false;
            confirmationModal.showConfirmation(
                'Title',
                'Message',
                () => {},
                () => { cancelCalled = true; }
            );

            document.getElementById('modal-cancel-btn').click();

            expect(cancelCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should call onCancel when Escape key is pressed', () => {
            let cancelCalled = false;
            confirmationModal.showConfirmation(
                'Title',
                'Message',
                () => {},
                () => { cancelCalled = true; }
            );

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(cancelCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should call onCancel when overlay is clicked', () => {
            let cancelCalled = false;
            confirmationModal.showConfirmation(
                'Title',
                'Message',
                () => {},
                () => { cancelCalled = true; }
            );

            const overlay = confirmationModal.getCurrentModal();
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
            overlay.dispatchEvent(clickEvent);

            expect(cancelCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should work without onCancel callback', () => {
            expect(() => {
                confirmationModal.showConfirmation('Title', 'Message', () => {});
                document.getElementById('modal-cancel-btn').click();
            }).not.toThrow();
        });

        test('should work without onConfirm callback', () => {
            expect(() => {
                confirmationModal.showConfirmation('Title', 'Message');
                document.getElementById('modal-confirm-btn').click();
            }).not.toThrow();
        });
    });

    describe('showAlert', () => {
        test('should display alert modal with title and message', () => {
            confirmationModal.showAlert('Alert Title', 'Alert Message', () => {});

            const title = document.querySelector('.modal-title');
            const content = document.querySelector('.modal-content p');

            expect(title.textContent).toBe('Alert Title');
            expect(content.textContent).toBe('Alert Message');
        });

        test('should display only OK button', () => {
            confirmationModal.showAlert('Title', 'Message', () => {});

            const okBtn = document.getElementById('modal-ok-btn');
            const cancelBtn = document.getElementById('modal-cancel-btn');

            expect(okBtn).toBeTruthy();
            expect(okBtn.textContent).toContain('OK');
            expect(cancelBtn).toBeFalsy();
        });

        test('should call onClose when OK button is clicked', () => {
            let closeCalled = false;
            confirmationModal.showAlert('Title', 'Message', () => { closeCalled = true; });

            document.getElementById('modal-ok-btn').click();

            expect(closeCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should call onClose when Escape key is pressed', () => {
            let closeCalled = false;
            confirmationModal.showAlert('Title', 'Message', () => { closeCalled = true; });

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(closeCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should call onClose when overlay is clicked', () => {
            let closeCalled = false;
            confirmationModal.showAlert('Title', 'Message', () => { closeCalled = true; });

            const overlay = confirmationModal.getCurrentModal();
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
            overlay.dispatchEvent(clickEvent);

            expect(closeCalled).toBe(true);
            expect(confirmationModal.isOpen()).toBe(false);
        });

        test('should work without onClose callback', () => {
            expect(() => {
                confirmationModal.showAlert('Title', 'Message');
                document.getElementById('modal-ok-btn').click();
            }).not.toThrow();
        });

        test('should render HTML in message as actual HTML', () => {
            confirmationModal.showAlert('Title', 'Message with <b>HTML</b>');

            const content = document.querySelector('.modal-content p');
            // Browser parses HTML tags, so textContent will not include tags
            expect(content.textContent).toBe('Message with HTML');
            // But the HTML is present in innerHTML
            expect(content.innerHTML).toContain('<b>HTML</b>');
        });
    });

    describe('modal replacement', () => {
        test('should replace existing modal when showing new one', () => {
            confirmationModal.showAlert('First Alert', 'First Message');
            expect(document.querySelector('.modal-title').textContent).toBe('First Alert');

            confirmationModal.showConfirmation('Second Title', 'Second Message');
            expect(document.querySelector('.modal-title').textContent).toBe('Second Title');
            
            // Should only be one modal in DOM
            expect(document.querySelectorAll('.modal-overlay').length).toBe(1);
        });
    });
});
