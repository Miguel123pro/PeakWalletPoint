/**
 * FinancePro - Helper Utilities
 * Common utility functions
 * 
 * @version 2.0.0
 */

const Helpers = {
    /**
     * Format currency amount
     */
    formatCurrency(amount, options = {}) {
        try {
            const {
                symbol = CURRENCY_SETTINGS?.symbol || '€',
                decimals = CURRENCY_SETTINGS?.decimals || 2,
                position = CURRENCY_SETTINGS?.position || 'after'
            } = options;

            const value = parseFloat(amount || 0);
            const formatted = Math.abs(value).toFixed(decimals);
            const parts = formatted.split('.');

            // Add thousands separator
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            const formattedValue = parts.join('.');

            // Add currency symbol
            if (position === 'before') {
                return `${symbol}${formattedValue}`;
            } else {
                return `${formattedValue}${symbol}`;
            }
        } catch (error) {
            console.error('Failed to format currency:', error);
            return `€${(amount || 0).toFixed(2)}`;
        }
    },

    /**
     * Format date
     */
    formatDate(date, format = 'medium') {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }

            if (format === 'relative') {
                return this.getRelativeTime(dateObj);
            }

            const options = {
                short: { month: 'numeric', day: 'numeric', year: '2-digit' },
                medium: { month: 'short', day: 'numeric', year: 'numeric' },
                long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                iso: null
            };

            if (format === 'iso') {
                return dateObj.toISOString().split('T')[0];
            }

            return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
        } catch (error) {
            console.error('Failed to format date:', error);
            return 'Invalid Date';
        }
    },

    /**
     * Get relative time (e.g., "2 days ago")
     */
    getRelativeTime(date) {
        try {
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));

            if (diffMinutes < 1) {
                return 'Just now';
            } else if (diffMinutes < 60) {
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months} month${months !== 1 ? 's' : ''} ago`;
            } else {
                const years = Math.floor(diffDays / 365);
                return `${years} year${years !== 1 ? 's' : ''} ago`;
            }
        } catch (error) {
            console.error('Failed to get relative time:', error);
            return 'Unknown';
        }
    },

    /**
     * Format percentage
     */
    formatPercentage(value, decimals = 1) {
        try {
            return `${parseFloat(value).toFixed(decimals)}%`;
        } catch (error) {
            return '0.0%';
        }
    },

    /**
     * Format number with thousands separator
     */
    formatNumber(value, decimals = 0) {
        try {
            const num = parseFloat(value);
            if (isNaN(num)) return '0';

            return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } catch (error) {
            return '0';
        }
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit = 250) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate amount
     */
    isValidAmount(amount) {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
    },

    /**
     * Validate date
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Get date range for period
     */
    getDateRange(period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(today);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'yesterday':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'week':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'last30':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 30);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'last90':
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 90);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
                break;

            default:
                startDate = new Date(today);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    },

    /**
     * Calculate percentage change
     */
    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Deep clone object
     */
    deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Failed to deep clone object:', error);
            return obj;
        }
    },

    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by key
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    },

    /**
     * Filter array by search term
     */
    filterBySearch(array, searchTerm, keys) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return array;

        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (value === null || value === undefined) return false;
                return value.toString().toLowerCase().includes(term);
            });
        });
    },

    /**
     * Truncate text
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Capitalize first letter
     */
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Get category name
     */
    getCategoryName(categoryId, type = 'expense') {
        try {
            const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const category = categories.find(c => c.id === categoryId);
            return category ? category.name : categoryId;
        } catch (error) {
            return categoryId;
        }
    },

    /**
     * Get category color
     */
    getCategoryColor(categoryId) {
        const colors = CHART_COLORS?.categories || [
            '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
            '#f59e0b', '#ef4444', '#ec4899', '#84cc16'
        ];

        const categories = [...(EXPENSE_CATEGORIES || []), ...(INCOME_CATEGORIES || [])];
        const index = categories.findIndex(c => c.id === categoryId);
        return colors[index % colors.length] || colors[0];
    },

    /**
     * Parse amount from input
     */
    parseAmount(input) {
        if (typeof input === 'number') return input;
        const cleaned = String(input).replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned) || 0;
    },

    /**
     * Check if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Check if dark theme
     */
    isDarkTheme() {
        return document.body.classList.contains('dark-theme');
    },

    /**
     * Scroll to element
     */
    scrollTo(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const top = element.offsetTop - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    },

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Make Helpers available globally
window.Helpers = Helpers;