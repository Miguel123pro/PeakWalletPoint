/**
 * FinancePro - Utility Functions and Helpers
 * Common helper functions used throughout the application
 * 
 * @version 2.0.0
 */

class Helpers {

    // ===============================
    // FORMATTING FUNCTIONS
    // ===============================

    /**
     * Format currency value
     * @param {number} amount - The amount to format
     * @param {string} currency - Currency code (default: USD)
     * @param {string} locale - Locale for formatting (default: en-US)
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '0.00$';
        }

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting
            return `$${Math.abs(amount).toFixed(2)}`;
        }
    }

    /**
     * Format number with thousands separators
     * @param {number} number - The number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    static formatNumber(number, decimals = 0) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    /**
     * Format percentage
     * @param {number} value - The percentage value (0-1 or 0-100)
     * @param {number} decimals - Number of decimal places
     * @param {boolean} isDecimal - Whether input is decimal (0-1) or percentage (0-100)
     * @returns {string} Formatted percentage string
     */
    static formatPercentage(value, decimals = 1, isDecimal = true) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.0%';
        }

        const percentage = isDecimal ? value * 100 : value;
        return `${percentage.toFixed(decimals)}%`;
    }

    /**
     * Format date
     * @param {string|Date} date - The date to format
     * @param {string} format - Format type ('short', 'medium', 'long', 'relative')
     * @returns {string} Formatted date string
     */
    static formatDate(date, format = 'medium') {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        const now = new Date();
        const diffTime = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });

            case 'medium':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

            case 'long':
                return dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

            case 'relative':
                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                if (diffDays === -1) return 'Tomorrow';
                if (diffDays > 0) return `${diffDays} days ago`;
                if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
                break;

            default:
                return dateObj.toLocaleDateString();
        }
    }

    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted file size string
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ===============================
    // VALIDATION FUNCTIONS
    // ===============================

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate amount
     * @param {number|string} amount - Amount to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {boolean} Whether amount is valid
     */
    static isValidAmount(amount, min = 0.01, max = 1000000) {
        const num = parseFloat(amount);
        return !isNaN(num) && num >= min && num <= max && num.toString() !== 'NaN';
    }

    /**
     * Validate date
     * @param {string} dateString - Date string to validate
     * @returns {boolean} Whether date is valid
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Validate required field
     * @param {any} value - Value to validate
     * @returns {boolean} Whether field is filled
     */
    static isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    // ===============================
    // UTILITY FUNCTIONS
    // ===============================

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Whether to execute immediately
     * @returns {Function} Debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;

        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };

            const callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) func(...args);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;

        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone an object
     * @param {any} obj - Object to clone
     * @returns {any} Cloned object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}