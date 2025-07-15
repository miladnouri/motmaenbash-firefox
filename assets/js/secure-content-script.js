/**
 * Secure content script for MotmaenBash Firefox Extension
 * Replaces vulnerable DOM manipulation with secure alternatives
 * 
 * Security improvements:
 * - Secure DOM manipulation without innerHTML
 * - Input validation and sanitization
 * - CSP compliance
 * - XSS prevention
 * 
 * @version 2.0.0
 * @author محمدحسین نوروزی (Mohammad Hossein Norouzi)
 */

'use strict';

/**
 * Security utilities for content script
 */
const ContentSecurityUtils = {
    /**
     * Sanitizes text content
     * @param {string} text - Text to sanitize
     * @returns {string} - Sanitized text
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>\"'&]/g, (match) => {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return escapeMap[match];
        });
    },

    /**
     * Validates URL security
     * @param {string} url - URL to validate
     * @returns {boolean} - True if URL is safe
     */
    isSecureUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' && this.isAllowedDomain(urlObj.hostname);
        } catch (e) {
            return false;
        }
    },

    /**
     * Checks if domain is allowed
     * @param {string} hostname - Hostname to check
     * @returns {boolean} - True if domain is allowed
     */
    isAllowedDomain(hostname) {
        const allowedDomains = [
            'shaparak.ir',
            'sep.ir',
            'fanava.ir',
            'parsian.com',
            'mellat.ir'
        ];
        
        return allowedDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    },

    /**
     * Creates secure DOM element
     * @param {string} tag - HTML tag
     * @param {Object} props - Element properties
     * @returns {HTMLElement} - Created element
     */
    createSecureElement(tag, props = {}) {
        const element = document.createElement(tag);
        
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = this.sanitizeText(value);
            } else if (key === 'className') {
                element.className = value;
            } else if (key === 'id') {
                element.id = value;
            } else if (key === 'src' && this.isSecureUrl(value)) {
                element.src = value;
            } else if (key === 'href' && this.isSecureUrl(value)) {
                element.href = value;
            }
        });
        
        return element;
    }
};

/**
 * Payment gateway security validator
 */
class PaymentGatewayValidator {
    constructor() {
        this.currentDomain = window.location.hostname;
        this.initialized = false;
    }

    /**
     * Initializes the validator
     */
    init() {
        if (this.initialized) return;
        
        this.validateCurrentPage();
        this.createSecurityIndicator();
        this.setupSecurityMonitoring();
        this.initialized = true;
    }

    /**
     * Validates current page security
     */
    validateCurrentPage() {
        const validationResult = {
            isSecure: false,
            domain: this.currentDomain,
            timestamp: Date.now()
        };

        // Check if domain is legitimate payment gateway
        if (ContentSecurityUtils.isAllowedDomain(this.currentDomain)) {
            validationResult.isSecure = true;
            validationResult.status = 'verified';
            validationResult.message = 'این درگاه پرداخت معتبر و امن است';
        } else {
            validationResult.status = 'warning';
            validationResult.message = 'هشدار: این درگاه پرداخت تأیید نشده است';
        }

        this.sendValidationResult(validationResult);
    }

    /**
     * Creates security indicator on page
     */
    createSecurityIndicator() {
        // Remove existing indicator
        const existingIndicator = document.getElementById('motmaenbash-security-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create new indicator
        const indicator = ContentSecurityUtils.createSecureElement('div', {
            id: 'motmaenbash-security-indicator',
            className: 'motmaenbash-indicator'
        });

        // Create indicator content
        const icon = ContentSecurityUtils.createSecureElement('span', {
            className: 'motmaenbash-icon',
            textContent: '🔒'
        });

        const message = ContentSecurityUtils.createSecureElement('span', {
            className: 'motmaenbash-message',
            textContent: 'محافظت شده توسط MotmaenBash'
        });

        indicator.appendChild(icon);
        indicator.appendChild(message);

        // Add styles
        this.addSecurityIndicatorStyles(indicator);

        // Insert into page
        document.body.appendChild(indicator);
    }

    /**
     * Adds styles to security indicator
     * @param {HTMLElement} indicator - The indicator element
     */
    addSecurityIndicatorStyles(indicator) {
        const style = document.createElement('style');
        style.textContent = `
            .motmaenbash-indicator {
                position: fixed;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .motmaenbash-icon {
                font-size: 14px;
            }
            
            .motmaenbash-message {
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Sets up security monitoring
     */
    setupSecurityMonitoring() {
        // Monitor DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.checkForSuspiciousContent(mutation.addedNodes);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Monitor form submissions
        document.addEventListener('submit', (e) => {
            this.validateFormSubmission(e);
        });
    }

    /**
     * Checks for suspicious content
     * @param {NodeList} nodes - Added nodes to check
     */
    checkForSuspiciousContent(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check for suspicious scripts
                const scripts = node.querySelectorAll('script');
                scripts.forEach(script => {
                    if (script.src && !ContentSecurityUtils.isSecureUrl(script.src)) {
                        console.warn('Suspicious script detected:', script.src);
                        script.remove();
                    }
                });

                // Check for suspicious iframes
                const iframes = node.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    if (iframe.src && !ContentSecurityUtils.isSecureUrl(iframe.src)) {
                        console.warn('Suspicious iframe detected:', iframe.src);
                        iframe.remove();
                    }
                });
            }
        });
    }

    /**
     * Validates form submission
     * @param {Event} event - Form submission event
     */
    validateFormSubmission(event) {
        const form = event.target;
        const action = form.action;

        if (action && !ContentSecurityUtils.isSecureUrl(action)) {
            event.preventDefault();
            this.showSecurityWarning('فرم به مقصد نامعتبر ارسال می‌شود');
            return false;
        }

        // Check for password fields
        const passwordFields = form.querySelectorAll('input[type="password"]');
        if (passwordFields.length > 0 && !window.location.protocol.startsWith('https')) {
            event.preventDefault();
            this.showSecurityWarning('ارسال رمز عبور در اتصال غیرایمن');
            return false;
        }

        return true;
    }

    /**
     * Shows security warning
     * @param {string} message - Warning message
     */
    showSecurityWarning(message) {
        const warning = ContentSecurityUtils.createSecureElement('div', {
            className: 'motmaenbash-warning',
            textContent: message
        });

        const style = document.createElement('style');
        style.textContent = `
            .motmaenbash-warning {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #dc3545;
                color: white;
                padding: 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10001;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(warning);

        // Remove warning after 5 seconds
        setTimeout(() => {
            warning.remove();
            style.remove();
        }, 5000);
    }

    /**
     * Sends validation result to background script
     * @param {Object} result - Validation result
     */
    sendValidationResult(result) {
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.sendMessage({
                type: 'validation_result',
                data: result
            }).catch(error => {
                console.error('Error sending validation result:', error);
            });
        }
    }
}

/**
 * Initialize content script when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const validator = new PaymentGatewayValidator();
        validator.init();
    });
} else {
    const validator = new PaymentGatewayValidator();
    validator.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContentSecurityUtils, PaymentGatewayValidator };
}