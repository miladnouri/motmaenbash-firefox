/**
 * Secure background script for MotmaenBash Firefox Extension
 * Handles security monitoring and threat detection
 * 
 * Security improvements:
 * - Secure message handling
 * - Threat detection and reporting
 * - Safe data storage
 * - Network security monitoring
 * 
 * @version 2.0.0
 * @author محمدحسین نوروزی (Mohammad Hossein Norouzi)
 */

'use strict';

/**
 * Background security manager
 */
class BackgroundSecurityManager {
    constructor() {
        this.threatDatabase = new Map();
        this.securityEvents = [];
        this.initialized = false;
    }

    /**
     * Initializes the background manager
     */
    init() {
        if (this.initialized) return;
        
        this.setupMessageHandlers();
        this.setupTabMonitoring();
        this.loadThreatDatabase();
        this.initialized = true;
        
        console.log('MotmaenBash Firefox Extension initialized');
    }

    /**
     * Sets up message handlers
     */
    setupMessageHandlers() {
        if (typeof browser !== 'undefined' && browser.runtime) {
            browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                return this.handleMessage(message, sender, sendResponse);
            });
        }
    }

    /**
     * Handles incoming messages
     * @param {Object} message - The message object
     * @param {Object} sender - Message sender
     * @param {Function} sendResponse - Response function
     */
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'validation_result':
                    await this.handleValidationResult(message.data, sender);
                    break;
                case 'get_threat_status':
                    return this.getThreatStatus(sender.tab.id);
                case 'report_threat':
                    await this.reportThreat(message.data, sender);
                    break;
                case 'get_security_config':
                    return this.getSecurityConfig();
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    /**
     * Sets up tab monitoring
     */
    setupTabMonitoring() {
        if (typeof browser !== 'undefined' && browser.tabs) {
            browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.url) {
                    this.analyzeTabUrl(tabId, changeInfo.url);
                }
            });
        }
    }

    /**
     * Handles validation result from content script
     * @param {Object} result - Validation result
     * @param {Object} sender - Message sender
     */
    async handleValidationResult(result, sender) {
        const tabId = sender.tab.id;
        const timestamp = Date.now();
        
        // Store validation result
        await this.storeValidationResult(tabId, {
            ...result,
            timestamp,
            tabId
        });

        // Check for threats
        if (!result.isSecure) {
            await this.handleThreatDetection(tabId, result);
        }

        // Update badge
        this.updateBadge(tabId, result.status);
    }

    /**
     * Analyzes tab URL for security threats
     * @param {number} tabId - Tab ID
     * @param {string} url - Tab URL
     */
    analyzeTabUrl(tabId, url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            
            // Check against known payment gateways
            const paymentGateways = [
                'shaparak.ir',
                'sep.ir',
                'fanava.ir',
                'parsian.com',
                'mellat.ir'
            ];

            const isPaymentGateway = paymentGateways.some(domain => 
                hostname === domain || hostname.endsWith('.' + domain)
            );

            if (isPaymentGateway) {
                this.validatePaymentGateway(tabId, url, hostname);
            } else {
                // Check for phishing attempts
                this.checkPhishingAttempt(tabId, url, hostname);
            }
        } catch (error) {
            console.error('Error analyzing tab URL:', error);
        }
    }

    /**
     * Validates payment gateway
     * @param {number} tabId - Tab ID
     * @param {string} url - Gateway URL
     * @param {string} hostname - Gateway hostname
     */
    validatePaymentGateway(tabId, url, hostname) {
        const validationResult = {
            isSecure: true,
            domain: hostname,
            status: 'verified',
            message: 'درگاه پرداخت معتبر',
            timestamp: Date.now()
        };

        this.storeValidationResult(tabId, validationResult);
        this.updateBadge(tabId, 'verified');
    }

    /**
     * Checks for phishing attempts
     * @param {number} tabId - Tab ID
     * @param {string} url - Suspicious URL
     * @param {string} hostname - Suspicious hostname
     */
    checkPhishingAttempt(tabId, url, hostname) {
        const suspiciousPatterns = [
            /shaparak[\w-]*\.(?!ir)/i,
            /sep[\w-]*\.(?!ir)/i,
            /fanava[\w-]*\.(?!ir)/i,
            /parsian[\w-]*\.(?!com)/i,
            /mellat[\w-]*\.(?!ir)/i
        ];

        const isPhishing = suspiciousPatterns.some(pattern => pattern.test(hostname));

        if (isPhishing) {
            this.handlePhishingDetection(tabId, url, hostname);
        }
    }

    /**
     * Handles phishing detection
     * @param {number} tabId - Tab ID
     * @param {string} url - Phishing URL
     * @param {string} hostname - Phishing hostname
     */
    async handlePhishingDetection(tabId, url, hostname) {
        const threatResult = {
            isSecure: false,
            domain: hostname,
            status: 'danger',
            message: 'هشدار: احتمال فیشینگ',
            threatType: 'phishing',
            timestamp: Date.now()
        };

        await this.storeValidationResult(tabId, threatResult);
        this.updateBadge(tabId, 'danger');

        // Show notification
        this.showThreatNotification(threatResult);
    }

    /**
     * Handles threat detection
     * @param {number} tabId - Tab ID
     * @param {Object} threat - Threat information
     */
    async handleThreatDetection(tabId, threat) {
        const threatEvent = {
            tabId,
            threat,
            timestamp: Date.now(),
            handled: false
        };

        this.securityEvents.push(threatEvent);
        await this.storeThreatEvent(threatEvent);
    }

    /**
     * Shows threat notification
     * @param {Object} threat - Threat information
     */
    showThreatNotification(threat) {
        if (typeof browser !== 'undefined' && browser.notifications) {
            browser.notifications.create({
                type: 'basic',
                iconUrl: 'assets/images/icon_48.png',
                title: 'MotmaenBash Security Alert',
                message: threat.message
            });
        }
    }

    /**
     * Updates extension badge
     * @param {number} tabId - Tab ID
     * @param {string} status - Security status
     */
    updateBadge(tabId, status) {
        if (typeof browser !== 'undefined' && browser.browserAction) {
            const badgeConfig = {
                verified: { text: '✓', color: '#28a745' },
                warning: { text: '!', color: '#ffc107' },
                danger: { text: '⚠', color: '#dc3545' }
            };

            const config = badgeConfig[status] || { text: '', color: '#6c757d' };
            
            browser.browserAction.setBadgeText({
                text: config.text,
                tabId: tabId
            });
            
            browser.browserAction.setBadgeBackgroundColor({
                color: config.color,
                tabId: tabId
            });
        }
    }

    /**
     * Stores validation result
     * @param {number} tabId - Tab ID
     * @param {Object} result - Validation result
     */
    async storeValidationResult(tabId, result) {
        try {
            const storageKey = `validation_${tabId}`;
            const storageData = { [storageKey]: result };
            
            if (typeof browser !== 'undefined' && browser.storage) {
                await browser.storage.local.set(storageData);
            }
        } catch (error) {
            console.error('Error storing validation result:', error);
        }
    }

    /**
     * Gets threat status for tab
     * @param {number} tabId - Tab ID
     * @returns {Object} - Threat status
     */
    async getThreatStatus(tabId) {
        try {
            const storageKey = `validation_${tabId}`;
            
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.local.get(storageKey);
                return result[storageKey] || null;
            }
        } catch (error) {
            console.error('Error getting threat status:', error);
            return null;
        }
    }

    /**
     * Reports a threat
     * @param {Object} threat - Threat data
     * @param {Object} sender - Message sender
     */
    async reportThreat(threat, sender) {
        const reportData = {
            ...threat,
            reportedAt: Date.now(),
            tabId: sender.tab.id,
            userAgent: 'MotmaenBash-Firefox'
        };

        // Store report locally
        await this.storeThreatReport(reportData);
        
        console.log('Threat reported:', reportData);
    }

    /**
     * Stores threat report
     * @param {Object} report - Threat report
     */
    async storeThreatReport(report) {
        try {
            const reports = await this.getThreatReports();
            reports.push(report);
            
            if (typeof browser !== 'undefined' && browser.storage) {
                await browser.storage.local.set({ threat_reports: reports });
            }
        } catch (error) {
            console.error('Error storing threat report:', error);
        }
    }

    /**
     * Gets stored threat reports
     * @returns {Array} - Array of threat reports
     */
    async getThreatReports() {
        try {
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.local.get('threat_reports');
                return result.threat_reports || [];
            }
        } catch (error) {
            console.error('Error getting threat reports:', error);
            return [];
        }
    }

    /**
     * Stores threat event
     * @param {Object} event - Threat event
     */
    async storeThreatEvent(event) {
        try {
            const events = await this.getSecurityEvents();
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            if (typeof browser !== 'undefined' && browser.storage) {
                await browser.storage.local.set({ security_events: events });
            }
        } catch (error) {
            console.error('Error storing threat event:', error);
        }
    }

    /**
     * Gets security events
     * @returns {Array} - Array of security events
     */
    async getSecurityEvents() {
        try {
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.local.get('security_events');
                return result.security_events || [];
            }
        } catch (error) {
            console.error('Error getting security events:', error);
            return [];
        }
    }

    /**
     * Loads threat database
     */
    async loadThreatDatabase() {
        try {
            // Load known threats from storage
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.local.get('threat_database');
                const threatData = result.threat_database || {};
                
                Object.entries(threatData).forEach(([key, value]) => {
                    this.threatDatabase.set(key, value);
                });
            }
        } catch (error) {
            console.error('Error loading threat database:', error);
        }
    }

    /**
     * Gets security configuration
     * @returns {Object} - Security configuration
     */
    getSecurityConfig() {
        return {
            version: '2.0.0',
            author: 'محمدحسین نوروزی (Mohammad Hossein Norouzi)',
            features: [
                'payment_gateway_validation',
                'phishing_detection',
                'secure_content_monitoring',
                'threat_reporting'
            ],
            supportedGateways: [
                'shaparak.ir',
                'sep.ir',
                'fanava.ir',
                'parsian.com',
                'mellat.ir'
            ]
        };
    }
}

// Initialize background manager
const backgroundManager = new BackgroundSecurityManager();
backgroundManager.init();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackgroundSecurityManager };
}